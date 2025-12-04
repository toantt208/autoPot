/**
 * Type definitions for the Polymarket auto-trading bot
 */

export interface MarketWindow {
  /** Market slug (e.g., btc-updown-15m-1764690300) */
  slug: string;
  /** Crypto symbol (btc, eth, sol) */
  crypto: string;
  /** Unix timestamp when market starts */
  startTime: number;
  /** Unix timestamp when market actually closes (for trading calculations) */
  marketCloseTime: number;
  /** Unix timestamp for extended window end (includes grace period) */
  endTime: number;
  /** Unix timestamp when trading window starts (2 min before close) */
  tradingWindowStart: number;
}

export interface TokenIds {
  /** Token ID for the "Up" outcome */
  up: string;
  /** Token ID for the "Down" outcome */
  down: string;
  /** Whether this is a neg risk market */
  negRisk: boolean;
  /** Minimum tick size for order prices */
  tickSize: string;
}

export interface PriceSnapshot {
  /** Unix timestamp of the price check */
  timestamp: number;
  /** Current price for "Up" outcome (0-1) */
  upPrice: number;
  /** Current price for "Down" outcome (0-1) */
  downPrice: number;
}

export interface TradingSignal {
  /** Which side to buy */
  side: 'UP' | 'DOWN';
  /** Current price of the side */
  price: number;
  /** Token ID to buy */
  tokenId: string;
  /** Market slug */
  marketSlug: string;
  /** Whether this is a neg risk market */
  negRisk: boolean;
  /** Minimum tick size for order prices */
  tickSize: string;
  /** Unix timestamp when the trading window ends (market close time) */
  windowEndTime: number;
}

export interface TradeResult {
  /** Whether the trade was successful */
  success: boolean;
  /** Order ID if successful */
  orderId?: string;
  /** Transaction hash on-chain */
  transactionHash?: string;
  /** Amount filled */
  filledAmount?: number;
  /** Average fill price */
  averagePrice?: number;
  /** Error message if failed */
  error?: string;
  /** Market slug traded */
  marketSlug: string;
  /** Side traded */
  side: 'UP' | 'DOWN';
}

export interface MarketData {
  /** Market/event ID */
  id: string;
  /** Market slug */
  slug: string;
  /** Market question/title */
  question: string;
  /** Whether market is closed */
  closed: boolean;
  /** End date ISO string */
  endDateIso: string;
  /** Array of market outcomes */
  markets: OutcomeMarket[];
}

export interface OutcomeMarket {
  /** Outcome market ID */
  id: string;
  /** Condition ID */
  conditionId: string;
  /** Outcomes array (Up, Down) */
  outcomes: string[];
  /** Outcome prices as strings */
  outcomePrices: string[];
  /** CLOB token IDs for each outcome */
  clobTokenIds: string[];
  /** Whether this is a neg risk market */
  negRisk: boolean;
  /** Minimum tick size for order prices */
  orderPriceMinTickSize: string;
}

export interface OrderResponse {
  /** Order ID */
  orderID?: string;
  /** Order status */
  status?: string;
  /** Error message if any */
  errorMsg?: string;
  /** Fill information */
  fills?: OrderFill[];
}

export interface OrderFill {
  /** Fill price */
  price: string;
  /** Fill size */
  size: string;
  /** Fill side */
  side: string;
}
