/**
 * Fix flipsAt98 in database using new logic
 *
 * New logic: wasAt98 = true if the LOSING side ever reached 98%+ at ANY point
 *
 * Usage: DATABASE_URL="postgresql://..." node scripts/fix-flips-98.cjs [--dry-run]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllWindows(dryRun = false) {
  const windows = await prisma.statsWindow.findMany({
    orderBy: { id: 'asc' },
    include: {
      snapshots: { orderBy: { timestamp: 'asc' } },
      flips: { orderBy: { timestamp: 'asc' } },
    },
  });

  console.log(`Processing ${windows.length} windows... ${dryRun ? '(DRY RUN)' : ''}\n`);

  let updated = 0;
  let flipsUpdated = 0;

  for (const window of windows) {
    // Calculate correct flipsAt98 with new logic
    let correctFlipsAt98 = 0;
    let lastSide = null;
    let maxPriceEver = { UP: 0, DOWN: 0 };

    // Track flip details for updating flip records
    let flipDetails = [];

    for (const s of window.snapshots) {
      const up = Number(s.upPrice);
      const down = Number(s.downPrice);
      const higherSide = up >= down ? 'UP' : 'DOWN';

      // Update max price ever seen
      if (up > maxPriceEver.UP) maxPriceEver.UP = up;
      if (down > maxPriceEver.DOWN) maxPriceEver.DOWN = down;

      if (lastSide !== null && lastSide !== higherSide) {
        // Check if losing side ever reached 98%
        const wasAt98 = maxPriceEver[lastSide] >= 0.98;
        if (wasAt98) {
          correctFlipsAt98++;
        }
        flipDetails.push({
          timeLeft: s.timeLeft,
          fromSide: lastSide,
          toSide: higherSide,
          wasAt98,
          maxPrice: maxPriceEver[lastSide],
        });
      }

      lastSide = higherSide;
    }

    // Final check: if losing side ever reached 98%+ but wasn't counted in a flip
    if (lastSide) {
      const losingSide = lastSide === 'UP' ? 'DOWN' : 'UP';
      if (maxPriceEver[losingSide] >= 0.98) {
        const alreadyCounted = flipDetails.some(d => d.fromSide === losingSide && d.wasAt98);
        if (!alreadyCounted) {
          correctFlipsAt98++;
          console.log(`  Final check: ${losingSide} reached ${(maxPriceEver[losingSide] * 100).toFixed(0)}% but final is ${lastSide}`);
        }
      }
    }

    // Check if window needs update
    const needsUpdate = correctFlipsAt98 !== window.flipsAt98;

    if (needsUpdate) {
      console.log(`Window ${window.id} (${window.marketSlug.slice(-25)}): ${window.flipsAt98} -> ${correctFlipsAt98}`);

      if (!dryRun) {
        // Update window record
        await prisma.statsWindow.update({
          where: { id: window.id },
          data: { flipsAt98: correctFlipsAt98 },
        });
      }
      updated++;
    }

    // Update flip records' wasAt98 field
    for (let i = 0; i < window.flips.length && i < flipDetails.length; i++) {
      const flip = window.flips[i];
      const detail = flipDetails[i];

      // Match by timeLeft (might not be exact, but close enough)
      const matchingDetail = flipDetails.find(d =>
        d.fromSide === flip.fromSide &&
        d.toSide === flip.toSide &&
        Math.abs(d.timeLeft - flip.timeLeft) <= 2
      );

      if (matchingDetail && matchingDetail.wasAt98 !== flip.wasAt98) {
        console.log(`  Flip ${flip.id}: wasAt98 ${flip.wasAt98} -> ${matchingDetail.wasAt98} (maxPrice: ${(matchingDetail.maxPrice * 100).toFixed(0)}%)`);

        if (!dryRun) {
          await prisma.statsSideFlip.update({
            where: { id: flip.id },
            data: { wasAt98: matchingDetail.wasAt98 },
          });
        }
        flipsUpdated++;
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total windows: ${windows.length}`);
  console.log(`Windows updated: ${updated}`);
  console.log(`Flip records updated: ${flipsUpdated}`);
  if (dryRun) {
    console.log(`\nThis was a DRY RUN. Run without --dry-run to apply changes.`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  try {
    await fixAllWindows(dryRun);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
