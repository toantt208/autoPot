/**
 * Approve All Allowances Script
 *
 * Approves USDC and CTF (Conditional Tokens) to all required Polymarket contracts.
 * This is a one-time setup script that needs to be run before trading.
 *
 * Usage: npx tsx src/approve-all.ts
 */

import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';
import { logger } from './utils/logger.js';

async function main() {
  logger.info('=== Polymarket Allowance Approval Script ===');

  // Load and validate config
  const config = getConfig();

  logger.info(
    {
      safeAddress: config.GNOSIS_SAFE_ADDRESS,
      rpcUrl: config.POLYGON_RPC_URL,
    },
    'Configuration loaded'
  );

  // Initialize trading client
  const tradingClient = new TradingClient(config);

  // Log contract addresses
  const contracts = TradingClient.getContracts();
  logger.info({ contracts }, 'Target contracts');

  // Check current allowance status
  logger.info('Checking current allowance status...');
  const hasAllowances = await tradingClient.hasAllowances();

  if (hasAllowances) {
    logger.info('All allowances already set! No action needed.');
    const status = await tradingClient.getAllowanceStatus();
    logger.info(
      {
        usdcToNegRiskExchange: !status.usdcToNegRiskExchange.isZero(),
        usdcToNegRiskAdapter: !status.usdcToNegRiskAdapter.isZero(),
        ctfToNegRiskExchange: status.ctfToNegRiskExchange,
        ctfToNegRiskAdapter: status.ctfToNegRiskAdapter,
      },
      'Current allowance status'
    );
    return;
  }

  logger.info('Some allowances are missing. Starting approval process via Builder Relayer...');

  // Approve all via relayer (gasless)
  const result = await tradingClient.approveAll();

  if (!result.success) {
    logger.error('Approval failed. Please check the logs above.');
    process.exit(1);
  }

  // Log results
  logger.info('=== Approval Complete ===');
  logger.info({ txHash: result.txHash }, 'Approval transaction');

  // Verify
  logger.info('Verifying allowances...');
  const finalStatus = await tradingClient.hasAllowances();

  if (finalStatus) {
    logger.info('All allowances verified successfully!');
  } else {
    logger.error('Allowance verification failed. Please check transaction on Polygonscan.');
    logger.info({ txHash: result.txHash }, 'Check this transaction');
    process.exit(1);
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error in approval script');
  process.exit(1);
});
