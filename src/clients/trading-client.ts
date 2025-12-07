/**
 * Trading Client for Polymarket CLOB
 *
 * Simplified wrapper around @polymarket/clob-client for auto-trading.
 * Uses Gnosis Safe wallet signing (POLY_GNOSIS_SAFE signature type).
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { RelayClient } from '@polymarket/builder-relayer-client';
import type { SafeTransaction } from '@polymarket/builder-relayer-client';
import { BuilderConfig } from '@polymarket/builder-signing-sdk';
import { Wallet } from '@ethersproject/wallet';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import type { BigNumber } from '@ethersproject/bignumber';
import { encodeFunctionData } from 'viem';
import { logger } from '../utils/logger.js';
import type { Config } from '../config/index.js';

// Contract addresses on Polygon
const CONTRACTS = {
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  CTF_EXCHANGE: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',
  NEG_RISK_CTF_EXCHANGE: '0xC5d563A36AE78145C45a50134d48A1215220f80a',
  NEG_RISK_ADAPTER: '0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296',
  CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
};

const POLYGON_CHAIN_ID = 137;
const CLOB_HOST = 'https://clob.polymarket.com';
const RELAYER_URL = 'https://relayer-v2.polymarket.com/';
const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

// ABIs for encoding transaction data (viem format)
const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ERC1155_SET_APPROVAL_ABI = [
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Minimal ABIs for allowance checks
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const ERC1155_ABI = [
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function setApprovalForAll(address operator, bool approved)',
];

export interface MarketBuyParams {
  /** Token ID of the outcome to buy */
  tokenId: string;
  /** Amount in USDC to spend */
  amount: number;
  /** Whether this is a neg risk market (from Gamma API) */
  negRisk: boolean;
  /** Minimum tick size for order prices (from Gamma API) */
  tickSize: string;
}

export interface AllowanceStatus {
  usdcToNegRiskExchange: BigNumber;
  usdcToNegRiskAdapter: BigNumber;
  ctfToNegRiskExchange: boolean;
  ctfToNegRiskAdapter: boolean;
}

export class TradingClient {
  private client: ClobClient;
  private relayClient: RelayClient;
  private provider: JsonRpcProvider;
  private proxyAddress: string;
  private wallet: Wallet;
  private dryRun: boolean;

  constructor(config: Config) {
    this.provider = new JsonRpcProvider(config.POLYGON_RPC_URL);
    this.proxyAddress = config.GNOSIS_SAFE_ADDRESS;
    this.dryRun = config.DRY_RUN;

    // Create wallet connected to provider
    this.wallet = new Wallet(config.MASTER_PRIVATE_KEY, this.provider);

    const creds: ApiKeyCreds = {
      key: config.CLOB_API_KEY,
      secret: config.CLOB_SECRET,
      passphrase: config.CLOB_PASSPHRASE,
    };

    // Initialize CLOB client with Safe wallet signing
    this.client = new ClobClient(
      CLOB_HOST,
      POLYGON_CHAIN_ID,
      this.wallet,
      creds,
      SignatureType.POLY_GNOSIS_SAFE,
      config.GNOSIS_SAFE_ADDRESS
    );

    // Initialize Builder Relayer client for gasless transactions
    const builderConfig = new BuilderConfig({
      localBuilderCreds: {
        key: config.BUILDER_API_KEY,
        secret: config.BUILDER_SECRET,
        passphrase: config.BUILDER_PASSPHRASE,
      },
    });

    this.relayClient = new RelayClient(
      RELAYER_URL,
      POLYGON_CHAIN_ID,
      this.wallet,
      builderConfig
    );

    logger.info(
      { safeAddress: this.proxyAddress, dryRun: this.dryRun },
      'Trading client initialized'
    );
  }

  /**
   * Get current buy price for a token
   */
  async getBuyPrice(tokenId: string): Promise<number> {
    try {
      const result = await this.client.getPrice(tokenId, Side.BUY);
      // API returns { price: "0.7" } object
      const priceStr = typeof result === 'object' && result !== null
        ? (result as any).price
        : result;
      const parsed = parseFloat(priceStr);
      logger.debug({ tokenId: tokenId.slice(0, 20) + '...', raw: result, parsed }, 'Price fetched');
      if (isNaN(parsed)) {
        logger.warn({ tokenId: tokenId.slice(0, 20) + '...', result }, 'Price returned NaN');
        return 0;
      }
      return parsed;
    } catch (error: any) {
      logger.warn({ tokenId: tokenId.slice(0, 20) + '...', error: error?.message }, 'Error fetching price');
      return 0;
    }
  }

