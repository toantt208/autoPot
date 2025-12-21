/**
 * Redeem Service
 *
 * Redeems won positions from resolved markets using the Polymarket Builder Relayer.
 * Uses Promise.race between relayer polling and RPC polling for transaction confirmation.
 */

import { RelayClient } from '@polymarket/builder-relayer-client';
import type { SafeTransaction, RelayerTransactionState } from '@polymarket/builder-relayer-client';
import { BuilderConfig } from '@polymarket/builder-signing-sdk';
import { Wallet, Contract } from 'ethers';
import { encodeFunctionData } from 'viem';
import { JsonRpcProvider } from '@ethersproject/providers';
import type { TransactionReceipt } from '@ethersproject/providers';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { Position } from '../clients/data-api-client.js';
import type { Config } from '../config/index.js';

// Contract addresses on Polygon
const CONTRACTS = {
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const,
  CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' as const,
  NEG_RISK_ADAPTER: '0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296' as const,
};

const POLYGON_CHAIN_ID = 137;
const RELAYER_URL = 'https://relayer-v2.polymarket.com/';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const TX_CONFIRMATION_TIMEOUT_MS = 60000;
const RPC_POLL_INTERVAL_MS = 2000;

// ABIs for redemption
const NEG_RISK_ADAPTER_ABI = [
  {
    inputs: [
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSets', type: 'uint256[]' },
    ],
    name: 'redeemPositions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const CONDITIONAL_TOKENS_ABI = [
  {
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSets', type: 'uint256[]' },
    ],
    name: 'redeemPositions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ERC1155 ABI for balance check
const ERC1155_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface RedeemResult {
  success: boolean;
  conditionId: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Build redemption transaction for NegRisk markets
 */
function buildNegRiskRedeemTxn(conditionId: string): SafeTransaction {
  const data = encodeFunctionData({
    abi: NEG_RISK_ADAPTER_ABI,
    functionName: 'redeemPositions',
    args: [conditionId as `0x${string}`, [BigInt(1), BigInt(2)]],
  });

  return {
    to: CONTRACTS.NEG_RISK_ADAPTER,
    data,
    value: '0',
    operation: 0, // Call
  };
}

/**
 * Build redemption transaction for regular CTF markets
 */
function buildCtfRedeemTxn(conditionId: string): SafeTransaction {
  const data = encodeFunctionData({
    abi: CONDITIONAL_TOKENS_ABI,
    functionName: 'redeemPositions',
    args: [
      CONTRACTS.USDC,
      ZERO_BYTES32 as `0x${string}`,
      conditionId as `0x${string}`,
      [BigInt(1), BigInt(2)],
    ],
  });

  return {
    to: CONTRACTS.CONDITIONAL_TOKENS,
    data,
    value: '0',
    operation: 0, // Call
  };
}

/**
 * Poll RPC for transaction receipt
 */
async function pollRpcForReceipt(
  provider: JsonRpcProvider,
  txHash: string,
  timeoutMs: number,
  abortSignal: { aborted: boolean }
): Promise<{ source: 'rpc'; receipt: TransactionReceipt } | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs && !abortSignal.aborted) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt && receipt.blockNumber) {
        logger.info({ txHash, source: 'rpc', blockNumber: receipt.blockNumber }, 'Transaction confirmed via RPC');
        return { source: 'rpc', receipt };
      }
    } catch (error) {
      logger.debug({ txHash, error }, 'Error polling RPC for receipt');
    }
    await sleep(RPC_POLL_INTERVAL_MS);
  }

  return null;
}

/**
 * Poll relayer for transaction state
 */
