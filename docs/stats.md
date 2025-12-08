# Price Statistics & Analytics

Monitor and analyze price movements during trading windows, track side flips, and calculate win rates.

## Prerequisites

### Database Setup

1. Ensure PostgreSQL is running (via Docker):
```bash
docker-compose up -d postgres
```

2. Set DATABASE_URL in `.env`:
```
DATABASE_URL=postgresql://polymarket:polymarket_secret@localhost:5432/polymarket
```

3. Generate Prisma client and push schema:
```bash
pnpm db:generate
pnpm db:push
```

4. Build the project:
```bash
pnpm run legacy:build
```

## Stats Collector

Monitors prices during trading windows and saves to PostgreSQL.

### Usage

```bash
node dist/stats.js <event_type>
```

### Examples

```bash
# Monitor BTC 15-minute markets
node dist/stats.js btc_15m

# Monitor ETH 15-minute markets
node dist/stats.js eth_15m

# Monitor SOL 15-minute markets
node dist/stats.js sol_15m
```

### What It Collects

- **Price snapshots** every 500ms during trading window
- **Side flips** when the higher-priced side changes (UP ↔ DOWN)
- **Phase tracking** (Phase 1, Phase 2, Retry)
- **Final outcomes** for each phase

### Output

Data is saved to:
- PostgreSQL database (real-time)
- JSON file on exit (backup)

Press `Ctrl+C` to stop and see summary.

---

## Stats Viewer CLI

View collected statistics from the database.

### Commands

#### Recent Windows
Show recent trading windows with flip details:
```bash
node dist/stats-view.js recent [crypto] [hours]
```

Examples:
```bash
# All cryptos, last 24 hours (default)
node dist/stats-view.js recent

# BTC only, last 12 hours
node dist/stats-view.js recent btc 12

# ETH only, last 48 hours
node dist/stats-view.js recent eth 48
```

#### Daily Statistics
Show daily aggregated flip statistics:
```bash
node dist/stats-view.js daily [crypto] [days]
```

Examples:
```bash
# All cryptos, last 7 days (default)
node dist/stats-view.js daily

# BTC only, last 30 days
node dist/stats-view.js daily btc 30
```

#### Flip Timing Distribution
Analyze when flips occur relative to market close:
```bash
node dist/stats-view.js flips [crypto]
```

Examples:
```bash
# All cryptos
node dist/stats-view.js flips

# SOL only
node dist/stats-view.js flips sol
```

Output shows flip counts by time bucket:
- `60+ sec` - More than 60 seconds before close
- `30-60 sec` - 30 to 60 seconds before close
- `10-30 sec` - 10 to 30 seconds before close
- `5-10 sec` - 5 to 10 seconds before close
- `0-5 sec` - Final 5 seconds before close
- `After close` - During retry window

#### Window Details
Show detailed stats for a specific trading window:
```bash
node dist/stats-view.js window <market_slug>
```

Example:
```bash
node dist/stats-view.js window btc-updown-15m-1733644800
```

Shows:
- Window metadata (crypto, interval, times)
- Side flip events with timestamps
- Sample price snapshots

#### Summary
Show overall statistics:
```bash
node dist/stats-view.js summary
```

Shows:
- Total windows collected
- Total flips recorded
- Total price snapshots
- Per-crypto statistics

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `stats_windows` | Trading window metadata and aggregates |
| `stats_price_snapshots` | Individual price snapshots (500ms interval) |
| `stats_side_flips` | Side flip events |
| `stats_sessions` | Session-level aggregates |

### SQL Views

Query the database directly with these views:

```sql
-- Window summary with price stats
SELECT * FROM stats_window_summary;

-- Daily flip statistics
SELECT * FROM stats_daily_flips;

-- Recent windows (last 24h)
SELECT * FROM stats_recent_windows;

-- Phase consistency analysis
SELECT * FROM stats_phase_analysis;

-- Flip timing distribution
SELECT * FROM stats_flip_timing;
```

---

## Example Output

### Recent Windows
```
Recent Windows (last 24 hours)
================================================================================
----------------+--------+-------+---------+---------+-------+------------------
Slug            | Crypto | Flips | P1 Side | P2 Side | Final | Flip Times
----------------+--------+-------+---------+---------+-------+------------------
...15m-1733644800 | BTC   | 2     | UP      | DOWN    | DOWN  | -8s, -3s
...15m-1733643900 | BTC   | 0     | UP      | UP      | UP    | -
...15m-1733643000 | ETH   | 1     | DOWN    | UP      | UP    | -5s
----------------+--------+-------+---------+---------+-------+------------------

Total: 3 windows
```

### Flip Timing Distribution
```
Flip Timing Distribution (last 7 days)
============================================================
-------------+-------+------------
Time Bucket  | Count | Percentage
-------------+-------+------------
60+ sec      | 5     | 10.0%
30-60 sec    | 8     | 16.0%
10-30 sec    | 15    | 30.0%
5-10 sec     | 12    | 24.0%
0-5 sec      | 10    | 20.0%
After close  | 0     | 0.0%
-------------+-------+------------

Total flips: 50
```

---

## Tips

1. **Run collector during active markets** - Start before trading windows begin
2. **Use with PM2** - Run as a background service for continuous collection
3. **Export data** - Query PostgreSQL directly for custom analysis
4. **Compare strategies** - Analyze flip patterns to optimize strategy timing
