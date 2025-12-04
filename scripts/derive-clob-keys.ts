#!/usr/bin/env tsx
/**
 * Derive CLOB API Credentials
 *
 * This script derives CLOB API credentials from your EOA private key.
 * The credentials are deterministic - running multiple times with the same
 * private key will return the same credentials.
 *
 * Usage:
 *   pnpm tsx scripts/derive-clob-keys.ts
 *
 * Or with private key as argument:
 *   pnpm tsx scripts/derive-clob-keys.ts <private_key>
 *
 * Or set MASTER_PRIVATE_KEY in .env file
 */

import { ClobClient } from '@polymarket/clob-client';
import { Wallet } from '@ethersproject/wallet';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const CLOB_HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137; // Polygon mainnet

interface ClobCredentials {
  apiKey: string;
  secret: string;
  passphrase: string;
}

async function deriveClobCredentials(privateKey: string): Promise<ClobCredentials> {
  const wallet = new Wallet(privateKey);

  console.log(`\nWallet Address: ${wallet.address}`);
  console.log('Deriving CLOB API credentials...\n');

  const clobClient = new ClobClient(CLOB_HOST, CHAIN_ID, wallet);
  const creds = await clobClient.createOrDeriveApiKey();

  return {
    apiKey: creds.key,
    secret: creds.secret,
    passphrase: creds.passphrase,
  };
}

async function main() {
  // Get private key from argument or environment
  let privateKey = process.argv[2];

  if (!privateKey) {
    privateKey = process.env.MASTER_PRIVATE_KEY || '';
  }

  if (!privateKey) {
    console.error('Error: No private key provided.');
    console.error('\nUsage:');
    console.error('  pnpm tsx scripts/derive-clob-keys.ts <private_key>');
    console.error('  Or set MASTER_PRIVATE_KEY in .env file');
    process.exit(1);
  }

  // Ensure private key has 0x prefix
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  try {
    const credentials = await deriveClobCredentials(privateKey);

    console.log('='.repeat(60));
    console.log('CLOB API Credentials (add these to your .env file):');
    console.log('='.repeat(60));
    console.log(`CLOB_API_KEY=${credentials.apiKey}`);
    console.log(`CLOB_SECRET=${credentials.secret}`);
    console.log(`CLOB_PASSPHRASE=${credentials.passphrase}`);
    console.log('='.repeat(60));
    console.log('\nCredentials derived successfully!');
  } catch (error) {
    console.error('Error deriving credentials:', error);
    process.exit(1);
  }
}

main();