async function pollRelayerForState(
  relayClient: RelayClient,
  transactionId: string,
  timeoutMs: number,
  abortSignal: { aborted: boolean }
): Promise<{ source: 'relayer'; state: RelayerTransactionState; hash?: string } | null> {
  const startTime = Date.now();
  const targetStates: RelayerTransactionState[] = ['STATE_MINED', 'STATE_CONFIRMED', 'STATE_FAILED'];

  while (Date.now() - startTime < timeoutMs && !abortSignal.aborted) {
    try {
      const txn = await relayClient.getTransaction(transactionId);

      if (txn && targetStates.includes(txn.state)) {
        logger.info(
          { transactionId, state: txn.state, hash: txn.hash, source: 'relayer' },
          'Transaction state updated via relayer'
        );
        return { source: 'relayer', state: txn.state, hash: txn.hash };
      }
    } catch (error) {
      logger.debug({ transactionId, error }, 'Error polling relayer for state');
    }
    await sleep(RPC_POLL_INTERVAL_MS);
  }

  return null;
}

/**
 * Wait for transaction confirmation using Promise.race between relayer and RPC
 */
async function waitForConfirmationWithRace(
  relayClient: RelayClient,
  provider: JsonRpcProvider,
  transactionId: string,
  txHash: string | undefined,
  timeoutMs: number = TX_CONFIRMATION_TIMEOUT_MS
): Promise<{ success: boolean; hash?: string; error?: string }> {
  logger.info({ transactionId, txHash }, 'Waiting for transaction confirmation (Promise.race)');

  const abortSignal = { aborted: false };

  const promises: Promise<any>[] = [
    // Relayer polling
    pollRelayerForState(relayClient, transactionId, timeoutMs, abortSignal),
  ];

  // Add RPC polling if we have a transaction hash
  if (txHash) {
    promises.push(pollRpcForReceipt(provider, txHash, timeoutMs, abortSignal));
  }

  // Add timeout
  promises.push(
    sleep(timeoutMs).then(() => ({ source: 'timeout' as const }))
  );

  try {
    const result = await Promise.race(promises);
    abortSignal.aborted = true; // Signal other polls to stop

    if (!result || result.source === 'timeout') {
      return { success: false, hash: txHash, error: 'Confirmation timeout' };
    }

    if (result.source === 'rpc') {
      const success = result.receipt.status === 1;
      return {
        success,
        hash: result.receipt.transactionHash,
        error: success ? undefined : 'Transaction reverted',
      };
    }

    if (result.source === 'relayer') {
      const success = result.state === 'STATE_MINED' || result.state === 'STATE_CONFIRMED';
      return {
        success,
        hash: result.hash,
        error: success ? undefined : `Relayer state: ${result.state}`,
      };
    }

    return { success: false, hash: txHash, error: 'Unknown result' };
  } catch (error: any) {
    abortSignal.aborted = true;
    logger.error({ error, transactionId }, 'Error waiting for confirmation');
    return { success: false, hash: txHash, error: error.message };
  }
}

export class RedeemService {
  private relayClient: RelayClient;
  private provider: JsonRpcProvider;
  private safeAddress: string;
  private dryRun: boolean;

  constructor(config: Config) {
    this.safeAddress = config.GNOSIS_SAFE_ADDRESS;
    this.dryRun = config.DRY_RUN;

    // Create provider for RPC polling (must be created first)
    this.provider = new JsonRpcProvider(config.POLYGON_RPC_URL, POLYGON_CHAIN_ID);

    // Create ethers wallet for signing (connected to provider - required by RelayClient)
    const wallet = new Wallet(config.MASTER_PRIVATE_KEY, this.provider);

    // Create builder config with API credentials for relayer authentication
    const builderConfig = new BuilderConfig({
      localBuilderCreds: {
        key: config.BUILDER_API_KEY,
        secret: config.BUILDER_SECRET,
        passphrase: config.BUILDER_PASSPHRASE,
      },
    });

    // Create relay client with builder config
    this.relayClient = new RelayClient(RELAYER_URL, POLYGON_CHAIN_ID, wallet, builderConfig);

    logger.info(
      {
        safeAddress: this.safeAddress,
        relayerUrl: RELAYER_URL,
        dryRun: this.dryRun,
      },
      'Redeem service initialized (using Polymarket Relayer)'
    );
  }