  /**
   * Get batch prices for multiple tokens in one API call
   * Uses POST /prices endpoint to avoid rate limiting
   */
  async getBatchPrices(upTokenId: string, downTokenId: string): Promise<{ upPrice: number; downPrice: number }> {
    try {
      const response = await fetch('https://clob.polymarket.com/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { token_id: upTokenId, side: 'BUY' },
          { token_id: downTokenId, side: 'BUY' },
        ]),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      // Response format: { "token_id": { "BUY": "0.7", "SELL": "0.8" }, ... }
      const upPrice = parseFloat(data[upTokenId]?.BUY || '0');
      const downPrice = parseFloat(data[downTokenId]?.BUY || '0');

      logger.debug({ upPrice, downPrice }, 'Batch prices fetched');
      return { upPrice, downPrice };
    } catch (error: any) {
      logger.warn({ error: error?.message }, 'Error fetching batch prices');
      return { upPrice: 0, downPrice: 0 };
    }
  }

  /**
   * Get current sell price for a token
   */
  async getSellPrice(tokenId: string): Promise<number> {
    const price = await this.client.getPrice(tokenId, Side.SELL);
    return parseFloat(price);
  }

  /**
   * Get midpoint price for a token
   */
  async getMidpoint(tokenId: string): Promise<number> {
    const midpoint = await this.client.getMidpoint(tokenId);
    return parseFloat(midpoint);
  }

  /**
   * Get order book for a token
   */
  async getOrderbook(tokenId: string) {
    return this.client.getOrderBook(tokenId);
  }

  /**
   * Check if orderbook exists for a token
   * Returns false if API returns "No orderbook exists" error
   */
  async orderbookExists(tokenId: string): Promise<boolean> {
    try {
      const response = await this.client.getOrderBook(tokenId);

      // @ts-ignore
      if (response?.status === 404) {
        return false;
      }

      return true;
    } catch (error: any) {
      const message = error?.message || '';
      if (message.includes('No orderbook exists')) {
        return false;
      }

      // Other errors - assume orderbook might exist
      return true;
    }
  }

  /**
   * Place a market buy order (FOK - Fill or Kill)
   * negRisk and tickSize come from Gamma API market data
   */
  async marketBuy(params: MarketBuyParams) {
    const { tokenId, amount, negRisk, tickSize } = params;

    logger.info(
      {
        tokenId: tokenId.slice(0, 20) + '...',
        amount,
        negRisk,
        tickSize,
        dryRun: this.dryRun,
      },
      'Placing market buy order'
    );

    if (this.dryRun) {
      logger.info({ tokenId: tokenId.slice(0, 20) + '...', amount }, 'DRY RUN: Would place market buy order');
      return {
        orderID: 'dry-run-order-id',
        status: 'DRY_RUN',
      };
    }

    // Create and post market order in one call
    const result = await this.client.createAndPostMarketOrder(
      {
        tokenID: tokenId,
        amount,
        side: Side.BUY,
      },
      {
        negRisk,
        tickSize: tickSize as TickSize,
      },
      OrderType.FAK
    );

    logger.info(
      { orderId: result.orderID, status: result.status },
      'Market buy order placed'
    );

    return result;
  }

  /**
   * Check allowance status for neg risk markets
   */
  async getAllowanceStatus(): Promise<AllowanceStatus> {
    const usdc = new Contract(CONTRACTS.USDC, ERC20_ABI, this.provider);
    const ctf = new Contract(CONTRACTS.CONDITIONAL_TOKENS, ERC1155_ABI, this.provider);

    const [
      usdcToNegRiskExchange,
      usdcToNegRiskAdapter,
      ctfToNegRiskExchange,
      ctfToNegRiskAdapter,
    ] = await Promise.all([
      usdc.allowance(this.proxyAddress, CONTRACTS.NEG_RISK_CTF_EXCHANGE),
      usdc.allowance(this.proxyAddress, CONTRACTS.NEG_RISK_ADAPTER),
      ctf.isApprovedForAll(this.proxyAddress, CONTRACTS.NEG_RISK_CTF_EXCHANGE),
      ctf.isApprovedForAll(this.proxyAddress, CONTRACTS.NEG_RISK_ADAPTER),
    ]);

    return {
      usdcToNegRiskExchange,
      usdcToNegRiskAdapter,
      ctfToNegRiskExchange,
      ctfToNegRiskAdapter,
    };
  }

  /**
   * Check if allowances are set for neg risk trading
   */
  async hasAllowances(): Promise<boolean> {
    const status = await this.getAllowanceStatus();

    const hasAllowances =
      !status.usdcToNegRiskExchange.isZero() &&
      !status.usdcToNegRiskAdapter.isZero() &&
      status.ctfToNegRiskExchange &&
      status.ctfToNegRiskAdapter;

    logger.debug({ status: {
      usdcToNegRiskExchange: !status.usdcToNegRiskExchange.isZero(),
      usdcToNegRiskAdapter: !status.usdcToNegRiskAdapter.isZero(),
      ctfToNegRiskExchange: status.ctfToNegRiskExchange,
      ctfToNegRiskAdapter: status.ctfToNegRiskAdapter,
    }, hasAllowances }, 'Allowance status checked');

    return hasAllowances;
  }

  /**
   * Get the Safe/proxy address
   */
  getProxyAddress(): string {
    return this.proxyAddress;
  }

  /**
   * Get the underlying CLOB client for advanced operations
   */
  getClobClient(): ClobClient {
    return this.client;
  }

  /**
   * Get the JSON RPC provider for direct RPC calls
   */
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get the wallet for direct signing
   */
  getWallet(): Wallet {
    return this.wallet;
  }

  /**
   * Build all approval transactions for trading
   * USDC approvals + CTF (ERC1155) approvals to all required contracts
   */
  private buildAllApprovalTxs(): SafeTransaction[] {
    const transactions: SafeTransaction[] = [];

    // USDC approvals (ERC20)
    const usdcSpenders = [
      CONTRACTS.CTF_EXCHANGE,
      CONTRACTS.NEG_RISK_CTF_EXCHANGE,
      CONTRACTS.NEG_RISK_ADAPTER,
    ];

    for (const spender of usdcSpenders) {
      const data = encodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, BigInt(MAX_UINT256)],
      });

      transactions.push({
        to: CONTRACTS.USDC,
        operation: 0, // Call
        value: '0',
        data,
      });
    }

    // CTF approvals (ERC1155)
    const ctfOperators = [
      CONTRACTS.CTF_EXCHANGE,
      CONTRACTS.NEG_RISK_CTF_EXCHANGE,
      CONTRACTS.NEG_RISK_ADAPTER,
    ];

    for (const operator of ctfOperators) {
      const data = encodeFunctionData({
        abi: ERC1155_SET_APPROVAL_ABI,
        functionName: 'setApprovalForAll',
        args: [operator as `0x${string}`, true],
      });

      transactions.push({
        to: CONTRACTS.CONDITIONAL_TOKENS,
        operation: 0, // Call
        value: '0',
        data,
      });
    }

    return transactions;
  }

  /**
   * Approve all tokens for trading via Builder Relayer (gasless)
   * Approves USDC and CTF to all required Polymarket contracts
   * Returns transaction hash
   */
  async approveAll(): Promise<{ txHash: string; success: boolean }> {
    logger.info({ safeAddress: this.proxyAddress }, 'Starting gasless approval via relayer...');

    const transactions = this.buildAllApprovalTxs();
    logger.info({ txCount: transactions.length }, 'Built approval transactions');

    try {
      // Execute via relayer (gasless - relayer pays gas)
      const response = await this.relayClient.execute(transactions, 'Approve all tokens for trading');
      const txHash = (response as any).transactionHash || '';

      logger.info({ txHash }, 'Approval transaction sent via relayer');

      // Wait for confirmation
      if (txHash) {
        logger.info('Waiting for transaction confirmation...');
        const receipt = await this.provider.waitForTransaction(txHash);
        logger.info({ txHash, blockNumber: receipt.blockNumber }, 'Approval transaction confirmed');
      }

      return { txHash, success: true };
    } catch (error: any) {
      logger.error({ error: error?.message }, 'Failed to execute approvals via relayer');
      return { txHash: '', success: false };
    }
  }

  /**
   * Get contract addresses (for logging/debugging)
   */
  static getContracts() {
    return CONTRACTS;
  }
}
