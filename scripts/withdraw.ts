/**
 * Withdraw USDC Script
 *
 * Withdraws USDC from Gnosis Safe to a destination address using Builder Relayer.
 *
 * Usage: npx tsx scripts/withdraw.ts <to_address> <amount_usdc>
 * Example: npx tsx scripts/withdraw.ts 0x1234...5678 100
 */

import { RelayClient } from '@polymarket/builder-relayer-client';
import type { SafeTransaction } from '@polymarket/builder-relayer-client';
import { BuilderConfig } from '@polymarket/builder-signing-sdk';
import { Wallet } from 'ethers';
import { encodeFunctionData } from 'viem';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getConfig } from '../src/config/index.js';
import { logger } from '../src/utils/logger.js';
import { sleep } from '../src/utils/retry.js';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const POLYGON_CHAIN_ID = 137;
const RELAYER_URL = 'https://relayer-v2.polymarket.com/';
const TX_TIMEOUT_MS = 60000;
const POLL_INTERVAL_MS = 2000;

// USDC has 6 decimals
const USDC_DECIMALS = 6;

const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

function buildTransferTx(to: string, amount: bigint): SafeTransaction {
  const data = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [to as `0x${string}`, amount],
  });

  return {
    to: USDC_ADDRESS,
    data,
    value: '0',
    operation: 0, // Call
  };
}

async function waitForConfirmation(
  relayClient: RelayClient,
  provider: JsonRpcProvider,
  transactionId: string,
  txHash: string | undefined
): Promise<{ success: boolean; hash?: string }> {
  const startTime = Date.now();

  while (Date.now() - startTime < TX_TIMEOUT_MS) {
    try {
      // Check relayer state
      const txn = await relayClient.getTransaction(transactionId);
      if (txn) {
        if (txn.state === 'STATE_CONFIRMED' || txn.state === 'STATE_MINED') {
          return { success: true, hash: txn.hash };
        }
        if (txn.state === 'STATE_FAILED') {
          return { success: false, hash: txn.hash };
        }
      }

      // Also check RPC if we have hash
      if (txHash) {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && receipt.blockNumber) {
          return { success: receipt.status === 1, hash: txHash };
        }
      }
    } catch (error) {
      // Continue polling
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return { success: false };
}

async function main() {
  const toAddress = process.argv[2];
  const amountStr = process.argv[3];

  if (!toAddress || !amountStr) {
    console.error('Usage: npx tsx scripts/withdraw.ts <to_address> <amount_usdc>');
    console.error('Example: npx tsx scripts/withdraw.ts 0x1234...5678 100');
    process.exit(1);
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
    console.error('Invalid address format');
    process.exit(1);
  }

  const amountUsdc = parseFloat(amountStr);
  if (isNaN(amountUsdc) || amountUsdc <= 0) {
    console.error('Invalid amount');
    process.exit(1);
  }

  // Convert to USDC units (6 decimals)
  const amountRaw = BigInt(Math.floor(amountUsdc * 10 ** USDC_DECIMALS));

  const config = getConfig();

  logger.info({
    from: config.GNOSIS_SAFE_ADDRESS,
    to: toAddress,
    amount: `${amountUsdc} USDC`,
  }, 'Preparing withdrawal');

  // Initialize provider and wallet
  const provider = new JsonRpcProvider(config.POLYGON_RPC_URL, POLYGON_CHAIN_ID);
  const wallet = new Wallet(config.MASTER_PRIVATE_KEY, provider);

  // Initialize relay client
  const builderConfig = new BuilderConfig({
    localBuilderCreds: {
      key: config.BUILDER_API_KEY,
      secret: config.BUILDER_SECRET,
      passphrase: config.BUILDER_PASSPHRASE,
    },
  });

  const relayClient = new RelayClient(RELAYER_URL, POLYGON_CHAIN_ID, wallet, builderConfig);

  // Build transfer transaction
  const tx = buildTransferTx(toAddress, amountRaw);

  logger.info('Sending transaction via relayer...');

  try {
    // Execute via relayer
    const response = await relayClient.execute([tx], 'withdraw');

    logger.info({
      transactionId: response.transactionID,
      state: response.state,
      hash: response.hash,
    }, 'Transaction submitted');

    // Wait for confirmation
    logger.info('Waiting for confirmation...');
    const result = await waitForConfirmation(relayClient, provider, response.transactionID, response.hash);

    if (result.success) {
      logger.info({
        txHash: result.hash,
        amount: `${amountUsdc} USDC`,
        to: toAddress,
      }, 'Withdrawal successful!');
      console.log(`\nSuccess! TX: https://polygonscan.com/tx/${result.hash}`);
    } else {
      logger.error({ hash: result.hash }, 'Withdrawal failed');
      process.exit(1);
    }
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to execute withdrawal');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