  /**
   * Check onchain ERC1155 balance for a token
   */
  async getOnchainBalance(tokenId: string): Promise<bigint> {
    try {
      const contract = new Contract(
        CONTRACTS.CONDITIONAL_TOKENS,
        ERC1155_ABI,
        this.provider
      );
      const balance = await contract.balanceOf(this.safeAddress, tokenId);
      return BigInt(balance.toString());
    } catch (error: any) {
      logger.error({ tokenId, error: error.message }, 'Error checking onchain balance');
      return BigInt(0);
    }
  }

  /**
   * Redeem a single position using the relay client
   */
  async redeemPosition(position: Position): Promise<RedeemResult> {
    // Check onchain balance first
    const onchainBalance = await this.getOnchainBalance(position.asset);

    if (onchainBalance === BigInt(0)) {
      logger.info(
        {
          conditionId: position.conditionId.slice(0, 20) + '...',
          asset: position.asset.slice(0, 20) + '...',
          title: position.title,
        },
        'Skipping - zero onchain balance'
      );
      return {
        success: true, // Not an error, just nothing to redeem
        conditionId: position.conditionId,
        error: 'Zero onchain balance',
      };
    }

    logger.info(
      {
        conditionId: position.conditionId.slice(0, 20) + '...',
        outcome: position.outcome,
        size: position.size,
        onchainBalance: onchainBalance.toString(),
        value: position.currentValue,
        negRisk: position.negativeRisk,
        title: position.title,
      },
      'Redeeming position'
    );

    if (this.dryRun) {
      logger.info(
        { conditionId: position.conditionId.slice(0, 20) + '...' },
        'DRY RUN: Would redeem position'
      );
      return {
        success: true,
        conditionId: position.conditionId,
        transactionHash: 'dry-run-tx-hash',
      };
    }

    try {
      // Build the redemption transaction based on market type
      const txn = position.negativeRisk
        ? buildNegRiskRedeemTxn(position.conditionId)
        : buildCtfRedeemTxn(position.conditionId);

      logger.debug(
        {
          to: txn.to,
          negRisk: position.negativeRisk,
          conditionId: position.conditionId.slice(0, 20) + '...',
        },
        'Executing redemption via relayer'
      );

      // Execute via relay client
      const response = await this.relayClient.execute([txn], 'redeem');

      logger.info(
        {
          transactionId: response.transactionID,
          state: response.state,
          hash: response.hash,
        },
        'Transaction submitted to relayer'
      );

      // Wait for confirmation using Promise.race (relayer polling vs RPC polling)
      const confirmation = await waitForConfirmationWithRace(
        this.relayClient,
        this.provider,
        response.transactionID,
        response.hash,
        TX_CONFIRMATION_TIMEOUT_MS
      );

      if (confirmation.success) {
        logger.info(
          {
            conditionId: position.conditionId.slice(0, 20) + '...',
            txHash: confirmation.hash,
          },
          'Position redeemed successfully'
        );
      } else {
        logger.warn(
          {
            conditionId: position.conditionId.slice(0, 20) + '...',
            txHash: confirmation.hash,
            error: confirmation.error,
          },
          'Redemption failed or not confirmed'
        );
      }

      return {
        success: confirmation.success,
        conditionId: position.conditionId,
        transactionHash: confirmation.hash,
        error: confirmation.error,
      };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      logger.error(
        { conditionId: position.conditionId.slice(0, 20) + '...', error: errorMessage },
        'Error redeeming position'
      );

      return {
        success: false,
        conditionId: position.conditionId,
        error: errorMessage,
      };
    }
  }

  /**
   * Redeem multiple positions with delay between each
   */
  async redeemAll(positions: Position[], delayMs: number = 5000): Promise<RedeemResult[]> {
    const results: RedeemResult[] = [];

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];

      logger.info(
        { index: i + 1, total: positions.length },
        'Processing position'
      );

      const result = await this.redeemPosition(position);
      results.push(result);

      // Add delay between redemptions (except for last one)
      if (i < positions.length - 1) {
        await sleep(delayMs);
      }
    }

    // Log summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.info(
      { total: results.length, successful, failed },
      'Redemption batch completed'
    );

    return results;
  }

  /**
   * Get the Safe address
   */
  getSafeAddress(): string {
    return this.safeAddress;
  }
}
