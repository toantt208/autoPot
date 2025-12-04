/**
 * Trading Client for Polymarket CLOB
 *
 * Simplified wrapper around @polymarket/clob-client for auto-trading.
 * Uses Gnosis Safe wallet signing (POLY_GNOSIS_SAFE signature type).
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import type { BigNumber } from '@ethersproject/bignumber';
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
}
