/**
 * Check flips at 98% in database
 *
 * A "flip at 98%" means:
 * - At some point, one side reached 98%+
 * - But the final result was the OTHER side
 *
 * Usage: DATABASE_URL="postgresql://..." node scripts/check-flips-98.js [windowId]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWindow(windowId) {
  const window = await prisma.statsWindow.findUnique({
    where: { id: BigInt(windowId) },
    include: {
      snapshots: { orderBy: { timestamp: 'asc' } },
      flips: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!window) {
    console.log(`Window ${windowId} not found`);
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Window ID: ${window.id}`);
  console.log(`Slug: ${window.marketSlug}`);
  console.log(`Final Side: ${window.finalSide}`);
  console.log(`Recorded sideFlips: ${window.sideFlips}`);
  console.log(`Recorded flipsAt98: ${window.flipsAt98}`);
  console.log('='.repeat(80));

  // Find all snapshots where either side >= 98%
  const snapshotsAt98 = window.snapshots.filter(s => {
    const up = Number(s.upPrice);
    const down = Number(s.downPrice);
    return up >= 0.98 || down >= 0.98;
  });

  console.log(`\nSnapshots at 98%+: ${snapshotsAt98.length}`);

  if (snapshotsAt98.length > 0) {
    console.log('\nFirst 10 snapshots at 98%+:');
    snapshotsAt98.slice(0, 10).forEach(s => {
      const up = (Number(s.upPrice) * 100).toFixed(2);
      const down = (Number(s.downPrice) * 100).toFixed(2);
      console.log(`  id:${s.id} timeLeft:${s.timeLeft}s UP:${up}% DOWN:${down}% higher:${s.higherSide}`);
    });
  }

  // Check: Did any side reach 98% but final was different?
  let sidesThatReached98 = new Set();
  for (const s of window.snapshots) {
    const up = Number(s.upPrice);
    const down = Number(s.downPrice);
    if (up >= 0.98) sidesThatReached98.add('UP');
    if (down >= 0.98) sidesThatReached98.add('DOWN');
  }

  console.log(`\nSides that reached 98%+: ${[...sidesThatReached98].join(', ') || 'none'}`);

  // Calculate: Should this be a "flip at 98%"?
  let shouldBeFlipAt98 = false;
  let reason = '';

  for (const side of sidesThatReached98) {
    if (side !== window.finalSide) {
      shouldBeFlipAt98 = true;
      reason = `${side} reached 98% but final was ${window.finalSide}`;
      break;
    }
  }

  console.log(`\nShould be flip at 98%: ${shouldBeFlipAt98}`);
  if (reason) console.log(`Reason: ${reason}`);

  // Show recorded flips
  console.log(`\nRecorded flip events (${window.flips.length}):`);
  window.flips.forEach(f => {
    const price = (Number(f.priceAtFlip) * 100).toFixed(2);
    console.log(`  id:${f.id} timeLeft:${f.timeLeft}s ${f.fromSide}->${f.toSide} price:${price}% wasAt98:${f.wasAt98}`);
  });

  // Verify flip detection with NEW LOGIC
  // wasAt98 = true if the LOSING side ever reached 98%+ at ANY point before the flip
  console.log('\n--- VERIFICATION (NEW LOGIC) ---');
  let detectedFlipsAt98 = 0;
  let lastSide = null;
  let maxPriceEver = { UP: 0, DOWN: 0 };

  for (const s of window.snapshots) {
    const up = Number(s.upPrice);
    const down = Number(s.downPrice);
    const higherSide = up >= down ? 'UP' : 'DOWN';

    // Update max price ever seen for each side
    if (up > maxPriceEver.UP) maxPriceEver.UP = up;
    if (down > maxPriceEver.DOWN) maxPriceEver.DOWN = down;

    if (lastSide !== null && lastSide !== higherSide) {
      // Check if the losing side (lastSide) ever reached 98%
      const wasAt98 = maxPriceEver[lastSide] >= 0.98;

      console.log(`Flip at timeLeft ${s.timeLeft}s: ${lastSide}->${higherSide}`);
      console.log(`  maxPrice[${lastSide}]: ${(maxPriceEver[lastSide] * 100).toFixed(2)}%`);
      console.log(`  wasAt98: ${wasAt98}`);

      if (wasAt98) {
        detectedFlipsAt98++;
      }
    }

    lastSide = higherSide;
  }

  // Final check: if losing side ever reached 98%+ but wasn't counted in a flip
  if (lastSide) {
    const losingSide = lastSide === 'UP' ? 'DOWN' : 'UP';
    if (maxPriceEver[losingSide] >= 0.98) {
      // Check if already counted
      let alreadyCounted = false;
      // We need to track flip events to check this properly
      // For simplicity, just check if any flip had fromSide = losingSide with wasAt98
      const matchingFlip = window.flips.find(f => f.fromSide === losingSide && f.wasAt98);
      if (!matchingFlip) {
        console.log(`\nFinal check: ${losingSide} reached ${(maxPriceEver[losingSide] * 100).toFixed(2)}% but final is ${lastSide} - adding to flipsAt98`);
        detectedFlipsAt98++;
      }
    }
  }

  console.log(`\nMax prices seen: UP=${(maxPriceEver.UP * 100).toFixed(2)}% DOWN=${(maxPriceEver.DOWN * 100).toFixed(2)}%`);
  console.log(`Detected flips at 98% (new logic): ${detectedFlipsAt98}`);
  console.log(`Recorded flipsAt98 in DB: ${window.flipsAt98}`);

  if (detectedFlipsAt98 !== window.flipsAt98) {
    console.log(`\n⚠️  MISMATCH! Should be ${detectedFlipsAt98}, recorded as ${window.flipsAt98}`);
  } else {
    console.log(`\n✓ Match`);
  }
}

async function checkAllWindows() {
  const windows = await prisma.statsWindow.findMany({
    orderBy: { id: 'desc' },
    take: 20,
    include: {
      snapshots: { orderBy: { timestamp: 'asc' } },
      flips: true,
    },
  });

  console.log(`Checking ${windows.length} recent windows...\n`);

  let issues = [];

  for (const window of windows) {
    // Calculate expected flipsAt98 with NEW LOGIC
    let expectedFlipsAt98 = 0;
    let lastSide = null;
    let maxPriceEver = { UP: 0, DOWN: 0 };

    for (const s of window.snapshots) {
      const up = Number(s.upPrice);
      const down = Number(s.downPrice);
      const higherSide = up >= down ? 'UP' : 'DOWN';

      // Update max price ever seen
      if (up > maxPriceEver.UP) maxPriceEver.UP = up;
      if (down > maxPriceEver.DOWN) maxPriceEver.DOWN = down;

      if (lastSide !== null && lastSide !== higherSide) {
        // Check if losing side ever reached 98%
        if (maxPriceEver[lastSide] >= 0.98) {
          expectedFlipsAt98++;
        }
      }

      lastSide = higherSide;
    }

    // Final check: if losing side ever reached 98%+ but wasn't counted in a flip
    if (lastSide) {
      const losingSide = lastSide === 'UP' ? 'DOWN' : 'UP';
      if (maxPriceEver[losingSide] >= 0.98) {
        const matchingFlip = window.flips.find(f => f.fromSide === losingSide && f.wasAt98);
        if (!matchingFlip) {
          expectedFlipsAt98++;
        }
      }
    }

    const match = expectedFlipsAt98 === window.flipsAt98;
    const status = match ? '✓' : '⚠️';

    console.log(`${status} Window ${window.id}: flipsAt98=${window.flipsAt98} expected=${expectedFlipsAt98} (${window.marketSlug.slice(-30)})`);

    if (!match) {
      issues.push({
        id: window.id,
        slug: window.marketSlug,
        recorded: window.flipsAt98,
        expected: expectedFlipsAt98,
      });
    }
  }

  if (issues.length > 0) {
    console.log(`\n${issues.length} windows with mismatches:`);
    issues.forEach(i => {
      console.log(`  Window ${i.id}: recorded=${i.recorded} expected=${i.expected}`);
    });
  } else {
    console.log('\nAll windows match!');
  }
}

async function main() {
  const windowId = process.argv[2];

  try {
    if (windowId) {
      await checkWindow(windowId);
    } else {
      await checkAllWindows();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
