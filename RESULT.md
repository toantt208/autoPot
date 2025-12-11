# Martingale Simulation with Skip Rule

## Configuration
- **Crypto**: BTC
- **Target Side**: UP
- **Base Bet**: $1
- **Skip After**: 5 consecutive losses
- **Skip Duration**: 1 hour(s)

## Summary
| Metric | Value |
|--------|-------|
| Total Windows | 2784 |
| Traded Windows | 2574 |
| Skipped Windows | 210 |
| Wins | 1291 (50.2%) |
| Losses | 1283 (49.8%) |
| **Total Profit** | **$1290.00** |
| Max Bet Required | $512 |
| Max Drawdown | $511.00 |
| Max Loss Streak | 9 |
| Skip Events | 70 |

## Balance Requirements (with skip rule)
After 5 losses, skip 1h then continue with doubled bet.
Max bet seen in simulation: $512

| Base Bet | Max Balance Needed |
|----------|-------------------|
| $1 | $1023 |
| $2 | $2046 |
| $5 | $5115 |

## Big Recoveries (won after loss streak)
| Time | Loss Streak | Bet Amount | Recovered |
|------|-------------|------------|-----------|
| 2025-12-05 04:45:00 | 9 | $512 | $511 |
| 2025-11-12 18:45:00 | 8 | $256 | $255 |
| 2025-11-21 03:30:00 | 8 | $256 | $255 |
| 2025-11-21 16:15:00 | 8 | $256 | $255 |
| 2025-11-11 08:00:00 | 7 | $128 | $127 |
| 2025-11-13 19:00:00 | 7 | $128 | $127 |
| 2025-11-21 10:45:00 | 7 | $128 | $127 |
| 2025-11-22 01:45:00 | 7 | $128 | $127 |
| 2025-11-11 22:30:00 | 6 | $64 | $63 |
| 2025-11-14 19:45:00 | 6 | $64 | $63 |
| 2025-11-16 17:45:00 | 6 | $64 | $63 |
| 2025-11-16 23:30:00 | 6 | $64 | $63 |
| 2025-11-19 05:45:00 | 6 | $64 | $63 |
| 2025-11-20 11:30:00 | 6 | $64 | $63 |
| 2025-11-22 10:45:00 | 6 | $64 | $63 |
| 2025-12-01 05:15:00 | 6 | $64 | $63 |
| 2025-12-04 19:30:00 | 6 | $64 | $63 |
| 2025-12-05 10:30:00 | 6 | $64 | $63 |
| 2025-12-07 23:45:00 | 6 | $64 | $63 |
| 2025-11-11 13:45:00 | 5 | $32 | $31 |

## Skip Events (70 total)
| # | After Window | Loss Streak | Lost Amount | Next Bet | Skip Until | Mode |
|---|--------------|-------------|-------------|----------|------------|------|
| 1 | 2025-11-11 05:00:00 | 5 | $31 | $32 | 2025-11-11 06:00:00.000 | CONTINUE |
| 2 | 2025-11-11 06:00:00 | 6 | $63 | $64 | 2025-11-11 07:00:00.000 | CONTINUE |
| 3 | 2025-11-11 07:00:00 | 7 | $127 | $128 | 2025-11-11 08:00:00.000 | CONTINUE |
| 4 | 2025-11-11 12:45:00 | 5 | $31 | $32 | 2025-11-11 13:45:00.000 | CONTINUE |
| 5 | 2025-11-11 20:30:00 | 5 | $31 | $32 | 2025-11-11 21:30:00.000 | CONTINUE |
| 6 | 2025-11-11 21:30:00 | 6 | $63 | $64 | 2025-11-11 22:30:00.000 | CONTINUE |
| 7 | 2025-11-12 14:45:00 | 5 | $31 | $32 | 2025-11-12 15:45:00.000 | CONTINUE |
| 8 | 2025-11-12 15:45:00 | 6 | $63 | $64 | 2025-11-12 16:45:00.000 | CONTINUE |
| 9 | 2025-11-12 16:45:00 | 7 | $127 | $128 | 2025-11-12 17:45:00.000 | CONTINUE |
| 10 | 2025-11-12 17:45:00 | 8 | $255 | $256 | 2025-11-12 18:45:00.000 | CONTINUE |
| 11 | 2025-11-13 13:45:00 | 5 | $31 | $32 | 2025-11-13 14:45:00.000 | CONTINUE |
| 12 | 2025-11-13 16:00:00 | 5 | $31 | $32 | 2025-11-13 17:00:00.000 | CONTINUE |
| 13 | 2025-11-13 17:00:00 | 6 | $63 | $64 | 2025-11-13 18:00:00.000 | CONTINUE |
| 14 | 2025-11-13 18:00:00 | 7 | $127 | $128 | 2025-11-13 19:00:00.000 | CONTINUE |
| 15 | 2025-11-14 17:45:00 | 5 | $31 | $32 | 2025-11-14 18:45:00.000 | CONTINUE |
| 16 | 2025-11-14 18:45:00 | 6 | $63 | $64 | 2025-11-14 19:45:00.000 | CONTINUE |
| 17 | 2025-11-15 11:45:00 | 5 | $31 | $32 | 2025-11-15 12:45:00.000 | CONTINUE |
| 18 | 2025-11-16 15:45:00 | 5 | $31 | $32 | 2025-11-16 16:45:00.000 | CONTINUE |
| 19 | 2025-11-16 16:45:00 | 6 | $63 | $64 | 2025-11-16 17:45:00.000 | CONTINUE |
| 20 | 2025-11-16 21:30:00 | 5 | $31 | $32 | 2025-11-16 22:30:00.000 | CONTINUE |
| 21 | 2025-11-16 22:30:00 | 6 | $63 | $64 | 2025-11-16 23:30:00.000 | CONTINUE |
| 22 | 2025-11-17 19:45:00 | 5 | $31 | $32 | 2025-11-17 20:45:00.000 | CONTINUE |
| 23 | 2025-11-19 03:45:00 | 5 | $31 | $32 | 2025-11-19 04:45:00.000 | CONTINUE |
| 24 | 2025-11-19 04:45:00 | 6 | $63 | $64 | 2025-11-19 05:45:00.000 | CONTINUE |
| 25 | 2025-11-20 09:30:00 | 5 | $31 | $32 | 2025-11-20 10:30:00.000 | CONTINUE |
| 26 | 2025-11-20 10:30:00 | 6 | $63 | $64 | 2025-11-20 11:30:00.000 | CONTINUE |
| 27 | 2025-11-20 23:30:00 | 5 | $31 | $32 | 2025-11-21 00:30:00.000 | CONTINUE |
| 28 | 2025-11-21 00:30:00 | 6 | $63 | $64 | 2025-11-21 01:30:00.000 | CONTINUE |
| 29 | 2025-11-21 01:30:00 | 7 | $127 | $128 | 2025-11-21 02:30:00.000 | CONTINUE |
| 30 | 2025-11-21 02:30:00 | 8 | $255 | $256 | 2025-11-21 03:30:00.000 | CONTINUE |
| 31 | 2025-11-21 07:45:00 | 5 | $31 | $32 | 2025-11-21 08:45:00.000 | CONTINUE |
| 32 | 2025-11-21 08:45:00 | 6 | $63 | $64 | 2025-11-21 09:45:00.000 | CONTINUE |
| 33 | 2025-11-21 09:45:00 | 7 | $127 | $128 | 2025-11-21 10:45:00.000 | CONTINUE |
| 34 | 2025-11-21 12:15:00 | 5 | $31 | $32 | 2025-11-21 13:15:00.000 | CONTINUE |
| 35 | 2025-11-21 13:15:00 | 6 | $63 | $64 | 2025-11-21 14:15:00.000 | CONTINUE |
| 36 | 2025-11-21 14:15:00 | 7 | $127 | $128 | 2025-11-21 15:15:00.000 | CONTINUE |
| 37 | 2025-11-21 15:15:00 | 8 | $255 | $256 | 2025-11-21 16:15:00.000 | CONTINUE |
| 38 | 2025-11-21 22:45:00 | 5 | $31 | $32 | 2025-11-21 23:45:00.000 | CONTINUE |
| 39 | 2025-11-21 23:45:00 | 6 | $63 | $64 | 2025-11-22 00:45:00.000 | CONTINUE |
| 40 | 2025-11-22 00:45:00 | 7 | $127 | $128 | 2025-11-22 01:45:00.000 | CONTINUE |
| 41 | 2025-11-22 08:45:00 | 5 | $31 | $32 | 2025-11-22 09:45:00.000 | CONTINUE |
| 42 | 2025-11-22 09:45:00 | 6 | $63 | $64 | 2025-11-22 10:45:00.000 | CONTINUE |
| 43 | 2025-11-23 07:00:00 | 5 | $31 | $32 | 2025-11-23 08:00:00.000 | CONTINUE |
| 44 | 2025-11-24 00:00:00 | 5 | $31 | $32 | 2025-11-24 01:00:00.000 | CONTINUE |
| 45 | 2025-11-26 09:00:00 | 5 | $31 | $32 | 2025-11-26 10:00:00.000 | CONTINUE |
| 46 | 2025-11-27 03:45:00 | 5 | $31 | $32 | 2025-11-27 04:45:00.000 | CONTINUE |
| 47 | 2025-11-27 13:15:00 | 5 | $31 | $32 | 2025-11-27 14:15:00.000 | CONTINUE |
| 48 | 2025-12-01 00:00:00 | 5 | $31 | $32 | 2025-12-01 01:00:00.000 | CONTINUE |
| 49 | 2025-12-01 03:15:00 | 5 | $31 | $32 | 2025-12-01 04:15:00.000 | CONTINUE |
| 50 | 2025-12-01 04:15:00 | 6 | $63 | $64 | 2025-12-01 05:15:00.000 | CONTINUE |
| 51 | 2025-12-01 12:00:00 | 5 | $31 | $32 | 2025-12-01 13:00:00.000 | CONTINUE |
| 52 | 2025-12-03 08:45:00 | 5 | $31 | $32 | 2025-12-03 09:45:00.000 | CONTINUE |
| 53 | 2025-12-04 00:00:00 | 5 | $31 | $32 | 2025-12-04 01:00:00.000 | CONTINUE |
| 54 | 2025-12-04 05:00:00 | 5 | $31 | $32 | 2025-12-04 06:00:00.000 | CONTINUE |
| 55 | 2025-12-04 10:45:00 | 5 | $31 | $32 | 2025-12-04 11:45:00.000 | CONTINUE |
| 56 | 2025-12-04 17:30:00 | 5 | $31 | $32 | 2025-12-04 18:30:00.000 | CONTINUE |
| 57 | 2025-12-04 18:30:00 | 6 | $63 | $64 | 2025-12-04 19:30:00.000 | CONTINUE |
| 58 | 2025-12-04 23:45:00 | 5 | $31 | $32 | 2025-12-05 00:45:00.000 | CONTINUE |
| 59 | 2025-12-05 00:45:00 | 6 | $63 | $64 | 2025-12-05 01:45:00.000 | CONTINUE |
| 60 | 2025-12-05 01:45:00 | 7 | $127 | $128 | 2025-12-05 02:45:00.000 | CONTINUE |
| 61 | 2025-12-05 02:45:00 | 8 | $255 | $256 | 2025-12-05 03:45:00.000 | CONTINUE |
| 62 | 2025-12-05 03:45:00 | 9 | $511 | $512 | 2025-12-05 04:45:00.000 | CONTINUE |
| 63 | 2025-12-05 08:30:00 | 5 | $31 | $32 | 2025-12-05 09:30:00.000 | CONTINUE |
| 64 | 2025-12-05 09:30:00 | 6 | $63 | $64 | 2025-12-05 10:30:00.000 | CONTINUE |
| 65 | 2025-12-05 16:30:00 | 5 | $31 | $32 | 2025-12-05 17:30:00.000 | CONTINUE |
| 66 | 2025-12-06 23:15:00 | 5 | $31 | $32 | 2025-12-07 00:15:00.000 | CONTINUE |
| 67 | 2025-12-07 05:00:00 | 5 | $31 | $32 | 2025-12-07 06:00:00.000 | CONTINUE |
| 68 | 2025-12-07 21:45:00 | 5 | $31 | $32 | 2025-12-07 22:45:00.000 | CONTINUE |
| 69 | 2025-12-07 22:45:00 | 6 | $63 | $64 | 2025-12-07 23:45:00.000 | CONTINUE |
| 70 | 2025-12-09 09:45:00 | 5 | $31 | $32 | 2025-12-09 10:45:00.000 | CONTINUE |

## Daily Breakdown
| Date | Windows | Traded | Skipped | Wins | Losses | Max Bet | Profit | Running Total |
|------|---------|--------|---------|------|--------|---------|--------|---------------|
| 2025-11-11 | 96 | 78 | 18 | 31 | 47 | $128 | +$31 | $31 |
| 2025-11-12 | 96 | 84 | 12 | 43 | 41 | $256 | +$43 | $74 |
| 2025-11-13 | 96 | 84 | 12 | 43 | 41 | $128 | +$42 | $116 |
| 2025-11-14 | 96 | 90 | 6 | 41 | 49 | $64 | +$41 | $157 |
| 2025-11-15 | 96 | 93 | 3 | 54 | 39 | $32 | +$55 | $212 |
| 2025-11-16 | 96 | 84 | 12 | 37 | 47 | $64 | +$36 | $248 |
| 2025-11-17 | 96 | 93 | 3 | 43 | 50 | $32 | +$44 | $292 |
| 2025-11-18 | 96 | 96 | 0 | 46 | 50 | $16 | +$46 | $338 |
| 2025-11-19 | 96 | 90 | 6 | 44 | 46 | $64 | +$44 | $382 |
| 2025-11-20 | 96 | 89 | 7 | 40 | 49 | $64 | +$9 | $391 |
| 2025-11-21 | 96 | 61 | 35 | 24 | 37 | $256 | $-8 | $383 |
| 2025-11-22 | 96 | 84 | 12 | 43 | 41 | $128 | +$91 | $474 |
| 2025-11-23 | 96 | 93 | 3 | 47 | 46 | $32 | +$47 | $521 |
| 2025-11-24 | 96 | 93 | 3 | 45 | 48 | $32 | +$57 | $578 |
| 2025-11-25 | 96 | 96 | 0 | 48 | 48 | $16 | +$44 | $622 |
| 2025-11-26 | 96 | 93 | 3 | 57 | 36 | $32 | +$64 | $686 |
| 2025-11-27 | 96 | 90 | 6 | 49 | 41 | $32 | +$48 | $734 |
| 2025-11-28 | 96 | 96 | 0 | 53 | 43 | $16 | +$53 | $787 |
| 2025-11-29 | 96 | 96 | 0 | 46 | 50 | $16 | +$46 | $833 |
| 2025-11-30 | 96 | 96 | 0 | 49 | 47 | $16 | +$35 | $868 |
| 2025-12-01 | 96 | 84 | 12 | 41 | 43 | $64 | +$53 | $921 |
| 2025-12-02 | 96 | 96 | 0 | 59 | 37 | $16 | +$47 | $968 |
| 2025-12-03 | 96 | 93 | 3 | 53 | 40 | $32 | +$53 | $1021 |
| 2025-12-04 | 96 | 81 | 15 | 34 | 47 | $64 | +$18 | $1039 |
| 2025-12-05 | 96 | 72 | 24 | 31 | 41 | $512 | +$62 | $1101 |
| 2025-12-06 | 96 | 94 | 2 | 41 | 53 | $32 | +$10 | $1111 |
| 2025-12-07 | 96 | 86 | 10 | 45 | 41 | $64 | +$76 | $1187 |
| 2025-12-08 | 96 | 96 | 0 | 55 | 41 | $16 | +$55 | $1242 |
| 2025-12-09 | 96 | 93 | 3 | 49 | 44 | $32 | +$48 | $1290 |

## Detailed Trade Log by Day

### 2025-11-11
**Summary:** 78 trades | 31 wins | 47 losses | Max Bet: $128 | Profit: +$31

**Skip Events (6):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 05:00 | 5 | $31 | $32 | 06:00 |
| 06:00 | 6 | $63 | $64 | 07:00 |
| 07:00 | 7 | $127 | $128 | 08:00 |
| 12:45 | 5 | $31 | $32 | 13:45 |
| 20:30 | 5 | $31 | $32 | 21:30 |
| 21:30 | 6 | $63 | $64 | 22:30 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1762819200](https://polymarket.com/event/btc-updown-15m-1762819200) | $1 | ❌ | DOWN | $-1 | $-1 | L1 |
| 2 | 00:15 | [btc-updown-15m-1762820100](https://polymarket.com/event/btc-updown-15m-1762820100) | $2 | ❌ | DOWN | $-2 | $-3 | L2 |
| 3 | 00:30 | [btc-updown-15m-1762821000](https://polymarket.com/event/btc-updown-15m-1762821000) | $4 | ❌ | DOWN | $-4 | $-7 | L3 |
| 4 | 00:45 | [btc-updown-15m-1762821900](https://polymarket.com/event/btc-updown-15m-1762821900) | $8 | ✅ | UP | +$8 | $1 | - |
| 5 | 01:00 | [btc-updown-15m-1762822800](https://polymarket.com/event/btc-updown-15m-1762822800) | $1 | ✅ | UP | +$1 | $2 | - |
| 6 | 01:15 | [btc-updown-15m-1762823700](https://polymarket.com/event/btc-updown-15m-1762823700) | $1 | ✅ | UP | +$1 | $3 | - |
| 7 | 01:30 | [btc-updown-15m-1762824600](https://polymarket.com/event/btc-updown-15m-1762824600) | $1 | ❌ | DOWN | $-1 | $2 | L1 |
| 8 | 01:45 | [btc-updown-15m-1762825500](https://polymarket.com/event/btc-updown-15m-1762825500) | $2 | ❌ | DOWN | $-2 | $0 | L2 |
| 9 | 02:00 | [btc-updown-15m-1762826400](https://polymarket.com/event/btc-updown-15m-1762826400) | $4 | ✅ | UP | +$4 | $4 | - |
| 10 | 02:15 | [btc-updown-15m-1762827300](https://polymarket.com/event/btc-updown-15m-1762827300) | $1 | ✅ | UP | +$1 | $5 | - |
| 11 | 02:30 | [btc-updown-15m-1762828200](https://polymarket.com/event/btc-updown-15m-1762828200) | $1 | ✅ | UP | +$1 | $6 | - |
| 12 | 02:45 | [btc-updown-15m-1762829100](https://polymarket.com/event/btc-updown-15m-1762829100) | $1 | ❌ | DOWN | $-1 | $5 | L1 |
| 13 | 03:00 | [btc-updown-15m-1762830000](https://polymarket.com/event/btc-updown-15m-1762830000) | $2 | ✅ | UP | +$2 | $7 | - |
| 14 | 03:15 | [btc-updown-15m-1762830900](https://polymarket.com/event/btc-updown-15m-1762830900) | $1 | ❌ | DOWN | $-1 | $6 | L1 |
| 15 | 03:30 | [btc-updown-15m-1762831800](https://polymarket.com/event/btc-updown-15m-1762831800) | $2 | ❌ | DOWN | $-2 | $4 | L2 |
| 16 | 03:45 | [btc-updown-15m-1762832700](https://polymarket.com/event/btc-updown-15m-1762832700) | $4 | ✅ | UP | +$4 | $8 | - |
| 17 | 04:00 | [btc-updown-15m-1762833600](https://polymarket.com/event/btc-updown-15m-1762833600) | $1 | ❌ | DOWN | $-1 | $7 | L1 |
| 18 | 04:15 | [btc-updown-15m-1762834500](https://polymarket.com/event/btc-updown-15m-1762834500) | $2 | ❌ | DOWN | $-2 | $5 | L2 |
| 19 | 04:30 | [btc-updown-15m-1762835400](https://polymarket.com/event/btc-updown-15m-1762835400) | $4 | ❌ | DOWN | $-4 | $1 | L3 |
| 20 | 04:45 | [btc-updown-15m-1762836300](https://polymarket.com/event/btc-updown-15m-1762836300) | $8 | ❌ | DOWN | $-8 | $-7 | L4 |
| 21 | 05:00 | [btc-updown-15m-1762837200](https://polymarket.com/event/btc-updown-15m-1762837200) | $16 | ❌ | DOWN | $-16 | $-23 | L5 |
| - | 05:15 | [btc-updown-15m-1762838100](https://polymarket.com/event/btc-updown-15m-1762838100) | - | ⏭️ SKIP | UP | - | $-23 | - |
| - | 05:30 | [btc-updown-15m-1762839000](https://polymarket.com/event/btc-updown-15m-1762839000) | - | ⏭️ SKIP | DOWN | - | $-23 | - |
| - | 05:45 | [btc-updown-15m-1762839900](https://polymarket.com/event/btc-updown-15m-1762839900) | - | ⏭️ SKIP | DOWN | - | $-23 | - |
| 22 | 06:00 | [btc-updown-15m-1762840800](https://polymarket.com/event/btc-updown-15m-1762840800) | $32 | ❌ | DOWN | $-32 | $-55 | L6 |
| - | 06:15 | [btc-updown-15m-1762841700](https://polymarket.com/event/btc-updown-15m-1762841700) | - | ⏭️ SKIP | DOWN | - | $-55 | - |
| - | 06:30 | [btc-updown-15m-1762842600](https://polymarket.com/event/btc-updown-15m-1762842600) | - | ⏭️ SKIP | DOWN | - | $-55 | - |
| - | 06:45 | [btc-updown-15m-1762843500](https://polymarket.com/event/btc-updown-15m-1762843500) | - | ⏭️ SKIP | UP | - | $-55 | - |
| 23 | 07:00 | [btc-updown-15m-1762844400](https://polymarket.com/event/btc-updown-15m-1762844400) | $64 | ❌ | DOWN | $-64 | $-119 | L7 |
| - | 07:15 | [btc-updown-15m-1762845300](https://polymarket.com/event/btc-updown-15m-1762845300) | - | ⏭️ SKIP | DOWN | - | $-119 | - |
| - | 07:30 | [btc-updown-15m-1762846200](https://polymarket.com/event/btc-updown-15m-1762846200) | - | ⏭️ SKIP | DOWN | - | $-119 | - |
| - | 07:45 | [btc-updown-15m-1762847100](https://polymarket.com/event/btc-updown-15m-1762847100) | - | ⏭️ SKIP | DOWN | - | $-119 | - |
| 24 | 08:00 | [btc-updown-15m-1762848000](https://polymarket.com/event/btc-updown-15m-1762848000) | $128 | ✅ | UP | +$128 | $9 | - |
| 25 | 08:15 | [btc-updown-15m-1762848900](https://polymarket.com/event/btc-updown-15m-1762848900) | $1 | ✅ | UP | +$1 | $10 | - |
| 26 | 08:30 | [btc-updown-15m-1762849800](https://polymarket.com/event/btc-updown-15m-1762849800) | $1 | ❌ | DOWN | $-1 | $9 | L1 |
| 27 | 08:45 | [btc-updown-15m-1762850700](https://polymarket.com/event/btc-updown-15m-1762850700) | $2 | ✅ | UP | +$2 | $11 | - |
| 28 | 09:00 | [btc-updown-15m-1762851600](https://polymarket.com/event/btc-updown-15m-1762851600) | $1 | ✅ | UP | +$1 | $12 | - |
| 29 | 09:15 | [btc-updown-15m-1762852500](https://polymarket.com/event/btc-updown-15m-1762852500) | $1 | ✅ | UP | +$1 | $13 | - |
| 30 | 09:30 | [btc-updown-15m-1762853400](https://polymarket.com/event/btc-updown-15m-1762853400) | $1 | ❌ | DOWN | $-1 | $12 | L1 |
| 31 | 09:45 | [btc-updown-15m-1762854300](https://polymarket.com/event/btc-updown-15m-1762854300) | $2 | ❌ | DOWN | $-2 | $10 | L2 |
| 32 | 10:00 | [btc-updown-15m-1762855200](https://polymarket.com/event/btc-updown-15m-1762855200) | $4 | ✅ | UP | +$4 | $14 | - |
| 33 | 10:15 | [btc-updown-15m-1762856100](https://polymarket.com/event/btc-updown-15m-1762856100) | $1 | ✅ | UP | +$1 | $15 | - |
| 34 | 10:30 | [btc-updown-15m-1762857000](https://polymarket.com/event/btc-updown-15m-1762857000) | $1 | ✅ | UP | +$1 | $16 | - |
| 35 | 10:45 | [btc-updown-15m-1762857900](https://polymarket.com/event/btc-updown-15m-1762857900) | $1 | ❌ | DOWN | $-1 | $15 | L1 |
| 36 | 11:00 | [btc-updown-15m-1762858800](https://polymarket.com/event/btc-updown-15m-1762858800) | $2 | ✅ | UP | +$2 | $17 | - |
| 37 | 11:15 | [btc-updown-15m-1762859700](https://polymarket.com/event/btc-updown-15m-1762859700) | $1 | ❌ | DOWN | $-1 | $16 | L1 |
| 38 | 11:30 | [btc-updown-15m-1762860600](https://polymarket.com/event/btc-updown-15m-1762860600) | $2 | ✅ | UP | +$2 | $18 | - |
| 39 | 11:45 | [btc-updown-15m-1762861500](https://polymarket.com/event/btc-updown-15m-1762861500) | $1 | ❌ | DOWN | $-1 | $17 | L1 |
| 40 | 12:00 | [btc-updown-15m-1762862400](https://polymarket.com/event/btc-updown-15m-1762862400) | $2 | ❌ | DOWN | $-2 | $15 | L2 |
| 41 | 12:15 | [btc-updown-15m-1762863300](https://polymarket.com/event/btc-updown-15m-1762863300) | $4 | ❌ | DOWN | $-4 | $11 | L3 |
| 42 | 12:30 | [btc-updown-15m-1762864200](https://polymarket.com/event/btc-updown-15m-1762864200) | $8 | ❌ | DOWN | $-8 | $3 | L4 |
| 43 | 12:45 | [btc-updown-15m-1762865100](https://polymarket.com/event/btc-updown-15m-1762865100) | $16 | ❌ | DOWN | $-16 | $-13 | L5 |
| - | 13:00 | [btc-updown-15m-1762866000](https://polymarket.com/event/btc-updown-15m-1762866000) | - | ⏭️ SKIP | UP | - | $-13 | - |
| - | 13:15 | [btc-updown-15m-1762866900](https://polymarket.com/event/btc-updown-15m-1762866900) | - | ⏭️ SKIP | DOWN | - | $-13 | - |
| - | 13:30 | [btc-updown-15m-1762867800](https://polymarket.com/event/btc-updown-15m-1762867800) | - | ⏭️ SKIP | UP | - | $-13 | - |
| 44 | 13:45 | [btc-updown-15m-1762868700](https://polymarket.com/event/btc-updown-15m-1762868700) | $32 | ✅ | UP | +$32 | $19 | - |
| 45 | 14:00 | [btc-updown-15m-1762869600](https://polymarket.com/event/btc-updown-15m-1762869600) | $1 | ❌ | DOWN | $-1 | $18 | L1 |
| 46 | 14:15 | [btc-updown-15m-1762870500](https://polymarket.com/event/btc-updown-15m-1762870500) | $2 | ✅ | UP | +$2 | $20 | - |
| 47 | 14:30 | [btc-updown-15m-1762871400](https://polymarket.com/event/btc-updown-15m-1762871400) | $1 | ❌ | DOWN | $-1 | $19 | L1 |
| 48 | 14:45 | [btc-updown-15m-1762872300](https://polymarket.com/event/btc-updown-15m-1762872300) | $2 | ✅ | UP | +$2 | $21 | - |
| 49 | 15:00 | [btc-updown-15m-1762873200](https://polymarket.com/event/btc-updown-15m-1762873200) | $1 | ❌ | DOWN | $-1 | $20 | L1 |
| 50 | 15:15 | [btc-updown-15m-1762874100](https://polymarket.com/event/btc-updown-15m-1762874100) | $2 | ❌ | DOWN | $-2 | $18 | L2 |
| 51 | 15:30 | [btc-updown-15m-1762875000](https://polymarket.com/event/btc-updown-15m-1762875000) | $4 | ❌ | DOWN | $-4 | $14 | L3 |
| 52 | 15:45 | [btc-updown-15m-1762875900](https://polymarket.com/event/btc-updown-15m-1762875900) | $8 | ❌ | DOWN | $-8 | $6 | L4 |
| 53 | 16:00 | [btc-updown-15m-1762876800](https://polymarket.com/event/btc-updown-15m-1762876800) | $16 | ✅ | UP | +$16 | $22 | - |
| 54 | 16:15 | [btc-updown-15m-1762877700](https://polymarket.com/event/btc-updown-15m-1762877700) | $1 | ❌ | DOWN | $-1 | $21 | L1 |
| 55 | 16:30 | [btc-updown-15m-1762878600](https://polymarket.com/event/btc-updown-15m-1762878600) | $2 | ✅ | UP | +$2 | $23 | - |
| 56 | 16:45 | [btc-updown-15m-1762879500](https://polymarket.com/event/btc-updown-15m-1762879500) | $1 | ❌ | DOWN | $-1 | $22 | L1 |
| 57 | 17:00 | [btc-updown-15m-1762880400](https://polymarket.com/event/btc-updown-15m-1762880400) | $2 | ✅ | UP | +$2 | $24 | - |
| 58 | 17:15 | [btc-updown-15m-1762881300](https://polymarket.com/event/btc-updown-15m-1762881300) | $1 | ❌ | DOWN | $-1 | $23 | L1 |
| 59 | 17:30 | [btc-updown-15m-1762882200](https://polymarket.com/event/btc-updown-15m-1762882200) | $2 | ❌ | DOWN | $-2 | $21 | L2 |
| 60 | 17:45 | [btc-updown-15m-1762883100](https://polymarket.com/event/btc-updown-15m-1762883100) | $4 | ✅ | UP | +$4 | $25 | - |
| 61 | 18:00 | [btc-updown-15m-1762884000](https://polymarket.com/event/btc-updown-15m-1762884000) | $1 | ❌ | DOWN | $-1 | $24 | L1 |
| 62 | 18:15 | [btc-updown-15m-1762884900](https://polymarket.com/event/btc-updown-15m-1762884900) | $2 | ✅ | UP | +$2 | $26 | - |
| 63 | 18:30 | [btc-updown-15m-1762885800](https://polymarket.com/event/btc-updown-15m-1762885800) | $1 | ❌ | DOWN | $-1 | $25 | L1 |
| 64 | 18:45 | [btc-updown-15m-1762886700](https://polymarket.com/event/btc-updown-15m-1762886700) | $2 | ✅ | UP | +$2 | $27 | - |
| 65 | 19:00 | [btc-updown-15m-1762887600](https://polymarket.com/event/btc-updown-15m-1762887600) | $1 | ❌ | DOWN | $-1 | $26 | L1 |
| 66 | 19:15 | [btc-updown-15m-1762888500](https://polymarket.com/event/btc-updown-15m-1762888500) | $2 | ✅ | UP | +$2 | $28 | - |
| 67 | 19:30 | [btc-updown-15m-1762889400](https://polymarket.com/event/btc-updown-15m-1762889400) | $1 | ❌ | DOWN | $-1 | $27 | L1 |
| 68 | 19:45 | [btc-updown-15m-1762890300](https://polymarket.com/event/btc-updown-15m-1762890300) | $2 | ❌ | DOWN | $-2 | $25 | L2 |
| 69 | 20:00 | [btc-updown-15m-1762891200](https://polymarket.com/event/btc-updown-15m-1762891200) | $4 | ❌ | DOWN | $-4 | $21 | L3 |
| 70 | 20:15 | [btc-updown-15m-1762892100](https://polymarket.com/event/btc-updown-15m-1762892100) | $8 | ❌ | DOWN | $-8 | $13 | L4 |
| 71 | 20:30 | [btc-updown-15m-1762893000](https://polymarket.com/event/btc-updown-15m-1762893000) | $16 | ❌ | DOWN | $-16 | $-3 | L5 |
| - | 20:45 | [btc-updown-15m-1762893900](https://polymarket.com/event/btc-updown-15m-1762893900) | - | ⏭️ SKIP | DOWN | - | $-3 | - |
| - | 21:00 | [btc-updown-15m-1762894800](https://polymarket.com/event/btc-updown-15m-1762894800) | - | ⏭️ SKIP | UP | - | $-3 | - |
| - | 21:15 | [btc-updown-15m-1762895700](https://polymarket.com/event/btc-updown-15m-1762895700) | - | ⏭️ SKIP | DOWN | - | $-3 | - |
| 72 | 21:30 | [btc-updown-15m-1762896600](https://polymarket.com/event/btc-updown-15m-1762896600) | $32 | ❌ | DOWN | $-32 | $-35 | L6 |
| - | 21:45 | [btc-updown-15m-1762897500](https://polymarket.com/event/btc-updown-15m-1762897500) | - | ⏭️ SKIP | UP | - | $-35 | - |
| - | 22:00 | [btc-updown-15m-1762898400](https://polymarket.com/event/btc-updown-15m-1762898400) | - | ⏭️ SKIP | UP | - | $-35 | - |
| - | 22:15 | [btc-updown-15m-1762899300](https://polymarket.com/event/btc-updown-15m-1762899300) | - | ⏭️ SKIP | UP | - | $-35 | - |
| 73 | 22:30 | [btc-updown-15m-1762900200](https://polymarket.com/event/btc-updown-15m-1762900200) | $64 | ✅ | UP | +$64 | $29 | - |
| 74 | 22:45 | [btc-updown-15m-1762901100](https://polymarket.com/event/btc-updown-15m-1762901100) | $1 | ❌ | DOWN | $-1 | $28 | L1 |
| 75 | 23:00 | [btc-updown-15m-1762902000](https://polymarket.com/event/btc-updown-15m-1762902000) | $2 | ❌ | DOWN | $-2 | $26 | L2 |
| 76 | 23:15 | [btc-updown-15m-1762902900](https://polymarket.com/event/btc-updown-15m-1762902900) | $4 | ✅ | UP | +$4 | $30 | - |
| 77 | 23:30 | [btc-updown-15m-1762903800](https://polymarket.com/event/btc-updown-15m-1762903800) | $1 | ❌ | DOWN | $-1 | $29 | L1 |
| 78 | 23:45 | [btc-updown-15m-1762904700](https://polymarket.com/event/btc-updown-15m-1762904700) | $2 | ✅ | UP | +$2 | $31 | - |

### 2025-11-12
**Summary:** 84 trades | 43 wins | 41 losses | Max Bet: $256 | Profit: +$43

**Skip Events (4):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 14:45 | 5 | $31 | $32 | 15:45 |
| 15:45 | 6 | $63 | $64 | 16:45 |
| 16:45 | 7 | $127 | $128 | 17:45 |
| 17:45 | 8 | $255 | $256 | 18:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1762905600](https://polymarket.com/event/btc-updown-15m-1762905600) | $1 | ❌ | DOWN | $-1 | $30 | L1 |
| 2 | 00:15 | [btc-updown-15m-1762906500](https://polymarket.com/event/btc-updown-15m-1762906500) | $2 | ✅ | UP | +$2 | $32 | - |
| 3 | 00:30 | [btc-updown-15m-1762907400](https://polymarket.com/event/btc-updown-15m-1762907400) | $1 | ❌ | DOWN | $-1 | $31 | L1 |
| 4 | 00:45 | [btc-updown-15m-1762908300](https://polymarket.com/event/btc-updown-15m-1762908300) | $2 | ❌ | DOWN | $-2 | $29 | L2 |
| 5 | 01:00 | [btc-updown-15m-1762909200](https://polymarket.com/event/btc-updown-15m-1762909200) | $4 | ✅ | UP | +$4 | $33 | - |
| 6 | 01:15 | [btc-updown-15m-1762910100](https://polymarket.com/event/btc-updown-15m-1762910100) | $1 | ❌ | DOWN | $-1 | $32 | L1 |
| 7 | 01:30 | [btc-updown-15m-1762911000](https://polymarket.com/event/btc-updown-15m-1762911000) | $2 | ✅ | UP | +$2 | $34 | - |
| 8 | 01:45 | [btc-updown-15m-1762911900](https://polymarket.com/event/btc-updown-15m-1762911900) | $1 | ✅ | UP | +$1 | $35 | - |
| 9 | 02:00 | [btc-updown-15m-1762912800](https://polymarket.com/event/btc-updown-15m-1762912800) | $1 | ✅ | UP | +$1 | $36 | - |
| 10 | 02:15 | [btc-updown-15m-1762913700](https://polymarket.com/event/btc-updown-15m-1762913700) | $1 | ❌ | DOWN | $-1 | $35 | L1 |
| 11 | 02:30 | [btc-updown-15m-1762914600](https://polymarket.com/event/btc-updown-15m-1762914600) | $2 | ❌ | DOWN | $-2 | $33 | L2 |
| 12 | 02:45 | [btc-updown-15m-1762915500](https://polymarket.com/event/btc-updown-15m-1762915500) | $4 | ✅ | UP | +$4 | $37 | - |
| 13 | 03:00 | [btc-updown-15m-1762916400](https://polymarket.com/event/btc-updown-15m-1762916400) | $1 | ✅ | UP | +$1 | $38 | - |
| 14 | 03:15 | [btc-updown-15m-1762917300](https://polymarket.com/event/btc-updown-15m-1762917300) | $1 | ✅ | UP | +$1 | $39 | - |
| 15 | 03:30 | [btc-updown-15m-1762918200](https://polymarket.com/event/btc-updown-15m-1762918200) | $1 | ✅ | UP | +$1 | $40 | - |
| 16 | 03:45 | [btc-updown-15m-1762919100](https://polymarket.com/event/btc-updown-15m-1762919100) | $1 | ❌ | DOWN | $-1 | $39 | L1 |
| 17 | 04:00 | [btc-updown-15m-1762920000](https://polymarket.com/event/btc-updown-15m-1762920000) | $2 | ✅ | UP | +$2 | $41 | - |
| 18 | 04:15 | [btc-updown-15m-1762920900](https://polymarket.com/event/btc-updown-15m-1762920900) | $1 | ❌ | DOWN | $-1 | $40 | L1 |
| 19 | 04:30 | [btc-updown-15m-1762921800](https://polymarket.com/event/btc-updown-15m-1762921800) | $2 | ❌ | DOWN | $-2 | $38 | L2 |
| 20 | 04:45 | [btc-updown-15m-1762922700](https://polymarket.com/event/btc-updown-15m-1762922700) | $4 | ✅ | UP | +$4 | $42 | - |
| 21 | 05:00 | [btc-updown-15m-1762923600](https://polymarket.com/event/btc-updown-15m-1762923600) | $1 | ✅ | UP | +$1 | $43 | - |
| 22 | 05:15 | [btc-updown-15m-1762924500](https://polymarket.com/event/btc-updown-15m-1762924500) | $1 | ✅ | UP | +$1 | $44 | - |
| 23 | 05:30 | [btc-updown-15m-1762925400](https://polymarket.com/event/btc-updown-15m-1762925400) | $1 | ✅ | UP | +$1 | $45 | - |
| 24 | 05:45 | [btc-updown-15m-1762926300](https://polymarket.com/event/btc-updown-15m-1762926300) | $1 | ✅ | UP | +$1 | $46 | - |
| 25 | 06:00 | [btc-updown-15m-1762927200](https://polymarket.com/event/btc-updown-15m-1762927200) | $1 | ✅ | UP | +$1 | $47 | - |
| 26 | 06:15 | [btc-updown-15m-1762928100](https://polymarket.com/event/btc-updown-15m-1762928100) | $1 | ❌ | DOWN | $-1 | $46 | L1 |
| 27 | 06:30 | [btc-updown-15m-1762929000](https://polymarket.com/event/btc-updown-15m-1762929000) | $2 | ❌ | DOWN | $-2 | $44 | L2 |
| 28 | 06:45 | [btc-updown-15m-1762929900](https://polymarket.com/event/btc-updown-15m-1762929900) | $4 | ❌ | DOWN | $-4 | $40 | L3 |
| 29 | 07:00 | [btc-updown-15m-1762930800](https://polymarket.com/event/btc-updown-15m-1762930800) | $8 | ✅ | UP | +$8 | $48 | - |
| 30 | 07:15 | [btc-updown-15m-1762931700](https://polymarket.com/event/btc-updown-15m-1762931700) | $1 | ❌ | DOWN | $-1 | $47 | L1 |
| 31 | 07:30 | [btc-updown-15m-1762932600](https://polymarket.com/event/btc-updown-15m-1762932600) | $2 | ❌ | DOWN | $-2 | $45 | L2 |
| 32 | 07:45 | [btc-updown-15m-1762933500](https://polymarket.com/event/btc-updown-15m-1762933500) | $4 | ❌ | DOWN | $-4 | $41 | L3 |
| 33 | 08:00 | [btc-updown-15m-1762934400](https://polymarket.com/event/btc-updown-15m-1762934400) | $8 | ✅ | UP | +$8 | $49 | - |
| 34 | 08:15 | [btc-updown-15m-1762935300](https://polymarket.com/event/btc-updown-15m-1762935300) | $1 | ✅ | UP | +$1 | $50 | - |
| 35 | 08:30 | [btc-updown-15m-1762936200](https://polymarket.com/event/btc-updown-15m-1762936200) | $1 | ✅ | UP | +$1 | $51 | - |
| 36 | 08:45 | [btc-updown-15m-1762937100](https://polymarket.com/event/btc-updown-15m-1762937100) | $1 | ✅ | UP | +$1 | $52 | - |
| 37 | 09:00 | [btc-updown-15m-1762938000](https://polymarket.com/event/btc-updown-15m-1762938000) | $1 | ✅ | UP | +$1 | $53 | - |
| 38 | 09:15 | [btc-updown-15m-1762938900](https://polymarket.com/event/btc-updown-15m-1762938900) | $1 | ❌ | DOWN | $-1 | $52 | L1 |
| 39 | 09:30 | [btc-updown-15m-1762939800](https://polymarket.com/event/btc-updown-15m-1762939800) | $2 | ❌ | DOWN | $-2 | $50 | L2 |
| 40 | 09:45 | [btc-updown-15m-1762940700](https://polymarket.com/event/btc-updown-15m-1762940700) | $4 | ❌ | DOWN | $-4 | $46 | L3 |
| 41 | 10:00 | [btc-updown-15m-1762941600](https://polymarket.com/event/btc-updown-15m-1762941600) | $8 | ✅ | UP | +$8 | $54 | - |
| 42 | 10:15 | [btc-updown-15m-1762942500](https://polymarket.com/event/btc-updown-15m-1762942500) | $1 | ❌ | DOWN | $-1 | $53 | L1 |
| 43 | 10:30 | [btc-updown-15m-1762943400](https://polymarket.com/event/btc-updown-15m-1762943400) | $2 | ✅ | UP | +$2 | $55 | - |
| 44 | 10:45 | [btc-updown-15m-1762944300](https://polymarket.com/event/btc-updown-15m-1762944300) | $1 | ✅ | UP | +$1 | $56 | - |
| 45 | 11:00 | [btc-updown-15m-1762945200](https://polymarket.com/event/btc-updown-15m-1762945200) | $1 | ✅ | UP | +$1 | $57 | - |
| 46 | 11:15 | [btc-updown-15m-1762946100](https://polymarket.com/event/btc-updown-15m-1762946100) | $1 | ❌ | DOWN | $-1 | $56 | L1 |
| 47 | 11:30 | [btc-updown-15m-1762947000](https://polymarket.com/event/btc-updown-15m-1762947000) | $2 | ❌ | DOWN | $-2 | $54 | L2 |
| 48 | 11:45 | [btc-updown-15m-1762947900](https://polymarket.com/event/btc-updown-15m-1762947900) | $4 | ✅ | UP | +$4 | $58 | - |
| 49 | 12:00 | [btc-updown-15m-1762948800](https://polymarket.com/event/btc-updown-15m-1762948800) | $1 | ✅ | UP | +$1 | $59 | - |
| 50 | 12:15 | [btc-updown-15m-1762949700](https://polymarket.com/event/btc-updown-15m-1762949700) | $1 | ❌ | DOWN | $-1 | $58 | L1 |
| 51 | 12:30 | [btc-updown-15m-1762950600](https://polymarket.com/event/btc-updown-15m-1762950600) | $2 | ❌ | DOWN | $-2 | $56 | L2 |
| 52 | 12:45 | [btc-updown-15m-1762951500](https://polymarket.com/event/btc-updown-15m-1762951500) | $4 | ✅ | UP | +$4 | $60 | - |
| 53 | 13:00 | [btc-updown-15m-1762952400](https://polymarket.com/event/btc-updown-15m-1762952400) | $1 | ❌ | DOWN | $-1 | $59 | L1 |
| 54 | 13:15 | [btc-updown-15m-1762953300](https://polymarket.com/event/btc-updown-15m-1762953300) | $2 | ✅ | UP | +$2 | $61 | - |
| 55 | 13:30 | [btc-updown-15m-1762954200](https://polymarket.com/event/btc-updown-15m-1762954200) | $1 | ✅ | UP | +$1 | $62 | - |
| 56 | 13:45 | [btc-updown-15m-1762955100](https://polymarket.com/event/btc-updown-15m-1762955100) | $1 | ❌ | DOWN | $-1 | $61 | L1 |
| 57 | 14:00 | [btc-updown-15m-1762956000](https://polymarket.com/event/btc-updown-15m-1762956000) | $2 | ❌ | DOWN | $-2 | $59 | L2 |
| 58 | 14:15 | [btc-updown-15m-1762956900](https://polymarket.com/event/btc-updown-15m-1762956900) | $4 | ❌ | DOWN | $-4 | $55 | L3 |
| 59 | 14:30 | [btc-updown-15m-1762957800](https://polymarket.com/event/btc-updown-15m-1762957800) | $8 | ❌ | DOWN | $-8 | $47 | L4 |
| 60 | 14:45 | [btc-updown-15m-1762958700](https://polymarket.com/event/btc-updown-15m-1762958700) | $16 | ❌ | DOWN | $-16 | $31 | L5 |
| - | 15:00 | [btc-updown-15m-1762959600](https://polymarket.com/event/btc-updown-15m-1762959600) | - | ⏭️ SKIP | DOWN | - | $31 | - |
| - | 15:15 | [btc-updown-15m-1762960500](https://polymarket.com/event/btc-updown-15m-1762960500) | - | ⏭️ SKIP | DOWN | - | $31 | - |
| - | 15:30 | [btc-updown-15m-1762961400](https://polymarket.com/event/btc-updown-15m-1762961400) | - | ⏭️ SKIP | DOWN | - | $31 | - |
| 61 | 15:45 | [btc-updown-15m-1762962300](https://polymarket.com/event/btc-updown-15m-1762962300) | $32 | ❌ | DOWN | $-32 | $-1 | L6 |
| - | 16:00 | [btc-updown-15m-1762963200](https://polymarket.com/event/btc-updown-15m-1762963200) | - | ⏭️ SKIP | DOWN | - | $-1 | - |
| - | 16:15 | [btc-updown-15m-1762964100](https://polymarket.com/event/btc-updown-15m-1762964100) | - | ⏭️ SKIP | UP | - | $-1 | - |
| - | 16:30 | [btc-updown-15m-1762965000](https://polymarket.com/event/btc-updown-15m-1762965000) | - | ⏭️ SKIP | DOWN | - | $-1 | - |
| 62 | 16:45 | [btc-updown-15m-1762965900](https://polymarket.com/event/btc-updown-15m-1762965900) | $64 | ❌ | DOWN | $-64 | $-65 | L7 |
| - | 17:00 | [btc-updown-15m-1762966800](https://polymarket.com/event/btc-updown-15m-1762966800) | - | ⏭️ SKIP | UP | - | $-65 | - |
| - | 17:15 | [btc-updown-15m-1762967700](https://polymarket.com/event/btc-updown-15m-1762967700) | - | ⏭️ SKIP | UP | - | $-65 | - |
| - | 17:30 | [btc-updown-15m-1762968600](https://polymarket.com/event/btc-updown-15m-1762968600) | - | ⏭️ SKIP | UP | - | $-65 | - |
| 63 | 17:45 | [btc-updown-15m-1762969500](https://polymarket.com/event/btc-updown-15m-1762969500) | $128 | ❌ | DOWN | $-128 | $-193 | L8 |
| - | 18:00 | [btc-updown-15m-1762970400](https://polymarket.com/event/btc-updown-15m-1762970400) | - | ⏭️ SKIP | DOWN | - | $-193 | - |
| - | 18:15 | [btc-updown-15m-1762971300](https://polymarket.com/event/btc-updown-15m-1762971300) | - | ⏭️ SKIP | DOWN | - | $-193 | - |
| - | 18:30 | [btc-updown-15m-1762972200](https://polymarket.com/event/btc-updown-15m-1762972200) | - | ⏭️ SKIP | DOWN | - | $-193 | - |
| 64 | 18:45 | [btc-updown-15m-1762973100](https://polymarket.com/event/btc-updown-15m-1762973100) | $256 | ✅ | UP | +$256 | $63 | - |
| 65 | 19:00 | [btc-updown-15m-1762974000](https://polymarket.com/event/btc-updown-15m-1762974000) | $1 | ❌ | DOWN | $-1 | $62 | L1 |
| 66 | 19:15 | [btc-updown-15m-1762974900](https://polymarket.com/event/btc-updown-15m-1762974900) | $2 | ❌ | DOWN | $-2 | $60 | L2 |
| 67 | 19:30 | [btc-updown-15m-1762975800](https://polymarket.com/event/btc-updown-15m-1762975800) | $4 | ✅ | UP | +$4 | $64 | - |
| 68 | 19:45 | [btc-updown-15m-1762976700](https://polymarket.com/event/btc-updown-15m-1762976700) | $1 | ❌ | DOWN | $-1 | $63 | L1 |
| 69 | 20:00 | [btc-updown-15m-1762977600](https://polymarket.com/event/btc-updown-15m-1762977600) | $2 | ✅ | UP | +$2 | $65 | - |
| 70 | 20:15 | [btc-updown-15m-1762978500](https://polymarket.com/event/btc-updown-15m-1762978500) | $1 | ✅ | UP | +$1 | $66 | - |
| 71 | 20:30 | [btc-updown-15m-1762979400](https://polymarket.com/event/btc-updown-15m-1762979400) | $1 | ❌ | DOWN | $-1 | $65 | L1 |
| 72 | 20:45 | [btc-updown-15m-1762980300](https://polymarket.com/event/btc-updown-15m-1762980300) | $2 | ❌ | DOWN | $-2 | $63 | L2 |
| 73 | 21:00 | [btc-updown-15m-1762981200](https://polymarket.com/event/btc-updown-15m-1762981200) | $4 | ✅ | UP | +$4 | $67 | - |
| 74 | 21:15 | [btc-updown-15m-1762982100](https://polymarket.com/event/btc-updown-15m-1762982100) | $1 | ❌ | DOWN | $-1 | $66 | L1 |
| 75 | 21:30 | [btc-updown-15m-1762983000](https://polymarket.com/event/btc-updown-15m-1762983000) | $2 | ✅ | UP | +$2 | $68 | - |
| 76 | 21:45 | [btc-updown-15m-1762983900](https://polymarket.com/event/btc-updown-15m-1762983900) | $1 | ✅ | UP | +$1 | $69 | - |
| 77 | 22:00 | [btc-updown-15m-1762984800](https://polymarket.com/event/btc-updown-15m-1762984800) | $1 | ❌ | DOWN | $-1 | $68 | L1 |
| 78 | 22:15 | [btc-updown-15m-1762985700](https://polymarket.com/event/btc-updown-15m-1762985700) | $2 | ✅ | UP | +$2 | $70 | - |
| 79 | 22:30 | [btc-updown-15m-1762986600](https://polymarket.com/event/btc-updown-15m-1762986600) | $1 | ✅ | UP | +$1 | $71 | - |
| 80 | 22:45 | [btc-updown-15m-1762987500](https://polymarket.com/event/btc-updown-15m-1762987500) | $1 | ✅ | UP | +$1 | $72 | - |
| 81 | 23:00 | [btc-updown-15m-1762988400](https://polymarket.com/event/btc-updown-15m-1762988400) | $1 | ❌ | DOWN | $-1 | $71 | L1 |
| 82 | 23:15 | [btc-updown-15m-1762989300](https://polymarket.com/event/btc-updown-15m-1762989300) | $2 | ✅ | UP | +$2 | $73 | - |
| 83 | 23:30 | [btc-updown-15m-1762990200](https://polymarket.com/event/btc-updown-15m-1762990200) | $1 | ❌ | DOWN | $-1 | $72 | L1 |
| 84 | 23:45 | [btc-updown-15m-1762991100](https://polymarket.com/event/btc-updown-15m-1762991100) | $2 | ✅ | UP | +$2 | $74 | - |

### 2025-11-13
**Summary:** 84 trades | 43 wins | 41 losses | Max Bet: $128 | Profit: +$42

**Skip Events (4):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 13:45 | 5 | $31 | $32 | 14:45 |
| 16:00 | 5 | $31 | $32 | 17:00 |
| 17:00 | 6 | $63 | $64 | 18:00 |
| 18:00 | 7 | $127 | $128 | 19:00 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1762992000](https://polymarket.com/event/btc-updown-15m-1762992000) | $1 | ✅ | UP | +$1 | $75 | - |
| 2 | 00:15 | [btc-updown-15m-1762992900](https://polymarket.com/event/btc-updown-15m-1762992900) | $1 | ❌ | DOWN | $-1 | $74 | L1 |
| 3 | 00:30 | [btc-updown-15m-1762993800](https://polymarket.com/event/btc-updown-15m-1762993800) | $2 | ✅ | UP | +$2 | $76 | - |
| 4 | 00:45 | [btc-updown-15m-1762994700](https://polymarket.com/event/btc-updown-15m-1762994700) | $1 | ✅ | UP | +$1 | $77 | - |
| 5 | 01:00 | [btc-updown-15m-1762995600](https://polymarket.com/event/btc-updown-15m-1762995600) | $1 | ✅ | UP | +$1 | $78 | - |
| 6 | 01:15 | [btc-updown-15m-1762996500](https://polymarket.com/event/btc-updown-15m-1762996500) | $1 | ❌ | DOWN | $-1 | $77 | L1 |
| 7 | 01:30 | [btc-updown-15m-1762997400](https://polymarket.com/event/btc-updown-15m-1762997400) | $2 | ✅ | UP | +$2 | $79 | - |
| 8 | 01:45 | [btc-updown-15m-1762998300](https://polymarket.com/event/btc-updown-15m-1762998300) | $1 | ❌ | DOWN | $-1 | $78 | L1 |
| 9 | 02:00 | [btc-updown-15m-1762999200](https://polymarket.com/event/btc-updown-15m-1762999200) | $2 | ✅ | UP | +$2 | $80 | - |
| 10 | 02:15 | [btc-updown-15m-1763000100](https://polymarket.com/event/btc-updown-15m-1763000100) | $1 | ❌ | DOWN | $-1 | $79 | L1 |
| 11 | 02:30 | [btc-updown-15m-1763001000](https://polymarket.com/event/btc-updown-15m-1763001000) | $2 | ✅ | UP | +$2 | $81 | - |
| 12 | 02:45 | [btc-updown-15m-1763001900](https://polymarket.com/event/btc-updown-15m-1763001900) | $1 | ❌ | DOWN | $-1 | $80 | L1 |
| 13 | 03:00 | [btc-updown-15m-1763002800](https://polymarket.com/event/btc-updown-15m-1763002800) | $2 | ❌ | DOWN | $-2 | $78 | L2 |
| 14 | 03:15 | [btc-updown-15m-1763003700](https://polymarket.com/event/btc-updown-15m-1763003700) | $4 | ✅ | UP | +$4 | $82 | - |
| 15 | 03:30 | [btc-updown-15m-1763004600](https://polymarket.com/event/btc-updown-15m-1763004600) | $1 | ✅ | UP | +$1 | $83 | - |
| 16 | 03:45 | [btc-updown-15m-1763005500](https://polymarket.com/event/btc-updown-15m-1763005500) | $1 | ❌ | DOWN | $-1 | $82 | L1 |
| 17 | 04:00 | [btc-updown-15m-1763006400](https://polymarket.com/event/btc-updown-15m-1763006400) | $2 | ❌ | DOWN | $-2 | $80 | L2 |
| 18 | 04:15 | [btc-updown-15m-1763007300](https://polymarket.com/event/btc-updown-15m-1763007300) | $4 | ✅ | UP | +$4 | $84 | - |
| 19 | 04:30 | [btc-updown-15m-1763008200](https://polymarket.com/event/btc-updown-15m-1763008200) | $1 | ❌ | DOWN | $-1 | $83 | L1 |
| 20 | 04:45 | [btc-updown-15m-1763009100](https://polymarket.com/event/btc-updown-15m-1763009100) | $2 | ✅ | UP | +$2 | $85 | - |
| 21 | 05:00 | [btc-updown-15m-1763010000](https://polymarket.com/event/btc-updown-15m-1763010000) | $1 | ❌ | DOWN | $-1 | $84 | L1 |
| 22 | 05:15 | [btc-updown-15m-1763010900](https://polymarket.com/event/btc-updown-15m-1763010900) | $2 | ✅ | UP | +$2 | $86 | - |
| 23 | 05:30 | [btc-updown-15m-1763011800](https://polymarket.com/event/btc-updown-15m-1763011800) | $1 | ✅ | UP | +$1 | $87 | - |
| 24 | 05:45 | [btc-updown-15m-1763012700](https://polymarket.com/event/btc-updown-15m-1763012700) | $1 | ✅ | UP | +$1 | $88 | - |
| 25 | 06:00 | [btc-updown-15m-1763013600](https://polymarket.com/event/btc-updown-15m-1763013600) | $1 | ✅ | UP | +$1 | $89 | - |
| 26 | 06:15 | [btc-updown-15m-1763014500](https://polymarket.com/event/btc-updown-15m-1763014500) | $1 | ✅ | UP | +$1 | $90 | - |
| 27 | 06:30 | [btc-updown-15m-1763015400](https://polymarket.com/event/btc-updown-15m-1763015400) | $1 | ❌ | DOWN | $-1 | $89 | L1 |
| 28 | 06:45 | [btc-updown-15m-1763016300](https://polymarket.com/event/btc-updown-15m-1763016300) | $2 | ✅ | UP | +$2 | $91 | - |
| 29 | 07:00 | [btc-updown-15m-1763017200](https://polymarket.com/event/btc-updown-15m-1763017200) | $1 | ✅ | UP | +$1 | $92 | - |
| 30 | 07:15 | [btc-updown-15m-1763018100](https://polymarket.com/event/btc-updown-15m-1763018100) | $1 | ✅ | UP | +$1 | $93 | - |
| 31 | 07:30 | [btc-updown-15m-1763019000](https://polymarket.com/event/btc-updown-15m-1763019000) | $1 | ❌ | DOWN | $-1 | $92 | L1 |
| 32 | 07:45 | [btc-updown-15m-1763019900](https://polymarket.com/event/btc-updown-15m-1763019900) | $2 | ❌ | DOWN | $-2 | $90 | L2 |
| 33 | 08:00 | [btc-updown-15m-1763020800](https://polymarket.com/event/btc-updown-15m-1763020800) | $4 | ❌ | DOWN | $-4 | $86 | L3 |
| 34 | 08:15 | [btc-updown-15m-1763021700](https://polymarket.com/event/btc-updown-15m-1763021700) | $8 | ✅ | UP | +$8 | $94 | - |
| 35 | 08:30 | [btc-updown-15m-1763022600](https://polymarket.com/event/btc-updown-15m-1763022600) | $1 | ✅ | UP | +$1 | $95 | - |
| 36 | 08:45 | [btc-updown-15m-1763023500](https://polymarket.com/event/btc-updown-15m-1763023500) | $1 | ❌ | DOWN | $-1 | $94 | L1 |
| 37 | 09:00 | [btc-updown-15m-1763024400](https://polymarket.com/event/btc-updown-15m-1763024400) | $2 | ❌ | DOWN | $-2 | $92 | L2 |
| 38 | 09:15 | [btc-updown-15m-1763025300](https://polymarket.com/event/btc-updown-15m-1763025300) | $4 | ✅ | UP | +$4 | $96 | - |
| 39 | 09:30 | [btc-updown-15m-1763026200](https://polymarket.com/event/btc-updown-15m-1763026200) | $1 | ✅ | UP | +$1 | $97 | - |
| 40 | 09:45 | [btc-updown-15m-1763027100](https://polymarket.com/event/btc-updown-15m-1763027100) | $1 | ❌ | DOWN | $-1 | $96 | L1 |
| 41 | 10:00 | [btc-updown-15m-1763028000](https://polymarket.com/event/btc-updown-15m-1763028000) | $2 | ❌ | DOWN | $-2 | $94 | L2 |
| 42 | 10:15 | [btc-updown-15m-1763028900](https://polymarket.com/event/btc-updown-15m-1763028900) | $4 | ✅ | UP | +$4 | $98 | - |
| 43 | 10:30 | [btc-updown-15m-1763029800](https://polymarket.com/event/btc-updown-15m-1763029800) | $1 | ❌ | DOWN | $-1 | $97 | L1 |
| 44 | 10:45 | [btc-updown-15m-1763030700](https://polymarket.com/event/btc-updown-15m-1763030700) | $2 | ✅ | UP | +$2 | $99 | - |
| 45 | 11:00 | [btc-updown-15m-1763031600](https://polymarket.com/event/btc-updown-15m-1763031600) | $1 | ✅ | UP | +$1 | $100 | - |
| 46 | 11:15 | [btc-updown-15m-1763032500](https://polymarket.com/event/btc-updown-15m-1763032500) | $1 | ❌ | DOWN | $-1 | $99 | L1 |
| 47 | 11:30 | [btc-updown-15m-1763033400](https://polymarket.com/event/btc-updown-15m-1763033400) | $2 | ✅ | UP | +$2 | $101 | - |
| 48 | 11:45 | [btc-updown-15m-1763034300](https://polymarket.com/event/btc-updown-15m-1763034300) | $1 | ❌ | DOWN | $-1 | $100 | L1 |
| 49 | 12:00 | [btc-updown-15m-1763035200](https://polymarket.com/event/btc-updown-15m-1763035200) | $2 | ❌ | DOWN | $-2 | $98 | L2 |
| 50 | 12:15 | [btc-updown-15m-1763036100](https://polymarket.com/event/btc-updown-15m-1763036100) | $4 | ✅ | UP | +$4 | $102 | - |
| 51 | 12:30 | [btc-updown-15m-1763037000](https://polymarket.com/event/btc-updown-15m-1763037000) | $1 | ✅ | UP | +$1 | $103 | - |
| 52 | 12:45 | [btc-updown-15m-1763037900](https://polymarket.com/event/btc-updown-15m-1763037900) | $1 | ❌ | DOWN | $-1 | $102 | L1 |
| 53 | 13:00 | [btc-updown-15m-1763038800](https://polymarket.com/event/btc-updown-15m-1763038800) | $2 | ❌ | DOWN | $-2 | $100 | L2 |
| 54 | 13:15 | [btc-updown-15m-1763039700](https://polymarket.com/event/btc-updown-15m-1763039700) | $4 | ❌ | DOWN | $-4 | $96 | L3 |
| 55 | 13:30 | [btc-updown-15m-1763040600](https://polymarket.com/event/btc-updown-15m-1763040600) | $8 | ❌ | DOWN | $-8 | $88 | L4 |
| 56 | 13:45 | [btc-updown-15m-1763041500](https://polymarket.com/event/btc-updown-15m-1763041500) | $16 | ❌ | DOWN | $-16 | $72 | L5 |
| - | 14:00 | [btc-updown-15m-1763042400](https://polymarket.com/event/btc-updown-15m-1763042400) | - | ⏭️ SKIP | DOWN | - | $72 | - |
| - | 14:15 | [btc-updown-15m-1763043300](https://polymarket.com/event/btc-updown-15m-1763043300) | - | ⏭️ SKIP | UP | - | $72 | - |
| - | 14:30 | [btc-updown-15m-1763044200](https://polymarket.com/event/btc-updown-15m-1763044200) | - | ⏭️ SKIP | DOWN | - | $72 | - |
| 57 | 14:45 | [btc-updown-15m-1763045100](https://polymarket.com/event/btc-updown-15m-1763045100) | $32 | ✅ | UP | +$32 | $104 | - |
| 58 | 15:00 | [btc-updown-15m-1763046000](https://polymarket.com/event/btc-updown-15m-1763046000) | $1 | ❌ | DOWN | $-1 | $103 | L1 |
| 59 | 15:15 | [btc-updown-15m-1763046900](https://polymarket.com/event/btc-updown-15m-1763046900) | $2 | ❌ | DOWN | $-2 | $101 | L2 |
| 60 | 15:30 | [btc-updown-15m-1763047800](https://polymarket.com/event/btc-updown-15m-1763047800) | $4 | ❌ | DOWN | $-4 | $97 | L3 |
| 61 | 15:45 | [btc-updown-15m-1763048700](https://polymarket.com/event/btc-updown-15m-1763048700) | $8 | ❌ | DOWN | $-8 | $89 | L4 |
| 62 | 16:00 | [btc-updown-15m-1763049600](https://polymarket.com/event/btc-updown-15m-1763049600) | $16 | ❌ | DOWN | $-16 | $73 | L5 |
| - | 16:15 | [btc-updown-15m-1763050500](https://polymarket.com/event/btc-updown-15m-1763050500) | - | ⏭️ SKIP | DOWN | - | $73 | - |
| - | 16:30 | [btc-updown-15m-1763051400](https://polymarket.com/event/btc-updown-15m-1763051400) | - | ⏭️ SKIP | DOWN | - | $73 | - |
| - | 16:45 | [btc-updown-15m-1763052300](https://polymarket.com/event/btc-updown-15m-1763052300) | - | ⏭️ SKIP | DOWN | - | $73 | - |
| 63 | 17:00 | [btc-updown-15m-1763053200](https://polymarket.com/event/btc-updown-15m-1763053200) | $32 | ❌ | DOWN | $-32 | $41 | L6 |
| - | 17:15 | [btc-updown-15m-1763054100](https://polymarket.com/event/btc-updown-15m-1763054100) | - | ⏭️ SKIP | DOWN | - | $41 | - |
| - | 17:30 | [btc-updown-15m-1763055000](https://polymarket.com/event/btc-updown-15m-1763055000) | - | ⏭️ SKIP | DOWN | - | $41 | - |
| - | 17:45 | [btc-updown-15m-1763055900](https://polymarket.com/event/btc-updown-15m-1763055900) | - | ⏭️ SKIP | DOWN | - | $41 | - |
| 64 | 18:00 | [btc-updown-15m-1763056800](https://polymarket.com/event/btc-updown-15m-1763056800) | $64 | ❌ | DOWN | $-64 | $-23 | L7 |
| - | 18:15 | [btc-updown-15m-1763057700](https://polymarket.com/event/btc-updown-15m-1763057700) | - | ⏭️ SKIP | DOWN | - | $-23 | - |
| - | 18:30 | [btc-updown-15m-1763058600](https://polymarket.com/event/btc-updown-15m-1763058600) | - | ⏭️ SKIP | DOWN | - | $-23 | - |
| - | 18:45 | [btc-updown-15m-1763059500](https://polymarket.com/event/btc-updown-15m-1763059500) | - | ⏭️ SKIP | DOWN | - | $-23 | - |
| 65 | 19:00 | [btc-updown-15m-1763060400](https://polymarket.com/event/btc-updown-15m-1763060400) | $128 | ✅ | UP | +$128 | $105 | - |
| 66 | 19:15 | [btc-updown-15m-1763061300](https://polymarket.com/event/btc-updown-15m-1763061300) | $1 | ✅ | UP | +$1 | $106 | - |
| 67 | 19:30 | [btc-updown-15m-1763062200](https://polymarket.com/event/btc-updown-15m-1763062200) | $1 | ❌ | DOWN | $-1 | $105 | L1 |
| 68 | 19:45 | [btc-updown-15m-1763063100](https://polymarket.com/event/btc-updown-15m-1763063100) | $2 | ❌ | DOWN | $-2 | $103 | L2 |
| 69 | 20:00 | [btc-updown-15m-1763064000](https://polymarket.com/event/btc-updown-15m-1763064000) | $4 | ❌ | DOWN | $-4 | $99 | L3 |
| 70 | 20:15 | [btc-updown-15m-1763064900](https://polymarket.com/event/btc-updown-15m-1763064900) | $8 | ✅ | UP | +$8 | $107 | - |
| 71 | 20:30 | [btc-updown-15m-1763065800](https://polymarket.com/event/btc-updown-15m-1763065800) | $1 | ✅ | UP | +$1 | $108 | - |
| 72 | 20:45 | [btc-updown-15m-1763066700](https://polymarket.com/event/btc-updown-15m-1763066700) | $1 | ❌ | DOWN | $-1 | $107 | L1 |
| 73 | 21:00 | [btc-updown-15m-1763067600](https://polymarket.com/event/btc-updown-15m-1763067600) | $2 | ✅ | UP | +$2 | $109 | - |
| 74 | 21:15 | [btc-updown-15m-1763068500](https://polymarket.com/event/btc-updown-15m-1763068500) | $1 | ❌ | DOWN | $-1 | $108 | L1 |
| 75 | 21:30 | [btc-updown-15m-1763069400](https://polymarket.com/event/btc-updown-15m-1763069400) | $2 | ✅ | UP | +$2 | $110 | - |
| 76 | 21:45 | [btc-updown-15m-1763070300](https://polymarket.com/event/btc-updown-15m-1763070300) | $1 | ❌ | DOWN | $-1 | $109 | L1 |
| 77 | 22:00 | [btc-updown-15m-1763071200](https://polymarket.com/event/btc-updown-15m-1763071200) | $2 | ✅ | UP | +$2 | $111 | - |
| 78 | 22:15 | [btc-updown-15m-1763072100](https://polymarket.com/event/btc-updown-15m-1763072100) | $1 | ✅ | UP | +$1 | $112 | - |
| 79 | 22:30 | [btc-updown-15m-1763073000](https://polymarket.com/event/btc-updown-15m-1763073000) | $1 | ✅ | UP | +$1 | $113 | - |
| 80 | 22:45 | [btc-updown-15m-1763073900](https://polymarket.com/event/btc-updown-15m-1763073900) | $1 | ✅ | UP | +$1 | $114 | - |
| 81 | 23:00 | [btc-updown-15m-1763074800](https://polymarket.com/event/btc-updown-15m-1763074800) | $1 | ✅ | UP | +$1 | $115 | - |
| 82 | 23:15 | [btc-updown-15m-1763075700](https://polymarket.com/event/btc-updown-15m-1763075700) | $1 | ✅ | UP | +$1 | $116 | - |
| 83 | 23:30 | [btc-updown-15m-1763076600](https://polymarket.com/event/btc-updown-15m-1763076600) | $1 | ✅ | UP | +$1 | $117 | - |
| 84 | 23:45 | [btc-updown-15m-1763077500](https://polymarket.com/event/btc-updown-15m-1763077500) | $1 | ❌ | DOWN | $-1 | $116 | L1 |

### 2025-11-14
**Summary:** 90 trades | 41 wins | 49 losses | Max Bet: $64 | Profit: +$41

**Skip Events (2):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 17:45 | 5 | $31 | $32 | 18:45 |
| 18:45 | 6 | $63 | $64 | 19:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763078400](https://polymarket.com/event/btc-updown-15m-1763078400) | $2 | ❌ | DOWN | $-2 | $114 | L2 |
| 2 | 00:15 | [btc-updown-15m-1763079300](https://polymarket.com/event/btc-updown-15m-1763079300) | $4 | ✅ | UP | +$4 | $118 | - |
| 3 | 00:30 | [btc-updown-15m-1763080200](https://polymarket.com/event/btc-updown-15m-1763080200) | $1 | ❌ | DOWN | $-1 | $117 | L1 |
| 4 | 00:45 | [btc-updown-15m-1763081100](https://polymarket.com/event/btc-updown-15m-1763081100) | $2 | ❌ | DOWN | $-2 | $115 | L2 |
| 5 | 01:00 | [btc-updown-15m-1763082000](https://polymarket.com/event/btc-updown-15m-1763082000) | $4 | ❌ | DOWN | $-4 | $111 | L3 |
| 6 | 01:15 | [btc-updown-15m-1763082900](https://polymarket.com/event/btc-updown-15m-1763082900) | $8 | ✅ | UP | +$8 | $119 | - |
| 7 | 01:30 | [btc-updown-15m-1763083800](https://polymarket.com/event/btc-updown-15m-1763083800) | $1 | ✅ | UP | +$1 | $120 | - |
| 8 | 01:45 | [btc-updown-15m-1763084700](https://polymarket.com/event/btc-updown-15m-1763084700) | $1 | ✅ | UP | +$1 | $121 | - |
| 9 | 02:00 | [btc-updown-15m-1763085600](https://polymarket.com/event/btc-updown-15m-1763085600) | $1 | ✅ | UP | +$1 | $122 | - |
| 10 | 02:15 | [btc-updown-15m-1763086500](https://polymarket.com/event/btc-updown-15m-1763086500) | $1 | ✅ | UP | +$1 | $123 | - |
| 11 | 02:30 | [btc-updown-15m-1763087400](https://polymarket.com/event/btc-updown-15m-1763087400) | $1 | ✅ | UP | +$1 | $124 | - |
| 12 | 02:45 | [btc-updown-15m-1763088300](https://polymarket.com/event/btc-updown-15m-1763088300) | $1 | ❌ | DOWN | $-1 | $123 | L1 |
| 13 | 03:00 | [btc-updown-15m-1763089200](https://polymarket.com/event/btc-updown-15m-1763089200) | $2 | ❌ | DOWN | $-2 | $121 | L2 |
| 14 | 03:15 | [btc-updown-15m-1763090100](https://polymarket.com/event/btc-updown-15m-1763090100) | $4 | ❌ | DOWN | $-4 | $117 | L3 |
| 15 | 03:30 | [btc-updown-15m-1763091000](https://polymarket.com/event/btc-updown-15m-1763091000) | $8 | ❌ | DOWN | $-8 | $109 | L4 |
| 16 | 03:45 | [btc-updown-15m-1763091900](https://polymarket.com/event/btc-updown-15m-1763091900) | $16 | ✅ | UP | +$16 | $125 | - |
| 17 | 04:00 | [btc-updown-15m-1763092800](https://polymarket.com/event/btc-updown-15m-1763092800) | $1 | ❌ | DOWN | $-1 | $124 | L1 |
| 18 | 04:15 | [btc-updown-15m-1763093700](https://polymarket.com/event/btc-updown-15m-1763093700) | $2 | ✅ | UP | +$2 | $126 | - |
| 19 | 04:30 | [btc-updown-15m-1763094600](https://polymarket.com/event/btc-updown-15m-1763094600) | $1 | ❌ | DOWN | $-1 | $125 | L1 |
| 20 | 04:45 | [btc-updown-15m-1763095500](https://polymarket.com/event/btc-updown-15m-1763095500) | $2 | ✅ | UP | +$2 | $127 | - |
| 21 | 05:00 | [btc-updown-15m-1763096400](https://polymarket.com/event/btc-updown-15m-1763096400) | $1 | ❌ | DOWN | $-1 | $126 | L1 |
| 22 | 05:15 | [btc-updown-15m-1763097300](https://polymarket.com/event/btc-updown-15m-1763097300) | $2 | ❌ | DOWN | $-2 | $124 | L2 |
| 23 | 05:30 | [btc-updown-15m-1763098200](https://polymarket.com/event/btc-updown-15m-1763098200) | $4 | ❌ | DOWN | $-4 | $120 | L3 |
| 24 | 05:45 | [btc-updown-15m-1763099100](https://polymarket.com/event/btc-updown-15m-1763099100) | $8 | ✅ | UP | +$8 | $128 | - |
| 25 | 06:00 | [btc-updown-15m-1763100000](https://polymarket.com/event/btc-updown-15m-1763100000) | $1 | ❌ | DOWN | $-1 | $127 | L1 |
| 26 | 06:15 | [btc-updown-15m-1763100900](https://polymarket.com/event/btc-updown-15m-1763100900) | $2 | ❌ | DOWN | $-2 | $125 | L2 |
| 27 | 06:30 | [btc-updown-15m-1763101800](https://polymarket.com/event/btc-updown-15m-1763101800) | $4 | ❌ | DOWN | $-4 | $121 | L3 |
| 28 | 06:45 | [btc-updown-15m-1763102700](https://polymarket.com/event/btc-updown-15m-1763102700) | $8 | ✅ | UP | +$8 | $129 | - |
| 29 | 07:00 | [btc-updown-15m-1763103600](https://polymarket.com/event/btc-updown-15m-1763103600) | $1 | ❌ | DOWN | $-1 | $128 | L1 |
| 30 | 07:15 | [btc-updown-15m-1763104500](https://polymarket.com/event/btc-updown-15m-1763104500) | $2 | ✅ | UP | +$2 | $130 | - |
| 31 | 07:30 | [btc-updown-15m-1763105400](https://polymarket.com/event/btc-updown-15m-1763105400) | $1 | ❌ | DOWN | $-1 | $129 | L1 |
| 32 | 07:45 | [btc-updown-15m-1763106300](https://polymarket.com/event/btc-updown-15m-1763106300) | $2 | ❌ | DOWN | $-2 | $127 | L2 |
| 33 | 08:00 | [btc-updown-15m-1763107200](https://polymarket.com/event/btc-updown-15m-1763107200) | $4 | ❌ | DOWN | $-4 | $123 | L3 |
| 34 | 08:15 | [btc-updown-15m-1763108100](https://polymarket.com/event/btc-updown-15m-1763108100) | $8 | ✅ | UP | +$8 | $131 | - |
| 35 | 08:30 | [btc-updown-15m-1763109000](https://polymarket.com/event/btc-updown-15m-1763109000) | $1 | ✅ | UP | +$1 | $132 | - |
| 36 | 08:45 | [btc-updown-15m-1763109900](https://polymarket.com/event/btc-updown-15m-1763109900) | $1 | ✅ | UP | +$1 | $133 | - |
| 37 | 09:00 | [btc-updown-15m-1763110800](https://polymarket.com/event/btc-updown-15m-1763110800) | $1 | ❌ | DOWN | $-1 | $132 | L1 |
| 38 | 09:15 | [btc-updown-15m-1763111700](https://polymarket.com/event/btc-updown-15m-1763111700) | $2 | ❌ | DOWN | $-2 | $130 | L2 |
| 39 | 09:30 | [btc-updown-15m-1763112600](https://polymarket.com/event/btc-updown-15m-1763112600) | $4 | ✅ | UP | +$4 | $134 | - |
| 40 | 09:45 | [btc-updown-15m-1763113500](https://polymarket.com/event/btc-updown-15m-1763113500) | $1 | ❌ | DOWN | $-1 | $133 | L1 |
| 41 | 10:00 | [btc-updown-15m-1763114400](https://polymarket.com/event/btc-updown-15m-1763114400) | $2 | ✅ | UP | +$2 | $135 | - |
| 42 | 10:15 | [btc-updown-15m-1763115300](https://polymarket.com/event/btc-updown-15m-1763115300) | $1 | ✅ | UP | +$1 | $136 | - |
| 43 | 10:30 | [btc-updown-15m-1763116200](https://polymarket.com/event/btc-updown-15m-1763116200) | $1 | ✅ | UP | +$1 | $137 | - |
| 44 | 10:45 | [btc-updown-15m-1763117100](https://polymarket.com/event/btc-updown-15m-1763117100) | $1 | ❌ | DOWN | $-1 | $136 | L1 |
| 45 | 11:00 | [btc-updown-15m-1763118000](https://polymarket.com/event/btc-updown-15m-1763118000) | $2 | ✅ | UP | +$2 | $138 | - |
| 46 | 11:15 | [btc-updown-15m-1763118900](https://polymarket.com/event/btc-updown-15m-1763118900) | $1 | ❌ | DOWN | $-1 | $137 | L1 |
| 47 | 11:30 | [btc-updown-15m-1763119800](https://polymarket.com/event/btc-updown-15m-1763119800) | $2 | ❌ | DOWN | $-2 | $135 | L2 |
| 48 | 11:45 | [btc-updown-15m-1763120700](https://polymarket.com/event/btc-updown-15m-1763120700) | $4 | ❌ | DOWN | $-4 | $131 | L3 |
| 49 | 12:00 | [btc-updown-15m-1763121600](https://polymarket.com/event/btc-updown-15m-1763121600) | $8 | ❌ | DOWN | $-8 | $123 | L4 |
| 50 | 12:15 | [btc-updown-15m-1763122500](https://polymarket.com/event/btc-updown-15m-1763122500) | $16 | ✅ | UP | +$16 | $139 | - |
| 51 | 12:30 | [btc-updown-15m-1763123400](https://polymarket.com/event/btc-updown-15m-1763123400) | $1 | ❌ | DOWN | $-1 | $138 | L1 |
| 52 | 12:45 | [btc-updown-15m-1763124300](https://polymarket.com/event/btc-updown-15m-1763124300) | $2 | ✅ | UP | +$2 | $140 | - |
| 53 | 13:00 | [btc-updown-15m-1763125200](https://polymarket.com/event/btc-updown-15m-1763125200) | $1 | ❌ | DOWN | $-1 | $139 | L1 |
| 54 | 13:15 | [btc-updown-15m-1763126100](https://polymarket.com/event/btc-updown-15m-1763126100) | $2 | ✅ | UP | +$2 | $141 | - |
| 55 | 13:30 | [btc-updown-15m-1763127000](https://polymarket.com/event/btc-updown-15m-1763127000) | $1 | ❌ | DOWN | $-1 | $140 | L1 |
| 56 | 13:45 | [btc-updown-15m-1763127900](https://polymarket.com/event/btc-updown-15m-1763127900) | $2 | ✅ | UP | +$2 | $142 | - |
| 57 | 14:00 | [btc-updown-15m-1763128800](https://polymarket.com/event/btc-updown-15m-1763128800) | $1 | ✅ | UP | +$1 | $143 | - |
| 58 | 14:15 | [btc-updown-15m-1763129700](https://polymarket.com/event/btc-updown-15m-1763129700) | $1 | ✅ | UP | +$1 | $144 | - |
| 59 | 14:30 | [btc-updown-15m-1763130600](https://polymarket.com/event/btc-updown-15m-1763130600) | $1 | ✅ | UP | +$1 | $145 | - |
| 60 | 14:45 | [btc-updown-15m-1763131500](https://polymarket.com/event/btc-updown-15m-1763131500) | $1 | ✅ | UP | +$1 | $146 | - |
| 61 | 15:00 | [btc-updown-15m-1763132400](https://polymarket.com/event/btc-updown-15m-1763132400) | $1 | ❌ | DOWN | $-1 | $145 | L1 |
| 62 | 15:15 | [btc-updown-15m-1763133300](https://polymarket.com/event/btc-updown-15m-1763133300) | $2 | ✅ | UP | +$2 | $147 | - |
| 63 | 15:30 | [btc-updown-15m-1763134200](https://polymarket.com/event/btc-updown-15m-1763134200) | $1 | ✅ | UP | +$1 | $148 | - |
| 64 | 15:45 | [btc-updown-15m-1763135100](https://polymarket.com/event/btc-updown-15m-1763135100) | $1 | ✅ | UP | +$1 | $149 | - |
| 65 | 16:00 | [btc-updown-15m-1763136000](https://polymarket.com/event/btc-updown-15m-1763136000) | $1 | ❌ | DOWN | $-1 | $148 | L1 |
| 66 | 16:15 | [btc-updown-15m-1763136900](https://polymarket.com/event/btc-updown-15m-1763136900) | $2 | ✅ | UP | +$2 | $150 | - |
| 67 | 16:30 | [btc-updown-15m-1763137800](https://polymarket.com/event/btc-updown-15m-1763137800) | $1 | ✅ | UP | +$1 | $151 | - |
| 68 | 16:45 | [btc-updown-15m-1763138700](https://polymarket.com/event/btc-updown-15m-1763138700) | $1 | ❌ | DOWN | $-1 | $150 | L1 |
| 69 | 17:00 | [btc-updown-15m-1763139600](https://polymarket.com/event/btc-updown-15m-1763139600) | $2 | ❌ | DOWN | $-2 | $148 | L2 |
| 70 | 17:15 | [btc-updown-15m-1763140500](https://polymarket.com/event/btc-updown-15m-1763140500) | $4 | ❌ | DOWN | $-4 | $144 | L3 |
| 71 | 17:30 | [btc-updown-15m-1763141400](https://polymarket.com/event/btc-updown-15m-1763141400) | $8 | ❌ | DOWN | $-8 | $136 | L4 |
| 72 | 17:45 | [btc-updown-15m-1763142300](https://polymarket.com/event/btc-updown-15m-1763142300) | $16 | ❌ | DOWN | $-16 | $120 | L5 |
| - | 18:00 | [btc-updown-15m-1763143200](https://polymarket.com/event/btc-updown-15m-1763143200) | - | ⏭️ SKIP | UP | - | $120 | - |
| - | 18:15 | [btc-updown-15m-1763144100](https://polymarket.com/event/btc-updown-15m-1763144100) | - | ⏭️ SKIP | DOWN | - | $120 | - |
| - | 18:30 | [btc-updown-15m-1763145000](https://polymarket.com/event/btc-updown-15m-1763145000) | - | ⏭️ SKIP | DOWN | - | $120 | - |
| 73 | 18:45 | [btc-updown-15m-1763145900](https://polymarket.com/event/btc-updown-15m-1763145900) | $32 | ❌ | DOWN | $-32 | $88 | L6 |
| - | 19:00 | [btc-updown-15m-1763146800](https://polymarket.com/event/btc-updown-15m-1763146800) | - | ⏭️ SKIP | UP | - | $88 | - |
| - | 19:15 | [btc-updown-15m-1763147700](https://polymarket.com/event/btc-updown-15m-1763147700) | - | ⏭️ SKIP | UP | - | $88 | - |
| - | 19:30 | [btc-updown-15m-1763148600](https://polymarket.com/event/btc-updown-15m-1763148600) | - | ⏭️ SKIP | DOWN | - | $88 | - |
| 74 | 19:45 | [btc-updown-15m-1763149500](https://polymarket.com/event/btc-updown-15m-1763149500) | $64 | ✅ | UP | +$64 | $152 | - |
| 75 | 20:00 | [btc-updown-15m-1763150400](https://polymarket.com/event/btc-updown-15m-1763150400) | $1 | ❌ | DOWN | $-1 | $151 | L1 |
| 76 | 20:15 | [btc-updown-15m-1763151300](https://polymarket.com/event/btc-updown-15m-1763151300) | $2 | ❌ | DOWN | $-2 | $149 | L2 |
| 77 | 20:30 | [btc-updown-15m-1763152200](https://polymarket.com/event/btc-updown-15m-1763152200) | $4 | ❌ | DOWN | $-4 | $145 | L3 |
| 78 | 20:45 | [btc-updown-15m-1763153100](https://polymarket.com/event/btc-updown-15m-1763153100) | $8 | ❌ | DOWN | $-8 | $137 | L4 |
| 79 | 21:00 | [btc-updown-15m-1763154000](https://polymarket.com/event/btc-updown-15m-1763154000) | $16 | ✅ | UP | +$16 | $153 | - |
| 80 | 21:15 | [btc-updown-15m-1763154900](https://polymarket.com/event/btc-updown-15m-1763154900) | $1 | ❌ | DOWN | $-1 | $152 | L1 |
| 81 | 21:30 | [btc-updown-15m-1763155800](https://polymarket.com/event/btc-updown-15m-1763155800) | $2 | ✅ | UP | +$2 | $154 | - |
| 82 | 21:45 | [btc-updown-15m-1763156700](https://polymarket.com/event/btc-updown-15m-1763156700) | $1 | ✅ | UP | +$1 | $155 | - |
| 83 | 22:00 | [btc-updown-15m-1763157600](https://polymarket.com/event/btc-updown-15m-1763157600) | $1 | ❌ | DOWN | $-1 | $154 | L1 |
| 84 | 22:15 | [btc-updown-15m-1763158500](https://polymarket.com/event/btc-updown-15m-1763158500) | $2 | ✅ | UP | +$2 | $156 | - |
| 85 | 22:30 | [btc-updown-15m-1763159400](https://polymarket.com/event/btc-updown-15m-1763159400) | $1 | ✅ | UP | +$1 | $157 | - |
| 86 | 22:45 | [btc-updown-15m-1763160300](https://polymarket.com/event/btc-updown-15m-1763160300) | $1 | ❌ | DOWN | $-1 | $156 | L1 |
| 87 | 23:00 | [btc-updown-15m-1763161200](https://polymarket.com/event/btc-updown-15m-1763161200) | $2 | ❌ | DOWN | $-2 | $154 | L2 |
| 88 | 23:15 | [btc-updown-15m-1763162100](https://polymarket.com/event/btc-updown-15m-1763162100) | $4 | ❌ | DOWN | $-4 | $150 | L3 |
| 89 | 23:30 | [btc-updown-15m-1763163000](https://polymarket.com/event/btc-updown-15m-1763163000) | $8 | ✅ | UP | +$8 | $158 | - |
| 90 | 23:45 | [btc-updown-15m-1763163900](https://polymarket.com/event/btc-updown-15m-1763163900) | $1 | ❌ | DOWN | $-1 | $157 | L1 |

### 2025-11-15
**Summary:** 93 trades | 54 wins | 39 losses | Max Bet: $32 | Profit: +$55

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 11:45 | 5 | $31 | $32 | 12:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763164800](https://polymarket.com/event/btc-updown-15m-1763164800) | $2 | ✅ | UP | +$2 | $159 | - |
| 2 | 00:15 | [btc-updown-15m-1763165700](https://polymarket.com/event/btc-updown-15m-1763165700) | $1 | ✅ | UP | +$1 | $160 | - |
| 3 | 00:30 | [btc-updown-15m-1763166600](https://polymarket.com/event/btc-updown-15m-1763166600) | $1 | ❌ | DOWN | $-1 | $159 | L1 |
| 4 | 00:45 | [btc-updown-15m-1763167500](https://polymarket.com/event/btc-updown-15m-1763167500) | $2 | ✅ | UP | +$2 | $161 | - |
| 5 | 01:00 | [btc-updown-15m-1763168400](https://polymarket.com/event/btc-updown-15m-1763168400) | $1 | ❌ | DOWN | $-1 | $160 | L1 |
| 6 | 01:15 | [btc-updown-15m-1763169300](https://polymarket.com/event/btc-updown-15m-1763169300) | $2 | ✅ | UP | +$2 | $162 | - |
| 7 | 01:30 | [btc-updown-15m-1763170200](https://polymarket.com/event/btc-updown-15m-1763170200) | $1 | ✅ | UP | +$1 | $163 | - |
| 8 | 01:45 | [btc-updown-15m-1763171100](https://polymarket.com/event/btc-updown-15m-1763171100) | $1 | ✅ | UP | +$1 | $164 | - |
| 9 | 02:00 | [btc-updown-15m-1763172000](https://polymarket.com/event/btc-updown-15m-1763172000) | $1 | ❌ | DOWN | $-1 | $163 | L1 |
| 10 | 02:15 | [btc-updown-15m-1763172900](https://polymarket.com/event/btc-updown-15m-1763172900) | $2 | ✅ | UP | +$2 | $165 | - |
| 11 | 02:30 | [btc-updown-15m-1763173800](https://polymarket.com/event/btc-updown-15m-1763173800) | $1 | ✅ | UP | +$1 | $166 | - |
| 12 | 02:45 | [btc-updown-15m-1763174700](https://polymarket.com/event/btc-updown-15m-1763174700) | $1 | ✅ | UP | +$1 | $167 | - |
| 13 | 03:00 | [btc-updown-15m-1763175600](https://polymarket.com/event/btc-updown-15m-1763175600) | $1 | ✅ | UP | +$1 | $168 | - |
| 14 | 03:15 | [btc-updown-15m-1763176500](https://polymarket.com/event/btc-updown-15m-1763176500) | $1 | ✅ | UP | +$1 | $169 | - |
| 15 | 03:30 | [btc-updown-15m-1763177400](https://polymarket.com/event/btc-updown-15m-1763177400) | $1 | ❌ | DOWN | $-1 | $168 | L1 |
| 16 | 03:45 | [btc-updown-15m-1763178300](https://polymarket.com/event/btc-updown-15m-1763178300) | $2 | ✅ | UP | +$2 | $170 | - |
| 17 | 04:00 | [btc-updown-15m-1763179200](https://polymarket.com/event/btc-updown-15m-1763179200) | $1 | ❌ | DOWN | $-1 | $169 | L1 |
| 18 | 04:15 | [btc-updown-15m-1763180100](https://polymarket.com/event/btc-updown-15m-1763180100) | $2 | ❌ | DOWN | $-2 | $167 | L2 |
| 19 | 04:30 | [btc-updown-15m-1763181000](https://polymarket.com/event/btc-updown-15m-1763181000) | $4 | ❌ | DOWN | $-4 | $163 | L3 |
| 20 | 04:45 | [btc-updown-15m-1763181900](https://polymarket.com/event/btc-updown-15m-1763181900) | $8 | ✅ | UP | +$8 | $171 | - |
| 21 | 05:00 | [btc-updown-15m-1763182800](https://polymarket.com/event/btc-updown-15m-1763182800) | $1 | ❌ | DOWN | $-1 | $170 | L1 |
| 22 | 05:15 | [btc-updown-15m-1763183700](https://polymarket.com/event/btc-updown-15m-1763183700) | $2 | ✅ | UP | +$2 | $172 | - |
| 23 | 05:30 | [btc-updown-15m-1763184600](https://polymarket.com/event/btc-updown-15m-1763184600) | $1 | ✅ | UP | +$1 | $173 | - |
| 24 | 05:45 | [btc-updown-15m-1763185500](https://polymarket.com/event/btc-updown-15m-1763185500) | $1 | ✅ | UP | +$1 | $174 | - |
| 25 | 06:00 | [btc-updown-15m-1763186400](https://polymarket.com/event/btc-updown-15m-1763186400) | $1 | ✅ | UP | +$1 | $175 | - |
| 26 | 06:15 | [btc-updown-15m-1763187300](https://polymarket.com/event/btc-updown-15m-1763187300) | $1 | ❌ | DOWN | $-1 | $174 | L1 |
| 27 | 06:30 | [btc-updown-15m-1763188200](https://polymarket.com/event/btc-updown-15m-1763188200) | $2 | ❌ | DOWN | $-2 | $172 | L2 |
| 28 | 06:45 | [btc-updown-15m-1763189100](https://polymarket.com/event/btc-updown-15m-1763189100) | $4 | ✅ | UP | +$4 | $176 | - |
| 29 | 07:00 | [btc-updown-15m-1763190000](https://polymarket.com/event/btc-updown-15m-1763190000) | $1 | ✅ | UP | +$1 | $177 | - |
| 30 | 07:15 | [btc-updown-15m-1763190900](https://polymarket.com/event/btc-updown-15m-1763190900) | $1 | ✅ | UP | +$1 | $178 | - |
| 31 | 07:30 | [btc-updown-15m-1763191800](https://polymarket.com/event/btc-updown-15m-1763191800) | $1 | ❌ | DOWN | $-1 | $177 | L1 |
| 32 | 07:45 | [btc-updown-15m-1763192700](https://polymarket.com/event/btc-updown-15m-1763192700) | $2 | ✅ | UP | +$2 | $179 | - |
| 33 | 08:00 | [btc-updown-15m-1763193600](https://polymarket.com/event/btc-updown-15m-1763193600) | $1 | ❌ | DOWN | $-1 | $178 | L1 |
| 34 | 08:15 | [btc-updown-15m-1763194500](https://polymarket.com/event/btc-updown-15m-1763194500) | $2 | ❌ | DOWN | $-2 | $176 | L2 |
| 35 | 08:30 | [btc-updown-15m-1763195400](https://polymarket.com/event/btc-updown-15m-1763195400) | $4 | ❌ | DOWN | $-4 | $172 | L3 |
| 36 | 08:45 | [btc-updown-15m-1763196300](https://polymarket.com/event/btc-updown-15m-1763196300) | $8 | ✅ | UP | +$8 | $180 | - |
| 37 | 09:00 | [btc-updown-15m-1763197200](https://polymarket.com/event/btc-updown-15m-1763197200) | $1 | ✅ | UP | +$1 | $181 | - |
| 38 | 09:15 | [btc-updown-15m-1763198100](https://polymarket.com/event/btc-updown-15m-1763198100) | $1 | ❌ | DOWN | $-1 | $180 | L1 |
| 39 | 09:30 | [btc-updown-15m-1763199000](https://polymarket.com/event/btc-updown-15m-1763199000) | $2 | ✅ | UP | +$2 | $182 | - |
| 40 | 09:45 | [btc-updown-15m-1763199900](https://polymarket.com/event/btc-updown-15m-1763199900) | $1 | ❌ | DOWN | $-1 | $181 | L1 |
| 41 | 10:00 | [btc-updown-15m-1763200800](https://polymarket.com/event/btc-updown-15m-1763200800) | $2 | ✅ | UP | +$2 | $183 | - |
| 42 | 10:15 | [btc-updown-15m-1763201700](https://polymarket.com/event/btc-updown-15m-1763201700) | $1 | ✅ | UP | +$1 | $184 | - |
| 43 | 10:30 | [btc-updown-15m-1763202600](https://polymarket.com/event/btc-updown-15m-1763202600) | $1 | ✅ | UP | +$1 | $185 | - |
| 44 | 10:45 | [btc-updown-15m-1763203500](https://polymarket.com/event/btc-updown-15m-1763203500) | $1 | ❌ | DOWN | $-1 | $184 | L1 |
| 45 | 11:00 | [btc-updown-15m-1763204400](https://polymarket.com/event/btc-updown-15m-1763204400) | $2 | ❌ | DOWN | $-2 | $182 | L2 |
| 46 | 11:15 | [btc-updown-15m-1763205300](https://polymarket.com/event/btc-updown-15m-1763205300) | $4 | ❌ | DOWN | $-4 | $178 | L3 |
| 47 | 11:30 | [btc-updown-15m-1763206200](https://polymarket.com/event/btc-updown-15m-1763206200) | $8 | ❌ | DOWN | $-8 | $170 | L4 |
| 48 | 11:45 | [btc-updown-15m-1763207100](https://polymarket.com/event/btc-updown-15m-1763207100) | $16 | ❌ | DOWN | $-16 | $154 | L5 |
| - | 12:00 | [btc-updown-15m-1763208000](https://polymarket.com/event/btc-updown-15m-1763208000) | - | ⏭️ SKIP | UP | - | $154 | - |
| - | 12:15 | [btc-updown-15m-1763208900](https://polymarket.com/event/btc-updown-15m-1763208900) | - | ⏭️ SKIP | UP | - | $154 | - |
| - | 12:30 | [btc-updown-15m-1763209800](https://polymarket.com/event/btc-updown-15m-1763209800) | - | ⏭️ SKIP | DOWN | - | $154 | - |
| 49 | 12:45 | [btc-updown-15m-1763210700](https://polymarket.com/event/btc-updown-15m-1763210700) | $32 | ✅ | UP | +$32 | $186 | - |
| 50 | 13:00 | [btc-updown-15m-1763211600](https://polymarket.com/event/btc-updown-15m-1763211600) | $1 | ✅ | UP | +$1 | $187 | - |
| 51 | 13:15 | [btc-updown-15m-1763212500](https://polymarket.com/event/btc-updown-15m-1763212500) | $1 | ✅ | UP | +$1 | $188 | - |
| 52 | 13:30 | [btc-updown-15m-1763213400](https://polymarket.com/event/btc-updown-15m-1763213400) | $1 | ✅ | UP | +$1 | $189 | - |
| 53 | 13:45 | [btc-updown-15m-1763214300](https://polymarket.com/event/btc-updown-15m-1763214300) | $1 | ✅ | UP | +$1 | $190 | - |
| 54 | 14:00 | [btc-updown-15m-1763215200](https://polymarket.com/event/btc-updown-15m-1763215200) | $1 | ✅ | UP | +$1 | $191 | - |
| 55 | 14:15 | [btc-updown-15m-1763216100](https://polymarket.com/event/btc-updown-15m-1763216100) | $1 | ❌ | DOWN | $-1 | $190 | L1 |
| 56 | 14:30 | [btc-updown-15m-1763217000](https://polymarket.com/event/btc-updown-15m-1763217000) | $2 | ✅ | UP | +$2 | $192 | - |
| 57 | 14:45 | [btc-updown-15m-1763217900](https://polymarket.com/event/btc-updown-15m-1763217900) | $1 | ✅ | UP | +$1 | $193 | - |
| 58 | 15:00 | [btc-updown-15m-1763218800](https://polymarket.com/event/btc-updown-15m-1763218800) | $1 | ✅ | UP | +$1 | $194 | - |
| 59 | 15:15 | [btc-updown-15m-1763219700](https://polymarket.com/event/btc-updown-15m-1763219700) | $1 | ✅ | UP | +$1 | $195 | - |
| 60 | 15:30 | [btc-updown-15m-1763220600](https://polymarket.com/event/btc-updown-15m-1763220600) | $1 | ❌ | DOWN | $-1 | $194 | L1 |
| 61 | 15:45 | [btc-updown-15m-1763221500](https://polymarket.com/event/btc-updown-15m-1763221500) | $2 | ✅ | UP | +$2 | $196 | - |
| 62 | 16:00 | [btc-updown-15m-1763222400](https://polymarket.com/event/btc-updown-15m-1763222400) | $1 | ❌ | DOWN | $-1 | $195 | L1 |
| 63 | 16:15 | [btc-updown-15m-1763223300](https://polymarket.com/event/btc-updown-15m-1763223300) | $2 | ❌ | DOWN | $-2 | $193 | L2 |
| 64 | 16:30 | [btc-updown-15m-1763224200](https://polymarket.com/event/btc-updown-15m-1763224200) | $4 | ✅ | UP | +$4 | $197 | - |
| 65 | 16:45 | [btc-updown-15m-1763225100](https://polymarket.com/event/btc-updown-15m-1763225100) | $1 | ✅ | UP | +$1 | $198 | - |
| 66 | 17:00 | [btc-updown-15m-1763226000](https://polymarket.com/event/btc-updown-15m-1763226000) | $1 | ❌ | DOWN | $-1 | $197 | L1 |
| 67 | 17:15 | [btc-updown-15m-1763226900](https://polymarket.com/event/btc-updown-15m-1763226900) | $2 | ✅ | UP | +$2 | $199 | - |
| 68 | 17:30 | [btc-updown-15m-1763227800](https://polymarket.com/event/btc-updown-15m-1763227800) | $1 | ✅ | UP | +$1 | $200 | - |
| 69 | 17:45 | [btc-updown-15m-1763228700](https://polymarket.com/event/btc-updown-15m-1763228700) | $1 | ✅ | UP | +$1 | $201 | - |
| 70 | 18:00 | [btc-updown-15m-1763229600](https://polymarket.com/event/btc-updown-15m-1763229600) | $1 | ✅ | UP | +$1 | $202 | - |
| 71 | 18:15 | [btc-updown-15m-1763230500](https://polymarket.com/event/btc-updown-15m-1763230500) | $1 | ❌ | DOWN | $-1 | $201 | L1 |
| 72 | 18:30 | [btc-updown-15m-1763231400](https://polymarket.com/event/btc-updown-15m-1763231400) | $2 | ✅ | UP | +$2 | $203 | - |
| 73 | 18:45 | [btc-updown-15m-1763232300](https://polymarket.com/event/btc-updown-15m-1763232300) | $1 | ❌ | DOWN | $-1 | $202 | L1 |
| 74 | 19:00 | [btc-updown-15m-1763233200](https://polymarket.com/event/btc-updown-15m-1763233200) | $2 | ✅ | UP | +$2 | $204 | - |
| 75 | 19:15 | [btc-updown-15m-1763234100](https://polymarket.com/event/btc-updown-15m-1763234100) | $1 | ❌ | DOWN | $-1 | $203 | L1 |
| 76 | 19:30 | [btc-updown-15m-1763235000](https://polymarket.com/event/btc-updown-15m-1763235000) | $2 | ❌ | DOWN | $-2 | $201 | L2 |
| 77 | 19:45 | [btc-updown-15m-1763235900](https://polymarket.com/event/btc-updown-15m-1763235900) | $4 | ✅ | UP | +$4 | $205 | - |
| 78 | 20:00 | [btc-updown-15m-1763236800](https://polymarket.com/event/btc-updown-15m-1763236800) | $1 | ❌ | DOWN | $-1 | $204 | L1 |
| 79 | 20:15 | [btc-updown-15m-1763237700](https://polymarket.com/event/btc-updown-15m-1763237700) | $2 | ❌ | DOWN | $-2 | $202 | L2 |
| 80 | 20:30 | [btc-updown-15m-1763238600](https://polymarket.com/event/btc-updown-15m-1763238600) | $4 | ❌ | DOWN | $-4 | $198 | L3 |
| 81 | 20:45 | [btc-updown-15m-1763239500](https://polymarket.com/event/btc-updown-15m-1763239500) | $8 | ❌ | DOWN | $-8 | $190 | L4 |
| 82 | 21:00 | [btc-updown-15m-1763240400](https://polymarket.com/event/btc-updown-15m-1763240400) | $16 | ✅ | UP | +$16 | $206 | - |
| 83 | 21:15 | [btc-updown-15m-1763241300](https://polymarket.com/event/btc-updown-15m-1763241300) | $1 | ❌ | DOWN | $-1 | $205 | L1 |
| 84 | 21:30 | [btc-updown-15m-1763242200](https://polymarket.com/event/btc-updown-15m-1763242200) | $2 | ❌ | DOWN | $-2 | $203 | L2 |
| 85 | 21:45 | [btc-updown-15m-1763243100](https://polymarket.com/event/btc-updown-15m-1763243100) | $4 | ✅ | UP | +$4 | $207 | - |
| 86 | 22:00 | [btc-updown-15m-1763244000](https://polymarket.com/event/btc-updown-15m-1763244000) | $1 | ✅ | UP | +$1 | $208 | - |
| 87 | 22:15 | [btc-updown-15m-1763244900](https://polymarket.com/event/btc-updown-15m-1763244900) | $1 | ✅ | UP | +$1 | $209 | - |
| 88 | 22:30 | [btc-updown-15m-1763245800](https://polymarket.com/event/btc-updown-15m-1763245800) | $1 | ❌ | DOWN | $-1 | $208 | L1 |
| 89 | 22:45 | [btc-updown-15m-1763246700](https://polymarket.com/event/btc-updown-15m-1763246700) | $2 | ✅ | UP | +$2 | $210 | - |
| 90 | 23:00 | [btc-updown-15m-1763247600](https://polymarket.com/event/btc-updown-15m-1763247600) | $1 | ❌ | DOWN | $-1 | $209 | L1 |
| 91 | 23:15 | [btc-updown-15m-1763248500](https://polymarket.com/event/btc-updown-15m-1763248500) | $2 | ✅ | UP | +$2 | $211 | - |
| 92 | 23:30 | [btc-updown-15m-1763249400](https://polymarket.com/event/btc-updown-15m-1763249400) | $1 | ❌ | DOWN | $-1 | $210 | L1 |
| 93 | 23:45 | [btc-updown-15m-1763250300](https://polymarket.com/event/btc-updown-15m-1763250300) | $2 | ✅ | UP | +$2 | $212 | - |

### 2025-11-16
**Summary:** 84 trades | 37 wins | 47 losses | Max Bet: $64 | Profit: +$36

**Skip Events (4):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 15:45 | 5 | $31 | $32 | 16:45 |
| 16:45 | 6 | $63 | $64 | 17:45 |
| 21:30 | 5 | $31 | $32 | 22:30 |
| 22:30 | 6 | $63 | $64 | 23:30 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763251200](https://polymarket.com/event/btc-updown-15m-1763251200) | $1 | ❌ | DOWN | $-1 | $211 | L1 |
| 2 | 00:15 | [btc-updown-15m-1763252100](https://polymarket.com/event/btc-updown-15m-1763252100) | $2 | ❌ | DOWN | $-2 | $209 | L2 |
| 3 | 00:30 | [btc-updown-15m-1763253000](https://polymarket.com/event/btc-updown-15m-1763253000) | $4 | ✅ | UP | +$4 | $213 | - |
| 4 | 00:45 | [btc-updown-15m-1763253900](https://polymarket.com/event/btc-updown-15m-1763253900) | $1 | ❌ | DOWN | $-1 | $212 | L1 |
| 5 | 01:00 | [btc-updown-15m-1763254800](https://polymarket.com/event/btc-updown-15m-1763254800) | $2 | ✅ | UP | +$2 | $214 | - |
| 6 | 01:15 | [btc-updown-15m-1763255700](https://polymarket.com/event/btc-updown-15m-1763255700) | $1 | ❌ | DOWN | $-1 | $213 | L1 |
| 7 | 01:30 | [btc-updown-15m-1763256600](https://polymarket.com/event/btc-updown-15m-1763256600) | $2 | ❌ | DOWN | $-2 | $211 | L2 |
| 8 | 01:45 | [btc-updown-15m-1763257500](https://polymarket.com/event/btc-updown-15m-1763257500) | $4 | ✅ | UP | +$4 | $215 | - |
| 9 | 02:00 | [btc-updown-15m-1763258400](https://polymarket.com/event/btc-updown-15m-1763258400) | $1 | ✅ | UP | +$1 | $216 | - |
| 10 | 02:15 | [btc-updown-15m-1763259300](https://polymarket.com/event/btc-updown-15m-1763259300) | $1 | ✅ | UP | +$1 | $217 | - |
| 11 | 02:30 | [btc-updown-15m-1763260200](https://polymarket.com/event/btc-updown-15m-1763260200) | $1 | ✅ | UP | +$1 | $218 | - |
| 12 | 02:45 | [btc-updown-15m-1763261100](https://polymarket.com/event/btc-updown-15m-1763261100) | $1 | ✅ | UP | +$1 | $219 | - |
| 13 | 03:00 | [btc-updown-15m-1763262000](https://polymarket.com/event/btc-updown-15m-1763262000) | $1 | ❌ | DOWN | $-1 | $218 | L1 |
| 14 | 03:15 | [btc-updown-15m-1763262900](https://polymarket.com/event/btc-updown-15m-1763262900) | $2 | ✅ | UP | +$2 | $220 | - |
| 15 | 03:30 | [btc-updown-15m-1763263800](https://polymarket.com/event/btc-updown-15m-1763263800) | $1 | ❌ | DOWN | $-1 | $219 | L1 |
| 16 | 03:45 | [btc-updown-15m-1763264700](https://polymarket.com/event/btc-updown-15m-1763264700) | $2 | ✅ | UP | +$2 | $221 | - |
| 17 | 04:00 | [btc-updown-15m-1763265600](https://polymarket.com/event/btc-updown-15m-1763265600) | $1 | ✅ | UP | +$1 | $222 | - |
| 18 | 04:15 | [btc-updown-15m-1763266500](https://polymarket.com/event/btc-updown-15m-1763266500) | $1 | ❌ | DOWN | $-1 | $221 | L1 |
| 19 | 04:30 | [btc-updown-15m-1763267400](https://polymarket.com/event/btc-updown-15m-1763267400) | $2 | ❌ | DOWN | $-2 | $219 | L2 |
| 20 | 04:45 | [btc-updown-15m-1763268300](https://polymarket.com/event/btc-updown-15m-1763268300) | $4 | ✅ | UP | +$4 | $223 | - |
| 21 | 05:00 | [btc-updown-15m-1763269200](https://polymarket.com/event/btc-updown-15m-1763269200) | $1 | ✅ | UP | +$1 | $224 | - |
| 22 | 05:15 | [btc-updown-15m-1763270100](https://polymarket.com/event/btc-updown-15m-1763270100) | $1 | ❌ | DOWN | $-1 | $223 | L1 |
| 23 | 05:30 | [btc-updown-15m-1763271000](https://polymarket.com/event/btc-updown-15m-1763271000) | $2 | ❌ | DOWN | $-2 | $221 | L2 |
| 24 | 05:45 | [btc-updown-15m-1763271900](https://polymarket.com/event/btc-updown-15m-1763271900) | $4 | ❌ | DOWN | $-4 | $217 | L3 |
| 25 | 06:00 | [btc-updown-15m-1763272800](https://polymarket.com/event/btc-updown-15m-1763272800) | $8 | ✅ | UP | +$8 | $225 | - |
| 26 | 06:15 | [btc-updown-15m-1763273700](https://polymarket.com/event/btc-updown-15m-1763273700) | $1 | ✅ | UP | +$1 | $226 | - |
| 27 | 06:30 | [btc-updown-15m-1763274600](https://polymarket.com/event/btc-updown-15m-1763274600) | $1 | ❌ | DOWN | $-1 | $225 | L1 |
| 28 | 06:45 | [btc-updown-15m-1763275500](https://polymarket.com/event/btc-updown-15m-1763275500) | $2 | ❌ | DOWN | $-2 | $223 | L2 |
| 29 | 07:00 | [btc-updown-15m-1763276400](https://polymarket.com/event/btc-updown-15m-1763276400) | $4 | ✅ | UP | +$4 | $227 | - |
| 30 | 07:15 | [btc-updown-15m-1763277300](https://polymarket.com/event/btc-updown-15m-1763277300) | $1 | ❌ | DOWN | $-1 | $226 | L1 |
| 31 | 07:30 | [btc-updown-15m-1763278200](https://polymarket.com/event/btc-updown-15m-1763278200) | $2 | ✅ | UP | +$2 | $228 | - |
| 32 | 07:45 | [btc-updown-15m-1763279100](https://polymarket.com/event/btc-updown-15m-1763279100) | $1 | ✅ | UP | +$1 | $229 | - |
| 33 | 08:00 | [btc-updown-15m-1763280000](https://polymarket.com/event/btc-updown-15m-1763280000) | $1 | ❌ | DOWN | $-1 | $228 | L1 |
| 34 | 08:15 | [btc-updown-15m-1763280900](https://polymarket.com/event/btc-updown-15m-1763280900) | $2 | ❌ | DOWN | $-2 | $226 | L2 |
| 35 | 08:30 | [btc-updown-15m-1763281800](https://polymarket.com/event/btc-updown-15m-1763281800) | $4 | ✅ | UP | +$4 | $230 | - |
| 36 | 08:45 | [btc-updown-15m-1763282700](https://polymarket.com/event/btc-updown-15m-1763282700) | $1 | ✅ | UP | +$1 | $231 | - |
| 37 | 09:00 | [btc-updown-15m-1763283600](https://polymarket.com/event/btc-updown-15m-1763283600) | $1 | ❌ | DOWN | $-1 | $230 | L1 |
| 38 | 09:15 | [btc-updown-15m-1763284500](https://polymarket.com/event/btc-updown-15m-1763284500) | $2 | ✅ | UP | +$2 | $232 | - |
| 39 | 09:30 | [btc-updown-15m-1763285400](https://polymarket.com/event/btc-updown-15m-1763285400) | $1 | ✅ | UP | +$1 | $233 | - |
| 40 | 09:45 | [btc-updown-15m-1763286300](https://polymarket.com/event/btc-updown-15m-1763286300) | $1 | ✅ | UP | +$1 | $234 | - |
| 41 | 10:00 | [btc-updown-15m-1763287200](https://polymarket.com/event/btc-updown-15m-1763287200) | $1 | ❌ | DOWN | $-1 | $233 | L1 |
| 42 | 10:15 | [btc-updown-15m-1763288100](https://polymarket.com/event/btc-updown-15m-1763288100) | $2 | ❌ | DOWN | $-2 | $231 | L2 |
| 43 | 10:30 | [btc-updown-15m-1763289000](https://polymarket.com/event/btc-updown-15m-1763289000) | $4 | ❌ | DOWN | $-4 | $227 | L3 |
| 44 | 10:45 | [btc-updown-15m-1763289900](https://polymarket.com/event/btc-updown-15m-1763289900) | $8 | ✅ | UP | +$8 | $235 | - |
| 45 | 11:00 | [btc-updown-15m-1763290800](https://polymarket.com/event/btc-updown-15m-1763290800) | $1 | ❌ | DOWN | $-1 | $234 | L1 |
| 46 | 11:15 | [btc-updown-15m-1763291700](https://polymarket.com/event/btc-updown-15m-1763291700) | $2 | ❌ | DOWN | $-2 | $232 | L2 |
| 47 | 11:30 | [btc-updown-15m-1763292600](https://polymarket.com/event/btc-updown-15m-1763292600) | $4 | ❌ | DOWN | $-4 | $228 | L3 |
| 48 | 11:45 | [btc-updown-15m-1763293500](https://polymarket.com/event/btc-updown-15m-1763293500) | $8 | ✅ | UP | +$8 | $236 | - |
| 49 | 12:00 | [btc-updown-15m-1763294400](https://polymarket.com/event/btc-updown-15m-1763294400) | $1 | ✅ | UP | +$1 | $237 | - |
| 50 | 12:15 | [btc-updown-15m-1763295300](https://polymarket.com/event/btc-updown-15m-1763295300) | $1 | ✅ | UP | +$1 | $238 | - |
| 51 | 12:30 | [btc-updown-15m-1763296200](https://polymarket.com/event/btc-updown-15m-1763296200) | $1 | ✅ | UP | +$1 | $239 | - |
| 52 | 12:45 | [btc-updown-15m-1763297100](https://polymarket.com/event/btc-updown-15m-1763297100) | $1 | ❌ | DOWN | $-1 | $238 | L1 |
| 53 | 13:00 | [btc-updown-15m-1763298000](https://polymarket.com/event/btc-updown-15m-1763298000) | $2 | ✅ | UP | +$2 | $240 | - |
| 54 | 13:15 | [btc-updown-15m-1763298900](https://polymarket.com/event/btc-updown-15m-1763298900) | $1 | ❌ | DOWN | $-1 | $239 | L1 |
| 55 | 13:30 | [btc-updown-15m-1763299800](https://polymarket.com/event/btc-updown-15m-1763299800) | $2 | ❌ | DOWN | $-2 | $237 | L2 |
| 56 | 13:45 | [btc-updown-15m-1763300700](https://polymarket.com/event/btc-updown-15m-1763300700) | $4 | ✅ | UP | +$4 | $241 | - |
| 57 | 14:00 | [btc-updown-15m-1763301600](https://polymarket.com/event/btc-updown-15m-1763301600) | $1 | ✅ | UP | +$1 | $242 | - |
| 58 | 14:15 | [btc-updown-15m-1763302500](https://polymarket.com/event/btc-updown-15m-1763302500) | $1 | ❌ | DOWN | $-1 | $241 | L1 |
| 59 | 14:30 | [btc-updown-15m-1763303400](https://polymarket.com/event/btc-updown-15m-1763303400) | $2 | ✅ | UP | +$2 | $243 | - |
| 60 | 14:45 | [btc-updown-15m-1763304300](https://polymarket.com/event/btc-updown-15m-1763304300) | $1 | ❌ | DOWN | $-1 | $242 | L1 |
| 61 | 15:00 | [btc-updown-15m-1763305200](https://polymarket.com/event/btc-updown-15m-1763305200) | $2 | ❌ | DOWN | $-2 | $240 | L2 |
| 62 | 15:15 | [btc-updown-15m-1763306100](https://polymarket.com/event/btc-updown-15m-1763306100) | $4 | ❌ | DOWN | $-4 | $236 | L3 |
| 63 | 15:30 | [btc-updown-15m-1763307000](https://polymarket.com/event/btc-updown-15m-1763307000) | $8 | ❌ | DOWN | $-8 | $228 | L4 |
| 64 | 15:45 | [btc-updown-15m-1763307900](https://polymarket.com/event/btc-updown-15m-1763307900) | $16 | ❌ | DOWN | $-16 | $212 | L5 |
| - | 16:00 | [btc-updown-15m-1763308800](https://polymarket.com/event/btc-updown-15m-1763308800) | - | ⏭️ SKIP | DOWN | - | $212 | - |
| - | 16:15 | [btc-updown-15m-1763309700](https://polymarket.com/event/btc-updown-15m-1763309700) | - | ⏭️ SKIP | DOWN | - | $212 | - |
| - | 16:30 | [btc-updown-15m-1763310600](https://polymarket.com/event/btc-updown-15m-1763310600) | - | ⏭️ SKIP | UP | - | $212 | - |
| 65 | 16:45 | [btc-updown-15m-1763311500](https://polymarket.com/event/btc-updown-15m-1763311500) | $32 | ❌ | DOWN | $-32 | $180 | L6 |
| - | 17:00 | [btc-updown-15m-1763312400](https://polymarket.com/event/btc-updown-15m-1763312400) | - | ⏭️ SKIP | UP | - | $180 | - |
| - | 17:15 | [btc-updown-15m-1763313300](https://polymarket.com/event/btc-updown-15m-1763313300) | - | ⏭️ SKIP | UP | - | $180 | - |
| - | 17:30 | [btc-updown-15m-1763314200](https://polymarket.com/event/btc-updown-15m-1763314200) | - | ⏭️ SKIP | DOWN | - | $180 | - |
| 66 | 17:45 | [btc-updown-15m-1763315100](https://polymarket.com/event/btc-updown-15m-1763315100) | $64 | ✅ | UP | +$64 | $244 | - |
| 67 | 18:00 | [btc-updown-15m-1763316000](https://polymarket.com/event/btc-updown-15m-1763316000) | $1 | ✅ | UP | +$1 | $245 | - |
| 68 | 18:15 | [btc-updown-15m-1763316900](https://polymarket.com/event/btc-updown-15m-1763316900) | $1 | ❌ | DOWN | $-1 | $244 | L1 |
| 69 | 18:30 | [btc-updown-15m-1763317800](https://polymarket.com/event/btc-updown-15m-1763317800) | $2 | ❌ | DOWN | $-2 | $242 | L2 |
| 70 | 18:45 | [btc-updown-15m-1763318700](https://polymarket.com/event/btc-updown-15m-1763318700) | $4 | ❌ | DOWN | $-4 | $238 | L3 |
| 71 | 19:00 | [btc-updown-15m-1763319600](https://polymarket.com/event/btc-updown-15m-1763319600) | $8 | ✅ | UP | +$8 | $246 | - |
| 72 | 19:15 | [btc-updown-15m-1763320500](https://polymarket.com/event/btc-updown-15m-1763320500) | $1 | ❌ | DOWN | $-1 | $245 | L1 |
| 73 | 19:30 | [btc-updown-15m-1763321400](https://polymarket.com/event/btc-updown-15m-1763321400) | $2 | ❌ | DOWN | $-2 | $243 | L2 |
| 74 | 19:45 | [btc-updown-15m-1763322300](https://polymarket.com/event/btc-updown-15m-1763322300) | $4 | ❌ | DOWN | $-4 | $239 | L3 |
| 75 | 20:00 | [btc-updown-15m-1763323200](https://polymarket.com/event/btc-updown-15m-1763323200) | $8 | ✅ | UP | +$8 | $247 | - |
| 76 | 20:15 | [btc-updown-15m-1763324100](https://polymarket.com/event/btc-updown-15m-1763324100) | $1 | ✅ | UP | +$1 | $248 | - |
| 77 | 20:30 | [btc-updown-15m-1763325000](https://polymarket.com/event/btc-updown-15m-1763325000) | $1 | ❌ | DOWN | $-1 | $247 | L1 |
| 78 | 20:45 | [btc-updown-15m-1763325900](https://polymarket.com/event/btc-updown-15m-1763325900) | $2 | ❌ | DOWN | $-2 | $245 | L2 |
| 79 | 21:00 | [btc-updown-15m-1763326800](https://polymarket.com/event/btc-updown-15m-1763326800) | $4 | ❌ | DOWN | $-4 | $241 | L3 |
| 80 | 21:15 | [btc-updown-15m-1763327700](https://polymarket.com/event/btc-updown-15m-1763327700) | $8 | ❌ | DOWN | $-8 | $233 | L4 |
| 81 | 21:30 | [btc-updown-15m-1763328600](https://polymarket.com/event/btc-updown-15m-1763328600) | $16 | ❌ | DOWN | $-16 | $217 | L5 |
| - | 21:45 | [btc-updown-15m-1763329500](https://polymarket.com/event/btc-updown-15m-1763329500) | - | ⏭️ SKIP | DOWN | - | $217 | - |
| - | 22:00 | [btc-updown-15m-1763330400](https://polymarket.com/event/btc-updown-15m-1763330400) | - | ⏭️ SKIP | DOWN | - | $217 | - |
| - | 22:15 | [btc-updown-15m-1763331300](https://polymarket.com/event/btc-updown-15m-1763331300) | - | ⏭️ SKIP | UP | - | $217 | - |
| 82 | 22:30 | [btc-updown-15m-1763332200](https://polymarket.com/event/btc-updown-15m-1763332200) | $32 | ❌ | DOWN | $-32 | $185 | L6 |
| - | 22:45 | [btc-updown-15m-1763333100](https://polymarket.com/event/btc-updown-15m-1763333100) | - | ⏭️ SKIP | UP | - | $185 | - |
| - | 23:00 | [btc-updown-15m-1763334000](https://polymarket.com/event/btc-updown-15m-1763334000) | - | ⏭️ SKIP | DOWN | - | $185 | - |
| - | 23:15 | [btc-updown-15m-1763334900](https://polymarket.com/event/btc-updown-15m-1763334900) | - | ⏭️ SKIP | UP | - | $185 | - |
| 83 | 23:30 | [btc-updown-15m-1763335800](https://polymarket.com/event/btc-updown-15m-1763335800) | $64 | ✅ | UP | +$64 | $249 | - |
| 84 | 23:45 | [btc-updown-15m-1763336700](https://polymarket.com/event/btc-updown-15m-1763336700) | $1 | ❌ | DOWN | $-1 | $248 | L1 |

### 2025-11-17
**Summary:** 93 trades | 43 wins | 50 losses | Max Bet: $32 | Profit: +$44

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 19:45 | 5 | $31 | $32 | 20:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763337600](https://polymarket.com/event/btc-updown-15m-1763337600) | $2 | ❌ | DOWN | $-2 | $246 | L2 |
| 2 | 00:15 | [btc-updown-15m-1763338500](https://polymarket.com/event/btc-updown-15m-1763338500) | $4 | ✅ | UP | +$4 | $250 | - |
| 3 | 00:30 | [btc-updown-15m-1763339400](https://polymarket.com/event/btc-updown-15m-1763339400) | $1 | ❌ | DOWN | $-1 | $249 | L1 |
| 4 | 00:45 | [btc-updown-15m-1763340300](https://polymarket.com/event/btc-updown-15m-1763340300) | $2 | ✅ | UP | +$2 | $251 | - |
| 5 | 01:00 | [btc-updown-15m-1763341200](https://polymarket.com/event/btc-updown-15m-1763341200) | $1 | ❌ | DOWN | $-1 | $250 | L1 |
| 6 | 01:15 | [btc-updown-15m-1763342100](https://polymarket.com/event/btc-updown-15m-1763342100) | $2 | ✅ | UP | +$2 | $252 | - |
| 7 | 01:30 | [btc-updown-15m-1763343000](https://polymarket.com/event/btc-updown-15m-1763343000) | $1 | ❌ | DOWN | $-1 | $251 | L1 |
| 8 | 01:45 | [btc-updown-15m-1763343900](https://polymarket.com/event/btc-updown-15m-1763343900) | $2 | ❌ | DOWN | $-2 | $249 | L2 |
| 9 | 02:00 | [btc-updown-15m-1763344800](https://polymarket.com/event/btc-updown-15m-1763344800) | $4 | ✅ | UP | +$4 | $253 | - |
| 10 | 02:15 | [btc-updown-15m-1763345700](https://polymarket.com/event/btc-updown-15m-1763345700) | $1 | ❌ | DOWN | $-1 | $252 | L1 |
| 11 | 02:30 | [btc-updown-15m-1763346600](https://polymarket.com/event/btc-updown-15m-1763346600) | $2 | ❌ | DOWN | $-2 | $250 | L2 |
| 12 | 02:45 | [btc-updown-15m-1763347500](https://polymarket.com/event/btc-updown-15m-1763347500) | $4 | ✅ | UP | +$4 | $254 | - |
| 13 | 03:00 | [btc-updown-15m-1763348400](https://polymarket.com/event/btc-updown-15m-1763348400) | $1 | ✅ | UP | +$1 | $255 | - |
| 14 | 03:15 | [btc-updown-15m-1763349300](https://polymarket.com/event/btc-updown-15m-1763349300) | $1 | ✅ | UP | +$1 | $256 | - |
| 15 | 03:30 | [btc-updown-15m-1763350200](https://polymarket.com/event/btc-updown-15m-1763350200) | $1 | ❌ | DOWN | $-1 | $255 | L1 |
| 16 | 03:45 | [btc-updown-15m-1763351100](https://polymarket.com/event/btc-updown-15m-1763351100) | $2 | ✅ | UP | +$2 | $257 | - |
| 17 | 04:00 | [btc-updown-15m-1763352000](https://polymarket.com/event/btc-updown-15m-1763352000) | $1 | ❌ | DOWN | $-1 | $256 | L1 |
| 18 | 04:15 | [btc-updown-15m-1763352900](https://polymarket.com/event/btc-updown-15m-1763352900) | $2 | ✅ | UP | +$2 | $258 | - |
| 19 | 04:30 | [btc-updown-15m-1763353800](https://polymarket.com/event/btc-updown-15m-1763353800) | $1 | ❌ | DOWN | $-1 | $257 | L1 |
| 20 | 04:45 | [btc-updown-15m-1763354700](https://polymarket.com/event/btc-updown-15m-1763354700) | $2 | ❌ | DOWN | $-2 | $255 | L2 |
| 21 | 05:00 | [btc-updown-15m-1763355600](https://polymarket.com/event/btc-updown-15m-1763355600) | $4 | ❌ | DOWN | $-4 | $251 | L3 |
| 22 | 05:15 | [btc-updown-15m-1763356500](https://polymarket.com/event/btc-updown-15m-1763356500) | $8 | ✅ | UP | +$8 | $259 | - |
| 23 | 05:30 | [btc-updown-15m-1763357400](https://polymarket.com/event/btc-updown-15m-1763357400) | $1 | ❌ | DOWN | $-1 | $258 | L1 |
| 24 | 05:45 | [btc-updown-15m-1763358300](https://polymarket.com/event/btc-updown-15m-1763358300) | $2 | ❌ | DOWN | $-2 | $256 | L2 |
| 25 | 06:00 | [btc-updown-15m-1763359200](https://polymarket.com/event/btc-updown-15m-1763359200) | $4 | ❌ | DOWN | $-4 | $252 | L3 |
| 26 | 06:15 | [btc-updown-15m-1763360100](https://polymarket.com/event/btc-updown-15m-1763360100) | $8 | ✅ | UP | +$8 | $260 | - |
| 27 | 06:30 | [btc-updown-15m-1763361000](https://polymarket.com/event/btc-updown-15m-1763361000) | $1 | ❌ | DOWN | $-1 | $259 | L1 |
| 28 | 06:45 | [btc-updown-15m-1763361900](https://polymarket.com/event/btc-updown-15m-1763361900) | $2 | ✅ | UP | +$2 | $261 | - |
| 29 | 07:00 | [btc-updown-15m-1763362800](https://polymarket.com/event/btc-updown-15m-1763362800) | $1 | ✅ | UP | +$1 | $262 | - |
| 30 | 07:15 | [btc-updown-15m-1763363700](https://polymarket.com/event/btc-updown-15m-1763363700) | $1 | ✅ | UP | +$1 | $263 | - |
| 31 | 07:30 | [btc-updown-15m-1763364600](https://polymarket.com/event/btc-updown-15m-1763364600) | $1 | ✅ | UP | +$1 | $264 | - |
| 32 | 07:45 | [btc-updown-15m-1763365500](https://polymarket.com/event/btc-updown-15m-1763365500) | $1 | ❌ | DOWN | $-1 | $263 | L1 |
| 33 | 08:00 | [btc-updown-15m-1763366400](https://polymarket.com/event/btc-updown-15m-1763366400) | $2 | ✅ | UP | +$2 | $265 | - |
| 34 | 08:15 | [btc-updown-15m-1763367300](https://polymarket.com/event/btc-updown-15m-1763367300) | $1 | ✅ | UP | +$1 | $266 | - |
| 35 | 08:30 | [btc-updown-15m-1763368200](https://polymarket.com/event/btc-updown-15m-1763368200) | $1 | ❌ | DOWN | $-1 | $265 | L1 |
| 36 | 08:45 | [btc-updown-15m-1763369100](https://polymarket.com/event/btc-updown-15m-1763369100) | $2 | ❌ | DOWN | $-2 | $263 | L2 |
| 37 | 09:00 | [btc-updown-15m-1763370000](https://polymarket.com/event/btc-updown-15m-1763370000) | $4 | ❌ | DOWN | $-4 | $259 | L3 |
| 38 | 09:15 | [btc-updown-15m-1763370900](https://polymarket.com/event/btc-updown-15m-1763370900) | $8 | ✅ | UP | +$8 | $267 | - |
| 39 | 09:30 | [btc-updown-15m-1763371800](https://polymarket.com/event/btc-updown-15m-1763371800) | $1 | ✅ | UP | +$1 | $268 | - |
| 40 | 09:45 | [btc-updown-15m-1763372700](https://polymarket.com/event/btc-updown-15m-1763372700) | $1 | ❌ | DOWN | $-1 | $267 | L1 |
| 41 | 10:00 | [btc-updown-15m-1763373600](https://polymarket.com/event/btc-updown-15m-1763373600) | $2 | ✅ | UP | +$2 | $269 | - |
| 42 | 10:15 | [btc-updown-15m-1763374500](https://polymarket.com/event/btc-updown-15m-1763374500) | $1 | ❌ | DOWN | $-1 | $268 | L1 |
| 43 | 10:30 | [btc-updown-15m-1763375400](https://polymarket.com/event/btc-updown-15m-1763375400) | $2 | ✅ | UP | +$2 | $270 | - |
| 44 | 10:45 | [btc-updown-15m-1763376300](https://polymarket.com/event/btc-updown-15m-1763376300) | $1 | ❌ | DOWN | $-1 | $269 | L1 |
| 45 | 11:00 | [btc-updown-15m-1763377200](https://polymarket.com/event/btc-updown-15m-1763377200) | $2 | ✅ | UP | +$2 | $271 | - |
| 46 | 11:15 | [btc-updown-15m-1763378100](https://polymarket.com/event/btc-updown-15m-1763378100) | $1 | ❌ | DOWN | $-1 | $270 | L1 |
| 47 | 11:30 | [btc-updown-15m-1763379000](https://polymarket.com/event/btc-updown-15m-1763379000) | $2 | ❌ | DOWN | $-2 | $268 | L2 |
| 48 | 11:45 | [btc-updown-15m-1763379900](https://polymarket.com/event/btc-updown-15m-1763379900) | $4 | ❌ | DOWN | $-4 | $264 | L3 |
| 49 | 12:00 | [btc-updown-15m-1763380800](https://polymarket.com/event/btc-updown-15m-1763380800) | $8 | ❌ | DOWN | $-8 | $256 | L4 |
| 50 | 12:15 | [btc-updown-15m-1763381700](https://polymarket.com/event/btc-updown-15m-1763381700) | $16 | ✅ | UP | +$16 | $272 | - |
| 51 | 12:30 | [btc-updown-15m-1763382600](https://polymarket.com/event/btc-updown-15m-1763382600) | $1 | ✅ | UP | +$1 | $273 | - |
| 52 | 12:45 | [btc-updown-15m-1763383500](https://polymarket.com/event/btc-updown-15m-1763383500) | $1 | ❌ | DOWN | $-1 | $272 | L1 |
| 53 | 13:00 | [btc-updown-15m-1763384400](https://polymarket.com/event/btc-updown-15m-1763384400) | $2 | ❌ | DOWN | $-2 | $270 | L2 |
| 54 | 13:15 | [btc-updown-15m-1763385300](https://polymarket.com/event/btc-updown-15m-1763385300) | $4 | ❌ | DOWN | $-4 | $266 | L3 |
| 55 | 13:30 | [btc-updown-15m-1763386200](https://polymarket.com/event/btc-updown-15m-1763386200) | $8 | ❌ | DOWN | $-8 | $258 | L4 |
| 56 | 13:45 | [btc-updown-15m-1763387100](https://polymarket.com/event/btc-updown-15m-1763387100) | $16 | ✅ | UP | +$16 | $274 | - |
| 57 | 14:00 | [btc-updown-15m-1763388000](https://polymarket.com/event/btc-updown-15m-1763388000) | $1 | ✅ | UP | +$1 | $275 | - |
| 58 | 14:15 | [btc-updown-15m-1763388900](https://polymarket.com/event/btc-updown-15m-1763388900) | $1 | ✅ | UP | +$1 | $276 | - |
| 59 | 14:30 | [btc-updown-15m-1763389800](https://polymarket.com/event/btc-updown-15m-1763389800) | $1 | ✅ | UP | +$1 | $277 | - |
| 60 | 14:45 | [btc-updown-15m-1763390700](https://polymarket.com/event/btc-updown-15m-1763390700) | $1 | ❌ | DOWN | $-1 | $276 | L1 |
| 61 | 15:00 | [btc-updown-15m-1763391600](https://polymarket.com/event/btc-updown-15m-1763391600) | $2 | ❌ | DOWN | $-2 | $274 | L2 |
| 62 | 15:15 | [btc-updown-15m-1763392500](https://polymarket.com/event/btc-updown-15m-1763392500) | $4 | ✅ | UP | +$4 | $278 | - |
| 63 | 15:30 | [btc-updown-15m-1763393400](https://polymarket.com/event/btc-updown-15m-1763393400) | $1 | ❌ | DOWN | $-1 | $277 | L1 |
| 64 | 15:45 | [btc-updown-15m-1763394300](https://polymarket.com/event/btc-updown-15m-1763394300) | $2 | ❌ | DOWN | $-2 | $275 | L2 |
| 65 | 16:00 | [btc-updown-15m-1763395200](https://polymarket.com/event/btc-updown-15m-1763395200) | $4 | ❌ | DOWN | $-4 | $271 | L3 |
| 66 | 16:15 | [btc-updown-15m-1763396100](https://polymarket.com/event/btc-updown-15m-1763396100) | $8 | ✅ | UP | +$8 | $279 | - |
| 67 | 16:30 | [btc-updown-15m-1763397000](https://polymarket.com/event/btc-updown-15m-1763397000) | $1 | ✅ | UP | +$1 | $280 | - |
| 68 | 16:45 | [btc-updown-15m-1763397900](https://polymarket.com/event/btc-updown-15m-1763397900) | $1 | ✅ | UP | +$1 | $281 | - |
| 69 | 17:00 | [btc-updown-15m-1763398800](https://polymarket.com/event/btc-updown-15m-1763398800) | $1 | ❌ | DOWN | $-1 | $280 | L1 |
| 70 | 17:15 | [btc-updown-15m-1763399700](https://polymarket.com/event/btc-updown-15m-1763399700) | $2 | ❌ | DOWN | $-2 | $278 | L2 |
| 71 | 17:30 | [btc-updown-15m-1763400600](https://polymarket.com/event/btc-updown-15m-1763400600) | $4 | ❌ | DOWN | $-4 | $274 | L3 |
| 72 | 17:45 | [btc-updown-15m-1763401500](https://polymarket.com/event/btc-updown-15m-1763401500) | $8 | ❌ | DOWN | $-8 | $266 | L4 |
| 73 | 18:00 | [btc-updown-15m-1763402400](https://polymarket.com/event/btc-updown-15m-1763402400) | $16 | ✅ | UP | +$16 | $282 | - |
| 74 | 18:15 | [btc-updown-15m-1763403300](https://polymarket.com/event/btc-updown-15m-1763403300) | $1 | ❌ | DOWN | $-1 | $281 | L1 |
| 75 | 18:30 | [btc-updown-15m-1763404200](https://polymarket.com/event/btc-updown-15m-1763404200) | $2 | ✅ | UP | +$2 | $283 | - |
| 76 | 18:45 | [btc-updown-15m-1763405100](https://polymarket.com/event/btc-updown-15m-1763405100) | $1 | ❌ | DOWN | $-1 | $282 | L1 |
| 77 | 19:00 | [btc-updown-15m-1763406000](https://polymarket.com/event/btc-updown-15m-1763406000) | $2 | ❌ | DOWN | $-2 | $280 | L2 |
| 78 | 19:15 | [btc-updown-15m-1763406900](https://polymarket.com/event/btc-updown-15m-1763406900) | $4 | ❌ | DOWN | $-4 | $276 | L3 |
| 79 | 19:30 | [btc-updown-15m-1763407800](https://polymarket.com/event/btc-updown-15m-1763407800) | $8 | ❌ | DOWN | $-8 | $268 | L4 |
| 80 | 19:45 | [btc-updown-15m-1763408700](https://polymarket.com/event/btc-updown-15m-1763408700) | $16 | ❌ | DOWN | $-16 | $252 | L5 |
| - | 20:00 | [btc-updown-15m-1763409600](https://polymarket.com/event/btc-updown-15m-1763409600) | - | ⏭️ SKIP | DOWN | - | $252 | - |
| - | 20:15 | [btc-updown-15m-1763410500](https://polymarket.com/event/btc-updown-15m-1763410500) | - | ⏭️ SKIP | UP | - | $252 | - |
| - | 20:30 | [btc-updown-15m-1763411400](https://polymarket.com/event/btc-updown-15m-1763411400) | - | ⏭️ SKIP | DOWN | - | $252 | - |
| 81 | 20:45 | [btc-updown-15m-1763412300](https://polymarket.com/event/btc-updown-15m-1763412300) | $32 | ✅ | UP | +$32 | $284 | - |
| 82 | 21:00 | [btc-updown-15m-1763413200](https://polymarket.com/event/btc-updown-15m-1763413200) | $1 | ✅ | UP | +$1 | $285 | - |
| 83 | 21:15 | [btc-updown-15m-1763414100](https://polymarket.com/event/btc-updown-15m-1763414100) | $1 | ❌ | DOWN | $-1 | $284 | L1 |
| 84 | 21:30 | [btc-updown-15m-1763415000](https://polymarket.com/event/btc-updown-15m-1763415000) | $2 | ✅ | UP | +$2 | $286 | - |
| 85 | 21:45 | [btc-updown-15m-1763415900](https://polymarket.com/event/btc-updown-15m-1763415900) | $1 | ✅ | UP | +$1 | $287 | - |
| 86 | 22:00 | [btc-updown-15m-1763416800](https://polymarket.com/event/btc-updown-15m-1763416800) | $1 | ✅ | UP | +$1 | $288 | - |
| 87 | 22:15 | [btc-updown-15m-1763417700](https://polymarket.com/event/btc-updown-15m-1763417700) | $1 | ✅ | UP | +$1 | $289 | - |
| 88 | 22:30 | [btc-updown-15m-1763418600](https://polymarket.com/event/btc-updown-15m-1763418600) | $1 | ✅ | UP | +$1 | $290 | - |
| 89 | 22:45 | [btc-updown-15m-1763419500](https://polymarket.com/event/btc-updown-15m-1763419500) | $1 | ❌ | DOWN | $-1 | $289 | L1 |
| 90 | 23:00 | [btc-updown-15m-1763420400](https://polymarket.com/event/btc-updown-15m-1763420400) | $2 | ❌ | DOWN | $-2 | $287 | L2 |
| 91 | 23:15 | [btc-updown-15m-1763421300](https://polymarket.com/event/btc-updown-15m-1763421300) | $4 | ❌ | DOWN | $-4 | $283 | L3 |
| 92 | 23:30 | [btc-updown-15m-1763422200](https://polymarket.com/event/btc-updown-15m-1763422200) | $8 | ✅ | UP | +$8 | $291 | - |
| 93 | 23:45 | [btc-updown-15m-1763423100](https://polymarket.com/event/btc-updown-15m-1763423100) | $1 | ✅ | UP | +$1 | $292 | - |

### 2025-11-18
**Summary:** 96 trades | 46 wins | 50 losses | Max Bet: $16 | Profit: +$46

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763424000](https://polymarket.com/event/btc-updown-15m-1763424000) | $1 | ✅ | UP | +$1 | $293 | - |
| 2 | 00:15 | [btc-updown-15m-1763424900](https://polymarket.com/event/btc-updown-15m-1763424900) | $1 | ❌ | DOWN | $-1 | $292 | L1 |
| 3 | 00:30 | [btc-updown-15m-1763425800](https://polymarket.com/event/btc-updown-15m-1763425800) | $2 | ❌ | DOWN | $-2 | $290 | L2 |
| 4 | 00:45 | [btc-updown-15m-1763426700](https://polymarket.com/event/btc-updown-15m-1763426700) | $4 | ✅ | UP | +$4 | $294 | - |
| 5 | 01:00 | [btc-updown-15m-1763427600](https://polymarket.com/event/btc-updown-15m-1763427600) | $1 | ❌ | DOWN | $-1 | $293 | L1 |
| 6 | 01:15 | [btc-updown-15m-1763428500](https://polymarket.com/event/btc-updown-15m-1763428500) | $2 | ❌ | DOWN | $-2 | $291 | L2 |
| 7 | 01:30 | [btc-updown-15m-1763429400](https://polymarket.com/event/btc-updown-15m-1763429400) | $4 | ✅ | UP | +$4 | $295 | - |
| 8 | 01:45 | [btc-updown-15m-1763430300](https://polymarket.com/event/btc-updown-15m-1763430300) | $1 | ❌ | DOWN | $-1 | $294 | L1 |
| 9 | 02:00 | [btc-updown-15m-1763431200](https://polymarket.com/event/btc-updown-15m-1763431200) | $2 | ❌ | DOWN | $-2 | $292 | L2 |
| 10 | 02:15 | [btc-updown-15m-1763432100](https://polymarket.com/event/btc-updown-15m-1763432100) | $4 | ✅ | UP | +$4 | $296 | - |
| 11 | 02:30 | [btc-updown-15m-1763433000](https://polymarket.com/event/btc-updown-15m-1763433000) | $1 | ❌ | DOWN | $-1 | $295 | L1 |
| 12 | 02:45 | [btc-updown-15m-1763433900](https://polymarket.com/event/btc-updown-15m-1763433900) | $2 | ❌ | DOWN | $-2 | $293 | L2 |
| 13 | 03:00 | [btc-updown-15m-1763434800](https://polymarket.com/event/btc-updown-15m-1763434800) | $4 | ❌ | DOWN | $-4 | $289 | L3 |
| 14 | 03:15 | [btc-updown-15m-1763435700](https://polymarket.com/event/btc-updown-15m-1763435700) | $8 | ❌ | DOWN | $-8 | $281 | L4 |
| 15 | 03:30 | [btc-updown-15m-1763436600](https://polymarket.com/event/btc-updown-15m-1763436600) | $16 | ✅ | UP | +$16 | $297 | - |
| 16 | 03:45 | [btc-updown-15m-1763437500](https://polymarket.com/event/btc-updown-15m-1763437500) | $1 | ✅ | UP | +$1 | $298 | - |
| 17 | 04:00 | [btc-updown-15m-1763438400](https://polymarket.com/event/btc-updown-15m-1763438400) | $1 | ❌ | DOWN | $-1 | $297 | L1 |
| 18 | 04:15 | [btc-updown-15m-1763439300](https://polymarket.com/event/btc-updown-15m-1763439300) | $2 | ❌ | DOWN | $-2 | $295 | L2 |
| 19 | 04:30 | [btc-updown-15m-1763440200](https://polymarket.com/event/btc-updown-15m-1763440200) | $4 | ❌ | DOWN | $-4 | $291 | L3 |
| 20 | 04:45 | [btc-updown-15m-1763441100](https://polymarket.com/event/btc-updown-15m-1763441100) | $8 | ✅ | UP | +$8 | $299 | - |
| 21 | 05:00 | [btc-updown-15m-1763442000](https://polymarket.com/event/btc-updown-15m-1763442000) | $1 | ✅ | UP | +$1 | $300 | - |
| 22 | 05:15 | [btc-updown-15m-1763442900](https://polymarket.com/event/btc-updown-15m-1763442900) | $1 | ❌ | DOWN | $-1 | $299 | L1 |
| 23 | 05:30 | [btc-updown-15m-1763443800](https://polymarket.com/event/btc-updown-15m-1763443800) | $2 | ❌ | DOWN | $-2 | $297 | L2 |
| 24 | 05:45 | [btc-updown-15m-1763444700](https://polymarket.com/event/btc-updown-15m-1763444700) | $4 | ✅ | UP | +$4 | $301 | - |
| 25 | 06:00 | [btc-updown-15m-1763445600](https://polymarket.com/event/btc-updown-15m-1763445600) | $1 | ❌ | DOWN | $-1 | $300 | L1 |
| 26 | 06:15 | [btc-updown-15m-1763446500](https://polymarket.com/event/btc-updown-15m-1763446500) | $2 | ❌ | DOWN | $-2 | $298 | L2 |
| 27 | 06:30 | [btc-updown-15m-1763447400](https://polymarket.com/event/btc-updown-15m-1763447400) | $4 | ❌ | DOWN | $-4 | $294 | L3 |
| 28 | 06:45 | [btc-updown-15m-1763448300](https://polymarket.com/event/btc-updown-15m-1763448300) | $8 | ✅ | UP | +$8 | $302 | - |
| 29 | 07:00 | [btc-updown-15m-1763449200](https://polymarket.com/event/btc-updown-15m-1763449200) | $1 | ✅ | UP | +$1 | $303 | - |
| 30 | 07:15 | [btc-updown-15m-1763450100](https://polymarket.com/event/btc-updown-15m-1763450100) | $1 | ✅ | UP | +$1 | $304 | - |
| 31 | 07:30 | [btc-updown-15m-1763451000](https://polymarket.com/event/btc-updown-15m-1763451000) | $1 | ✅ | UP | +$1 | $305 | - |
| 32 | 07:45 | [btc-updown-15m-1763451900](https://polymarket.com/event/btc-updown-15m-1763451900) | $1 | ✅ | UP | +$1 | $306 | - |
| 33 | 08:00 | [btc-updown-15m-1763452800](https://polymarket.com/event/btc-updown-15m-1763452800) | $1 | ✅ | UP | +$1 | $307 | - |
| 34 | 08:15 | [btc-updown-15m-1763453700](https://polymarket.com/event/btc-updown-15m-1763453700) | $1 | ✅ | UP | +$1 | $308 | - |
| 35 | 08:30 | [btc-updown-15m-1763454600](https://polymarket.com/event/btc-updown-15m-1763454600) | $1 | ✅ | UP | +$1 | $309 | - |
| 36 | 08:45 | [btc-updown-15m-1763455500](https://polymarket.com/event/btc-updown-15m-1763455500) | $1 | ❌ | DOWN | $-1 | $308 | L1 |
| 37 | 09:00 | [btc-updown-15m-1763456400](https://polymarket.com/event/btc-updown-15m-1763456400) | $2 | ❌ | DOWN | $-2 | $306 | L2 |
| 38 | 09:15 | [btc-updown-15m-1763457300](https://polymarket.com/event/btc-updown-15m-1763457300) | $4 | ❌ | DOWN | $-4 | $302 | L3 |
| 39 | 09:30 | [btc-updown-15m-1763458200](https://polymarket.com/event/btc-updown-15m-1763458200) | $8 | ✅ | UP | +$8 | $310 | - |
| 40 | 09:45 | [btc-updown-15m-1763459100](https://polymarket.com/event/btc-updown-15m-1763459100) | $1 | ✅ | UP | +$1 | $311 | - |
| 41 | 10:00 | [btc-updown-15m-1763460000](https://polymarket.com/event/btc-updown-15m-1763460000) | $1 | ❌ | DOWN | $-1 | $310 | L1 |
| 42 | 10:15 | [btc-updown-15m-1763460900](https://polymarket.com/event/btc-updown-15m-1763460900) | $2 | ❌ | DOWN | $-2 | $308 | L2 |
| 43 | 10:30 | [btc-updown-15m-1763461800](https://polymarket.com/event/btc-updown-15m-1763461800) | $4 | ✅ | UP | +$4 | $312 | - |
| 44 | 10:45 | [btc-updown-15m-1763462700](https://polymarket.com/event/btc-updown-15m-1763462700) | $1 | ✅ | UP | +$1 | $313 | - |
| 45 | 11:00 | [btc-updown-15m-1763463600](https://polymarket.com/event/btc-updown-15m-1763463600) | $1 | ❌ | DOWN | $-1 | $312 | L1 |
| 46 | 11:15 | [btc-updown-15m-1763464500](https://polymarket.com/event/btc-updown-15m-1763464500) | $2 | ✅ | UP | +$2 | $314 | - |
| 47 | 11:30 | [btc-updown-15m-1763465400](https://polymarket.com/event/btc-updown-15m-1763465400) | $1 | ✅ | UP | +$1 | $315 | - |
| 48 | 11:45 | [btc-updown-15m-1763466300](https://polymarket.com/event/btc-updown-15m-1763466300) | $1 | ❌ | DOWN | $-1 | $314 | L1 |
| 49 | 12:00 | [btc-updown-15m-1763467200](https://polymarket.com/event/btc-updown-15m-1763467200) | $2 | ❌ | DOWN | $-2 | $312 | L2 |
| 50 | 12:15 | [btc-updown-15m-1763468100](https://polymarket.com/event/btc-updown-15m-1763468100) | $4 | ✅ | UP | +$4 | $316 | - |
| 51 | 12:30 | [btc-updown-15m-1763469000](https://polymarket.com/event/btc-updown-15m-1763469000) | $1 | ✅ | UP | +$1 | $317 | - |
| 52 | 12:45 | [btc-updown-15m-1763469900](https://polymarket.com/event/btc-updown-15m-1763469900) | $1 | ❌ | DOWN | $-1 | $316 | L1 |
| 53 | 13:00 | [btc-updown-15m-1763470800](https://polymarket.com/event/btc-updown-15m-1763470800) | $2 | ❌ | DOWN | $-2 | $314 | L2 |
| 54 | 13:15 | [btc-updown-15m-1763471700](https://polymarket.com/event/btc-updown-15m-1763471700) | $4 | ❌ | DOWN | $-4 | $310 | L3 |
| 55 | 13:30 | [btc-updown-15m-1763472600](https://polymarket.com/event/btc-updown-15m-1763472600) | $8 | ❌ | DOWN | $-8 | $302 | L4 |
| 56 | 13:45 | [btc-updown-15m-1763473500](https://polymarket.com/event/btc-updown-15m-1763473500) | $16 | ✅ | UP | +$16 | $318 | - |
| 57 | 14:00 | [btc-updown-15m-1763474400](https://polymarket.com/event/btc-updown-15m-1763474400) | $1 | ❌ | DOWN | $-1 | $317 | L1 |
| 58 | 14:15 | [btc-updown-15m-1763475300](https://polymarket.com/event/btc-updown-15m-1763475300) | $2 | ✅ | UP | +$2 | $319 | - |
| 59 | 14:30 | [btc-updown-15m-1763476200](https://polymarket.com/event/btc-updown-15m-1763476200) | $1 | ❌ | DOWN | $-1 | $318 | L1 |
| 60 | 14:45 | [btc-updown-15m-1763477100](https://polymarket.com/event/btc-updown-15m-1763477100) | $2 | ❌ | DOWN | $-2 | $316 | L2 |
| 61 | 15:00 | [btc-updown-15m-1763478000](https://polymarket.com/event/btc-updown-15m-1763478000) | $4 | ✅ | UP | +$4 | $320 | - |
| 62 | 15:15 | [btc-updown-15m-1763478900](https://polymarket.com/event/btc-updown-15m-1763478900) | $1 | ✅ | UP | +$1 | $321 | - |
| 63 | 15:30 | [btc-updown-15m-1763479800](https://polymarket.com/event/btc-updown-15m-1763479800) | $1 | ❌ | DOWN | $-1 | $320 | L1 |
| 64 | 15:45 | [btc-updown-15m-1763480700](https://polymarket.com/event/btc-updown-15m-1763480700) | $2 | ✅ | UP | +$2 | $322 | - |
| 65 | 16:00 | [btc-updown-15m-1763481600](https://polymarket.com/event/btc-updown-15m-1763481600) | $1 | ✅ | UP | +$1 | $323 | - |
| 66 | 16:15 | [btc-updown-15m-1763482500](https://polymarket.com/event/btc-updown-15m-1763482500) | $1 | ✅ | UP | +$1 | $324 | - |
| 67 | 16:30 | [btc-updown-15m-1763483400](https://polymarket.com/event/btc-updown-15m-1763483400) | $1 | ❌ | DOWN | $-1 | $323 | L1 |
| 68 | 16:45 | [btc-updown-15m-1763484300](https://polymarket.com/event/btc-updown-15m-1763484300) | $2 | ✅ | UP | +$2 | $325 | - |
| 69 | 17:00 | [btc-updown-15m-1763485200](https://polymarket.com/event/btc-updown-15m-1763485200) | $1 | ❌ | DOWN | $-1 | $324 | L1 |
| 70 | 17:15 | [btc-updown-15m-1763486100](https://polymarket.com/event/btc-updown-15m-1763486100) | $2 | ❌ | DOWN | $-2 | $322 | L2 |
| 71 | 17:30 | [btc-updown-15m-1763487000](https://polymarket.com/event/btc-updown-15m-1763487000) | $4 | ✅ | UP | +$4 | $326 | - |
| 72 | 17:45 | [btc-updown-15m-1763487900](https://polymarket.com/event/btc-updown-15m-1763487900) | $1 | ❌ | DOWN | $-1 | $325 | L1 |
| 73 | 18:00 | [btc-updown-15m-1763488800](https://polymarket.com/event/btc-updown-15m-1763488800) | $2 | ✅ | UP | +$2 | $327 | - |
| 74 | 18:15 | [btc-updown-15m-1763489700](https://polymarket.com/event/btc-updown-15m-1763489700) | $1 | ❌ | DOWN | $-1 | $326 | L1 |
| 75 | 18:30 | [btc-updown-15m-1763490600](https://polymarket.com/event/btc-updown-15m-1763490600) | $2 | ✅ | UP | +$2 | $328 | - |
| 76 | 18:45 | [btc-updown-15m-1763491500](https://polymarket.com/event/btc-updown-15m-1763491500) | $1 | ❌ | DOWN | $-1 | $327 | L1 |
| 77 | 19:00 | [btc-updown-15m-1763492400](https://polymarket.com/event/btc-updown-15m-1763492400) | $2 | ✅ | UP | +$2 | $329 | - |
| 78 | 19:15 | [btc-updown-15m-1763493300](https://polymarket.com/event/btc-updown-15m-1763493300) | $1 | ❌ | DOWN | $-1 | $328 | L1 |
| 79 | 19:30 | [btc-updown-15m-1763494200](https://polymarket.com/event/btc-updown-15m-1763494200) | $2 | ❌ | DOWN | $-2 | $326 | L2 |
| 80 | 19:45 | [btc-updown-15m-1763495100](https://polymarket.com/event/btc-updown-15m-1763495100) | $4 | ❌ | DOWN | $-4 | $322 | L3 |
| 81 | 20:00 | [btc-updown-15m-1763496000](https://polymarket.com/event/btc-updown-15m-1763496000) | $8 | ❌ | DOWN | $-8 | $314 | L4 |
| 82 | 20:15 | [btc-updown-15m-1763496900](https://polymarket.com/event/btc-updown-15m-1763496900) | $16 | ✅ | UP | +$16 | $330 | - |
| 83 | 20:30 | [btc-updown-15m-1763497800](https://polymarket.com/event/btc-updown-15m-1763497800) | $1 | ❌ | DOWN | $-1 | $329 | L1 |
| 84 | 20:45 | [btc-updown-15m-1763498700](https://polymarket.com/event/btc-updown-15m-1763498700) | $2 | ✅ | UP | +$2 | $331 | - |
| 85 | 21:00 | [btc-updown-15m-1763499600](https://polymarket.com/event/btc-updown-15m-1763499600) | $1 | ✅ | UP | +$1 | $332 | - |
| 86 | 21:15 | [btc-updown-15m-1763500500](https://polymarket.com/event/btc-updown-15m-1763500500) | $1 | ❌ | DOWN | $-1 | $331 | L1 |
| 87 | 21:30 | [btc-updown-15m-1763501400](https://polymarket.com/event/btc-updown-15m-1763501400) | $2 | ❌ | DOWN | $-2 | $329 | L2 |
| 88 | 21:45 | [btc-updown-15m-1763502300](https://polymarket.com/event/btc-updown-15m-1763502300) | $4 | ❌ | DOWN | $-4 | $325 | L3 |
| 89 | 22:00 | [btc-updown-15m-1763503200](https://polymarket.com/event/btc-updown-15m-1763503200) | $8 | ✅ | UP | +$8 | $333 | - |
| 90 | 22:15 | [btc-updown-15m-1763504100](https://polymarket.com/event/btc-updown-15m-1763504100) | $1 | ✅ | UP | +$1 | $334 | - |
| 91 | 22:30 | [btc-updown-15m-1763505000](https://polymarket.com/event/btc-updown-15m-1763505000) | $1 | ✅ | UP | +$1 | $335 | - |
| 92 | 22:45 | [btc-updown-15m-1763505900](https://polymarket.com/event/btc-updown-15m-1763505900) | $1 | ❌ | DOWN | $-1 | $334 | L1 |
| 93 | 23:00 | [btc-updown-15m-1763506800](https://polymarket.com/event/btc-updown-15m-1763506800) | $2 | ❌ | DOWN | $-2 | $332 | L2 |
| 94 | 23:15 | [btc-updown-15m-1763507700](https://polymarket.com/event/btc-updown-15m-1763507700) | $4 | ✅ | UP | +$4 | $336 | - |
| 95 | 23:30 | [btc-updown-15m-1763508600](https://polymarket.com/event/btc-updown-15m-1763508600) | $1 | ✅ | UP | +$1 | $337 | - |
| 96 | 23:45 | [btc-updown-15m-1763509500](https://polymarket.com/event/btc-updown-15m-1763509500) | $1 | ✅ | UP | +$1 | $338 | - |

### 2025-11-19
**Summary:** 90 trades | 44 wins | 46 losses | Max Bet: $64 | Profit: +$44

**Skip Events (2):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 03:45 | 5 | $31 | $32 | 04:45 |
| 04:45 | 6 | $63 | $64 | 05:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763510400](https://polymarket.com/event/btc-updown-15m-1763510400) | $1 | ❌ | DOWN | $-1 | $337 | L1 |
| 2 | 00:15 | [btc-updown-15m-1763511300](https://polymarket.com/event/btc-updown-15m-1763511300) | $2 | ❌ | DOWN | $-2 | $335 | L2 |
| 3 | 00:30 | [btc-updown-15m-1763512200](https://polymarket.com/event/btc-updown-15m-1763512200) | $4 | ✅ | UP | +$4 | $339 | - |
| 4 | 00:45 | [btc-updown-15m-1763513100](https://polymarket.com/event/btc-updown-15m-1763513100) | $1 | ❌ | DOWN | $-1 | $338 | L1 |
| 5 | 01:00 | [btc-updown-15m-1763514000](https://polymarket.com/event/btc-updown-15m-1763514000) | $2 | ❌ | DOWN | $-2 | $336 | L2 |
| 6 | 01:15 | [btc-updown-15m-1763514900](https://polymarket.com/event/btc-updown-15m-1763514900) | $4 | ✅ | UP | +$4 | $340 | - |
| 7 | 01:30 | [btc-updown-15m-1763515800](https://polymarket.com/event/btc-updown-15m-1763515800) | $1 | ❌ | DOWN | $-1 | $339 | L1 |
| 8 | 01:45 | [btc-updown-15m-1763516700](https://polymarket.com/event/btc-updown-15m-1763516700) | $2 | ✅ | UP | +$2 | $341 | - |
| 9 | 02:00 | [btc-updown-15m-1763517600](https://polymarket.com/event/btc-updown-15m-1763517600) | $1 | ✅ | UP | +$1 | $342 | - |
| 10 | 02:15 | [btc-updown-15m-1763518500](https://polymarket.com/event/btc-updown-15m-1763518500) | $1 | ❌ | DOWN | $-1 | $341 | L1 |
| 11 | 02:30 | [btc-updown-15m-1763519400](https://polymarket.com/event/btc-updown-15m-1763519400) | $2 | ✅ | UP | +$2 | $343 | - |
| 12 | 02:45 | [btc-updown-15m-1763520300](https://polymarket.com/event/btc-updown-15m-1763520300) | $1 | ❌ | DOWN | $-1 | $342 | L1 |
| 13 | 03:00 | [btc-updown-15m-1763521200](https://polymarket.com/event/btc-updown-15m-1763521200) | $2 | ❌ | DOWN | $-2 | $340 | L2 |
| 14 | 03:15 | [btc-updown-15m-1763522100](https://polymarket.com/event/btc-updown-15m-1763522100) | $4 | ❌ | DOWN | $-4 | $336 | L3 |
| 15 | 03:30 | [btc-updown-15m-1763523000](https://polymarket.com/event/btc-updown-15m-1763523000) | $8 | ❌ | DOWN | $-8 | $328 | L4 |
| 16 | 03:45 | [btc-updown-15m-1763523900](https://polymarket.com/event/btc-updown-15m-1763523900) | $16 | ❌ | DOWN | $-16 | $312 | L5 |
| - | 04:00 | [btc-updown-15m-1763524800](https://polymarket.com/event/btc-updown-15m-1763524800) | - | ⏭️ SKIP | DOWN | - | $312 | - |
| - | 04:15 | [btc-updown-15m-1763525700](https://polymarket.com/event/btc-updown-15m-1763525700) | - | ⏭️ SKIP | DOWN | - | $312 | - |
| - | 04:30 | [btc-updown-15m-1763526600](https://polymarket.com/event/btc-updown-15m-1763526600) | - | ⏭️ SKIP | DOWN | - | $312 | - |
| 17 | 04:45 | [btc-updown-15m-1763527500](https://polymarket.com/event/btc-updown-15m-1763527500) | $32 | ❌ | DOWN | $-32 | $280 | L6 |
| - | 05:00 | [btc-updown-15m-1763528400](https://polymarket.com/event/btc-updown-15m-1763528400) | - | ⏭️ SKIP | DOWN | - | $280 | - |
| - | 05:15 | [btc-updown-15m-1763529300](https://polymarket.com/event/btc-updown-15m-1763529300) | - | ⏭️ SKIP | DOWN | - | $280 | - |
| - | 05:30 | [btc-updown-15m-1763530200](https://polymarket.com/event/btc-updown-15m-1763530200) | - | ⏭️ SKIP | DOWN | - | $280 | - |
| 18 | 05:45 | [btc-updown-15m-1763531100](https://polymarket.com/event/btc-updown-15m-1763531100) | $64 | ✅ | UP | +$64 | $344 | - |
| 19 | 06:00 | [btc-updown-15m-1763532000](https://polymarket.com/event/btc-updown-15m-1763532000) | $1 | ✅ | UP | +$1 | $345 | - |
| 20 | 06:15 | [btc-updown-15m-1763532900](https://polymarket.com/event/btc-updown-15m-1763532900) | $1 | ✅ | UP | +$1 | $346 | - |
| 21 | 06:30 | [btc-updown-15m-1763533800](https://polymarket.com/event/btc-updown-15m-1763533800) | $1 | ✅ | UP | +$1 | $347 | - |
| 22 | 06:45 | [btc-updown-15m-1763534700](https://polymarket.com/event/btc-updown-15m-1763534700) | $1 | ✅ | UP | +$1 | $348 | - |
| 23 | 07:00 | [btc-updown-15m-1763535600](https://polymarket.com/event/btc-updown-15m-1763535600) | $1 | ✅ | UP | +$1 | $349 | - |
| 24 | 07:15 | [btc-updown-15m-1763536500](https://polymarket.com/event/btc-updown-15m-1763536500) | $1 | ❌ | DOWN | $-1 | $348 | L1 |
| 25 | 07:30 | [btc-updown-15m-1763537400](https://polymarket.com/event/btc-updown-15m-1763537400) | $2 | ✅ | UP | +$2 | $350 | - |
| 26 | 07:45 | [btc-updown-15m-1763538300](https://polymarket.com/event/btc-updown-15m-1763538300) | $1 | ✅ | UP | +$1 | $351 | - |
| 27 | 08:00 | [btc-updown-15m-1763539200](https://polymarket.com/event/btc-updown-15m-1763539200) | $1 | ❌ | DOWN | $-1 | $350 | L1 |
| 28 | 08:15 | [btc-updown-15m-1763540100](https://polymarket.com/event/btc-updown-15m-1763540100) | $2 | ✅ | UP | +$2 | $352 | - |
| 29 | 08:30 | [btc-updown-15m-1763541000](https://polymarket.com/event/btc-updown-15m-1763541000) | $1 | ❌ | DOWN | $-1 | $351 | L1 |
| 30 | 08:45 | [btc-updown-15m-1763541900](https://polymarket.com/event/btc-updown-15m-1763541900) | $2 | ❌ | DOWN | $-2 | $349 | L2 |
| 31 | 09:00 | [btc-updown-15m-1763542800](https://polymarket.com/event/btc-updown-15m-1763542800) | $4 | ❌ | DOWN | $-4 | $345 | L3 |
| 32 | 09:15 | [btc-updown-15m-1763543700](https://polymarket.com/event/btc-updown-15m-1763543700) | $8 | ❌ | DOWN | $-8 | $337 | L4 |
| 33 | 09:30 | [btc-updown-15m-1763544600](https://polymarket.com/event/btc-updown-15m-1763544600) | $16 | ✅ | UP | +$16 | $353 | - |
| 34 | 09:45 | [btc-updown-15m-1763545500](https://polymarket.com/event/btc-updown-15m-1763545500) | $1 | ✅ | UP | +$1 | $354 | - |
| 35 | 10:00 | [btc-updown-15m-1763546400](https://polymarket.com/event/btc-updown-15m-1763546400) | $1 | ✅ | UP | +$1 | $355 | - |
| 36 | 10:15 | [btc-updown-15m-1763547300](https://polymarket.com/event/btc-updown-15m-1763547300) | $1 | ❌ | DOWN | $-1 | $354 | L1 |
| 37 | 10:30 | [btc-updown-15m-1763548200](https://polymarket.com/event/btc-updown-15m-1763548200) | $2 | ❌ | DOWN | $-2 | $352 | L2 |
| 38 | 10:45 | [btc-updown-15m-1763549100](https://polymarket.com/event/btc-updown-15m-1763549100) | $4 | ❌ | DOWN | $-4 | $348 | L3 |
| 39 | 11:00 | [btc-updown-15m-1763550000](https://polymarket.com/event/btc-updown-15m-1763550000) | $8 | ✅ | UP | +$8 | $356 | - |
| 40 | 11:15 | [btc-updown-15m-1763550900](https://polymarket.com/event/btc-updown-15m-1763550900) | $1 | ❌ | DOWN | $-1 | $355 | L1 |
| 41 | 11:30 | [btc-updown-15m-1763551800](https://polymarket.com/event/btc-updown-15m-1763551800) | $2 | ✅ | UP | +$2 | $357 | - |
| 42 | 11:45 | [btc-updown-15m-1763552700](https://polymarket.com/event/btc-updown-15m-1763552700) | $1 | ❌ | DOWN | $-1 | $356 | L1 |
| 43 | 12:00 | [btc-updown-15m-1763553600](https://polymarket.com/event/btc-updown-15m-1763553600) | $2 | ✅ | UP | +$2 | $358 | - |
| 44 | 12:15 | [btc-updown-15m-1763554500](https://polymarket.com/event/btc-updown-15m-1763554500) | $1 | ❌ | DOWN | $-1 | $357 | L1 |
| 45 | 12:30 | [btc-updown-15m-1763555400](https://polymarket.com/event/btc-updown-15m-1763555400) | $2 | ✅ | UP | +$2 | $359 | - |
| 46 | 12:45 | [btc-updown-15m-1763556300](https://polymarket.com/event/btc-updown-15m-1763556300) | $1 | ✅ | UP | +$1 | $360 | - |
| 47 | 13:00 | [btc-updown-15m-1763557200](https://polymarket.com/event/btc-updown-15m-1763557200) | $1 | ❌ | DOWN | $-1 | $359 | L1 |
| 48 | 13:15 | [btc-updown-15m-1763558100](https://polymarket.com/event/btc-updown-15m-1763558100) | $2 | ✅ | UP | +$2 | $361 | - |
| 49 | 13:30 | [btc-updown-15m-1763559000](https://polymarket.com/event/btc-updown-15m-1763559000) | $1 | ❌ | DOWN | $-1 | $360 | L1 |
| 50 | 13:45 | [btc-updown-15m-1763559900](https://polymarket.com/event/btc-updown-15m-1763559900) | $2 | ❌ | DOWN | $-2 | $358 | L2 |
| 51 | 14:00 | [btc-updown-15m-1763560800](https://polymarket.com/event/btc-updown-15m-1763560800) | $4 | ✅ | UP | +$4 | $362 | - |
| 52 | 14:15 | [btc-updown-15m-1763561700](https://polymarket.com/event/btc-updown-15m-1763561700) | $1 | ❌ | DOWN | $-1 | $361 | L1 |
| 53 | 14:30 | [btc-updown-15m-1763562600](https://polymarket.com/event/btc-updown-15m-1763562600) | $2 | ✅ | UP | +$2 | $363 | - |
| 54 | 14:45 | [btc-updown-15m-1763563500](https://polymarket.com/event/btc-updown-15m-1763563500) | $1 | ❌ | DOWN | $-1 | $362 | L1 |
| 55 | 15:00 | [btc-updown-15m-1763564400](https://polymarket.com/event/btc-updown-15m-1763564400) | $2 | ✅ | UP | +$2 | $364 | - |
| 56 | 15:15 | [btc-updown-15m-1763565300](https://polymarket.com/event/btc-updown-15m-1763565300) | $1 | ❌ | DOWN | $-1 | $363 | L1 |
| 57 | 15:30 | [btc-updown-15m-1763566200](https://polymarket.com/event/btc-updown-15m-1763566200) | $2 | ❌ | DOWN | $-2 | $361 | L2 |
| 58 | 15:45 | [btc-updown-15m-1763567100](https://polymarket.com/event/btc-updown-15m-1763567100) | $4 | ❌ | DOWN | $-4 | $357 | L3 |
| 59 | 16:00 | [btc-updown-15m-1763568000](https://polymarket.com/event/btc-updown-15m-1763568000) | $8 | ✅ | UP | +$8 | $365 | - |
| 60 | 16:15 | [btc-updown-15m-1763568900](https://polymarket.com/event/btc-updown-15m-1763568900) | $1 | ❌ | DOWN | $-1 | $364 | L1 |
| 61 | 16:30 | [btc-updown-15m-1763569800](https://polymarket.com/event/btc-updown-15m-1763569800) | $2 | ✅ | UP | +$2 | $366 | - |
| 62 | 16:45 | [btc-updown-15m-1763570700](https://polymarket.com/event/btc-updown-15m-1763570700) | $1 | ✅ | UP | +$1 | $367 | - |
| 63 | 17:00 | [btc-updown-15m-1763571600](https://polymarket.com/event/btc-updown-15m-1763571600) | $1 | ❌ | DOWN | $-1 | $366 | L1 |
| 64 | 17:15 | [btc-updown-15m-1763572500](https://polymarket.com/event/btc-updown-15m-1763572500) | $2 | ✅ | UP | +$2 | $368 | - |
| 65 | 17:30 | [btc-updown-15m-1763573400](https://polymarket.com/event/btc-updown-15m-1763573400) | $1 | ❌ | DOWN | $-1 | $367 | L1 |
| 66 | 17:45 | [btc-updown-15m-1763574300](https://polymarket.com/event/btc-updown-15m-1763574300) | $2 | ✅ | UP | +$2 | $369 | - |
| 67 | 18:00 | [btc-updown-15m-1763575200](https://polymarket.com/event/btc-updown-15m-1763575200) | $1 | ✅ | UP | +$1 | $370 | - |
| 68 | 18:15 | [btc-updown-15m-1763576100](https://polymarket.com/event/btc-updown-15m-1763576100) | $1 | ❌ | DOWN | $-1 | $369 | L1 |
| 69 | 18:30 | [btc-updown-15m-1763577000](https://polymarket.com/event/btc-updown-15m-1763577000) | $2 | ❌ | DOWN | $-2 | $367 | L2 |
| 70 | 18:45 | [btc-updown-15m-1763577900](https://polymarket.com/event/btc-updown-15m-1763577900) | $4 | ✅ | UP | +$4 | $371 | - |
| 71 | 19:00 | [btc-updown-15m-1763578800](https://polymarket.com/event/btc-updown-15m-1763578800) | $1 | ❌ | DOWN | $-1 | $370 | L1 |
| 72 | 19:15 | [btc-updown-15m-1763579700](https://polymarket.com/event/btc-updown-15m-1763579700) | $2 | ❌ | DOWN | $-2 | $368 | L2 |
| 73 | 19:30 | [btc-updown-15m-1763580600](https://polymarket.com/event/btc-updown-15m-1763580600) | $4 | ❌ | DOWN | $-4 | $364 | L3 |
| 74 | 19:45 | [btc-updown-15m-1763581500](https://polymarket.com/event/btc-updown-15m-1763581500) | $8 | ✅ | UP | +$8 | $372 | - |
| 75 | 20:00 | [btc-updown-15m-1763582400](https://polymarket.com/event/btc-updown-15m-1763582400) | $1 | ❌ | DOWN | $-1 | $371 | L1 |
| 76 | 20:15 | [btc-updown-15m-1763583300](https://polymarket.com/event/btc-updown-15m-1763583300) | $2 | ✅ | UP | +$2 | $373 | - |
| 77 | 20:30 | [btc-updown-15m-1763584200](https://polymarket.com/event/btc-updown-15m-1763584200) | $1 | ❌ | DOWN | $-1 | $372 | L1 |
| 78 | 20:45 | [btc-updown-15m-1763585100](https://polymarket.com/event/btc-updown-15m-1763585100) | $2 | ✅ | UP | +$2 | $374 | - |
| 79 | 21:00 | [btc-updown-15m-1763586000](https://polymarket.com/event/btc-updown-15m-1763586000) | $1 | ✅ | UP | +$1 | $375 | - |
| 80 | 21:15 | [btc-updown-15m-1763586900](https://polymarket.com/event/btc-updown-15m-1763586900) | $1 | ✅ | UP | +$1 | $376 | - |
| 81 | 21:30 | [btc-updown-15m-1763587800](https://polymarket.com/event/btc-updown-15m-1763587800) | $1 | ✅ | UP | +$1 | $377 | - |
| 82 | 21:45 | [btc-updown-15m-1763588700](https://polymarket.com/event/btc-updown-15m-1763588700) | $1 | ✅ | UP | +$1 | $378 | - |
| 83 | 22:00 | [btc-updown-15m-1763589600](https://polymarket.com/event/btc-updown-15m-1763589600) | $1 | ❌ | DOWN | $-1 | $377 | L1 |
| 84 | 22:15 | [btc-updown-15m-1763590500](https://polymarket.com/event/btc-updown-15m-1763590500) | $2 | ✅ | UP | +$2 | $379 | - |
| 85 | 22:30 | [btc-updown-15m-1763591400](https://polymarket.com/event/btc-updown-15m-1763591400) | $1 | ❌ | DOWN | $-1 | $378 | L1 |
| 86 | 22:45 | [btc-updown-15m-1763592300](https://polymarket.com/event/btc-updown-15m-1763592300) | $2 | ❌ | DOWN | $-2 | $376 | L2 |
| 87 | 23:00 | [btc-updown-15m-1763593200](https://polymarket.com/event/btc-updown-15m-1763593200) | $4 | ✅ | UP | +$4 | $380 | - |
| 88 | 23:15 | [btc-updown-15m-1763594100](https://polymarket.com/event/btc-updown-15m-1763594100) | $1 | ✅ | UP | +$1 | $381 | - |
| 89 | 23:30 | [btc-updown-15m-1763595000](https://polymarket.com/event/btc-updown-15m-1763595000) | $1 | ❌ | DOWN | $-1 | $380 | L1 |
| 90 | 23:45 | [btc-updown-15m-1763595900](https://polymarket.com/event/btc-updown-15m-1763595900) | $2 | ✅ | UP | +$2 | $382 | - |

### 2025-11-20
**Summary:** 89 trades | 40 wins | 49 losses | Max Bet: $64 | Profit: +$9

**Skip Events (3):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 09:30 | 5 | $31 | $32 | 10:30 |
| 10:30 | 6 | $63 | $64 | 11:30 |
| 23:30 | 5 | $31 | $32 | 2025-11-21 00:30 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763596800](https://polymarket.com/event/btc-updown-15m-1763596800) | $1 | ❌ | DOWN | $-1 | $381 | L1 |
| 2 | 00:15 | [btc-updown-15m-1763597700](https://polymarket.com/event/btc-updown-15m-1763597700) | $2 | ✅ | UP | +$2 | $383 | - |
| 3 | 00:30 | [btc-updown-15m-1763598600](https://polymarket.com/event/btc-updown-15m-1763598600) | $1 | ✅ | UP | +$1 | $384 | - |
| 4 | 00:45 | [btc-updown-15m-1763599500](https://polymarket.com/event/btc-updown-15m-1763599500) | $1 | ❌ | DOWN | $-1 | $383 | L1 |
| 5 | 01:00 | [btc-updown-15m-1763600400](https://polymarket.com/event/btc-updown-15m-1763600400) | $2 | ✅ | UP | +$2 | $385 | - |
| 6 | 01:15 | [btc-updown-15m-1763601300](https://polymarket.com/event/btc-updown-15m-1763601300) | $1 | ✅ | UP | +$1 | $386 | - |
| 7 | 01:30 | [btc-updown-15m-1763602200](https://polymarket.com/event/btc-updown-15m-1763602200) | $1 | ✅ | UP | +$1 | $387 | - |
| 8 | 01:45 | [btc-updown-15m-1763603100](https://polymarket.com/event/btc-updown-15m-1763603100) | $1 | ✅ | UP | +$1 | $388 | - |
| 9 | 02:00 | [btc-updown-15m-1763604000](https://polymarket.com/event/btc-updown-15m-1763604000) | $1 | ✅ | UP | +$1 | $389 | - |
| 10 | 02:15 | [btc-updown-15m-1763604900](https://polymarket.com/event/btc-updown-15m-1763604900) | $1 | ❌ | DOWN | $-1 | $388 | L1 |
| 11 | 02:30 | [btc-updown-15m-1763605800](https://polymarket.com/event/btc-updown-15m-1763605800) | $2 | ❌ | DOWN | $-2 | $386 | L2 |
| 12 | 02:45 | [btc-updown-15m-1763606700](https://polymarket.com/event/btc-updown-15m-1763606700) | $4 | ✅ | UP | +$4 | $390 | - |
| 13 | 03:00 | [btc-updown-15m-1763607600](https://polymarket.com/event/btc-updown-15m-1763607600) | $1 | ❌ | DOWN | $-1 | $389 | L1 |
| 14 | 03:15 | [btc-updown-15m-1763608500](https://polymarket.com/event/btc-updown-15m-1763608500) | $2 | ❌ | DOWN | $-2 | $387 | L2 |
| 15 | 03:30 | [btc-updown-15m-1763609400](https://polymarket.com/event/btc-updown-15m-1763609400) | $4 | ✅ | UP | +$4 | $391 | - |
| 16 | 03:45 | [btc-updown-15m-1763610300](https://polymarket.com/event/btc-updown-15m-1763610300) | $1 | ❌ | DOWN | $-1 | $390 | L1 |
| 17 | 04:00 | [btc-updown-15m-1763611200](https://polymarket.com/event/btc-updown-15m-1763611200) | $2 | ✅ | UP | +$2 | $392 | - |
| 18 | 04:15 | [btc-updown-15m-1763612100](https://polymarket.com/event/btc-updown-15m-1763612100) | $1 | ❌ | DOWN | $-1 | $391 | L1 |
| 19 | 04:30 | [btc-updown-15m-1763613000](https://polymarket.com/event/btc-updown-15m-1763613000) | $2 | ✅ | UP | +$2 | $393 | - |
| 20 | 04:45 | [btc-updown-15m-1763613900](https://polymarket.com/event/btc-updown-15m-1763613900) | $1 | ✅ | UP | +$1 | $394 | - |
| 21 | 05:00 | [btc-updown-15m-1763614800](https://polymarket.com/event/btc-updown-15m-1763614800) | $1 | ❌ | DOWN | $-1 | $393 | L1 |
| 22 | 05:15 | [btc-updown-15m-1763615700](https://polymarket.com/event/btc-updown-15m-1763615700) | $2 | ❌ | DOWN | $-2 | $391 | L2 |
| 23 | 05:30 | [btc-updown-15m-1763616600](https://polymarket.com/event/btc-updown-15m-1763616600) | $4 | ❌ | DOWN | $-4 | $387 | L3 |
| 24 | 05:45 | [btc-updown-15m-1763617500](https://polymarket.com/event/btc-updown-15m-1763617500) | $8 | ✅ | UP | +$8 | $395 | - |
| 25 | 06:00 | [btc-updown-15m-1763618400](https://polymarket.com/event/btc-updown-15m-1763618400) | $1 | ✅ | UP | +$1 | $396 | - |
| 26 | 06:15 | [btc-updown-15m-1763619300](https://polymarket.com/event/btc-updown-15m-1763619300) | $1 | ❌ | DOWN | $-1 | $395 | L1 |
| 27 | 06:30 | [btc-updown-15m-1763620200](https://polymarket.com/event/btc-updown-15m-1763620200) | $2 | ❌ | DOWN | $-2 | $393 | L2 |
| 28 | 06:45 | [btc-updown-15m-1763621100](https://polymarket.com/event/btc-updown-15m-1763621100) | $4 | ✅ | UP | +$4 | $397 | - |
| 29 | 07:00 | [btc-updown-15m-1763622000](https://polymarket.com/event/btc-updown-15m-1763622000) | $1 | ✅ | UP | +$1 | $398 | - |
| 30 | 07:15 | [btc-updown-15m-1763622900](https://polymarket.com/event/btc-updown-15m-1763622900) | $1 | ❌ | DOWN | $-1 | $397 | L1 |
| 31 | 07:30 | [btc-updown-15m-1763623800](https://polymarket.com/event/btc-updown-15m-1763623800) | $2 | ✅ | UP | +$2 | $399 | - |
| 32 | 07:45 | [btc-updown-15m-1763624700](https://polymarket.com/event/btc-updown-15m-1763624700) | $1 | ✅ | UP | +$1 | $400 | - |
| 33 | 08:00 | [btc-updown-15m-1763625600](https://polymarket.com/event/btc-updown-15m-1763625600) | $1 | ❌ | DOWN | $-1 | $399 | L1 |
| 34 | 08:15 | [btc-updown-15m-1763626500](https://polymarket.com/event/btc-updown-15m-1763626500) | $2 | ✅ | UP | +$2 | $401 | - |
| 35 | 08:30 | [btc-updown-15m-1763627400](https://polymarket.com/event/btc-updown-15m-1763627400) | $1 | ❌ | DOWN | $-1 | $400 | L1 |
| 36 | 08:45 | [btc-updown-15m-1763628300](https://polymarket.com/event/btc-updown-15m-1763628300) | $2 | ❌ | DOWN | $-2 | $398 | L2 |
| 37 | 09:00 | [btc-updown-15m-1763629200](https://polymarket.com/event/btc-updown-15m-1763629200) | $4 | ❌ | DOWN | $-4 | $394 | L3 |
| 38 | 09:15 | [btc-updown-15m-1763630100](https://polymarket.com/event/btc-updown-15m-1763630100) | $8 | ❌ | DOWN | $-8 | $386 | L4 |
| 39 | 09:30 | [btc-updown-15m-1763631000](https://polymarket.com/event/btc-updown-15m-1763631000) | $16 | ❌ | DOWN | $-16 | $370 | L5 |
| - | 09:45 | [btc-updown-15m-1763631900](https://polymarket.com/event/btc-updown-15m-1763631900) | - | ⏭️ SKIP | UP | - | $370 | - |
| - | 10:00 | [btc-updown-15m-1763632800](https://polymarket.com/event/btc-updown-15m-1763632800) | - | ⏭️ SKIP | DOWN | - | $370 | - |
| - | 10:15 | [btc-updown-15m-1763633700](https://polymarket.com/event/btc-updown-15m-1763633700) | - | ⏭️ SKIP | UP | - | $370 | - |
| 40 | 10:30 | [btc-updown-15m-1763634600](https://polymarket.com/event/btc-updown-15m-1763634600) | $32 | ❌ | DOWN | $-32 | $338 | L6 |
| - | 10:45 | [btc-updown-15m-1763635500](https://polymarket.com/event/btc-updown-15m-1763635500) | - | ⏭️ SKIP | UP | - | $338 | - |
| - | 11:00 | [btc-updown-15m-1763636400](https://polymarket.com/event/btc-updown-15m-1763636400) | - | ⏭️ SKIP | DOWN | - | $338 | - |
| - | 11:15 | [btc-updown-15m-1763637300](https://polymarket.com/event/btc-updown-15m-1763637300) | - | ⏭️ SKIP | DOWN | - | $338 | - |
| 41 | 11:30 | [btc-updown-15m-1763638200](https://polymarket.com/event/btc-updown-15m-1763638200) | $64 | ✅ | UP | +$64 | $402 | - |
| 42 | 11:45 | [btc-updown-15m-1763639100](https://polymarket.com/event/btc-updown-15m-1763639100) | $1 | ✅ | UP | +$1 | $403 | - |
| 43 | 12:00 | [btc-updown-15m-1763640000](https://polymarket.com/event/btc-updown-15m-1763640000) | $1 | ❌ | DOWN | $-1 | $402 | L1 |
| 44 | 12:15 | [btc-updown-15m-1763640900](https://polymarket.com/event/btc-updown-15m-1763640900) | $2 | ✅ | UP | +$2 | $404 | - |
| 45 | 12:30 | [btc-updown-15m-1763641800](https://polymarket.com/event/btc-updown-15m-1763641800) | $1 | ✅ | UP | +$1 | $405 | - |
| 46 | 12:45 | [btc-updown-15m-1763642700](https://polymarket.com/event/btc-updown-15m-1763642700) | $1 | ✅ | UP | +$1 | $406 | - |
| 47 | 13:00 | [btc-updown-15m-1763643600](https://polymarket.com/event/btc-updown-15m-1763643600) | $1 | ✅ | UP | +$1 | $407 | - |
| 48 | 13:15 | [btc-updown-15m-1763644500](https://polymarket.com/event/btc-updown-15m-1763644500) | $1 | ❌ | DOWN | $-1 | $406 | L1 |
| 49 | 13:30 | [btc-updown-15m-1763645400](https://polymarket.com/event/btc-updown-15m-1763645400) | $2 | ❌ | DOWN | $-2 | $404 | L2 |
| 50 | 13:45 | [btc-updown-15m-1763646300](https://polymarket.com/event/btc-updown-15m-1763646300) | $4 | ❌ | DOWN | $-4 | $400 | L3 |
| 51 | 14:00 | [btc-updown-15m-1763647200](https://polymarket.com/event/btc-updown-15m-1763647200) | $8 | ❌ | DOWN | $-8 | $392 | L4 |
| 52 | 14:15 | [btc-updown-15m-1763648100](https://polymarket.com/event/btc-updown-15m-1763648100) | $16 | ✅ | UP | +$16 | $408 | - |
| 53 | 14:30 | [btc-updown-15m-1763649000](https://polymarket.com/event/btc-updown-15m-1763649000) | $1 | ❌ | DOWN | $-1 | $407 | L1 |
| 54 | 14:45 | [btc-updown-15m-1763649900](https://polymarket.com/event/btc-updown-15m-1763649900) | $2 | ✅ | UP | +$2 | $409 | - |
| 55 | 15:00 | [btc-updown-15m-1763650800](https://polymarket.com/event/btc-updown-15m-1763650800) | $1 | ❌ | DOWN | $-1 | $408 | L1 |
| 56 | 15:15 | [btc-updown-15m-1763651700](https://polymarket.com/event/btc-updown-15m-1763651700) | $2 | ✅ | UP | +$2 | $410 | - |
| 57 | 15:30 | [btc-updown-15m-1763652600](https://polymarket.com/event/btc-updown-15m-1763652600) | $1 | ❌ | DOWN | $-1 | $409 | L1 |
| 58 | 15:45 | [btc-updown-15m-1763653500](https://polymarket.com/event/btc-updown-15m-1763653500) | $2 | ❌ | DOWN | $-2 | $407 | L2 |
| 59 | 16:00 | [btc-updown-15m-1763654400](https://polymarket.com/event/btc-updown-15m-1763654400) | $4 | ❌ | DOWN | $-4 | $403 | L3 |
| 60 | 16:15 | [btc-updown-15m-1763655300](https://polymarket.com/event/btc-updown-15m-1763655300) | $8 | ✅ | UP | +$8 | $411 | - |
| 61 | 16:30 | [btc-updown-15m-1763656200](https://polymarket.com/event/btc-updown-15m-1763656200) | $1 | ❌ | DOWN | $-1 | $410 | L1 |
| 62 | 16:45 | [btc-updown-15m-1763657100](https://polymarket.com/event/btc-updown-15m-1763657100) | $2 | ❌ | DOWN | $-2 | $408 | L2 |
| 63 | 17:00 | [btc-updown-15m-1763658000](https://polymarket.com/event/btc-updown-15m-1763658000) | $4 | ❌ | DOWN | $-4 | $404 | L3 |
| 64 | 17:15 | [btc-updown-15m-1763658900](https://polymarket.com/event/btc-updown-15m-1763658900) | $8 | ✅ | UP | +$8 | $412 | - |
| 65 | 17:30 | [btc-updown-15m-1763659800](https://polymarket.com/event/btc-updown-15m-1763659800) | $1 | ❌ | DOWN | $-1 | $411 | L1 |
| 66 | 17:45 | [btc-updown-15m-1763660700](https://polymarket.com/event/btc-updown-15m-1763660700) | $2 | ✅ | UP | +$2 | $413 | - |
| 67 | 18:00 | [btc-updown-15m-1763661600](https://polymarket.com/event/btc-updown-15m-1763661600) | $1 | ✅ | UP | +$1 | $414 | - |
| 68 | 18:15 | [btc-updown-15m-1763662500](https://polymarket.com/event/btc-updown-15m-1763662500) | $1 | ❌ | DOWN | $-1 | $413 | L1 |
| 69 | 18:30 | [btc-updown-15m-1763663400](https://polymarket.com/event/btc-updown-15m-1763663400) | $2 | ❌ | DOWN | $-2 | $411 | L2 |
| 70 | 18:45 | [btc-updown-15m-1763664300](https://polymarket.com/event/btc-updown-15m-1763664300) | $4 | ❌ | DOWN | $-4 | $407 | L3 |
| 71 | 19:00 | [btc-updown-15m-1763665200](https://polymarket.com/event/btc-updown-15m-1763665200) | $8 | ❌ | DOWN | $-8 | $399 | L4 |
| 72 | 19:15 | [btc-updown-15m-1763666100](https://polymarket.com/event/btc-updown-15m-1763666100) | $16 | ✅ | UP | +$16 | $415 | - |
| 73 | 19:30 | [btc-updown-15m-1763667000](https://polymarket.com/event/btc-updown-15m-1763667000) | $1 | ❌ | DOWN | $-1 | $414 | L1 |
| 74 | 19:45 | [btc-updown-15m-1763667900](https://polymarket.com/event/btc-updown-15m-1763667900) | $2 | ✅ | UP | +$2 | $416 | - |
| 75 | 20:00 | [btc-updown-15m-1763668800](https://polymarket.com/event/btc-updown-15m-1763668800) | $1 | ❌ | DOWN | $-1 | $415 | L1 |
| 76 | 20:15 | [btc-updown-15m-1763669700](https://polymarket.com/event/btc-updown-15m-1763669700) | $2 | ✅ | UP | +$2 | $417 | - |
| 77 | 20:30 | [btc-updown-15m-1763670600](https://polymarket.com/event/btc-updown-15m-1763670600) | $1 | ❌ | DOWN | $-1 | $416 | L1 |
| 78 | 20:45 | [btc-updown-15m-1763671500](https://polymarket.com/event/btc-updown-15m-1763671500) | $2 | ❌ | DOWN | $-2 | $414 | L2 |
| 79 | 21:00 | [btc-updown-15m-1763672400](https://polymarket.com/event/btc-updown-15m-1763672400) | $4 | ✅ | UP | +$4 | $418 | - |
| 80 | 21:15 | [btc-updown-15m-1763673300](https://polymarket.com/event/btc-updown-15m-1763673300) | $1 | ✅ | UP | +$1 | $419 | - |
| 81 | 21:30 | [btc-updown-15m-1763674200](https://polymarket.com/event/btc-updown-15m-1763674200) | $1 | ✅ | UP | +$1 | $420 | - |
| 82 | 21:45 | [btc-updown-15m-1763675100](https://polymarket.com/event/btc-updown-15m-1763675100) | $1 | ❌ | DOWN | $-1 | $419 | L1 |
| 83 | 22:00 | [btc-updown-15m-1763676000](https://polymarket.com/event/btc-updown-15m-1763676000) | $2 | ✅ | UP | +$2 | $421 | - |
| 84 | 22:15 | [btc-updown-15m-1763676900](https://polymarket.com/event/btc-updown-15m-1763676900) | $1 | ✅ | UP | +$1 | $422 | - |
| 85 | 22:30 | [btc-updown-15m-1763677800](https://polymarket.com/event/btc-updown-15m-1763677800) | $1 | ❌ | DOWN | $-1 | $421 | L1 |
| 86 | 22:45 | [btc-updown-15m-1763678700](https://polymarket.com/event/btc-updown-15m-1763678700) | $2 | ❌ | DOWN | $-2 | $419 | L2 |
| 87 | 23:00 | [btc-updown-15m-1763679600](https://polymarket.com/event/btc-updown-15m-1763679600) | $4 | ❌ | DOWN | $-4 | $415 | L3 |
| 88 | 23:15 | [btc-updown-15m-1763680500](https://polymarket.com/event/btc-updown-15m-1763680500) | $8 | ❌ | DOWN | $-8 | $407 | L4 |
| 89 | 23:30 | [btc-updown-15m-1763681400](https://polymarket.com/event/btc-updown-15m-1763681400) | $16 | ❌ | DOWN | $-16 | $391 | L5 |
| - | 23:45 | [btc-updown-15m-1763682300](https://polymarket.com/event/btc-updown-15m-1763682300) | - | ⏭️ SKIP | DOWN | - | $391 | - |

### 2025-11-21
**Summary:** 61 trades | 24 wins | 37 losses | Max Bet: $256 | Profit: $-8

**Skip Events (12):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:30 | 6 | $63 | $64 | 01:30 |
| 01:30 | 7 | $127 | $128 | 02:30 |
| 02:30 | 8 | $255 | $256 | 03:30 |
| 07:45 | 5 | $31 | $32 | 08:45 |
| 08:45 | 6 | $63 | $64 | 09:45 |
| 09:45 | 7 | $127 | $128 | 10:45 |
| 12:15 | 5 | $31 | $32 | 13:15 |
| 13:15 | 6 | $63 | $64 | 14:15 |
| 14:15 | 7 | $127 | $128 | 15:15 |
| 15:15 | 8 | $255 | $256 | 16:15 |
| 22:45 | 5 | $31 | $32 | 23:45 |
| 23:45 | 6 | $63 | $64 | 2025-11-22 00:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| - | 00:00 | [btc-updown-15m-1763683200](https://polymarket.com/event/btc-updown-15m-1763683200) | - | ⏭️ SKIP | UP | - | $391 | - |
| - | 00:15 | [btc-updown-15m-1763684100](https://polymarket.com/event/btc-updown-15m-1763684100) | - | ⏭️ SKIP | UP | - | $391 | - |
| 1 | 00:30 | [btc-updown-15m-1763685000](https://polymarket.com/event/btc-updown-15m-1763685000) | $32 | ❌ | DOWN | $-32 | $359 | L6 |
| - | 00:45 | [btc-updown-15m-1763685900](https://polymarket.com/event/btc-updown-15m-1763685900) | - | ⏭️ SKIP | UP | - | $359 | - |
| - | 01:00 | [btc-updown-15m-1763686800](https://polymarket.com/event/btc-updown-15m-1763686800) | - | ⏭️ SKIP | DOWN | - | $359 | - |
| - | 01:15 | [btc-updown-15m-1763687700](https://polymarket.com/event/btc-updown-15m-1763687700) | - | ⏭️ SKIP | UP | - | $359 | - |
| 2 | 01:30 | [btc-updown-15m-1763688600](https://polymarket.com/event/btc-updown-15m-1763688600) | $64 | ❌ | DOWN | $-64 | $295 | L7 |
| - | 01:45 | [btc-updown-15m-1763689500](https://polymarket.com/event/btc-updown-15m-1763689500) | - | ⏭️ SKIP | DOWN | - | $295 | - |
| - | 02:00 | [btc-updown-15m-1763690400](https://polymarket.com/event/btc-updown-15m-1763690400) | - | ⏭️ SKIP | DOWN | - | $295 | - |
| - | 02:15 | [btc-updown-15m-1763691300](https://polymarket.com/event/btc-updown-15m-1763691300) | - | ⏭️ SKIP | UP | - | $295 | - |
| 3 | 02:30 | [btc-updown-15m-1763692200](https://polymarket.com/event/btc-updown-15m-1763692200) | $128 | ❌ | DOWN | $-128 | $167 | L8 |
| - | 02:45 | [btc-updown-15m-1763693100](https://polymarket.com/event/btc-updown-15m-1763693100) | - | ⏭️ SKIP | DOWN | - | $167 | - |
| - | 03:00 | [btc-updown-15m-1763694000](https://polymarket.com/event/btc-updown-15m-1763694000) | - | ⏭️ SKIP | UP | - | $167 | - |
| - | 03:15 | [btc-updown-15m-1763694900](https://polymarket.com/event/btc-updown-15m-1763694900) | - | ⏭️ SKIP | DOWN | - | $167 | - |
| 4 | 03:30 | [btc-updown-15m-1763695800](https://polymarket.com/event/btc-updown-15m-1763695800) | $256 | ✅ | UP | +$256 | $423 | - |
| 5 | 03:45 | [btc-updown-15m-1763696700](https://polymarket.com/event/btc-updown-15m-1763696700) | $1 | ❌ | DOWN | $-1 | $422 | L1 |
| 6 | 04:00 | [btc-updown-15m-1763697600](https://polymarket.com/event/btc-updown-15m-1763697600) | $2 | ❌ | DOWN | $-2 | $420 | L2 |
| 7 | 04:15 | [btc-updown-15m-1763698500](https://polymarket.com/event/btc-updown-15m-1763698500) | $4 | ✅ | UP | +$4 | $424 | - |
| 8 | 04:30 | [btc-updown-15m-1763699400](https://polymarket.com/event/btc-updown-15m-1763699400) | $1 | ✅ | UP | +$1 | $425 | - |
| 9 | 04:45 | [btc-updown-15m-1763700300](https://polymarket.com/event/btc-updown-15m-1763700300) | $1 | ✅ | UP | +$1 | $426 | - |
| 10 | 05:00 | [btc-updown-15m-1763701200](https://polymarket.com/event/btc-updown-15m-1763701200) | $1 | ✅ | UP | +$1 | $427 | - |
| 11 | 05:15 | [btc-updown-15m-1763702100](https://polymarket.com/event/btc-updown-15m-1763702100) | $1 | ❌ | DOWN | $-1 | $426 | L1 |
| 12 | 05:30 | [btc-updown-15m-1763703000](https://polymarket.com/event/btc-updown-15m-1763703000) | $2 | ❌ | DOWN | $-2 | $424 | L2 |
| 13 | 05:45 | [btc-updown-15m-1763703900](https://polymarket.com/event/btc-updown-15m-1763703900) | $4 | ✅ | UP | +$4 | $428 | - |
| 14 | 06:00 | [btc-updown-15m-1763704800](https://polymarket.com/event/btc-updown-15m-1763704800) | $1 | ❌ | DOWN | $-1 | $427 | L1 |
| 15 | 06:15 | [btc-updown-15m-1763705700](https://polymarket.com/event/btc-updown-15m-1763705700) | $2 | ❌ | DOWN | $-2 | $425 | L2 |
| 16 | 06:30 | [btc-updown-15m-1763706600](https://polymarket.com/event/btc-updown-15m-1763706600) | $4 | ✅ | UP | +$4 | $429 | - |
| 17 | 06:45 | [btc-updown-15m-1763707500](https://polymarket.com/event/btc-updown-15m-1763707500) | $1 | ❌ | DOWN | $-1 | $428 | L1 |
| 18 | 07:00 | [btc-updown-15m-1763708400](https://polymarket.com/event/btc-updown-15m-1763708400) | $2 | ❌ | DOWN | $-2 | $426 | L2 |
| 19 | 07:15 | [btc-updown-15m-1763709300](https://polymarket.com/event/btc-updown-15m-1763709300) | $4 | ❌ | DOWN | $-4 | $422 | L3 |
| 20 | 07:30 | [btc-updown-15m-1763710200](https://polymarket.com/event/btc-updown-15m-1763710200) | $8 | ❌ | DOWN | $-8 | $414 | L4 |
| 21 | 07:45 | [btc-updown-15m-1763711100](https://polymarket.com/event/btc-updown-15m-1763711100) | $16 | ❌ | DOWN | $-16 | $398 | L5 |
| - | 08:00 | [btc-updown-15m-1763712000](https://polymarket.com/event/btc-updown-15m-1763712000) | - | ⏭️ SKIP | UP | - | $398 | - |
| - | 08:15 | [btc-updown-15m-1763712900](https://polymarket.com/event/btc-updown-15m-1763712900) | - | ⏭️ SKIP | DOWN | - | $398 | - |
| - | 08:30 | [btc-updown-15m-1763713800](https://polymarket.com/event/btc-updown-15m-1763713800) | - | ⏭️ SKIP | DOWN | - | $398 | - |
| 22 | 08:45 | [btc-updown-15m-1763714700](https://polymarket.com/event/btc-updown-15m-1763714700) | $32 | ❌ | DOWN | $-32 | $366 | L6 |
| - | 09:00 | [btc-updown-15m-1763715600](https://polymarket.com/event/btc-updown-15m-1763715600) | - | ⏭️ SKIP | UP | - | $366 | - |
| - | 09:15 | [btc-updown-15m-1763716500](https://polymarket.com/event/btc-updown-15m-1763716500) | - | ⏭️ SKIP | DOWN | - | $366 | - |
| - | 09:30 | [btc-updown-15m-1763717400](https://polymarket.com/event/btc-updown-15m-1763717400) | - | ⏭️ SKIP | DOWN | - | $366 | - |
| 23 | 09:45 | [btc-updown-15m-1763718300](https://polymarket.com/event/btc-updown-15m-1763718300) | $64 | ❌ | DOWN | $-64 | $302 | L7 |
| - | 10:00 | [btc-updown-15m-1763719200](https://polymarket.com/event/btc-updown-15m-1763719200) | - | ⏭️ SKIP | DOWN | - | $302 | - |
| - | 10:15 | [btc-updown-15m-1763720100](https://polymarket.com/event/btc-updown-15m-1763720100) | - | ⏭️ SKIP | DOWN | - | $302 | - |
| - | 10:30 | [btc-updown-15m-1763721000](https://polymarket.com/event/btc-updown-15m-1763721000) | - | ⏭️ SKIP | UP | - | $302 | - |
| 24 | 10:45 | [btc-updown-15m-1763721900](https://polymarket.com/event/btc-updown-15m-1763721900) | $128 | ✅ | UP | +$128 | $430 | - |
| 25 | 11:00 | [btc-updown-15m-1763722800](https://polymarket.com/event/btc-updown-15m-1763722800) | $1 | ✅ | UP | +$1 | $431 | - |
| 26 | 11:15 | [btc-updown-15m-1763723700](https://polymarket.com/event/btc-updown-15m-1763723700) | $1 | ❌ | DOWN | $-1 | $430 | L1 |
| 27 | 11:30 | [btc-updown-15m-1763724600](https://polymarket.com/event/btc-updown-15m-1763724600) | $2 | ❌ | DOWN | $-2 | $428 | L2 |
| 28 | 11:45 | [btc-updown-15m-1763725500](https://polymarket.com/event/btc-updown-15m-1763725500) | $4 | ❌ | DOWN | $-4 | $424 | L3 |
| 29 | 12:00 | [btc-updown-15m-1763726400](https://polymarket.com/event/btc-updown-15m-1763726400) | $8 | ❌ | DOWN | $-8 | $416 | L4 |
| 30 | 12:15 | [btc-updown-15m-1763727300](https://polymarket.com/event/btc-updown-15m-1763727300) | $16 | ❌ | DOWN | $-16 | $400 | L5 |
| - | 12:30 | [btc-updown-15m-1763728200](https://polymarket.com/event/btc-updown-15m-1763728200) | - | ⏭️ SKIP | UP | - | $400 | - |
| - | 12:45 | [btc-updown-15m-1763729100](https://polymarket.com/event/btc-updown-15m-1763729100) | - | ⏭️ SKIP | UP | - | $400 | - |
| - | 13:00 | [btc-updown-15m-1763730000](https://polymarket.com/event/btc-updown-15m-1763730000) | - | ⏭️ SKIP | UP | - | $400 | - |
| 31 | 13:15 | [btc-updown-15m-1763730900](https://polymarket.com/event/btc-updown-15m-1763730900) | $32 | ❌ | DOWN | $-32 | $368 | L6 |
| - | 13:30 | [btc-updown-15m-1763731800](https://polymarket.com/event/btc-updown-15m-1763731800) | - | ⏭️ SKIP | UP | - | $368 | - |
| - | 13:45 | [btc-updown-15m-1763732700](https://polymarket.com/event/btc-updown-15m-1763732700) | - | ⏭️ SKIP | DOWN | - | $368 | - |
| - | 14:00 | [btc-updown-15m-1763733600](https://polymarket.com/event/btc-updown-15m-1763733600) | - | ⏭️ SKIP | DOWN | - | $368 | - |
| 32 | 14:15 | [btc-updown-15m-1763734500](https://polymarket.com/event/btc-updown-15m-1763734500) | $64 | ❌ | DOWN | $-64 | $304 | L7 |
| - | 14:30 | [btc-updown-15m-1763735400](https://polymarket.com/event/btc-updown-15m-1763735400) | - | ⏭️ SKIP | UP | - | $304 | - |
| - | 14:45 | [btc-updown-15m-1763736300](https://polymarket.com/event/btc-updown-15m-1763736300) | - | ⏭️ SKIP | DOWN | - | $304 | - |
| - | 15:00 | [btc-updown-15m-1763737200](https://polymarket.com/event/btc-updown-15m-1763737200) | - | ⏭️ SKIP | DOWN | - | $304 | - |
| 33 | 15:15 | [btc-updown-15m-1763738100](https://polymarket.com/event/btc-updown-15m-1763738100) | $128 | ❌ | DOWN | $-128 | $176 | L8 |
| - | 15:30 | [btc-updown-15m-1763739000](https://polymarket.com/event/btc-updown-15m-1763739000) | - | ⏭️ SKIP | DOWN | - | $176 | - |
| - | 15:45 | [btc-updown-15m-1763739900](https://polymarket.com/event/btc-updown-15m-1763739900) | - | ⏭️ SKIP | DOWN | - | $176 | - |
| - | 16:00 | [btc-updown-15m-1763740800](https://polymarket.com/event/btc-updown-15m-1763740800) | - | ⏭️ SKIP | UP | - | $176 | - |
| 34 | 16:15 | [btc-updown-15m-1763741700](https://polymarket.com/event/btc-updown-15m-1763741700) | $256 | ✅ | UP | +$256 | $432 | - |
| 35 | 16:30 | [btc-updown-15m-1763742600](https://polymarket.com/event/btc-updown-15m-1763742600) | $1 | ✅ | UP | +$1 | $433 | - |
| 36 | 16:45 | [btc-updown-15m-1763743500](https://polymarket.com/event/btc-updown-15m-1763743500) | $1 | ✅ | UP | +$1 | $434 | - |
| 37 | 17:00 | [btc-updown-15m-1763744400](https://polymarket.com/event/btc-updown-15m-1763744400) | $1 | ✅ | UP | +$1 | $435 | - |
| 38 | 17:15 | [btc-updown-15m-1763745300](https://polymarket.com/event/btc-updown-15m-1763745300) | $1 | ✅ | UP | +$1 | $436 | - |
| 39 | 17:30 | [btc-updown-15m-1763746200](https://polymarket.com/event/btc-updown-15m-1763746200) | $1 | ❌ | DOWN | $-1 | $435 | L1 |
| 40 | 17:45 | [btc-updown-15m-1763747100](https://polymarket.com/event/btc-updown-15m-1763747100) | $2 | ❌ | DOWN | $-2 | $433 | L2 |
| 41 | 18:00 | [btc-updown-15m-1763748000](https://polymarket.com/event/btc-updown-15m-1763748000) | $4 | ❌ | DOWN | $-4 | $429 | L3 |
| 42 | 18:15 | [btc-updown-15m-1763748900](https://polymarket.com/event/btc-updown-15m-1763748900) | $8 | ✅ | UP | +$8 | $437 | - |
| 43 | 18:30 | [btc-updown-15m-1763749800](https://polymarket.com/event/btc-updown-15m-1763749800) | $1 | ✅ | UP | +$1 | $438 | - |
| 44 | 18:45 | [btc-updown-15m-1763750700](https://polymarket.com/event/btc-updown-15m-1763750700) | $1 | ✅ | UP | +$1 | $439 | - |
| 45 | 19:00 | [btc-updown-15m-1763751600](https://polymarket.com/event/btc-updown-15m-1763751600) | $1 | ❌ | DOWN | $-1 | $438 | L1 |
| 46 | 19:15 | [btc-updown-15m-1763752500](https://polymarket.com/event/btc-updown-15m-1763752500) | $2 | ✅ | UP | +$2 | $440 | - |
| 47 | 19:30 | [btc-updown-15m-1763753400](https://polymarket.com/event/btc-updown-15m-1763753400) | $1 | ❌ | DOWN | $-1 | $439 | L1 |
| 48 | 19:45 | [btc-updown-15m-1763754300](https://polymarket.com/event/btc-updown-15m-1763754300) | $2 | ❌ | DOWN | $-2 | $437 | L2 |
| 49 | 20:00 | [btc-updown-15m-1763755200](https://polymarket.com/event/btc-updown-15m-1763755200) | $4 | ✅ | UP | +$4 | $441 | - |
| 50 | 20:15 | [btc-updown-15m-1763756100](https://polymarket.com/event/btc-updown-15m-1763756100) | $1 | ❌ | DOWN | $-1 | $440 | L1 |
| 51 | 20:30 | [btc-updown-15m-1763757000](https://polymarket.com/event/btc-updown-15m-1763757000) | $2 | ✅ | UP | +$2 | $442 | - |
| 52 | 20:45 | [btc-updown-15m-1763757900](https://polymarket.com/event/btc-updown-15m-1763757900) | $1 | ✅ | UP | +$1 | $443 | - |
| 53 | 21:00 | [btc-updown-15m-1763758800](https://polymarket.com/event/btc-updown-15m-1763758800) | $1 | ✅ | UP | +$1 | $444 | - |
| 54 | 21:15 | [btc-updown-15m-1763759700](https://polymarket.com/event/btc-updown-15m-1763759700) | $1 | ✅ | UP | +$1 | $445 | - |
| 55 | 21:30 | [btc-updown-15m-1763760600](https://polymarket.com/event/btc-updown-15m-1763760600) | $1 | ✅ | UP | +$1 | $446 | - |
| 56 | 21:45 | [btc-updown-15m-1763761500](https://polymarket.com/event/btc-updown-15m-1763761500) | $1 | ❌ | DOWN | $-1 | $445 | L1 |
| 57 | 22:00 | [btc-updown-15m-1763762400](https://polymarket.com/event/btc-updown-15m-1763762400) | $2 | ❌ | DOWN | $-2 | $443 | L2 |
| 58 | 22:15 | [btc-updown-15m-1763763300](https://polymarket.com/event/btc-updown-15m-1763763300) | $4 | ❌ | DOWN | $-4 | $439 | L3 |
| 59 | 22:30 | [btc-updown-15m-1763764200](https://polymarket.com/event/btc-updown-15m-1763764200) | $8 | ❌ | DOWN | $-8 | $431 | L4 |
| 60 | 22:45 | [btc-updown-15m-1763765100](https://polymarket.com/event/btc-updown-15m-1763765100) | $16 | ❌ | DOWN | $-16 | $415 | L5 |
| - | 23:00 | [btc-updown-15m-1763766000](https://polymarket.com/event/btc-updown-15m-1763766000) | - | ⏭️ SKIP | UP | - | $415 | - |
| - | 23:15 | [btc-updown-15m-1763766900](https://polymarket.com/event/btc-updown-15m-1763766900) | - | ⏭️ SKIP | UP | - | $415 | - |
| - | 23:30 | [btc-updown-15m-1763767800](https://polymarket.com/event/btc-updown-15m-1763767800) | - | ⏭️ SKIP | UP | - | $415 | - |
| 61 | 23:45 | [btc-updown-15m-1763768700](https://polymarket.com/event/btc-updown-15m-1763768700) | $32 | ❌ | DOWN | $-32 | $383 | L6 |

### 2025-11-22
**Summary:** 84 trades | 43 wins | 41 losses | Max Bet: $128 | Profit: +$91

**Skip Events (3):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:45 | 7 | $127 | $128 | 01:45 |
| 08:45 | 5 | $31 | $32 | 09:45 |
| 09:45 | 6 | $63 | $64 | 10:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| - | 00:00 | [btc-updown-15m-1763769600](https://polymarket.com/event/btc-updown-15m-1763769600) | - | ⏭️ SKIP | UP | - | $383 | - |
| - | 00:15 | [btc-updown-15m-1763770500](https://polymarket.com/event/btc-updown-15m-1763770500) | - | ⏭️ SKIP | DOWN | - | $383 | - |
| - | 00:30 | [btc-updown-15m-1763771400](https://polymarket.com/event/btc-updown-15m-1763771400) | - | ⏭️ SKIP | UP | - | $383 | - |
| 1 | 00:45 | [btc-updown-15m-1763772300](https://polymarket.com/event/btc-updown-15m-1763772300) | $64 | ❌ | DOWN | $-64 | $319 | L7 |
| - | 01:00 | [btc-updown-15m-1763773200](https://polymarket.com/event/btc-updown-15m-1763773200) | - | ⏭️ SKIP | UP | - | $319 | - |
| - | 01:15 | [btc-updown-15m-1763774100](https://polymarket.com/event/btc-updown-15m-1763774100) | - | ⏭️ SKIP | UP | - | $319 | - |
| - | 01:30 | [btc-updown-15m-1763775000](https://polymarket.com/event/btc-updown-15m-1763775000) | - | ⏭️ SKIP | UP | - | $319 | - |
| 2 | 01:45 | [btc-updown-15m-1763775900](https://polymarket.com/event/btc-updown-15m-1763775900) | $128 | ✅ | UP | +$128 | $447 | - |
| 3 | 02:00 | [btc-updown-15m-1763776800](https://polymarket.com/event/btc-updown-15m-1763776800) | $1 | ❌ | DOWN | $-1 | $446 | L1 |
| 4 | 02:15 | [btc-updown-15m-1763777700](https://polymarket.com/event/btc-updown-15m-1763777700) | $2 | ❌ | DOWN | $-2 | $444 | L2 |
| 5 | 02:30 | [btc-updown-15m-1763778600](https://polymarket.com/event/btc-updown-15m-1763778600) | $4 | ❌ | DOWN | $-4 | $440 | L3 |
| 6 | 02:45 | [btc-updown-15m-1763779500](https://polymarket.com/event/btc-updown-15m-1763779500) | $8 | ✅ | UP | +$8 | $448 | - |
| 7 | 03:00 | [btc-updown-15m-1763780400](https://polymarket.com/event/btc-updown-15m-1763780400) | $1 | ✅ | UP | +$1 | $449 | - |
| 8 | 03:15 | [btc-updown-15m-1763781300](https://polymarket.com/event/btc-updown-15m-1763781300) | $1 | ❌ | DOWN | $-1 | $448 | L1 |
| 9 | 03:30 | [btc-updown-15m-1763782200](https://polymarket.com/event/btc-updown-15m-1763782200) | $2 | ❌ | DOWN | $-2 | $446 | L2 |
| 10 | 03:45 | [btc-updown-15m-1763783100](https://polymarket.com/event/btc-updown-15m-1763783100) | $4 | ✅ | UP | +$4 | $450 | - |
| 11 | 04:00 | [btc-updown-15m-1763784000](https://polymarket.com/event/btc-updown-15m-1763784000) | $1 | ❌ | DOWN | $-1 | $449 | L1 |
| 12 | 04:15 | [btc-updown-15m-1763784900](https://polymarket.com/event/btc-updown-15m-1763784900) | $2 | ❌ | DOWN | $-2 | $447 | L2 |
| 13 | 04:30 | [btc-updown-15m-1763785800](https://polymarket.com/event/btc-updown-15m-1763785800) | $4 | ❌ | DOWN | $-4 | $443 | L3 |
| 14 | 04:45 | [btc-updown-15m-1763786700](https://polymarket.com/event/btc-updown-15m-1763786700) | $8 | ✅ | UP | +$8 | $451 | - |
| 15 | 05:00 | [btc-updown-15m-1763787600](https://polymarket.com/event/btc-updown-15m-1763787600) | $1 | ❌ | DOWN | $-1 | $450 | L1 |
| 16 | 05:15 | [btc-updown-15m-1763788500](https://polymarket.com/event/btc-updown-15m-1763788500) | $2 | ❌ | DOWN | $-2 | $448 | L2 |
| 17 | 05:30 | [btc-updown-15m-1763789400](https://polymarket.com/event/btc-updown-15m-1763789400) | $4 | ❌ | DOWN | $-4 | $444 | L3 |
| 18 | 05:45 | [btc-updown-15m-1763790300](https://polymarket.com/event/btc-updown-15m-1763790300) | $8 | ✅ | UP | +$8 | $452 | - |
| 19 | 06:00 | [btc-updown-15m-1763791200](https://polymarket.com/event/btc-updown-15m-1763791200) | $1 | ❌ | DOWN | $-1 | $451 | L1 |
| 20 | 06:15 | [btc-updown-15m-1763792100](https://polymarket.com/event/btc-updown-15m-1763792100) | $2 | ✅ | UP | +$2 | $453 | - |
| 21 | 06:30 | [btc-updown-15m-1763793000](https://polymarket.com/event/btc-updown-15m-1763793000) | $1 | ✅ | UP | +$1 | $454 | - |
| 22 | 06:45 | [btc-updown-15m-1763793900](https://polymarket.com/event/btc-updown-15m-1763793900) | $1 | ✅ | UP | +$1 | $455 | - |
| 23 | 07:00 | [btc-updown-15m-1763794800](https://polymarket.com/event/btc-updown-15m-1763794800) | $1 | ❌ | DOWN | $-1 | $454 | L1 |
| 24 | 07:15 | [btc-updown-15m-1763795700](https://polymarket.com/event/btc-updown-15m-1763795700) | $2 | ✅ | UP | +$2 | $456 | - |
| 25 | 07:30 | [btc-updown-15m-1763796600](https://polymarket.com/event/btc-updown-15m-1763796600) | $1 | ✅ | UP | +$1 | $457 | - |
| 26 | 07:45 | [btc-updown-15m-1763797500](https://polymarket.com/event/btc-updown-15m-1763797500) | $1 | ❌ | DOWN | $-1 | $456 | L1 |
| 27 | 08:00 | [btc-updown-15m-1763798400](https://polymarket.com/event/btc-updown-15m-1763798400) | $2 | ❌ | DOWN | $-2 | $454 | L2 |
| 28 | 08:15 | [btc-updown-15m-1763799300](https://polymarket.com/event/btc-updown-15m-1763799300) | $4 | ❌ | DOWN | $-4 | $450 | L3 |
| 29 | 08:30 | [btc-updown-15m-1763800200](https://polymarket.com/event/btc-updown-15m-1763800200) | $8 | ❌ | DOWN | $-8 | $442 | L4 |
| 30 | 08:45 | [btc-updown-15m-1763801100](https://polymarket.com/event/btc-updown-15m-1763801100) | $16 | ❌ | DOWN | $-16 | $426 | L5 |
| - | 09:00 | [btc-updown-15m-1763802000](https://polymarket.com/event/btc-updown-15m-1763802000) | - | ⏭️ SKIP | UP | - | $426 | - |
| - | 09:15 | [btc-updown-15m-1763802900](https://polymarket.com/event/btc-updown-15m-1763802900) | - | ⏭️ SKIP | DOWN | - | $426 | - |
| - | 09:30 | [btc-updown-15m-1763803800](https://polymarket.com/event/btc-updown-15m-1763803800) | - | ⏭️ SKIP | DOWN | - | $426 | - |
| 31 | 09:45 | [btc-updown-15m-1763804700](https://polymarket.com/event/btc-updown-15m-1763804700) | $32 | ❌ | DOWN | $-32 | $394 | L6 |
| - | 10:00 | [btc-updown-15m-1763805600](https://polymarket.com/event/btc-updown-15m-1763805600) | - | ⏭️ SKIP | UP | - | $394 | - |
| - | 10:15 | [btc-updown-15m-1763806500](https://polymarket.com/event/btc-updown-15m-1763806500) | - | ⏭️ SKIP | DOWN | - | $394 | - |
| - | 10:30 | [btc-updown-15m-1763807400](https://polymarket.com/event/btc-updown-15m-1763807400) | - | ⏭️ SKIP | DOWN | - | $394 | - |
| 32 | 10:45 | [btc-updown-15m-1763808300](https://polymarket.com/event/btc-updown-15m-1763808300) | $64 | ✅ | UP | +$64 | $458 | - |
| 33 | 11:00 | [btc-updown-15m-1763809200](https://polymarket.com/event/btc-updown-15m-1763809200) | $1 | ✅ | UP | +$1 | $459 | - |
| 34 | 11:15 | [btc-updown-15m-1763810100](https://polymarket.com/event/btc-updown-15m-1763810100) | $1 | ✅ | UP | +$1 | $460 | - |
| 35 | 11:30 | [btc-updown-15m-1763811000](https://polymarket.com/event/btc-updown-15m-1763811000) | $1 | ✅ | UP | +$1 | $461 | - |
| 36 | 11:45 | [btc-updown-15m-1763811900](https://polymarket.com/event/btc-updown-15m-1763811900) | $1 | ❌ | DOWN | $-1 | $460 | L1 |
| 37 | 12:00 | [btc-updown-15m-1763812800](https://polymarket.com/event/btc-updown-15m-1763812800) | $2 | ❌ | DOWN | $-2 | $458 | L2 |
| 38 | 12:15 | [btc-updown-15m-1763813700](https://polymarket.com/event/btc-updown-15m-1763813700) | $4 | ❌ | DOWN | $-4 | $454 | L3 |
| 39 | 12:30 | [btc-updown-15m-1763814600](https://polymarket.com/event/btc-updown-15m-1763814600) | $8 | ✅ | UP | +$8 | $462 | - |
| 40 | 12:45 | [btc-updown-15m-1763815500](https://polymarket.com/event/btc-updown-15m-1763815500) | $1 | ✅ | UP | +$1 | $463 | - |
| 41 | 13:00 | [btc-updown-15m-1763816400](https://polymarket.com/event/btc-updown-15m-1763816400) | $1 | ✅ | UP | +$1 | $464 | - |
| 42 | 13:15 | [btc-updown-15m-1763817300](https://polymarket.com/event/btc-updown-15m-1763817300) | $1 | ❌ | DOWN | $-1 | $463 | L1 |
| 43 | 13:30 | [btc-updown-15m-1763818200](https://polymarket.com/event/btc-updown-15m-1763818200) | $2 | ✅ | UP | +$2 | $465 | - |
| 44 | 13:45 | [btc-updown-15m-1763819100](https://polymarket.com/event/btc-updown-15m-1763819100) | $1 | ✅ | UP | +$1 | $466 | - |
| 45 | 14:00 | [btc-updown-15m-1763820000](https://polymarket.com/event/btc-updown-15m-1763820000) | $1 | ✅ | UP | +$1 | $467 | - |
| 46 | 14:15 | [btc-updown-15m-1763820900](https://polymarket.com/event/btc-updown-15m-1763820900) | $1 | ✅ | UP | +$1 | $468 | - |
| 47 | 14:30 | [btc-updown-15m-1763821800](https://polymarket.com/event/btc-updown-15m-1763821800) | $1 | ❌ | DOWN | $-1 | $467 | L1 |
| 48 | 14:45 | [btc-updown-15m-1763822700](https://polymarket.com/event/btc-updown-15m-1763822700) | $2 | ✅ | UP | +$2 | $469 | - |
| 49 | 15:00 | [btc-updown-15m-1763823600](https://polymarket.com/event/btc-updown-15m-1763823600) | $1 | ❌ | DOWN | $-1 | $468 | L1 |
| 50 | 15:15 | [btc-updown-15m-1763824500](https://polymarket.com/event/btc-updown-15m-1763824500) | $2 | ✅ | UP | +$2 | $470 | - |
| 51 | 15:30 | [btc-updown-15m-1763825400](https://polymarket.com/event/btc-updown-15m-1763825400) | $1 | ❌ | DOWN | $-1 | $469 | L1 |
| 52 | 15:45 | [btc-updown-15m-1763826300](https://polymarket.com/event/btc-updown-15m-1763826300) | $2 | ✅ | UP | +$2 | $471 | - |
| 53 | 16:00 | [btc-updown-15m-1763827200](https://polymarket.com/event/btc-updown-15m-1763827200) | $1 | ✅ | UP | +$1 | $472 | - |
| 54 | 16:15 | [btc-updown-15m-1763828100](https://polymarket.com/event/btc-updown-15m-1763828100) | $1 | ✅ | UP | +$1 | $473 | - |
| 55 | 16:30 | [btc-updown-15m-1763829000](https://polymarket.com/event/btc-updown-15m-1763829000) | $1 | ✅ | UP | +$1 | $474 | - |
| 56 | 16:45 | [btc-updown-15m-1763829900](https://polymarket.com/event/btc-updown-15m-1763829900) | $1 | ❌ | DOWN | $-1 | $473 | L1 |
| 57 | 17:00 | [btc-updown-15m-1763830800](https://polymarket.com/event/btc-updown-15m-1763830800) | $2 | ❌ | DOWN | $-2 | $471 | L2 |
| 58 | 17:15 | [btc-updown-15m-1763831700](https://polymarket.com/event/btc-updown-15m-1763831700) | $4 | ✅ | UP | +$4 | $475 | - |
| 59 | 17:30 | [btc-updown-15m-1763832600](https://polymarket.com/event/btc-updown-15m-1763832600) | $1 | ❌ | DOWN | $-1 | $474 | L1 |
| 60 | 17:45 | [btc-updown-15m-1763833500](https://polymarket.com/event/btc-updown-15m-1763833500) | $2 | ✅ | UP | +$2 | $476 | - |
| 61 | 18:00 | [btc-updown-15m-1763834400](https://polymarket.com/event/btc-updown-15m-1763834400) | $1 | ✅ | UP | +$1 | $477 | - |
| 62 | 18:15 | [btc-updown-15m-1763835300](https://polymarket.com/event/btc-updown-15m-1763835300) | $1 | ❌ | DOWN | $-1 | $476 | L1 |
| 63 | 18:30 | [btc-updown-15m-1763836200](https://polymarket.com/event/btc-updown-15m-1763836200) | $2 | ❌ | DOWN | $-2 | $474 | L2 |
| 64 | 18:45 | [btc-updown-15m-1763837100](https://polymarket.com/event/btc-updown-15m-1763837100) | $4 | ✅ | UP | +$4 | $478 | - |
| 65 | 19:00 | [btc-updown-15m-1763838000](https://polymarket.com/event/btc-updown-15m-1763838000) | $1 | ✅ | UP | +$1 | $479 | - |
| 66 | 19:15 | [btc-updown-15m-1763838900](https://polymarket.com/event/btc-updown-15m-1763838900) | $1 | ❌ | DOWN | $-1 | $478 | L1 |
| 67 | 19:30 | [btc-updown-15m-1763839800](https://polymarket.com/event/btc-updown-15m-1763839800) | $2 | ❌ | DOWN | $-2 | $476 | L2 |
| 68 | 19:45 | [btc-updown-15m-1763840700](https://polymarket.com/event/btc-updown-15m-1763840700) | $4 | ✅ | UP | +$4 | $480 | - |
| 69 | 20:00 | [btc-updown-15m-1763841600](https://polymarket.com/event/btc-updown-15m-1763841600) | $1 | ✅ | UP | +$1 | $481 | - |
| 70 | 20:15 | [btc-updown-15m-1763842500](https://polymarket.com/event/btc-updown-15m-1763842500) | $1 | ❌ | DOWN | $-1 | $480 | L1 |
| 71 | 20:30 | [btc-updown-15m-1763843400](https://polymarket.com/event/btc-updown-15m-1763843400) | $2 | ❌ | DOWN | $-2 | $478 | L2 |
| 72 | 20:45 | [btc-updown-15m-1763844300](https://polymarket.com/event/btc-updown-15m-1763844300) | $4 | ✅ | UP | +$4 | $482 | - |
| 73 | 21:00 | [btc-updown-15m-1763845200](https://polymarket.com/event/btc-updown-15m-1763845200) | $1 | ❌ | DOWN | $-1 | $481 | L1 |
| 74 | 21:15 | [btc-updown-15m-1763846100](https://polymarket.com/event/btc-updown-15m-1763846100) | $2 | ✅ | UP | +$2 | $483 | - |
| 75 | 21:30 | [btc-updown-15m-1763847000](https://polymarket.com/event/btc-updown-15m-1763847000) | $1 | ✅ | UP | +$1 | $484 | - |
| 76 | 21:45 | [btc-updown-15m-1763847900](https://polymarket.com/event/btc-updown-15m-1763847900) | $1 | ✅ | UP | +$1 | $485 | - |
| 77 | 22:00 | [btc-updown-15m-1763848800](https://polymarket.com/event/btc-updown-15m-1763848800) | $1 | ✅ | UP | +$1 | $486 | - |
| 78 | 22:15 | [btc-updown-15m-1763849700](https://polymarket.com/event/btc-updown-15m-1763849700) | $1 | ✅ | UP | +$1 | $487 | - |
| 79 | 22:30 | [btc-updown-15m-1763850600](https://polymarket.com/event/btc-updown-15m-1763850600) | $1 | ✅ | UP | +$1 | $488 | - |
| 80 | 22:45 | [btc-updown-15m-1763851500](https://polymarket.com/event/btc-updown-15m-1763851500) | $1 | ✅ | UP | +$1 | $489 | - |
| 81 | 23:00 | [btc-updown-15m-1763852400](https://polymarket.com/event/btc-updown-15m-1763852400) | $1 | ❌ | DOWN | $-1 | $488 | L1 |
| 82 | 23:15 | [btc-updown-15m-1763853300](https://polymarket.com/event/btc-updown-15m-1763853300) | $2 | ❌ | DOWN | $-2 | $486 | L2 |
| 83 | 23:30 | [btc-updown-15m-1763854200](https://polymarket.com/event/btc-updown-15m-1763854200) | $4 | ❌ | DOWN | $-4 | $482 | L3 |
| 84 | 23:45 | [btc-updown-15m-1763855100](https://polymarket.com/event/btc-updown-15m-1763855100) | $8 | ❌ | DOWN | $-8 | $474 | L4 |

### 2025-11-23
**Summary:** 93 trades | 47 wins | 46 losses | Max Bet: $32 | Profit: +$47

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 07:00 | 5 | $31 | $32 | 08:00 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763856000](https://polymarket.com/event/btc-updown-15m-1763856000) | $16 | ✅ | UP | +$16 | $490 | - |
| 2 | 00:15 | [btc-updown-15m-1763856900](https://polymarket.com/event/btc-updown-15m-1763856900) | $1 | ❌ | DOWN | $-1 | $489 | L1 |
| 3 | 00:30 | [btc-updown-15m-1763857800](https://polymarket.com/event/btc-updown-15m-1763857800) | $2 | ❌ | DOWN | $-2 | $487 | L2 |
| 4 | 00:45 | [btc-updown-15m-1763858700](https://polymarket.com/event/btc-updown-15m-1763858700) | $4 | ❌ | DOWN | $-4 | $483 | L3 |
| 5 | 01:00 | [btc-updown-15m-1763859600](https://polymarket.com/event/btc-updown-15m-1763859600) | $8 | ✅ | UP | +$8 | $491 | - |
| 6 | 01:15 | [btc-updown-15m-1763860500](https://polymarket.com/event/btc-updown-15m-1763860500) | $1 | ✅ | UP | +$1 | $492 | - |
| 7 | 01:30 | [btc-updown-15m-1763861400](https://polymarket.com/event/btc-updown-15m-1763861400) | $1 | ✅ | UP | +$1 | $493 | - |
| 8 | 01:45 | [btc-updown-15m-1763862300](https://polymarket.com/event/btc-updown-15m-1763862300) | $1 | ✅ | UP | +$1 | $494 | - |
| 9 | 02:00 | [btc-updown-15m-1763863200](https://polymarket.com/event/btc-updown-15m-1763863200) | $1 | ❌ | DOWN | $-1 | $493 | L1 |
| 10 | 02:15 | [btc-updown-15m-1763864100](https://polymarket.com/event/btc-updown-15m-1763864100) | $2 | ✅ | UP | +$2 | $495 | - |
| 11 | 02:30 | [btc-updown-15m-1763865000](https://polymarket.com/event/btc-updown-15m-1763865000) | $1 | ✅ | UP | +$1 | $496 | - |
| 12 | 02:45 | [btc-updown-15m-1763865900](https://polymarket.com/event/btc-updown-15m-1763865900) | $1 | ❌ | DOWN | $-1 | $495 | L1 |
| 13 | 03:00 | [btc-updown-15m-1763866800](https://polymarket.com/event/btc-updown-15m-1763866800) | $2 | ❌ | DOWN | $-2 | $493 | L2 |
| 14 | 03:15 | [btc-updown-15m-1763867700](https://polymarket.com/event/btc-updown-15m-1763867700) | $4 | ✅ | UP | +$4 | $497 | - |
| 15 | 03:30 | [btc-updown-15m-1763868600](https://polymarket.com/event/btc-updown-15m-1763868600) | $1 | ✅ | UP | +$1 | $498 | - |
| 16 | 03:45 | [btc-updown-15m-1763869500](https://polymarket.com/event/btc-updown-15m-1763869500) | $1 | ✅ | UP | +$1 | $499 | - |
| 17 | 04:00 | [btc-updown-15m-1763870400](https://polymarket.com/event/btc-updown-15m-1763870400) | $1 | ✅ | UP | +$1 | $500 | - |
| 18 | 04:15 | [btc-updown-15m-1763871300](https://polymarket.com/event/btc-updown-15m-1763871300) | $1 | ✅ | UP | +$1 | $501 | - |
| 19 | 04:30 | [btc-updown-15m-1763872200](https://polymarket.com/event/btc-updown-15m-1763872200) | $1 | ✅ | UP | +$1 | $502 | - |
| 20 | 04:45 | [btc-updown-15m-1763873100](https://polymarket.com/event/btc-updown-15m-1763873100) | $1 | ❌ | DOWN | $-1 | $501 | L1 |
| 21 | 05:00 | [btc-updown-15m-1763874000](https://polymarket.com/event/btc-updown-15m-1763874000) | $2 | ❌ | DOWN | $-2 | $499 | L2 |
| 22 | 05:15 | [btc-updown-15m-1763874900](https://polymarket.com/event/btc-updown-15m-1763874900) | $4 | ❌ | DOWN | $-4 | $495 | L3 |
| 23 | 05:30 | [btc-updown-15m-1763875800](https://polymarket.com/event/btc-updown-15m-1763875800) | $8 | ❌ | DOWN | $-8 | $487 | L4 |
| 24 | 05:45 | [btc-updown-15m-1763876700](https://polymarket.com/event/btc-updown-15m-1763876700) | $16 | ✅ | UP | +$16 | $503 | - |
| 25 | 06:00 | [btc-updown-15m-1763877600](https://polymarket.com/event/btc-updown-15m-1763877600) | $1 | ❌ | DOWN | $-1 | $502 | L1 |
| 26 | 06:15 | [btc-updown-15m-1763878500](https://polymarket.com/event/btc-updown-15m-1763878500) | $2 | ❌ | DOWN | $-2 | $500 | L2 |
| 27 | 06:30 | [btc-updown-15m-1763879400](https://polymarket.com/event/btc-updown-15m-1763879400) | $4 | ❌ | DOWN | $-4 | $496 | L3 |
| 28 | 06:45 | [btc-updown-15m-1763880300](https://polymarket.com/event/btc-updown-15m-1763880300) | $8 | ❌ | DOWN | $-8 | $488 | L4 |
| 29 | 07:00 | [btc-updown-15m-1763881200](https://polymarket.com/event/btc-updown-15m-1763881200) | $16 | ❌ | DOWN | $-16 | $472 | L5 |
| - | 07:15 | [btc-updown-15m-1763882100](https://polymarket.com/event/btc-updown-15m-1763882100) | - | ⏭️ SKIP | DOWN | - | $472 | - |
| - | 07:30 | [btc-updown-15m-1763883000](https://polymarket.com/event/btc-updown-15m-1763883000) | - | ⏭️ SKIP | UP | - | $472 | - |
| - | 07:45 | [btc-updown-15m-1763883900](https://polymarket.com/event/btc-updown-15m-1763883900) | - | ⏭️ SKIP | UP | - | $472 | - |
| 30 | 08:00 | [btc-updown-15m-1763884800](https://polymarket.com/event/btc-updown-15m-1763884800) | $32 | ✅ | UP | +$32 | $504 | - |
| 31 | 08:15 | [btc-updown-15m-1763885700](https://polymarket.com/event/btc-updown-15m-1763885700) | $1 | ❌ | DOWN | $-1 | $503 | L1 |
| 32 | 08:30 | [btc-updown-15m-1763886600](https://polymarket.com/event/btc-updown-15m-1763886600) | $2 | ❌ | DOWN | $-2 | $501 | L2 |
| 33 | 08:45 | [btc-updown-15m-1763887500](https://polymarket.com/event/btc-updown-15m-1763887500) | $4 | ✅ | UP | +$4 | $505 | - |
| 34 | 09:00 | [btc-updown-15m-1763888400](https://polymarket.com/event/btc-updown-15m-1763888400) | $1 | ✅ | UP | +$1 | $506 | - |
| 35 | 09:15 | [btc-updown-15m-1763889300](https://polymarket.com/event/btc-updown-15m-1763889300) | $1 | ❌ | DOWN | $-1 | $505 | L1 |
| 36 | 09:30 | [btc-updown-15m-1763890200](https://polymarket.com/event/btc-updown-15m-1763890200) | $2 | ✅ | UP | +$2 | $507 | - |
| 37 | 09:45 | [btc-updown-15m-1763891100](https://polymarket.com/event/btc-updown-15m-1763891100) | $1 | ❌ | DOWN | $-1 | $506 | L1 |
| 38 | 10:00 | [btc-updown-15m-1763892000](https://polymarket.com/event/btc-updown-15m-1763892000) | $2 | ❌ | DOWN | $-2 | $504 | L2 |
| 39 | 10:15 | [btc-updown-15m-1763892900](https://polymarket.com/event/btc-updown-15m-1763892900) | $4 | ❌ | DOWN | $-4 | $500 | L3 |
| 40 | 10:30 | [btc-updown-15m-1763893800](https://polymarket.com/event/btc-updown-15m-1763893800) | $8 | ✅ | UP | +$8 | $508 | - |
| 41 | 10:45 | [btc-updown-15m-1763894700](https://polymarket.com/event/btc-updown-15m-1763894700) | $1 | ❌ | DOWN | $-1 | $507 | L1 |
| 42 | 11:00 | [btc-updown-15m-1763895600](https://polymarket.com/event/btc-updown-15m-1763895600) | $2 | ❌ | DOWN | $-2 | $505 | L2 |
| 43 | 11:15 | [btc-updown-15m-1763896500](https://polymarket.com/event/btc-updown-15m-1763896500) | $4 | ✅ | UP | +$4 | $509 | - |
| 44 | 11:30 | [btc-updown-15m-1763897400](https://polymarket.com/event/btc-updown-15m-1763897400) | $1 | ✅ | UP | +$1 | $510 | - |
| 45 | 11:45 | [btc-updown-15m-1763898300](https://polymarket.com/event/btc-updown-15m-1763898300) | $1 | ✅ | UP | +$1 | $511 | - |
| 46 | 12:00 | [btc-updown-15m-1763899200](https://polymarket.com/event/btc-updown-15m-1763899200) | $1 | ✅ | UP | +$1 | $512 | - |
| 47 | 12:15 | [btc-updown-15m-1763900100](https://polymarket.com/event/btc-updown-15m-1763900100) | $1 | ✅ | UP | +$1 | $513 | - |
| 48 | 12:30 | [btc-updown-15m-1763901000](https://polymarket.com/event/btc-updown-15m-1763901000) | $1 | ❌ | DOWN | $-1 | $512 | L1 |
| 49 | 12:45 | [btc-updown-15m-1763901900](https://polymarket.com/event/btc-updown-15m-1763901900) | $2 | ❌ | DOWN | $-2 | $510 | L2 |
| 50 | 13:00 | [btc-updown-15m-1763902800](https://polymarket.com/event/btc-updown-15m-1763902800) | $4 | ❌ | DOWN | $-4 | $506 | L3 |
| 51 | 13:15 | [btc-updown-15m-1763903700](https://polymarket.com/event/btc-updown-15m-1763903700) | $8 | ✅ | UP | +$8 | $514 | - |
| 52 | 13:30 | [btc-updown-15m-1763904600](https://polymarket.com/event/btc-updown-15m-1763904600) | $1 | ✅ | UP | +$1 | $515 | - |
| 53 | 13:45 | [btc-updown-15m-1763905500](https://polymarket.com/event/btc-updown-15m-1763905500) | $1 | ✅ | UP | +$1 | $516 | - |
| 54 | 14:00 | [btc-updown-15m-1763906400](https://polymarket.com/event/btc-updown-15m-1763906400) | $1 | ❌ | DOWN | $-1 | $515 | L1 |
| 55 | 14:15 | [btc-updown-15m-1763907300](https://polymarket.com/event/btc-updown-15m-1763907300) | $2 | ❌ | DOWN | $-2 | $513 | L2 |
| 56 | 14:30 | [btc-updown-15m-1763908200](https://polymarket.com/event/btc-updown-15m-1763908200) | $4 | ❌ | DOWN | $-4 | $509 | L3 |
| 57 | 14:45 | [btc-updown-15m-1763909100](https://polymarket.com/event/btc-updown-15m-1763909100) | $8 | ❌ | DOWN | $-8 | $501 | L4 |
| 58 | 15:00 | [btc-updown-15m-1763910000](https://polymarket.com/event/btc-updown-15m-1763910000) | $16 | ✅ | UP | +$16 | $517 | - |
| 59 | 15:15 | [btc-updown-15m-1763910900](https://polymarket.com/event/btc-updown-15m-1763910900) | $1 | ❌ | DOWN | $-1 | $516 | L1 |
| 60 | 15:30 | [btc-updown-15m-1763911800](https://polymarket.com/event/btc-updown-15m-1763911800) | $2 | ✅ | UP | +$2 | $518 | - |
| 61 | 15:45 | [btc-updown-15m-1763912700](https://polymarket.com/event/btc-updown-15m-1763912700) | $1 | ✅ | UP | +$1 | $519 | - |
| 62 | 16:00 | [btc-updown-15m-1763913600](https://polymarket.com/event/btc-updown-15m-1763913600) | $1 | ✅ | UP | +$1 | $520 | - |
| 63 | 16:15 | [btc-updown-15m-1763914500](https://polymarket.com/event/btc-updown-15m-1763914500) | $1 | ❌ | DOWN | $-1 | $519 | L1 |
| 64 | 16:30 | [btc-updown-15m-1763915400](https://polymarket.com/event/btc-updown-15m-1763915400) | $2 | ✅ | UP | +$2 | $521 | - |
| 65 | 16:45 | [btc-updown-15m-1763916300](https://polymarket.com/event/btc-updown-15m-1763916300) | $1 | ❌ | DOWN | $-1 | $520 | L1 |
| 66 | 17:00 | [btc-updown-15m-1763917200](https://polymarket.com/event/btc-updown-15m-1763917200) | $2 | ✅ | UP | +$2 | $522 | - |
| 67 | 17:15 | [btc-updown-15m-1763918100](https://polymarket.com/event/btc-updown-15m-1763918100) | $1 | ✅ | UP | +$1 | $523 | - |
| 68 | 17:30 | [btc-updown-15m-1763919000](https://polymarket.com/event/btc-updown-15m-1763919000) | $1 | ❌ | DOWN | $-1 | $522 | L1 |
| 69 | 17:45 | [btc-updown-15m-1763919900](https://polymarket.com/event/btc-updown-15m-1763919900) | $2 | ❌ | DOWN | $-2 | $520 | L2 |
| 70 | 18:00 | [btc-updown-15m-1763920800](https://polymarket.com/event/btc-updown-15m-1763920800) | $4 | ✅ | UP | +$4 | $524 | - |
| 71 | 18:15 | [btc-updown-15m-1763921700](https://polymarket.com/event/btc-updown-15m-1763921700) | $1 | ✅ | UP | +$1 | $525 | - |
| 72 | 18:30 | [btc-updown-15m-1763922600](https://polymarket.com/event/btc-updown-15m-1763922600) | $1 | ✅ | UP | +$1 | $526 | - |
| 73 | 18:45 | [btc-updown-15m-1763923500](https://polymarket.com/event/btc-updown-15m-1763923500) | $1 | ❌ | DOWN | $-1 | $525 | L1 |
| 74 | 19:00 | [btc-updown-15m-1763924400](https://polymarket.com/event/btc-updown-15m-1763924400) | $2 | ✅ | UP | +$2 | $527 | - |
| 75 | 19:15 | [btc-updown-15m-1763925300](https://polymarket.com/event/btc-updown-15m-1763925300) | $1 | ✅ | UP | +$1 | $528 | - |
| 76 | 19:30 | [btc-updown-15m-1763926200](https://polymarket.com/event/btc-updown-15m-1763926200) | $1 | ✅ | UP | +$1 | $529 | - |
| 77 | 19:45 | [btc-updown-15m-1763927100](https://polymarket.com/event/btc-updown-15m-1763927100) | $1 | ❌ | DOWN | $-1 | $528 | L1 |
| 78 | 20:00 | [btc-updown-15m-1763928000](https://polymarket.com/event/btc-updown-15m-1763928000) | $2 | ✅ | UP | +$2 | $530 | - |
| 79 | 20:15 | [btc-updown-15m-1763928900](https://polymarket.com/event/btc-updown-15m-1763928900) | $1 | ✅ | UP | +$1 | $531 | - |
| 80 | 20:30 | [btc-updown-15m-1763929800](https://polymarket.com/event/btc-updown-15m-1763929800) | $1 | ❌ | DOWN | $-1 | $530 | L1 |
| 81 | 20:45 | [btc-updown-15m-1763930700](https://polymarket.com/event/btc-updown-15m-1763930700) | $2 | ❌ | DOWN | $-2 | $528 | L2 |
| 82 | 21:00 | [btc-updown-15m-1763931600](https://polymarket.com/event/btc-updown-15m-1763931600) | $4 | ❌ | DOWN | $-4 | $524 | L3 |
| 83 | 21:15 | [btc-updown-15m-1763932500](https://polymarket.com/event/btc-updown-15m-1763932500) | $8 | ✅ | UP | +$8 | $532 | - |
| 84 | 21:30 | [btc-updown-15m-1763933400](https://polymarket.com/event/btc-updown-15m-1763933400) | $1 | ✅ | UP | +$1 | $533 | - |
| 85 | 21:45 | [btc-updown-15m-1763934300](https://polymarket.com/event/btc-updown-15m-1763934300) | $1 | ✅ | UP | +$1 | $534 | - |
| 86 | 22:00 | [btc-updown-15m-1763935200](https://polymarket.com/event/btc-updown-15m-1763935200) | $1 | ❌ | DOWN | $-1 | $533 | L1 |
| 87 | 22:15 | [btc-updown-15m-1763936100](https://polymarket.com/event/btc-updown-15m-1763936100) | $2 | ✅ | UP | +$2 | $535 | - |
| 88 | 22:30 | [btc-updown-15m-1763937000](https://polymarket.com/event/btc-updown-15m-1763937000) | $1 | ❌ | DOWN | $-1 | $534 | L1 |
| 89 | 22:45 | [btc-updown-15m-1763937900](https://polymarket.com/event/btc-updown-15m-1763937900) | $2 | ✅ | UP | +$2 | $536 | - |
| 90 | 23:00 | [btc-updown-15m-1763938800](https://polymarket.com/event/btc-updown-15m-1763938800) | $1 | ❌ | DOWN | $-1 | $535 | L1 |
| 91 | 23:15 | [btc-updown-15m-1763939700](https://polymarket.com/event/btc-updown-15m-1763939700) | $2 | ❌ | DOWN | $-2 | $533 | L2 |
| 92 | 23:30 | [btc-updown-15m-1763940600](https://polymarket.com/event/btc-updown-15m-1763940600) | $4 | ❌ | DOWN | $-4 | $529 | L3 |
| 93 | 23:45 | [btc-updown-15m-1763941500](https://polymarket.com/event/btc-updown-15m-1763941500) | $8 | ❌ | DOWN | $-8 | $521 | L4 |

### 2025-11-24
**Summary:** 93 trades | 45 wins | 48 losses | Max Bet: $32 | Profit: +$57

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:00 | 5 | $31 | $32 | 01:00 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1763942400](https://polymarket.com/event/btc-updown-15m-1763942400) | $16 | ❌ | DOWN | $-16 | $505 | L5 |
| - | 00:15 | [btc-updown-15m-1763943300](https://polymarket.com/event/btc-updown-15m-1763943300) | - | ⏭️ SKIP | UP | - | $505 | - |
| - | 00:30 | [btc-updown-15m-1763944200](https://polymarket.com/event/btc-updown-15m-1763944200) | - | ⏭️ SKIP | UP | - | $505 | - |
| - | 00:45 | [btc-updown-15m-1763945100](https://polymarket.com/event/btc-updown-15m-1763945100) | - | ⏭️ SKIP | DOWN | - | $505 | - |
| 2 | 01:00 | [btc-updown-15m-1763946000](https://polymarket.com/event/btc-updown-15m-1763946000) | $32 | ✅ | UP | +$32 | $537 | - |
| 3 | 01:15 | [btc-updown-15m-1763946900](https://polymarket.com/event/btc-updown-15m-1763946900) | $1 | ✅ | UP | +$1 | $538 | - |
| 4 | 01:30 | [btc-updown-15m-1763947800](https://polymarket.com/event/btc-updown-15m-1763947800) | $1 | ❌ | DOWN | $-1 | $537 | L1 |
| 5 | 01:45 | [btc-updown-15m-1763948700](https://polymarket.com/event/btc-updown-15m-1763948700) | $2 | ✅ | UP | +$2 | $539 | - |
| 6 | 02:00 | [btc-updown-15m-1763949600](https://polymarket.com/event/btc-updown-15m-1763949600) | $1 | ✅ | UP | +$1 | $540 | - |
| 7 | 02:15 | [btc-updown-15m-1763950500](https://polymarket.com/event/btc-updown-15m-1763950500) | $1 | ❌ | DOWN | $-1 | $539 | L1 |
| 8 | 02:30 | [btc-updown-15m-1763951400](https://polymarket.com/event/btc-updown-15m-1763951400) | $2 | ❌ | DOWN | $-2 | $537 | L2 |
| 9 | 02:45 | [btc-updown-15m-1763952300](https://polymarket.com/event/btc-updown-15m-1763952300) | $4 | ✅ | UP | +$4 | $541 | - |
| 10 | 03:00 | [btc-updown-15m-1763953200](https://polymarket.com/event/btc-updown-15m-1763953200) | $1 | ❌ | DOWN | $-1 | $540 | L1 |
| 11 | 03:15 | [btc-updown-15m-1763954100](https://polymarket.com/event/btc-updown-15m-1763954100) | $2 | ✅ | UP | +$2 | $542 | - |
| 12 | 03:30 | [btc-updown-15m-1763955000](https://polymarket.com/event/btc-updown-15m-1763955000) | $1 | ❌ | DOWN | $-1 | $541 | L1 |
| 13 | 03:45 | [btc-updown-15m-1763955900](https://polymarket.com/event/btc-updown-15m-1763955900) | $2 | ❌ | DOWN | $-2 | $539 | L2 |
| 14 | 04:00 | [btc-updown-15m-1763956800](https://polymarket.com/event/btc-updown-15m-1763956800) | $4 | ❌ | DOWN | $-4 | $535 | L3 |
| 15 | 04:15 | [btc-updown-15m-1763957700](https://polymarket.com/event/btc-updown-15m-1763957700) | $8 | ❌ | DOWN | $-8 | $527 | L4 |
| 16 | 04:30 | [btc-updown-15m-1763958600](https://polymarket.com/event/btc-updown-15m-1763958600) | $16 | ✅ | UP | +$16 | $543 | - |
| 17 | 04:45 | [btc-updown-15m-1763959500](https://polymarket.com/event/btc-updown-15m-1763959500) | $1 | ✅ | UP | +$1 | $544 | - |
| 18 | 05:00 | [btc-updown-15m-1763960400](https://polymarket.com/event/btc-updown-15m-1763960400) | $1 | ✅ | UP | +$1 | $545 | - |
| 19 | 05:15 | [btc-updown-15m-1763961300](https://polymarket.com/event/btc-updown-15m-1763961300) | $1 | ✅ | UP | +$1 | $546 | - |
| 20 | 05:30 | [btc-updown-15m-1763962200](https://polymarket.com/event/btc-updown-15m-1763962200) | $1 | ❌ | DOWN | $-1 | $545 | L1 |
| 21 | 05:45 | [btc-updown-15m-1763963100](https://polymarket.com/event/btc-updown-15m-1763963100) | $2 | ❌ | DOWN | $-2 | $543 | L2 |
| 22 | 06:00 | [btc-updown-15m-1763964000](https://polymarket.com/event/btc-updown-15m-1763964000) | $4 | ❌ | DOWN | $-4 | $539 | L3 |
| 23 | 06:15 | [btc-updown-15m-1763964900](https://polymarket.com/event/btc-updown-15m-1763964900) | $8 | ✅ | UP | +$8 | $547 | - |
| 24 | 06:30 | [btc-updown-15m-1763965800](https://polymarket.com/event/btc-updown-15m-1763965800) | $1 | ❌ | DOWN | $-1 | $546 | L1 |
| 25 | 06:45 | [btc-updown-15m-1763966700](https://polymarket.com/event/btc-updown-15m-1763966700) | $2 | ❌ | DOWN | $-2 | $544 | L2 |
| 26 | 07:00 | [btc-updown-15m-1763967600](https://polymarket.com/event/btc-updown-15m-1763967600) | $4 | ❌ | DOWN | $-4 | $540 | L3 |
| 27 | 07:15 | [btc-updown-15m-1763968500](https://polymarket.com/event/btc-updown-15m-1763968500) | $8 | ✅ | UP | +$8 | $548 | - |
| 28 | 07:30 | [btc-updown-15m-1763969400](https://polymarket.com/event/btc-updown-15m-1763969400) | $1 | ✅ | UP | +$1 | $549 | - |
| 29 | 07:45 | [btc-updown-15m-1763970300](https://polymarket.com/event/btc-updown-15m-1763970300) | $1 | ❌ | DOWN | $-1 | $548 | L1 |
| 30 | 08:00 | [btc-updown-15m-1763971200](https://polymarket.com/event/btc-updown-15m-1763971200) | $2 | ❌ | DOWN | $-2 | $546 | L2 |
| 31 | 08:15 | [btc-updown-15m-1763972100](https://polymarket.com/event/btc-updown-15m-1763972100) | $4 | ❌ | DOWN | $-4 | $542 | L3 |
| 32 | 08:30 | [btc-updown-15m-1763973000](https://polymarket.com/event/btc-updown-15m-1763973000) | $8 | ✅ | UP | +$8 | $550 | - |
| 33 | 08:45 | [btc-updown-15m-1763973900](https://polymarket.com/event/btc-updown-15m-1763973900) | $1 | ✅ | UP | +$1 | $551 | - |
| 34 | 09:00 | [btc-updown-15m-1763974800](https://polymarket.com/event/btc-updown-15m-1763974800) | $1 | ❌ | DOWN | $-1 | $550 | L1 |
| 35 | 09:15 | [btc-updown-15m-1763975700](https://polymarket.com/event/btc-updown-15m-1763975700) | $2 | ❌ | DOWN | $-2 | $548 | L2 |
| 36 | 09:30 | [btc-updown-15m-1763976600](https://polymarket.com/event/btc-updown-15m-1763976600) | $4 | ✅ | UP | +$4 | $552 | - |
| 37 | 09:45 | [btc-updown-15m-1763977500](https://polymarket.com/event/btc-updown-15m-1763977500) | $1 | ❌ | DOWN | $-1 | $551 | L1 |
| 38 | 10:00 | [btc-updown-15m-1763978400](https://polymarket.com/event/btc-updown-15m-1763978400) | $2 | ❌ | DOWN | $-2 | $549 | L2 |
| 39 | 10:15 | [btc-updown-15m-1763979300](https://polymarket.com/event/btc-updown-15m-1763979300) | $4 | ❌ | DOWN | $-4 | $545 | L3 |
| 40 | 10:30 | [btc-updown-15m-1763980200](https://polymarket.com/event/btc-updown-15m-1763980200) | $8 | ✅ | UP | +$8 | $553 | - |
| 41 | 10:45 | [btc-updown-15m-1763981100](https://polymarket.com/event/btc-updown-15m-1763981100) | $1 | ✅ | UP | +$1 | $554 | - |
| 42 | 11:00 | [btc-updown-15m-1763982000](https://polymarket.com/event/btc-updown-15m-1763982000) | $1 | ✅ | UP | +$1 | $555 | - |
| 43 | 11:15 | [btc-updown-15m-1763982900](https://polymarket.com/event/btc-updown-15m-1763982900) | $1 | ❌ | DOWN | $-1 | $554 | L1 |
| 44 | 11:30 | [btc-updown-15m-1763983800](https://polymarket.com/event/btc-updown-15m-1763983800) | $2 | ✅ | UP | +$2 | $556 | - |
| 45 | 11:45 | [btc-updown-15m-1763984700](https://polymarket.com/event/btc-updown-15m-1763984700) | $1 | ❌ | DOWN | $-1 | $555 | L1 |
| 46 | 12:00 | [btc-updown-15m-1763985600](https://polymarket.com/event/btc-updown-15m-1763985600) | $2 | ❌ | DOWN | $-2 | $553 | L2 |
| 47 | 12:15 | [btc-updown-15m-1763986500](https://polymarket.com/event/btc-updown-15m-1763986500) | $4 | ✅ | UP | +$4 | $557 | - |
| 48 | 12:30 | [btc-updown-15m-1763987400](https://polymarket.com/event/btc-updown-15m-1763987400) | $1 | ❌ | DOWN | $-1 | $556 | L1 |
| 49 | 12:45 | [btc-updown-15m-1763988300](https://polymarket.com/event/btc-updown-15m-1763988300) | $2 | ✅ | UP | +$2 | $558 | - |
| 50 | 13:00 | [btc-updown-15m-1763989200](https://polymarket.com/event/btc-updown-15m-1763989200) | $1 | ✅ | UP | +$1 | $559 | - |
| 51 | 13:15 | [btc-updown-15m-1763990100](https://polymarket.com/event/btc-updown-15m-1763990100) | $1 | ✅ | UP | +$1 | $560 | - |
| 52 | 13:30 | [btc-updown-15m-1763991000](https://polymarket.com/event/btc-updown-15m-1763991000) | $1 | ✅ | UP | +$1 | $561 | - |
| 53 | 13:45 | [btc-updown-15m-1763991900](https://polymarket.com/event/btc-updown-15m-1763991900) | $1 | ❌ | DOWN | $-1 | $560 | L1 |
| 54 | 14:00 | [btc-updown-15m-1763992800](https://polymarket.com/event/btc-updown-15m-1763992800) | $2 | ❌ | DOWN | $-2 | $558 | L2 |
| 55 | 14:15 | [btc-updown-15m-1763993700](https://polymarket.com/event/btc-updown-15m-1763993700) | $4 | ❌ | DOWN | $-4 | $554 | L3 |
| 56 | 14:30 | [btc-updown-15m-1763994600](https://polymarket.com/event/btc-updown-15m-1763994600) | $8 | ❌ | DOWN | $-8 | $546 | L4 |
| 57 | 14:45 | [btc-updown-15m-1763995500](https://polymarket.com/event/btc-updown-15m-1763995500) | $16 | ✅ | UP | +$16 | $562 | - |
| 58 | 15:00 | [btc-updown-15m-1763996400](https://polymarket.com/event/btc-updown-15m-1763996400) | $1 | ✅ | UP | +$1 | $563 | - |
| 59 | 15:15 | [btc-updown-15m-1763997300](https://polymarket.com/event/btc-updown-15m-1763997300) | $1 | ❌ | DOWN | $-1 | $562 | L1 |
| 60 | 15:30 | [btc-updown-15m-1763998200](https://polymarket.com/event/btc-updown-15m-1763998200) | $2 | ✅ | UP | +$2 | $564 | - |
| 61 | 15:45 | [btc-updown-15m-1763999100](https://polymarket.com/event/btc-updown-15m-1763999100) | $1 | ✅ | UP | +$1 | $565 | - |
| 62 | 16:00 | [btc-updown-15m-1764000000](https://polymarket.com/event/btc-updown-15m-1764000000) | $1 | ✅ | UP | +$1 | $566 | - |
| 63 | 16:15 | [btc-updown-15m-1764000900](https://polymarket.com/event/btc-updown-15m-1764000900) | $1 | ✅ | UP | +$1 | $567 | - |
| 64 | 16:30 | [btc-updown-15m-1764001800](https://polymarket.com/event/btc-updown-15m-1764001800) | $1 | ✅ | UP | +$1 | $568 | - |
| 65 | 16:45 | [btc-updown-15m-1764002700](https://polymarket.com/event/btc-updown-15m-1764002700) | $1 | ❌ | DOWN | $-1 | $567 | L1 |
| 66 | 17:00 | [btc-updown-15m-1764003600](https://polymarket.com/event/btc-updown-15m-1764003600) | $2 | ❌ | DOWN | $-2 | $565 | L2 |
| 67 | 17:15 | [btc-updown-15m-1764004500](https://polymarket.com/event/btc-updown-15m-1764004500) | $4 | ✅ | UP | +$4 | $569 | - |
| 68 | 17:30 | [btc-updown-15m-1764005400](https://polymarket.com/event/btc-updown-15m-1764005400) | $1 | ✅ | UP | +$1 | $570 | - |
| 69 | 17:45 | [btc-updown-15m-1764006300](https://polymarket.com/event/btc-updown-15m-1764006300) | $1 | ✅ | UP | +$1 | $571 | - |
| 70 | 18:00 | [btc-updown-15m-1764007200](https://polymarket.com/event/btc-updown-15m-1764007200) | $1 | ✅ | UP | +$1 | $572 | - |
| 71 | 18:15 | [btc-updown-15m-1764008100](https://polymarket.com/event/btc-updown-15m-1764008100) | $1 | ❌ | DOWN | $-1 | $571 | L1 |
| 72 | 18:30 | [btc-updown-15m-1764009000](https://polymarket.com/event/btc-updown-15m-1764009000) | $2 | ✅ | UP | +$2 | $573 | - |
| 73 | 18:45 | [btc-updown-15m-1764009900](https://polymarket.com/event/btc-updown-15m-1764009900) | $1 | ✅ | UP | +$1 | $574 | - |
| 74 | 19:00 | [btc-updown-15m-1764010800](https://polymarket.com/event/btc-updown-15m-1764010800) | $1 | ❌ | DOWN | $-1 | $573 | L1 |
| 75 | 19:15 | [btc-updown-15m-1764011700](https://polymarket.com/event/btc-updown-15m-1764011700) | $2 | ❌ | DOWN | $-2 | $571 | L2 |
| 76 | 19:30 | [btc-updown-15m-1764012600](https://polymarket.com/event/btc-updown-15m-1764012600) | $4 | ❌ | DOWN | $-4 | $567 | L3 |
| 77 | 19:45 | [btc-updown-15m-1764013500](https://polymarket.com/event/btc-updown-15m-1764013500) | $8 | ❌ | DOWN | $-8 | $559 | L4 |
| 78 | 20:00 | [btc-updown-15m-1764014400](https://polymarket.com/event/btc-updown-15m-1764014400) | $16 | ✅ | UP | +$16 | $575 | - |
| 79 | 20:15 | [btc-updown-15m-1764015300](https://polymarket.com/event/btc-updown-15m-1764015300) | $1 | ✅ | UP | +$1 | $576 | - |
| 80 | 20:30 | [btc-updown-15m-1764016200](https://polymarket.com/event/btc-updown-15m-1764016200) | $1 | ✅ | UP | +$1 | $577 | - |
| 81 | 20:45 | [btc-updown-15m-1764017100](https://polymarket.com/event/btc-updown-15m-1764017100) | $1 | ✅ | UP | +$1 | $578 | - |
| 82 | 21:00 | [btc-updown-15m-1764018000](https://polymarket.com/event/btc-updown-15m-1764018000) | $1 | ❌ | DOWN | $-1 | $577 | L1 |
| 83 | 21:15 | [btc-updown-15m-1764018900](https://polymarket.com/event/btc-updown-15m-1764018900) | $2 | ❌ | DOWN | $-2 | $575 | L2 |
| 84 | 21:30 | [btc-updown-15m-1764019800](https://polymarket.com/event/btc-updown-15m-1764019800) | $4 | ❌ | DOWN | $-4 | $571 | L3 |
| 85 | 21:45 | [btc-updown-15m-1764020700](https://polymarket.com/event/btc-updown-15m-1764020700) | $8 | ❌ | DOWN | $-8 | $563 | L4 |
| 86 | 22:00 | [btc-updown-15m-1764021600](https://polymarket.com/event/btc-updown-15m-1764021600) | $16 | ✅ | UP | +$16 | $579 | - |
| 87 | 22:15 | [btc-updown-15m-1764022500](https://polymarket.com/event/btc-updown-15m-1764022500) | $1 | ❌ | DOWN | $-1 | $578 | L1 |
| 88 | 22:30 | [btc-updown-15m-1764023400](https://polymarket.com/event/btc-updown-15m-1764023400) | $2 | ✅ | UP | +$2 | $580 | - |
| 89 | 22:45 | [btc-updown-15m-1764024300](https://polymarket.com/event/btc-updown-15m-1764024300) | $1 | ❌ | DOWN | $-1 | $579 | L1 |
| 90 | 23:00 | [btc-updown-15m-1764025200](https://polymarket.com/event/btc-updown-15m-1764025200) | $2 | ❌ | DOWN | $-2 | $577 | L2 |
| 91 | 23:15 | [btc-updown-15m-1764026100](https://polymarket.com/event/btc-updown-15m-1764026100) | $4 | ✅ | UP | +$4 | $581 | - |
| 92 | 23:30 | [btc-updown-15m-1764027000](https://polymarket.com/event/btc-updown-15m-1764027000) | $1 | ❌ | DOWN | $-1 | $580 | L1 |
| 93 | 23:45 | [btc-updown-15m-1764027900](https://polymarket.com/event/btc-updown-15m-1764027900) | $2 | ❌ | DOWN | $-2 | $578 | L2 |

### 2025-11-25
**Summary:** 96 trades | 48 wins | 48 losses | Max Bet: $16 | Profit: +$44

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764028800](https://polymarket.com/event/btc-updown-15m-1764028800) | $4 | ❌ | DOWN | $-4 | $574 | L3 |
| 2 | 00:15 | [btc-updown-15m-1764029700](https://polymarket.com/event/btc-updown-15m-1764029700) | $8 | ❌ | DOWN | $-8 | $566 | L4 |
| 3 | 00:30 | [btc-updown-15m-1764030600](https://polymarket.com/event/btc-updown-15m-1764030600) | $16 | ✅ | UP | +$16 | $582 | - |
| 4 | 00:45 | [btc-updown-15m-1764031500](https://polymarket.com/event/btc-updown-15m-1764031500) | $1 | ❌ | DOWN | $-1 | $581 | L1 |
| 5 | 01:00 | [btc-updown-15m-1764032400](https://polymarket.com/event/btc-updown-15m-1764032400) | $2 | ✅ | UP | +$2 | $583 | - |
| 6 | 01:15 | [btc-updown-15m-1764033300](https://polymarket.com/event/btc-updown-15m-1764033300) | $1 | ❌ | DOWN | $-1 | $582 | L1 |
| 7 | 01:30 | [btc-updown-15m-1764034200](https://polymarket.com/event/btc-updown-15m-1764034200) | $2 | ❌ | DOWN | $-2 | $580 | L2 |
| 8 | 01:45 | [btc-updown-15m-1764035100](https://polymarket.com/event/btc-updown-15m-1764035100) | $4 | ❌ | DOWN | $-4 | $576 | L3 |
| 9 | 02:00 | [btc-updown-15m-1764036000](https://polymarket.com/event/btc-updown-15m-1764036000) | $8 | ✅ | UP | +$8 | $584 | - |
| 10 | 02:15 | [btc-updown-15m-1764036900](https://polymarket.com/event/btc-updown-15m-1764036900) | $1 | ❌ | DOWN | $-1 | $583 | L1 |
| 11 | 02:30 | [btc-updown-15m-1764037800](https://polymarket.com/event/btc-updown-15m-1764037800) | $2 | ✅ | UP | +$2 | $585 | - |
| 12 | 02:45 | [btc-updown-15m-1764038700](https://polymarket.com/event/btc-updown-15m-1764038700) | $1 | ✅ | UP | +$1 | $586 | - |
| 13 | 03:00 | [btc-updown-15m-1764039600](https://polymarket.com/event/btc-updown-15m-1764039600) | $1 | ❌ | DOWN | $-1 | $585 | L1 |
| 14 | 03:15 | [btc-updown-15m-1764040500](https://polymarket.com/event/btc-updown-15m-1764040500) | $2 | ✅ | UP | +$2 | $587 | - |
| 15 | 03:30 | [btc-updown-15m-1764041400](https://polymarket.com/event/btc-updown-15m-1764041400) | $1 | ❌ | DOWN | $-1 | $586 | L1 |
| 16 | 03:45 | [btc-updown-15m-1764042300](https://polymarket.com/event/btc-updown-15m-1764042300) | $2 | ✅ | UP | +$2 | $588 | - |
| 17 | 04:00 | [btc-updown-15m-1764043200](https://polymarket.com/event/btc-updown-15m-1764043200) | $1 | ✅ | UP | +$1 | $589 | - |
| 18 | 04:15 | [btc-updown-15m-1764044100](https://polymarket.com/event/btc-updown-15m-1764044100) | $1 | ❌ | DOWN | $-1 | $588 | L1 |
| 19 | 04:30 | [btc-updown-15m-1764045000](https://polymarket.com/event/btc-updown-15m-1764045000) | $2 | ✅ | UP | +$2 | $590 | - |
| 20 | 04:45 | [btc-updown-15m-1764045900](https://polymarket.com/event/btc-updown-15m-1764045900) | $1 | ✅ | UP | +$1 | $591 | - |
| 21 | 05:00 | [btc-updown-15m-1764046800](https://polymarket.com/event/btc-updown-15m-1764046800) | $1 | ❌ | DOWN | $-1 | $590 | L1 |
| 22 | 05:15 | [btc-updown-15m-1764047700](https://polymarket.com/event/btc-updown-15m-1764047700) | $2 | ❌ | DOWN | $-2 | $588 | L2 |
| 23 | 05:30 | [btc-updown-15m-1764048600](https://polymarket.com/event/btc-updown-15m-1764048600) | $4 | ✅ | UP | +$4 | $592 | - |
| 24 | 05:45 | [btc-updown-15m-1764049500](https://polymarket.com/event/btc-updown-15m-1764049500) | $1 | ❌ | DOWN | $-1 | $591 | L1 |
| 25 | 06:00 | [btc-updown-15m-1764050400](https://polymarket.com/event/btc-updown-15m-1764050400) | $2 | ❌ | DOWN | $-2 | $589 | L2 |
| 26 | 06:15 | [btc-updown-15m-1764051300](https://polymarket.com/event/btc-updown-15m-1764051300) | $4 | ❌ | DOWN | $-4 | $585 | L3 |
| 27 | 06:30 | [btc-updown-15m-1764052200](https://polymarket.com/event/btc-updown-15m-1764052200) | $8 | ❌ | DOWN | $-8 | $577 | L4 |
| 28 | 06:45 | [btc-updown-15m-1764053100](https://polymarket.com/event/btc-updown-15m-1764053100) | $16 | ✅ | UP | +$16 | $593 | - |
| 29 | 07:00 | [btc-updown-15m-1764054000](https://polymarket.com/event/btc-updown-15m-1764054000) | $1 | ✅ | UP | +$1 | $594 | - |
| 30 | 07:15 | [btc-updown-15m-1764054900](https://polymarket.com/event/btc-updown-15m-1764054900) | $1 | ❌ | DOWN | $-1 | $593 | L1 |
| 31 | 07:30 | [btc-updown-15m-1764055800](https://polymarket.com/event/btc-updown-15m-1764055800) | $2 | ❌ | DOWN | $-2 | $591 | L2 |
| 32 | 07:45 | [btc-updown-15m-1764056700](https://polymarket.com/event/btc-updown-15m-1764056700) | $4 | ❌ | DOWN | $-4 | $587 | L3 |
| 33 | 08:00 | [btc-updown-15m-1764057600](https://polymarket.com/event/btc-updown-15m-1764057600) | $8 | ✅ | UP | +$8 | $595 | - |
| 34 | 08:15 | [btc-updown-15m-1764058500](https://polymarket.com/event/btc-updown-15m-1764058500) | $1 | ✅ | UP | +$1 | $596 | - |
| 35 | 08:30 | [btc-updown-15m-1764059400](https://polymarket.com/event/btc-updown-15m-1764059400) | $1 | ❌ | DOWN | $-1 | $595 | L1 |
| 36 | 08:45 | [btc-updown-15m-1764060300](https://polymarket.com/event/btc-updown-15m-1764060300) | $2 | ❌ | DOWN | $-2 | $593 | L2 |
| 37 | 09:00 | [btc-updown-15m-1764061200](https://polymarket.com/event/btc-updown-15m-1764061200) | $4 | ❌ | DOWN | $-4 | $589 | L3 |
| 38 | 09:15 | [btc-updown-15m-1764062100](https://polymarket.com/event/btc-updown-15m-1764062100) | $8 | ❌ | DOWN | $-8 | $581 | L4 |
| 39 | 09:30 | [btc-updown-15m-1764063000](https://polymarket.com/event/btc-updown-15m-1764063000) | $16 | ✅ | UP | +$16 | $597 | - |
| 40 | 09:45 | [btc-updown-15m-1764063900](https://polymarket.com/event/btc-updown-15m-1764063900) | $1 | ✅ | UP | +$1 | $598 | - |
| 41 | 10:00 | [btc-updown-15m-1764064800](https://polymarket.com/event/btc-updown-15m-1764064800) | $1 | ❌ | DOWN | $-1 | $597 | L1 |
| 42 | 10:15 | [btc-updown-15m-1764065700](https://polymarket.com/event/btc-updown-15m-1764065700) | $2 | ✅ | UP | +$2 | $599 | - |
| 43 | 10:30 | [btc-updown-15m-1764066600](https://polymarket.com/event/btc-updown-15m-1764066600) | $1 | ✅ | UP | +$1 | $600 | - |
| 44 | 10:45 | [btc-updown-15m-1764067500](https://polymarket.com/event/btc-updown-15m-1764067500) | $1 | ✅ | UP | +$1 | $601 | - |
| 45 | 11:00 | [btc-updown-15m-1764068400](https://polymarket.com/event/btc-updown-15m-1764068400) | $1 | ✅ | UP | +$1 | $602 | - |
| 46 | 11:15 | [btc-updown-15m-1764069300](https://polymarket.com/event/btc-updown-15m-1764069300) | $1 | ❌ | DOWN | $-1 | $601 | L1 |
| 47 | 11:30 | [btc-updown-15m-1764070200](https://polymarket.com/event/btc-updown-15m-1764070200) | $2 | ✅ | UP | +$2 | $603 | - |
| 48 | 11:45 | [btc-updown-15m-1764071100](https://polymarket.com/event/btc-updown-15m-1764071100) | $1 | ❌ | DOWN | $-1 | $602 | L1 |
| 49 | 12:00 | [btc-updown-15m-1764072000](https://polymarket.com/event/btc-updown-15m-1764072000) | $2 | ✅ | UP | +$2 | $604 | - |
| 50 | 12:15 | [btc-updown-15m-1764072900](https://polymarket.com/event/btc-updown-15m-1764072900) | $1 | ❌ | DOWN | $-1 | $603 | L1 |
| 51 | 12:30 | [btc-updown-15m-1764073800](https://polymarket.com/event/btc-updown-15m-1764073800) | $2 | ✅ | UP | +$2 | $605 | - |
| 52 | 12:45 | [btc-updown-15m-1764074700](https://polymarket.com/event/btc-updown-15m-1764074700) | $1 | ❌ | DOWN | $-1 | $604 | L1 |
| 53 | 13:00 | [btc-updown-15m-1764075600](https://polymarket.com/event/btc-updown-15m-1764075600) | $2 | ✅ | UP | +$2 | $606 | - |
| 54 | 13:15 | [btc-updown-15m-1764076500](https://polymarket.com/event/btc-updown-15m-1764076500) | $1 | ✅ | UP | +$1 | $607 | - |
| 55 | 13:30 | [btc-updown-15m-1764077400](https://polymarket.com/event/btc-updown-15m-1764077400) | $1 | ❌ | DOWN | $-1 | $606 | L1 |
| 56 | 13:45 | [btc-updown-15m-1764078300](https://polymarket.com/event/btc-updown-15m-1764078300) | $2 | ✅ | UP | +$2 | $608 | - |
| 57 | 14:00 | [btc-updown-15m-1764079200](https://polymarket.com/event/btc-updown-15m-1764079200) | $1 | ❌ | DOWN | $-1 | $607 | L1 |
| 58 | 14:15 | [btc-updown-15m-1764080100](https://polymarket.com/event/btc-updown-15m-1764080100) | $2 | ✅ | UP | +$2 | $609 | - |
| 59 | 14:30 | [btc-updown-15m-1764081000](https://polymarket.com/event/btc-updown-15m-1764081000) | $1 | ❌ | DOWN | $-1 | $608 | L1 |
| 60 | 14:45 | [btc-updown-15m-1764081900](https://polymarket.com/event/btc-updown-15m-1764081900) | $2 | ✅ | UP | +$2 | $610 | - |
| 61 | 15:00 | [btc-updown-15m-1764082800](https://polymarket.com/event/btc-updown-15m-1764082800) | $1 | ❌ | DOWN | $-1 | $609 | L1 |
| 62 | 15:15 | [btc-updown-15m-1764083700](https://polymarket.com/event/btc-updown-15m-1764083700) | $2 | ✅ | UP | +$2 | $611 | - |
| 63 | 15:30 | [btc-updown-15m-1764084600](https://polymarket.com/event/btc-updown-15m-1764084600) | $1 | ✅ | UP | +$1 | $612 | - |
| 64 | 15:45 | [btc-updown-15m-1764085500](https://polymarket.com/event/btc-updown-15m-1764085500) | $1 | ❌ | DOWN | $-1 | $611 | L1 |
| 65 | 16:00 | [btc-updown-15m-1764086400](https://polymarket.com/event/btc-updown-15m-1764086400) | $2 | ❌ | DOWN | $-2 | $609 | L2 |
| 66 | 16:15 | [btc-updown-15m-1764087300](https://polymarket.com/event/btc-updown-15m-1764087300) | $4 | ✅ | UP | +$4 | $613 | - |
| 67 | 16:30 | [btc-updown-15m-1764088200](https://polymarket.com/event/btc-updown-15m-1764088200) | $1 | ❌ | DOWN | $-1 | $612 | L1 |
| 68 | 16:45 | [btc-updown-15m-1764089100](https://polymarket.com/event/btc-updown-15m-1764089100) | $2 | ✅ | UP | +$2 | $614 | - |
| 69 | 17:00 | [btc-updown-15m-1764090000](https://polymarket.com/event/btc-updown-15m-1764090000) | $1 | ✅ | UP | +$1 | $615 | - |
| 70 | 17:15 | [btc-updown-15m-1764090900](https://polymarket.com/event/btc-updown-15m-1764090900) | $1 | ✅ | UP | +$1 | $616 | - |
| 71 | 17:30 | [btc-updown-15m-1764091800](https://polymarket.com/event/btc-updown-15m-1764091800) | $1 | ✅ | UP | +$1 | $617 | - |
| 72 | 17:45 | [btc-updown-15m-1764092700](https://polymarket.com/event/btc-updown-15m-1764092700) | $1 | ❌ | DOWN | $-1 | $616 | L1 |
| 73 | 18:00 | [btc-updown-15m-1764093600](https://polymarket.com/event/btc-updown-15m-1764093600) | $2 | ✅ | UP | +$2 | $618 | - |
| 74 | 18:15 | [btc-updown-15m-1764094500](https://polymarket.com/event/btc-updown-15m-1764094500) | $1 | ✅ | UP | +$1 | $619 | - |
| 75 | 18:30 | [btc-updown-15m-1764095400](https://polymarket.com/event/btc-updown-15m-1764095400) | $1 | ❌ | DOWN | $-1 | $618 | L1 |
| 76 | 18:45 | [btc-updown-15m-1764096300](https://polymarket.com/event/btc-updown-15m-1764096300) | $2 | ❌ | DOWN | $-2 | $616 | L2 |
| 77 | 19:00 | [btc-updown-15m-1764097200](https://polymarket.com/event/btc-updown-15m-1764097200) | $4 | ❌ | DOWN | $-4 | $612 | L3 |
| 78 | 19:15 | [btc-updown-15m-1764098100](https://polymarket.com/event/btc-updown-15m-1764098100) | $8 | ❌ | DOWN | $-8 | $604 | L4 |
| 79 | 19:30 | [btc-updown-15m-1764099000](https://polymarket.com/event/btc-updown-15m-1764099000) | $16 | ✅ | UP | +$16 | $620 | - |
| 80 | 19:45 | [btc-updown-15m-1764099900](https://polymarket.com/event/btc-updown-15m-1764099900) | $1 | ✅ | UP | +$1 | $621 | - |
| 81 | 20:00 | [btc-updown-15m-1764100800](https://polymarket.com/event/btc-updown-15m-1764100800) | $1 | ✅ | UP | +$1 | $622 | - |
| 82 | 20:15 | [btc-updown-15m-1764101700](https://polymarket.com/event/btc-updown-15m-1764101700) | $1 | ❌ | DOWN | $-1 | $621 | L1 |
| 83 | 20:30 | [btc-updown-15m-1764102600](https://polymarket.com/event/btc-updown-15m-1764102600) | $2 | ✅ | UP | +$2 | $623 | - |
| 84 | 20:45 | [btc-updown-15m-1764103500](https://polymarket.com/event/btc-updown-15m-1764103500) | $1 | ✅ | UP | +$1 | $624 | - |
| 85 | 21:00 | [btc-updown-15m-1764104400](https://polymarket.com/event/btc-updown-15m-1764104400) | $1 | ❌ | DOWN | $-1 | $623 | L1 |
| 86 | 21:15 | [btc-updown-15m-1764105300](https://polymarket.com/event/btc-updown-15m-1764105300) | $2 | ✅ | UP | +$2 | $625 | - |
| 87 | 21:30 | [btc-updown-15m-1764106200](https://polymarket.com/event/btc-updown-15m-1764106200) | $1 | ❌ | DOWN | $-1 | $624 | L1 |
| 88 | 21:45 | [btc-updown-15m-1764107100](https://polymarket.com/event/btc-updown-15m-1764107100) | $2 | ❌ | DOWN | $-2 | $622 | L2 |
| 89 | 22:00 | [btc-updown-15m-1764108000](https://polymarket.com/event/btc-updown-15m-1764108000) | $4 | ❌ | DOWN | $-4 | $618 | L3 |
| 90 | 22:15 | [btc-updown-15m-1764108900](https://polymarket.com/event/btc-updown-15m-1764108900) | $8 | ✅ | UP | +$8 | $626 | - |
| 91 | 22:30 | [btc-updown-15m-1764109800](https://polymarket.com/event/btc-updown-15m-1764109800) | $1 | ✅ | UP | +$1 | $627 | - |
| 92 | 22:45 | [btc-updown-15m-1764110700](https://polymarket.com/event/btc-updown-15m-1764110700) | $1 | ✅ | UP | +$1 | $628 | - |
| 93 | 23:00 | [btc-updown-15m-1764111600](https://polymarket.com/event/btc-updown-15m-1764111600) | $1 | ✅ | UP | +$1 | $629 | - |
| 94 | 23:15 | [btc-updown-15m-1764112500](https://polymarket.com/event/btc-updown-15m-1764112500) | $1 | ❌ | DOWN | $-1 | $628 | L1 |
| 95 | 23:30 | [btc-updown-15m-1764113400](https://polymarket.com/event/btc-updown-15m-1764113400) | $2 | ❌ | DOWN | $-2 | $626 | L2 |
| 96 | 23:45 | [btc-updown-15m-1764114300](https://polymarket.com/event/btc-updown-15m-1764114300) | $4 | ❌ | DOWN | $-4 | $622 | L3 |

### 2025-11-26
**Summary:** 93 trades | 57 wins | 36 losses | Max Bet: $32 | Profit: +$64

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 09:00 | 5 | $31 | $32 | 10:00 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764115200](https://polymarket.com/event/btc-updown-15m-1764115200) | $8 | ✅ | UP | +$8 | $630 | - |
| 2 | 00:15 | [btc-updown-15m-1764116100](https://polymarket.com/event/btc-updown-15m-1764116100) | $1 | ✅ | UP | +$1 | $631 | - |
| 3 | 00:30 | [btc-updown-15m-1764117000](https://polymarket.com/event/btc-updown-15m-1764117000) | $1 | ❌ | DOWN | $-1 | $630 | L1 |
| 4 | 00:45 | [btc-updown-15m-1764117900](https://polymarket.com/event/btc-updown-15m-1764117900) | $2 | ✅ | UP | +$2 | $632 | - |
| 5 | 01:00 | [btc-updown-15m-1764118800](https://polymarket.com/event/btc-updown-15m-1764118800) | $1 | ❌ | DOWN | $-1 | $631 | L1 |
| 6 | 01:15 | [btc-updown-15m-1764119700](https://polymarket.com/event/btc-updown-15m-1764119700) | $2 | ✅ | UP | +$2 | $633 | - |
| 7 | 01:30 | [btc-updown-15m-1764120600](https://polymarket.com/event/btc-updown-15m-1764120600) | $1 | ✅ | UP | +$1 | $634 | - |
| 8 | 01:45 | [btc-updown-15m-1764121500](https://polymarket.com/event/btc-updown-15m-1764121500) | $1 | ❌ | DOWN | $-1 | $633 | L1 |
| 9 | 02:00 | [btc-updown-15m-1764122400](https://polymarket.com/event/btc-updown-15m-1764122400) | $2 | ✅ | UP | +$2 | $635 | - |
| 10 | 02:15 | [btc-updown-15m-1764123300](https://polymarket.com/event/btc-updown-15m-1764123300) | $1 | ❌ | DOWN | $-1 | $634 | L1 |
| 11 | 02:30 | [btc-updown-15m-1764124200](https://polymarket.com/event/btc-updown-15m-1764124200) | $2 | ✅ | UP | +$2 | $636 | - |
| 12 | 02:45 | [btc-updown-15m-1764125100](https://polymarket.com/event/btc-updown-15m-1764125100) | $1 | ❌ | DOWN | $-1 | $635 | L1 |
| 13 | 03:00 | [btc-updown-15m-1764126000](https://polymarket.com/event/btc-updown-15m-1764126000) | $2 | ❌ | DOWN | $-2 | $633 | L2 |
| 14 | 03:15 | [btc-updown-15m-1764126900](https://polymarket.com/event/btc-updown-15m-1764126900) | $4 | ✅ | UP | +$4 | $637 | - |
| 15 | 03:30 | [btc-updown-15m-1764127800](https://polymarket.com/event/btc-updown-15m-1764127800) | $1 | ❌ | DOWN | $-1 | $636 | L1 |
| 16 | 03:45 | [btc-updown-15m-1764128700](https://polymarket.com/event/btc-updown-15m-1764128700) | $2 | ❌ | DOWN | $-2 | $634 | L2 |
| 17 | 04:00 | [btc-updown-15m-1764129600](https://polymarket.com/event/btc-updown-15m-1764129600) | $4 | ❌ | DOWN | $-4 | $630 | L3 |
| 18 | 04:15 | [btc-updown-15m-1764130500](https://polymarket.com/event/btc-updown-15m-1764130500) | $8 | ✅ | UP | +$8 | $638 | - |
| 19 | 04:30 | [btc-updown-15m-1764131400](https://polymarket.com/event/btc-updown-15m-1764131400) | $1 | ✅ | UP | +$1 | $639 | - |
| 20 | 04:45 | [btc-updown-15m-1764132300](https://polymarket.com/event/btc-updown-15m-1764132300) | $1 | ❌ | DOWN | $-1 | $638 | L1 |
| 21 | 05:00 | [btc-updown-15m-1764133200](https://polymarket.com/event/btc-updown-15m-1764133200) | $2 | ✅ | UP | +$2 | $640 | - |
| 22 | 05:15 | [btc-updown-15m-1764134100](https://polymarket.com/event/btc-updown-15m-1764134100) | $1 | ✅ | UP | +$1 | $641 | - |
| 23 | 05:30 | [btc-updown-15m-1764135000](https://polymarket.com/event/btc-updown-15m-1764135000) | $1 | ✅ | UP | +$1 | $642 | - |
| 24 | 05:45 | [btc-updown-15m-1764135900](https://polymarket.com/event/btc-updown-15m-1764135900) | $1 | ❌ | DOWN | $-1 | $641 | L1 |
| 25 | 06:00 | [btc-updown-15m-1764136800](https://polymarket.com/event/btc-updown-15m-1764136800) | $2 | ✅ | UP | +$2 | $643 | - |
| 26 | 06:15 | [btc-updown-15m-1764137700](https://polymarket.com/event/btc-updown-15m-1764137700) | $1 | ❌ | DOWN | $-1 | $642 | L1 |
| 27 | 06:30 | [btc-updown-15m-1764138600](https://polymarket.com/event/btc-updown-15m-1764138600) | $2 | ✅ | UP | +$2 | $644 | - |
| 28 | 06:45 | [btc-updown-15m-1764139500](https://polymarket.com/event/btc-updown-15m-1764139500) | $1 | ✅ | UP | +$1 | $645 | - |
| 29 | 07:00 | [btc-updown-15m-1764140400](https://polymarket.com/event/btc-updown-15m-1764140400) | $1 | ✅ | UP | +$1 | $646 | - |
| 30 | 07:15 | [btc-updown-15m-1764141300](https://polymarket.com/event/btc-updown-15m-1764141300) | $1 | ❌ | DOWN | $-1 | $645 | L1 |
| 31 | 07:30 | [btc-updown-15m-1764142200](https://polymarket.com/event/btc-updown-15m-1764142200) | $2 | ❌ | DOWN | $-2 | $643 | L2 |
| 32 | 07:45 | [btc-updown-15m-1764143100](https://polymarket.com/event/btc-updown-15m-1764143100) | $4 | ✅ | UP | +$4 | $647 | - |
| 33 | 08:00 | [btc-updown-15m-1764144000](https://polymarket.com/event/btc-updown-15m-1764144000) | $1 | ❌ | DOWN | $-1 | $646 | L1 |
| 34 | 08:15 | [btc-updown-15m-1764144900](https://polymarket.com/event/btc-updown-15m-1764144900) | $2 | ❌ | DOWN | $-2 | $644 | L2 |
| 35 | 08:30 | [btc-updown-15m-1764145800](https://polymarket.com/event/btc-updown-15m-1764145800) | $4 | ❌ | DOWN | $-4 | $640 | L3 |
| 36 | 08:45 | [btc-updown-15m-1764146700](https://polymarket.com/event/btc-updown-15m-1764146700) | $8 | ❌ | DOWN | $-8 | $632 | L4 |
| 37 | 09:00 | [btc-updown-15m-1764147600](https://polymarket.com/event/btc-updown-15m-1764147600) | $16 | ❌ | DOWN | $-16 | $616 | L5 |
| - | 09:15 | [btc-updown-15m-1764148500](https://polymarket.com/event/btc-updown-15m-1764148500) | - | ⏭️ SKIP | DOWN | - | $616 | - |
| - | 09:30 | [btc-updown-15m-1764149400](https://polymarket.com/event/btc-updown-15m-1764149400) | - | ⏭️ SKIP | DOWN | - | $616 | - |
| - | 09:45 | [btc-updown-15m-1764150300](https://polymarket.com/event/btc-updown-15m-1764150300) | - | ⏭️ SKIP | DOWN | - | $616 | - |
| 38 | 10:00 | [btc-updown-15m-1764151200](https://polymarket.com/event/btc-updown-15m-1764151200) | $32 | ✅ | UP | +$32 | $648 | - |
| 39 | 10:15 | [btc-updown-15m-1764152100](https://polymarket.com/event/btc-updown-15m-1764152100) | $1 | ❌ | DOWN | $-1 | $647 | L1 |
| 40 | 10:30 | [btc-updown-15m-1764153000](https://polymarket.com/event/btc-updown-15m-1764153000) | $2 | ✅ | UP | +$2 | $649 | - |
| 41 | 10:45 | [btc-updown-15m-1764153900](https://polymarket.com/event/btc-updown-15m-1764153900) | $1 | ✅ | UP | +$1 | $650 | - |
| 42 | 11:00 | [btc-updown-15m-1764154800](https://polymarket.com/event/btc-updown-15m-1764154800) | $1 | ✅ | UP | +$1 | $651 | - |
| 43 | 11:15 | [btc-updown-15m-1764155700](https://polymarket.com/event/btc-updown-15m-1764155700) | $1 | ❌ | DOWN | $-1 | $650 | L1 |
| 44 | 11:30 | [btc-updown-15m-1764156600](https://polymarket.com/event/btc-updown-15m-1764156600) | $2 | ✅ | UP | +$2 | $652 | - |
| 45 | 11:45 | [btc-updown-15m-1764157500](https://polymarket.com/event/btc-updown-15m-1764157500) | $1 | ✅ | UP | +$1 | $653 | - |
| 46 | 12:00 | [btc-updown-15m-1764158400](https://polymarket.com/event/btc-updown-15m-1764158400) | $1 | ❌ | DOWN | $-1 | $652 | L1 |
| 47 | 12:15 | [btc-updown-15m-1764159300](https://polymarket.com/event/btc-updown-15m-1764159300) | $2 | ❌ | DOWN | $-2 | $650 | L2 |
| 48 | 12:30 | [btc-updown-15m-1764160200](https://polymarket.com/event/btc-updown-15m-1764160200) | $4 | ✅ | UP | +$4 | $654 | - |
| 49 | 12:45 | [btc-updown-15m-1764161100](https://polymarket.com/event/btc-updown-15m-1764161100) | $1 | ✅ | UP | +$1 | $655 | - |
| 50 | 13:00 | [btc-updown-15m-1764162000](https://polymarket.com/event/btc-updown-15m-1764162000) | $1 | ❌ | DOWN | $-1 | $654 | L1 |
| 51 | 13:15 | [btc-updown-15m-1764162900](https://polymarket.com/event/btc-updown-15m-1764162900) | $2 | ✅ | UP | +$2 | $656 | - |
| 52 | 13:30 | [btc-updown-15m-1764163800](https://polymarket.com/event/btc-updown-15m-1764163800) | $1 | ✅ | UP | +$1 | $657 | - |
| 53 | 13:45 | [btc-updown-15m-1764164700](https://polymarket.com/event/btc-updown-15m-1764164700) | $1 | ✅ | UP | +$1 | $658 | - |
| 54 | 14:00 | [btc-updown-15m-1764165600](https://polymarket.com/event/btc-updown-15m-1764165600) | $1 | ✅ | UP | +$1 | $659 | - |
| 55 | 14:15 | [btc-updown-15m-1764166500](https://polymarket.com/event/btc-updown-15m-1764166500) | $1 | ✅ | UP | +$1 | $660 | - |
| 56 | 14:30 | [btc-updown-15m-1764167400](https://polymarket.com/event/btc-updown-15m-1764167400) | $1 | ❌ | DOWN | $-1 | $659 | L1 |
| 57 | 14:45 | [btc-updown-15m-1764168300](https://polymarket.com/event/btc-updown-15m-1764168300) | $2 | ❌ | DOWN | $-2 | $657 | L2 |
| 58 | 15:00 | [btc-updown-15m-1764169200](https://polymarket.com/event/btc-updown-15m-1764169200) | $4 | ✅ | UP | +$4 | $661 | - |
| 59 | 15:15 | [btc-updown-15m-1764170100](https://polymarket.com/event/btc-updown-15m-1764170100) | $1 | ✅ | UP | +$1 | $662 | - |
| 60 | 15:30 | [btc-updown-15m-1764171000](https://polymarket.com/event/btc-updown-15m-1764171000) | $1 | ❌ | DOWN | $-1 | $661 | L1 |
| 61 | 15:45 | [btc-updown-15m-1764171900](https://polymarket.com/event/btc-updown-15m-1764171900) | $2 | ✅ | UP | +$2 | $663 | - |
| 62 | 16:00 | [btc-updown-15m-1764172800](https://polymarket.com/event/btc-updown-15m-1764172800) | $1 | ✅ | UP | +$1 | $664 | - |
| 63 | 16:15 | [btc-updown-15m-1764173700](https://polymarket.com/event/btc-updown-15m-1764173700) | $1 | ✅ | UP | +$1 | $665 | - |
| 64 | 16:30 | [btc-updown-15m-1764174600](https://polymarket.com/event/btc-updown-15m-1764174600) | $1 | ✅ | UP | +$1 | $666 | - |
| 65 | 16:45 | [btc-updown-15m-1764175500](https://polymarket.com/event/btc-updown-15m-1764175500) | $1 | ✅ | UP | +$1 | $667 | - |
| 66 | 17:00 | [btc-updown-15m-1764176400](https://polymarket.com/event/btc-updown-15m-1764176400) | $1 | ✅ | UP | +$1 | $668 | - |
| 67 | 17:15 | [btc-updown-15m-1764177300](https://polymarket.com/event/btc-updown-15m-1764177300) | $1 | ✅ | UP | +$1 | $669 | - |
| 68 | 17:30 | [btc-updown-15m-1764178200](https://polymarket.com/event/btc-updown-15m-1764178200) | $1 | ✅ | UP | +$1 | $670 | - |
| 69 | 17:45 | [btc-updown-15m-1764179100](https://polymarket.com/event/btc-updown-15m-1764179100) | $1 | ✅ | UP | +$1 | $671 | - |
| 70 | 18:00 | [btc-updown-15m-1764180000](https://polymarket.com/event/btc-updown-15m-1764180000) | $1 | ✅ | UP | +$1 | $672 | - |
| 71 | 18:15 | [btc-updown-15m-1764180900](https://polymarket.com/event/btc-updown-15m-1764180900) | $1 | ✅ | UP | +$1 | $673 | - |
| 72 | 18:30 | [btc-updown-15m-1764181800](https://polymarket.com/event/btc-updown-15m-1764181800) | $1 | ❌ | DOWN | $-1 | $672 | L1 |
| 73 | 18:45 | [btc-updown-15m-1764182700](https://polymarket.com/event/btc-updown-15m-1764182700) | $2 | ✅ | UP | +$2 | $674 | - |
| 74 | 19:00 | [btc-updown-15m-1764183600](https://polymarket.com/event/btc-updown-15m-1764183600) | $1 | ❌ | DOWN | $-1 | $673 | L1 |
| 75 | 19:15 | [btc-updown-15m-1764184500](https://polymarket.com/event/btc-updown-15m-1764184500) | $2 | ❌ | DOWN | $-2 | $671 | L2 |
| 76 | 19:30 | [btc-updown-15m-1764185400](https://polymarket.com/event/btc-updown-15m-1764185400) | $4 | ✅ | UP | +$4 | $675 | - |
| 77 | 19:45 | [btc-updown-15m-1764186300](https://polymarket.com/event/btc-updown-15m-1764186300) | $1 | ✅ | UP | +$1 | $676 | - |
| 78 | 20:00 | [btc-updown-15m-1764187200](https://polymarket.com/event/btc-updown-15m-1764187200) | $1 | ✅ | UP | +$1 | $677 | - |
| 79 | 20:15 | [btc-updown-15m-1764188100](https://polymarket.com/event/btc-updown-15m-1764188100) | $1 | ✅ | UP | +$1 | $678 | - |
| 80 | 20:30 | [btc-updown-15m-1764189000](https://polymarket.com/event/btc-updown-15m-1764189000) | $1 | ❌ | DOWN | $-1 | $677 | L1 |
| 81 | 20:45 | [btc-updown-15m-1764189900](https://polymarket.com/event/btc-updown-15m-1764189900) | $2 | ✅ | UP | +$2 | $679 | - |
| 82 | 21:00 | [btc-updown-15m-1764190800](https://polymarket.com/event/btc-updown-15m-1764190800) | $1 | ❌ | DOWN | $-1 | $678 | L1 |
| 83 | 21:15 | [btc-updown-15m-1764191700](https://polymarket.com/event/btc-updown-15m-1764191700) | $2 | ✅ | UP | +$2 | $680 | - |
| 84 | 21:30 | [btc-updown-15m-1764192600](https://polymarket.com/event/btc-updown-15m-1764192600) | $1 | ❌ | DOWN | $-1 | $679 | L1 |
| 85 | 21:45 | [btc-updown-15m-1764193500](https://polymarket.com/event/btc-updown-15m-1764193500) | $2 | ❌ | DOWN | $-2 | $677 | L2 |
| 86 | 22:00 | [btc-updown-15m-1764194400](https://polymarket.com/event/btc-updown-15m-1764194400) | $4 | ✅ | UP | +$4 | $681 | - |
| 87 | 22:15 | [btc-updown-15m-1764195300](https://polymarket.com/event/btc-updown-15m-1764195300) | $1 | ✅ | UP | +$1 | $682 | - |
| 88 | 22:30 | [btc-updown-15m-1764196200](https://polymarket.com/event/btc-updown-15m-1764196200) | $1 | ❌ | DOWN | $-1 | $681 | L1 |
| 89 | 22:45 | [btc-updown-15m-1764197100](https://polymarket.com/event/btc-updown-15m-1764197100) | $2 | ✅ | UP | +$2 | $683 | - |
| 90 | 23:00 | [btc-updown-15m-1764198000](https://polymarket.com/event/btc-updown-15m-1764198000) | $1 | ✅ | UP | +$1 | $684 | - |
| 91 | 23:15 | [btc-updown-15m-1764198900](https://polymarket.com/event/btc-updown-15m-1764198900) | $1 | ❌ | DOWN | $-1 | $683 | L1 |
| 92 | 23:30 | [btc-updown-15m-1764199800](https://polymarket.com/event/btc-updown-15m-1764199800) | $2 | ✅ | UP | +$2 | $685 | - |
| 93 | 23:45 | [btc-updown-15m-1764200700](https://polymarket.com/event/btc-updown-15m-1764200700) | $1 | ✅ | UP | +$1 | $686 | - |

### 2025-11-27
**Summary:** 90 trades | 49 wins | 41 losses | Max Bet: $32 | Profit: +$48

**Skip Events (2):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 03:45 | 5 | $31 | $32 | 04:45 |
| 13:15 | 5 | $31 | $32 | 14:15 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764201600](https://polymarket.com/event/btc-updown-15m-1764201600) | $1 | ❌ | DOWN | $-1 | $685 | L1 |
| 2 | 00:15 | [btc-updown-15m-1764202500](https://polymarket.com/event/btc-updown-15m-1764202500) | $2 | ✅ | UP | +$2 | $687 | - |
| 3 | 00:30 | [btc-updown-15m-1764203400](https://polymarket.com/event/btc-updown-15m-1764203400) | $1 | ✅ | UP | +$1 | $688 | - |
| 4 | 00:45 | [btc-updown-15m-1764204300](https://polymarket.com/event/btc-updown-15m-1764204300) | $1 | ✅ | UP | +$1 | $689 | - |
| 5 | 01:00 | [btc-updown-15m-1764205200](https://polymarket.com/event/btc-updown-15m-1764205200) | $1 | ✅ | UP | +$1 | $690 | - |
| 6 | 01:15 | [btc-updown-15m-1764206100](https://polymarket.com/event/btc-updown-15m-1764206100) | $1 | ✅ | UP | +$1 | $691 | - |
| 7 | 01:30 | [btc-updown-15m-1764207000](https://polymarket.com/event/btc-updown-15m-1764207000) | $1 | ❌ | DOWN | $-1 | $690 | L1 |
| 8 | 01:45 | [btc-updown-15m-1764207900](https://polymarket.com/event/btc-updown-15m-1764207900) | $2 | ✅ | UP | +$2 | $692 | - |
| 9 | 02:00 | [btc-updown-15m-1764208800](https://polymarket.com/event/btc-updown-15m-1764208800) | $1 | ❌ | DOWN | $-1 | $691 | L1 |
| 10 | 02:15 | [btc-updown-15m-1764209700](https://polymarket.com/event/btc-updown-15m-1764209700) | $2 | ✅ | UP | +$2 | $693 | - |
| 11 | 02:30 | [btc-updown-15m-1764210600](https://polymarket.com/event/btc-updown-15m-1764210600) | $1 | ✅ | UP | +$1 | $694 | - |
| 12 | 02:45 | [btc-updown-15m-1764211500](https://polymarket.com/event/btc-updown-15m-1764211500) | $1 | ❌ | DOWN | $-1 | $693 | L1 |
| 13 | 03:00 | [btc-updown-15m-1764212400](https://polymarket.com/event/btc-updown-15m-1764212400) | $2 | ❌ | DOWN | $-2 | $691 | L2 |
| 14 | 03:15 | [btc-updown-15m-1764213300](https://polymarket.com/event/btc-updown-15m-1764213300) | $4 | ❌ | DOWN | $-4 | $687 | L3 |
| 15 | 03:30 | [btc-updown-15m-1764214200](https://polymarket.com/event/btc-updown-15m-1764214200) | $8 | ❌ | DOWN | $-8 | $679 | L4 |
| 16 | 03:45 | [btc-updown-15m-1764215100](https://polymarket.com/event/btc-updown-15m-1764215100) | $16 | ❌ | DOWN | $-16 | $663 | L5 |
| - | 04:00 | [btc-updown-15m-1764216000](https://polymarket.com/event/btc-updown-15m-1764216000) | - | ⏭️ SKIP | UP | - | $663 | - |
| - | 04:15 | [btc-updown-15m-1764216900](https://polymarket.com/event/btc-updown-15m-1764216900) | - | ⏭️ SKIP | DOWN | - | $663 | - |
| - | 04:30 | [btc-updown-15m-1764217800](https://polymarket.com/event/btc-updown-15m-1764217800) | - | ⏭️ SKIP | UP | - | $663 | - |
| 17 | 04:45 | [btc-updown-15m-1764218700](https://polymarket.com/event/btc-updown-15m-1764218700) | $32 | ✅ | UP | +$32 | $695 | - |
| 18 | 05:00 | [btc-updown-15m-1764219600](https://polymarket.com/event/btc-updown-15m-1764219600) | $1 | ✅ | UP | +$1 | $696 | - |
| 19 | 05:15 | [btc-updown-15m-1764220500](https://polymarket.com/event/btc-updown-15m-1764220500) | $1 | ✅ | UP | +$1 | $697 | - |
| 20 | 05:30 | [btc-updown-15m-1764221400](https://polymarket.com/event/btc-updown-15m-1764221400) | $1 | ❌ | DOWN | $-1 | $696 | L1 |
| 21 | 05:45 | [btc-updown-15m-1764222300](https://polymarket.com/event/btc-updown-15m-1764222300) | $2 | ✅ | UP | +$2 | $698 | - |
| 22 | 06:00 | [btc-updown-15m-1764223200](https://polymarket.com/event/btc-updown-15m-1764223200) | $1 | ✅ | UP | +$1 | $699 | - |
| 23 | 06:15 | [btc-updown-15m-1764224100](https://polymarket.com/event/btc-updown-15m-1764224100) | $1 | ✅ | UP | +$1 | $700 | - |
| 24 | 06:30 | [btc-updown-15m-1764225000](https://polymarket.com/event/btc-updown-15m-1764225000) | $1 | ❌ | DOWN | $-1 | $699 | L1 |
| 25 | 06:45 | [btc-updown-15m-1764225900](https://polymarket.com/event/btc-updown-15m-1764225900) | $2 | ❌ | DOWN | $-2 | $697 | L2 |
| 26 | 07:00 | [btc-updown-15m-1764226800](https://polymarket.com/event/btc-updown-15m-1764226800) | $4 | ✅ | UP | +$4 | $701 | - |
| 27 | 07:15 | [btc-updown-15m-1764227700](https://polymarket.com/event/btc-updown-15m-1764227700) | $1 | ✅ | UP | +$1 | $702 | - |
| 28 | 07:30 | [btc-updown-15m-1764228600](https://polymarket.com/event/btc-updown-15m-1764228600) | $1 | ❌ | DOWN | $-1 | $701 | L1 |
| 29 | 07:45 | [btc-updown-15m-1764229500](https://polymarket.com/event/btc-updown-15m-1764229500) | $2 | ✅ | UP | +$2 | $703 | - |
| 30 | 08:00 | [btc-updown-15m-1764230400](https://polymarket.com/event/btc-updown-15m-1764230400) | $1 | ❌ | DOWN | $-1 | $702 | L1 |
| 31 | 08:15 | [btc-updown-15m-1764231300](https://polymarket.com/event/btc-updown-15m-1764231300) | $2 | ✅ | UP | +$2 | $704 | - |
| 32 | 08:30 | [btc-updown-15m-1764232200](https://polymarket.com/event/btc-updown-15m-1764232200) | $1 | ✅ | UP | +$1 | $705 | - |
| 33 | 08:45 | [btc-updown-15m-1764233100](https://polymarket.com/event/btc-updown-15m-1764233100) | $1 | ✅ | UP | +$1 | $706 | - |
| 34 | 09:00 | [btc-updown-15m-1764234000](https://polymarket.com/event/btc-updown-15m-1764234000) | $1 | ✅ | UP | +$1 | $707 | - |
| 35 | 09:15 | [btc-updown-15m-1764234900](https://polymarket.com/event/btc-updown-15m-1764234900) | $1 | ✅ | UP | +$1 | $708 | - |
| 36 | 09:30 | [btc-updown-15m-1764235800](https://polymarket.com/event/btc-updown-15m-1764235800) | $1 | ✅ | UP | +$1 | $709 | - |
| 37 | 09:45 | [btc-updown-15m-1764236700](https://polymarket.com/event/btc-updown-15m-1764236700) | $1 | ❌ | DOWN | $-1 | $708 | L1 |
| 38 | 10:00 | [btc-updown-15m-1764237600](https://polymarket.com/event/btc-updown-15m-1764237600) | $2 | ✅ | UP | +$2 | $710 | - |
| 39 | 10:15 | [btc-updown-15m-1764238500](https://polymarket.com/event/btc-updown-15m-1764238500) | $1 | ✅ | UP | +$1 | $711 | - |
| 40 | 10:30 | [btc-updown-15m-1764239400](https://polymarket.com/event/btc-updown-15m-1764239400) | $1 | ❌ | DOWN | $-1 | $710 | L1 |
| 41 | 10:45 | [btc-updown-15m-1764240300](https://polymarket.com/event/btc-updown-15m-1764240300) | $2 | ✅ | UP | +$2 | $712 | - |
| 42 | 11:00 | [btc-updown-15m-1764241200](https://polymarket.com/event/btc-updown-15m-1764241200) | $1 | ❌ | DOWN | $-1 | $711 | L1 |
| 43 | 11:15 | [btc-updown-15m-1764242100](https://polymarket.com/event/btc-updown-15m-1764242100) | $2 | ❌ | DOWN | $-2 | $709 | L2 |
| 44 | 11:30 | [btc-updown-15m-1764243000](https://polymarket.com/event/btc-updown-15m-1764243000) | $4 | ✅ | UP | +$4 | $713 | - |
| 45 | 11:45 | [btc-updown-15m-1764243900](https://polymarket.com/event/btc-updown-15m-1764243900) | $1 | ❌ | DOWN | $-1 | $712 | L1 |
| 46 | 12:00 | [btc-updown-15m-1764244800](https://polymarket.com/event/btc-updown-15m-1764244800) | $2 | ✅ | UP | +$2 | $714 | - |
| 47 | 12:15 | [btc-updown-15m-1764245700](https://polymarket.com/event/btc-updown-15m-1764245700) | $1 | ❌ | DOWN | $-1 | $713 | L1 |
| 48 | 12:30 | [btc-updown-15m-1764246600](https://polymarket.com/event/btc-updown-15m-1764246600) | $2 | ❌ | DOWN | $-2 | $711 | L2 |
| 49 | 12:45 | [btc-updown-15m-1764247500](https://polymarket.com/event/btc-updown-15m-1764247500) | $4 | ❌ | DOWN | $-4 | $707 | L3 |
| 50 | 13:00 | [btc-updown-15m-1764248400](https://polymarket.com/event/btc-updown-15m-1764248400) | $8 | ❌ | DOWN | $-8 | $699 | L4 |
| 51 | 13:15 | [btc-updown-15m-1764249300](https://polymarket.com/event/btc-updown-15m-1764249300) | $16 | ❌ | DOWN | $-16 | $683 | L5 |
| - | 13:30 | [btc-updown-15m-1764250200](https://polymarket.com/event/btc-updown-15m-1764250200) | - | ⏭️ SKIP | UP | - | $683 | - |
| - | 13:45 | [btc-updown-15m-1764251100](https://polymarket.com/event/btc-updown-15m-1764251100) | - | ⏭️ SKIP | UP | - | $683 | - |
| - | 14:00 | [btc-updown-15m-1764252000](https://polymarket.com/event/btc-updown-15m-1764252000) | - | ⏭️ SKIP | DOWN | - | $683 | - |
| 52 | 14:15 | [btc-updown-15m-1764252900](https://polymarket.com/event/btc-updown-15m-1764252900) | $32 | ✅ | UP | +$32 | $715 | - |
| 53 | 14:30 | [btc-updown-15m-1764253800](https://polymarket.com/event/btc-updown-15m-1764253800) | $1 | ❌ | DOWN | $-1 | $714 | L1 |
| 54 | 14:45 | [btc-updown-15m-1764254700](https://polymarket.com/event/btc-updown-15m-1764254700) | $2 | ✅ | UP | +$2 | $716 | - |
| 55 | 15:00 | [btc-updown-15m-1764255600](https://polymarket.com/event/btc-updown-15m-1764255600) | $1 | ❌ | DOWN | $-1 | $715 | L1 |
| 56 | 15:15 | [btc-updown-15m-1764256500](https://polymarket.com/event/btc-updown-15m-1764256500) | $2 | ✅ | UP | +$2 | $717 | - |
| 57 | 15:30 | [btc-updown-15m-1764257400](https://polymarket.com/event/btc-updown-15m-1764257400) | $1 | ❌ | DOWN | $-1 | $716 | L1 |
| 58 | 15:45 | [btc-updown-15m-1764258300](https://polymarket.com/event/btc-updown-15m-1764258300) | $2 | ✅ | UP | +$2 | $718 | - |
| 59 | 16:00 | [btc-updown-15m-1764259200](https://polymarket.com/event/btc-updown-15m-1764259200) | $1 | ✅ | UP | +$1 | $719 | - |
| 60 | 16:15 | [btc-updown-15m-1764260100](https://polymarket.com/event/btc-updown-15m-1764260100) | $1 | ❌ | DOWN | $-1 | $718 | L1 |
| 61 | 16:30 | [btc-updown-15m-1764261000](https://polymarket.com/event/btc-updown-15m-1764261000) | $2 | ✅ | UP | +$2 | $720 | - |
| 62 | 16:45 | [btc-updown-15m-1764261900](https://polymarket.com/event/btc-updown-15m-1764261900) | $1 | ✅ | UP | +$1 | $721 | - |
| 63 | 17:00 | [btc-updown-15m-1764262800](https://polymarket.com/event/btc-updown-15m-1764262800) | $1 | ✅ | UP | +$1 | $722 | - |
| 64 | 17:15 | [btc-updown-15m-1764263700](https://polymarket.com/event/btc-updown-15m-1764263700) | $1 | ❌ | DOWN | $-1 | $721 | L1 |
| 65 | 17:30 | [btc-updown-15m-1764264600](https://polymarket.com/event/btc-updown-15m-1764264600) | $2 | ✅ | UP | +$2 | $723 | - |
| 66 | 17:45 | [btc-updown-15m-1764265500](https://polymarket.com/event/btc-updown-15m-1764265500) | $1 | ✅ | UP | +$1 | $724 | - |
| 67 | 18:00 | [btc-updown-15m-1764266400](https://polymarket.com/event/btc-updown-15m-1764266400) | $1 | ❌ | DOWN | $-1 | $723 | L1 |
| 68 | 18:15 | [btc-updown-15m-1764267300](https://polymarket.com/event/btc-updown-15m-1764267300) | $2 | ❌ | DOWN | $-2 | $721 | L2 |
| 69 | 18:30 | [btc-updown-15m-1764268200](https://polymarket.com/event/btc-updown-15m-1764268200) | $4 | ✅ | UP | +$4 | $725 | - |
| 70 | 18:45 | [btc-updown-15m-1764269100](https://polymarket.com/event/btc-updown-15m-1764269100) | $1 | ✅ | UP | +$1 | $726 | - |
| 71 | 19:00 | [btc-updown-15m-1764270000](https://polymarket.com/event/btc-updown-15m-1764270000) | $1 | ❌ | DOWN | $-1 | $725 | L1 |
| 72 | 19:15 | [btc-updown-15m-1764270900](https://polymarket.com/event/btc-updown-15m-1764270900) | $2 | ❌ | DOWN | $-2 | $723 | L2 |
| 73 | 19:30 | [btc-updown-15m-1764271800](https://polymarket.com/event/btc-updown-15m-1764271800) | $4 | ✅ | UP | +$4 | $727 | - |
| 74 | 19:45 | [btc-updown-15m-1764272700](https://polymarket.com/event/btc-updown-15m-1764272700) | $1 | ❌ | DOWN | $-1 | $726 | L1 |
| 75 | 20:00 | [btc-updown-15m-1764273600](https://polymarket.com/event/btc-updown-15m-1764273600) | $2 | ❌ | DOWN | $-2 | $724 | L2 |
| 76 | 20:15 | [btc-updown-15m-1764274500](https://polymarket.com/event/btc-updown-15m-1764274500) | $4 | ❌ | DOWN | $-4 | $720 | L3 |
| 77 | 20:30 | [btc-updown-15m-1764275400](https://polymarket.com/event/btc-updown-15m-1764275400) | $8 | ✅ | UP | +$8 | $728 | - |
| 78 | 20:45 | [btc-updown-15m-1764276300](https://polymarket.com/event/btc-updown-15m-1764276300) | $1 | ❌ | DOWN | $-1 | $727 | L1 |
| 79 | 21:00 | [btc-updown-15m-1764277200](https://polymarket.com/event/btc-updown-15m-1764277200) | $2 | ❌ | DOWN | $-2 | $725 | L2 |
| 80 | 21:15 | [btc-updown-15m-1764278100](https://polymarket.com/event/btc-updown-15m-1764278100) | $4 | ✅ | UP | +$4 | $729 | - |
| 81 | 21:30 | [btc-updown-15m-1764279000](https://polymarket.com/event/btc-updown-15m-1764279000) | $1 | ✅ | UP | +$1 | $730 | - |
| 82 | 21:45 | [btc-updown-15m-1764279900](https://polymarket.com/event/btc-updown-15m-1764279900) | $1 | ❌ | DOWN | $-1 | $729 | L1 |
| 83 | 22:00 | [btc-updown-15m-1764280800](https://polymarket.com/event/btc-updown-15m-1764280800) | $2 | ✅ | UP | +$2 | $731 | - |
| 84 | 22:15 | [btc-updown-15m-1764281700](https://polymarket.com/event/btc-updown-15m-1764281700) | $1 | ✅ | UP | +$1 | $732 | - |
| 85 | 22:30 | [btc-updown-15m-1764282600](https://polymarket.com/event/btc-updown-15m-1764282600) | $1 | ❌ | DOWN | $-1 | $731 | L1 |
| 86 | 22:45 | [btc-updown-15m-1764283500](https://polymarket.com/event/btc-updown-15m-1764283500) | $2 | ✅ | UP | +$2 | $733 | - |
| 87 | 23:00 | [btc-updown-15m-1764284400](https://polymarket.com/event/btc-updown-15m-1764284400) | $1 | ✅ | UP | +$1 | $734 | - |
| 88 | 23:15 | [btc-updown-15m-1764285300](https://polymarket.com/event/btc-updown-15m-1764285300) | $1 | ❌ | DOWN | $-1 | $733 | L1 |
| 89 | 23:30 | [btc-updown-15m-1764286200](https://polymarket.com/event/btc-updown-15m-1764286200) | $2 | ✅ | UP | +$2 | $735 | - |
| 90 | 23:45 | [btc-updown-15m-1764287100](https://polymarket.com/event/btc-updown-15m-1764287100) | $1 | ❌ | DOWN | $-1 | $734 | L1 |

### 2025-11-28
**Summary:** 96 trades | 53 wins | 43 losses | Max Bet: $16 | Profit: +$53

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764288000](https://polymarket.com/event/btc-updown-15m-1764288000) | $2 | ❌ | DOWN | $-2 | $732 | L2 |
| 2 | 00:15 | [btc-updown-15m-1764288900](https://polymarket.com/event/btc-updown-15m-1764288900) | $4 | ✅ | UP | +$4 | $736 | - |
| 3 | 00:30 | [btc-updown-15m-1764289800](https://polymarket.com/event/btc-updown-15m-1764289800) | $1 | ❌ | DOWN | $-1 | $735 | L1 |
| 4 | 00:45 | [btc-updown-15m-1764290700](https://polymarket.com/event/btc-updown-15m-1764290700) | $2 | ❌ | DOWN | $-2 | $733 | L2 |
| 5 | 01:00 | [btc-updown-15m-1764291600](https://polymarket.com/event/btc-updown-15m-1764291600) | $4 | ❌ | DOWN | $-4 | $729 | L3 |
| 6 | 01:15 | [btc-updown-15m-1764292500](https://polymarket.com/event/btc-updown-15m-1764292500) | $8 | ✅ | UP | +$8 | $737 | - |
| 7 | 01:30 | [btc-updown-15m-1764293400](https://polymarket.com/event/btc-updown-15m-1764293400) | $1 | ✅ | UP | +$1 | $738 | - |
| 8 | 01:45 | [btc-updown-15m-1764294300](https://polymarket.com/event/btc-updown-15m-1764294300) | $1 | ❌ | DOWN | $-1 | $737 | L1 |
| 9 | 02:00 | [btc-updown-15m-1764295200](https://polymarket.com/event/btc-updown-15m-1764295200) | $2 | ✅ | UP | +$2 | $739 | - |
| 10 | 02:15 | [btc-updown-15m-1764296100](https://polymarket.com/event/btc-updown-15m-1764296100) | $1 | ❌ | DOWN | $-1 | $738 | L1 |
| 11 | 02:30 | [btc-updown-15m-1764297000](https://polymarket.com/event/btc-updown-15m-1764297000) | $2 | ✅ | UP | +$2 | $740 | - |
| 12 | 02:45 | [btc-updown-15m-1764297900](https://polymarket.com/event/btc-updown-15m-1764297900) | $1 | ✅ | UP | +$1 | $741 | - |
| 13 | 03:00 | [btc-updown-15m-1764298800](https://polymarket.com/event/btc-updown-15m-1764298800) | $1 | ✅ | UP | +$1 | $742 | - |
| 14 | 03:15 | [btc-updown-15m-1764299700](https://polymarket.com/event/btc-updown-15m-1764299700) | $1 | ✅ | UP | +$1 | $743 | - |
| 15 | 03:30 | [btc-updown-15m-1764300600](https://polymarket.com/event/btc-updown-15m-1764300600) | $1 | ❌ | DOWN | $-1 | $742 | L1 |
| 16 | 03:45 | [btc-updown-15m-1764301500](https://polymarket.com/event/btc-updown-15m-1764301500) | $2 | ✅ | UP | +$2 | $744 | - |
| 17 | 04:00 | [btc-updown-15m-1764302400](https://polymarket.com/event/btc-updown-15m-1764302400) | $1 | ✅ | UP | +$1 | $745 | - |
| 18 | 04:15 | [btc-updown-15m-1764303300](https://polymarket.com/event/btc-updown-15m-1764303300) | $1 | ✅ | UP | +$1 | $746 | - |
| 19 | 04:30 | [btc-updown-15m-1764304200](https://polymarket.com/event/btc-updown-15m-1764304200) | $1 | ✅ | UP | +$1 | $747 | - |
| 20 | 04:45 | [btc-updown-15m-1764305100](https://polymarket.com/event/btc-updown-15m-1764305100) | $1 | ❌ | DOWN | $-1 | $746 | L1 |
| 21 | 05:00 | [btc-updown-15m-1764306000](https://polymarket.com/event/btc-updown-15m-1764306000) | $2 | ✅ | UP | +$2 | $748 | - |
| 22 | 05:15 | [btc-updown-15m-1764306900](https://polymarket.com/event/btc-updown-15m-1764306900) | $1 | ✅ | UP | +$1 | $749 | - |
| 23 | 05:30 | [btc-updown-15m-1764307800](https://polymarket.com/event/btc-updown-15m-1764307800) | $1 | ✅ | UP | +$1 | $750 | - |
| 24 | 05:45 | [btc-updown-15m-1764308700](https://polymarket.com/event/btc-updown-15m-1764308700) | $1 | ✅ | UP | +$1 | $751 | - |
| 25 | 06:00 | [btc-updown-15m-1764309600](https://polymarket.com/event/btc-updown-15m-1764309600) | $1 | ❌ | DOWN | $-1 | $750 | L1 |
| 26 | 06:15 | [btc-updown-15m-1764310500](https://polymarket.com/event/btc-updown-15m-1764310500) | $2 | ❌ | DOWN | $-2 | $748 | L2 |
| 27 | 06:30 | [btc-updown-15m-1764311400](https://polymarket.com/event/btc-updown-15m-1764311400) | $4 | ✅ | UP | +$4 | $752 | - |
| 28 | 06:45 | [btc-updown-15m-1764312300](https://polymarket.com/event/btc-updown-15m-1764312300) | $1 | ❌ | DOWN | $-1 | $751 | L1 |
| 29 | 07:00 | [btc-updown-15m-1764313200](https://polymarket.com/event/btc-updown-15m-1764313200) | $2 | ✅ | UP | +$2 | $753 | - |
| 30 | 07:15 | [btc-updown-15m-1764314100](https://polymarket.com/event/btc-updown-15m-1764314100) | $1 | ✅ | UP | +$1 | $754 | - |
| 31 | 07:30 | [btc-updown-15m-1764315000](https://polymarket.com/event/btc-updown-15m-1764315000) | $1 | ❌ | DOWN | $-1 | $753 | L1 |
| 32 | 07:45 | [btc-updown-15m-1764315900](https://polymarket.com/event/btc-updown-15m-1764315900) | $2 | ❌ | DOWN | $-2 | $751 | L2 |
| 33 | 08:00 | [btc-updown-15m-1764316800](https://polymarket.com/event/btc-updown-15m-1764316800) | $4 | ✅ | UP | +$4 | $755 | - |
| 34 | 08:15 | [btc-updown-15m-1764317700](https://polymarket.com/event/btc-updown-15m-1764317700) | $1 | ✅ | UP | +$1 | $756 | - |
| 35 | 08:30 | [btc-updown-15m-1764318600](https://polymarket.com/event/btc-updown-15m-1764318600) | $1 | ❌ | DOWN | $-1 | $755 | L1 |
| 36 | 08:45 | [btc-updown-15m-1764319500](https://polymarket.com/event/btc-updown-15m-1764319500) | $2 | ✅ | UP | +$2 | $757 | - |
| 37 | 09:00 | [btc-updown-15m-1764320400](https://polymarket.com/event/btc-updown-15m-1764320400) | $1 | ❌ | DOWN | $-1 | $756 | L1 |
| 38 | 09:15 | [btc-updown-15m-1764321300](https://polymarket.com/event/btc-updown-15m-1764321300) | $2 | ❌ | DOWN | $-2 | $754 | L2 |
| 39 | 09:30 | [btc-updown-15m-1764322200](https://polymarket.com/event/btc-updown-15m-1764322200) | $4 | ❌ | DOWN | $-4 | $750 | L3 |
| 40 | 09:45 | [btc-updown-15m-1764323100](https://polymarket.com/event/btc-updown-15m-1764323100) | $8 | ✅ | UP | +$8 | $758 | - |
| 41 | 10:00 | [btc-updown-15m-1764324000](https://polymarket.com/event/btc-updown-15m-1764324000) | $1 | ❌ | DOWN | $-1 | $757 | L1 |
| 42 | 10:15 | [btc-updown-15m-1764324900](https://polymarket.com/event/btc-updown-15m-1764324900) | $2 | ✅ | UP | +$2 | $759 | - |
| 43 | 10:30 | [btc-updown-15m-1764325800](https://polymarket.com/event/btc-updown-15m-1764325800) | $1 | ✅ | UP | +$1 | $760 | - |
| 44 | 10:45 | [btc-updown-15m-1764326700](https://polymarket.com/event/btc-updown-15m-1764326700) | $1 | ✅ | UP | +$1 | $761 | - |
| 45 | 11:00 | [btc-updown-15m-1764327600](https://polymarket.com/event/btc-updown-15m-1764327600) | $1 | ❌ | DOWN | $-1 | $760 | L1 |
| 46 | 11:15 | [btc-updown-15m-1764328500](https://polymarket.com/event/btc-updown-15m-1764328500) | $2 | ❌ | DOWN | $-2 | $758 | L2 |
| 47 | 11:30 | [btc-updown-15m-1764329400](https://polymarket.com/event/btc-updown-15m-1764329400) | $4 | ❌ | DOWN | $-4 | $754 | L3 |
| 48 | 11:45 | [btc-updown-15m-1764330300](https://polymarket.com/event/btc-updown-15m-1764330300) | $8 | ✅ | UP | +$8 | $762 | - |
| 49 | 12:00 | [btc-updown-15m-1764331200](https://polymarket.com/event/btc-updown-15m-1764331200) | $1 | ✅ | UP | +$1 | $763 | - |
| 50 | 12:15 | [btc-updown-15m-1764332100](https://polymarket.com/event/btc-updown-15m-1764332100) | $1 | ✅ | UP | +$1 | $764 | - |
| 51 | 12:30 | [btc-updown-15m-1764333000](https://polymarket.com/event/btc-updown-15m-1764333000) | $1 | ❌ | DOWN | $-1 | $763 | L1 |
| 52 | 12:45 | [btc-updown-15m-1764333900](https://polymarket.com/event/btc-updown-15m-1764333900) | $2 | ✅ | UP | +$2 | $765 | - |
| 53 | 13:00 | [btc-updown-15m-1764334800](https://polymarket.com/event/btc-updown-15m-1764334800) | $1 | ❌ | DOWN | $-1 | $764 | L1 |
| 54 | 13:15 | [btc-updown-15m-1764335700](https://polymarket.com/event/btc-updown-15m-1764335700) | $2 | ✅ | UP | +$2 | $766 | - |
| 55 | 13:30 | [btc-updown-15m-1764336600](https://polymarket.com/event/btc-updown-15m-1764336600) | $1 | ✅ | UP | +$1 | $767 | - |
| 56 | 13:45 | [btc-updown-15m-1764337500](https://polymarket.com/event/btc-updown-15m-1764337500) | $1 | ✅ | UP | +$1 | $768 | - |
| 57 | 14:00 | [btc-updown-15m-1764338400](https://polymarket.com/event/btc-updown-15m-1764338400) | $1 | ❌ | DOWN | $-1 | $767 | L1 |
| 58 | 14:15 | [btc-updown-15m-1764339300](https://polymarket.com/event/btc-updown-15m-1764339300) | $2 | ✅ | UP | +$2 | $769 | - |
| 59 | 14:30 | [btc-updown-15m-1764340200](https://polymarket.com/event/btc-updown-15m-1764340200) | $1 | ❌ | DOWN | $-1 | $768 | L1 |
| 60 | 14:45 | [btc-updown-15m-1764341100](https://polymarket.com/event/btc-updown-15m-1764341100) | $2 | ✅ | UP | +$2 | $770 | - |
| 61 | 15:00 | [btc-updown-15m-1764342000](https://polymarket.com/event/btc-updown-15m-1764342000) | $1 | ✅ | UP | +$1 | $771 | - |
| 62 | 15:15 | [btc-updown-15m-1764342900](https://polymarket.com/event/btc-updown-15m-1764342900) | $1 | ✅ | UP | +$1 | $772 | - |
| 63 | 15:30 | [btc-updown-15m-1764343800](https://polymarket.com/event/btc-updown-15m-1764343800) | $1 | ❌ | DOWN | $-1 | $771 | L1 |
| 64 | 15:45 | [btc-updown-15m-1764344700](https://polymarket.com/event/btc-updown-15m-1764344700) | $2 | ❌ | DOWN | $-2 | $769 | L2 |
| 65 | 16:00 | [btc-updown-15m-1764345600](https://polymarket.com/event/btc-updown-15m-1764345600) | $4 | ❌ | DOWN | $-4 | $765 | L3 |
| 66 | 16:15 | [btc-updown-15m-1764346500](https://polymarket.com/event/btc-updown-15m-1764346500) | $8 | ❌ | DOWN | $-8 | $757 | L4 |
| 67 | 16:30 | [btc-updown-15m-1764347400](https://polymarket.com/event/btc-updown-15m-1764347400) | $16 | ✅ | UP | +$16 | $773 | - |
| 68 | 16:45 | [btc-updown-15m-1764348300](https://polymarket.com/event/btc-updown-15m-1764348300) | $1 | ❌ | DOWN | $-1 | $772 | L1 |
| 69 | 17:00 | [btc-updown-15m-1764349200](https://polymarket.com/event/btc-updown-15m-1764349200) | $2 | ❌ | DOWN | $-2 | $770 | L2 |
| 70 | 17:15 | [btc-updown-15m-1764350100](https://polymarket.com/event/btc-updown-15m-1764350100) | $4 | ❌ | DOWN | $-4 | $766 | L3 |
| 71 | 17:30 | [btc-updown-15m-1764351000](https://polymarket.com/event/btc-updown-15m-1764351000) | $8 | ❌ | DOWN | $-8 | $758 | L4 |
| 72 | 17:45 | [btc-updown-15m-1764351900](https://polymarket.com/event/btc-updown-15m-1764351900) | $16 | ✅ | UP | +$16 | $774 | - |
| 73 | 18:00 | [btc-updown-15m-1764352800](https://polymarket.com/event/btc-updown-15m-1764352800) | $1 | ✅ | UP | +$1 | $775 | - |
| 74 | 18:15 | [btc-updown-15m-1764353700](https://polymarket.com/event/btc-updown-15m-1764353700) | $1 | ❌ | DOWN | $-1 | $774 | L1 |
| 75 | 18:30 | [btc-updown-15m-1764354600](https://polymarket.com/event/btc-updown-15m-1764354600) | $2 | ✅ | UP | +$2 | $776 | - |
| 76 | 18:45 | [btc-updown-15m-1764355500](https://polymarket.com/event/btc-updown-15m-1764355500) | $1 | ✅ | UP | +$1 | $777 | - |
| 77 | 19:00 | [btc-updown-15m-1764356400](https://polymarket.com/event/btc-updown-15m-1764356400) | $1 | ✅ | UP | +$1 | $778 | - |
| 78 | 19:15 | [btc-updown-15m-1764357300](https://polymarket.com/event/btc-updown-15m-1764357300) | $1 | ✅ | UP | +$1 | $779 | - |
| 79 | 19:30 | [btc-updown-15m-1764358200](https://polymarket.com/event/btc-updown-15m-1764358200) | $1 | ✅ | UP | +$1 | $780 | - |
| 80 | 19:45 | [btc-updown-15m-1764359100](https://polymarket.com/event/btc-updown-15m-1764359100) | $1 | ✅ | UP | +$1 | $781 | - |
| 81 | 20:00 | [btc-updown-15m-1764360000](https://polymarket.com/event/btc-updown-15m-1764360000) | $1 | ❌ | DOWN | $-1 | $780 | L1 |
| 82 | 20:15 | [btc-updown-15m-1764360900](https://polymarket.com/event/btc-updown-15m-1764360900) | $2 | ✅ | UP | +$2 | $782 | - |
| 83 | 20:30 | [btc-updown-15m-1764361800](https://polymarket.com/event/btc-updown-15m-1764361800) | $1 | ❌ | DOWN | $-1 | $781 | L1 |
| 84 | 20:45 | [btc-updown-15m-1764362700](https://polymarket.com/event/btc-updown-15m-1764362700) | $2 | ✅ | UP | +$2 | $783 | - |
| 85 | 21:00 | [btc-updown-15m-1764363600](https://polymarket.com/event/btc-updown-15m-1764363600) | $1 | ❌ | DOWN | $-1 | $782 | L1 |
| 86 | 21:15 | [btc-updown-15m-1764364500](https://polymarket.com/event/btc-updown-15m-1764364500) | $2 | ❌ | DOWN | $-2 | $780 | L2 |
| 87 | 21:30 | [btc-updown-15m-1764365400](https://polymarket.com/event/btc-updown-15m-1764365400) | $4 | ✅ | UP | +$4 | $784 | - |
| 88 | 21:45 | [btc-updown-15m-1764366300](https://polymarket.com/event/btc-updown-15m-1764366300) | $1 | ❌ | DOWN | $-1 | $783 | L1 |
| 89 | 22:00 | [btc-updown-15m-1764367200](https://polymarket.com/event/btc-updown-15m-1764367200) | $2 | ❌ | DOWN | $-2 | $781 | L2 |
| 90 | 22:15 | [btc-updown-15m-1764368100](https://polymarket.com/event/btc-updown-15m-1764368100) | $4 | ✅ | UP | +$4 | $785 | - |
| 91 | 22:30 | [btc-updown-15m-1764369000](https://polymarket.com/event/btc-updown-15m-1764369000) | $1 | ✅ | UP | +$1 | $786 | - |
| 92 | 22:45 | [btc-updown-15m-1764369900](https://polymarket.com/event/btc-updown-15m-1764369900) | $1 | ✅ | UP | +$1 | $787 | - |
| 93 | 23:00 | [btc-updown-15m-1764370800](https://polymarket.com/event/btc-updown-15m-1764370800) | $1 | ❌ | DOWN | $-1 | $786 | L1 |
| 94 | 23:15 | [btc-updown-15m-1764371700](https://polymarket.com/event/btc-updown-15m-1764371700) | $2 | ❌ | DOWN | $-2 | $784 | L2 |
| 95 | 23:30 | [btc-updown-15m-1764372600](https://polymarket.com/event/btc-updown-15m-1764372600) | $4 | ✅ | UP | +$4 | $788 | - |
| 96 | 23:45 | [btc-updown-15m-1764373500](https://polymarket.com/event/btc-updown-15m-1764373500) | $1 | ❌ | DOWN | $-1 | $787 | L1 |

### 2025-11-29
**Summary:** 96 trades | 46 wins | 50 losses | Max Bet: $16 | Profit: +$46

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764374400](https://polymarket.com/event/btc-updown-15m-1764374400) | $2 | ❌ | DOWN | $-2 | $785 | L2 |
| 2 | 00:15 | [btc-updown-15m-1764375300](https://polymarket.com/event/btc-updown-15m-1764375300) | $4 | ✅ | UP | +$4 | $789 | - |
| 3 | 00:30 | [btc-updown-15m-1764376200](https://polymarket.com/event/btc-updown-15m-1764376200) | $1 | ✅ | UP | +$1 | $790 | - |
| 4 | 00:45 | [btc-updown-15m-1764377100](https://polymarket.com/event/btc-updown-15m-1764377100) | $1 | ❌ | DOWN | $-1 | $789 | L1 |
| 5 | 01:00 | [btc-updown-15m-1764378000](https://polymarket.com/event/btc-updown-15m-1764378000) | $2 | ✅ | UP | +$2 | $791 | - |
| 6 | 01:15 | [btc-updown-15m-1764378900](https://polymarket.com/event/btc-updown-15m-1764378900) | $1 | ❌ | DOWN | $-1 | $790 | L1 |
| 7 | 01:30 | [btc-updown-15m-1764379800](https://polymarket.com/event/btc-updown-15m-1764379800) | $2 | ❌ | DOWN | $-2 | $788 | L2 |
| 8 | 01:45 | [btc-updown-15m-1764380700](https://polymarket.com/event/btc-updown-15m-1764380700) | $4 | ✅ | UP | +$4 | $792 | - |
| 9 | 02:00 | [btc-updown-15m-1764381600](https://polymarket.com/event/btc-updown-15m-1764381600) | $1 | ❌ | DOWN | $-1 | $791 | L1 |
| 10 | 02:15 | [btc-updown-15m-1764382500](https://polymarket.com/event/btc-updown-15m-1764382500) | $2 | ❌ | DOWN | $-2 | $789 | L2 |
| 11 | 02:30 | [btc-updown-15m-1764383400](https://polymarket.com/event/btc-updown-15m-1764383400) | $4 | ❌ | DOWN | $-4 | $785 | L3 |
| 12 | 02:45 | [btc-updown-15m-1764384300](https://polymarket.com/event/btc-updown-15m-1764384300) | $8 | ✅ | UP | +$8 | $793 | - |
| 13 | 03:00 | [btc-updown-15m-1764385200](https://polymarket.com/event/btc-updown-15m-1764385200) | $1 | ✅ | UP | +$1 | $794 | - |
| 14 | 03:15 | [btc-updown-15m-1764386100](https://polymarket.com/event/btc-updown-15m-1764386100) | $1 | ❌ | DOWN | $-1 | $793 | L1 |
| 15 | 03:30 | [btc-updown-15m-1764387000](https://polymarket.com/event/btc-updown-15m-1764387000) | $2 | ❌ | DOWN | $-2 | $791 | L2 |
| 16 | 03:45 | [btc-updown-15m-1764387900](https://polymarket.com/event/btc-updown-15m-1764387900) | $4 | ❌ | DOWN | $-4 | $787 | L3 |
| 17 | 04:00 | [btc-updown-15m-1764388800](https://polymarket.com/event/btc-updown-15m-1764388800) | $8 | ❌ | DOWN | $-8 | $779 | L4 |
| 18 | 04:15 | [btc-updown-15m-1764389700](https://polymarket.com/event/btc-updown-15m-1764389700) | $16 | ✅ | UP | +$16 | $795 | - |
| 19 | 04:30 | [btc-updown-15m-1764390600](https://polymarket.com/event/btc-updown-15m-1764390600) | $1 | ✅ | UP | +$1 | $796 | - |
| 20 | 04:45 | [btc-updown-15m-1764391500](https://polymarket.com/event/btc-updown-15m-1764391500) | $1 | ✅ | UP | +$1 | $797 | - |
| 21 | 05:00 | [btc-updown-15m-1764392400](https://polymarket.com/event/btc-updown-15m-1764392400) | $1 | ❌ | DOWN | $-1 | $796 | L1 |
| 22 | 05:15 | [btc-updown-15m-1764393300](https://polymarket.com/event/btc-updown-15m-1764393300) | $2 | ✅ | UP | +$2 | $798 | - |
| 23 | 05:30 | [btc-updown-15m-1764394200](https://polymarket.com/event/btc-updown-15m-1764394200) | $1 | ❌ | DOWN | $-1 | $797 | L1 |
| 24 | 05:45 | [btc-updown-15m-1764395100](https://polymarket.com/event/btc-updown-15m-1764395100) | $2 | ❌ | DOWN | $-2 | $795 | L2 |
| 25 | 06:00 | [btc-updown-15m-1764396000](https://polymarket.com/event/btc-updown-15m-1764396000) | $4 | ✅ | UP | +$4 | $799 | - |
| 26 | 06:15 | [btc-updown-15m-1764396900](https://polymarket.com/event/btc-updown-15m-1764396900) | $1 | ❌ | DOWN | $-1 | $798 | L1 |
| 27 | 06:30 | [btc-updown-15m-1764397800](https://polymarket.com/event/btc-updown-15m-1764397800) | $2 | ❌ | DOWN | $-2 | $796 | L2 |
| 28 | 06:45 | [btc-updown-15m-1764398700](https://polymarket.com/event/btc-updown-15m-1764398700) | $4 | ✅ | UP | +$4 | $800 | - |
| 29 | 07:00 | [btc-updown-15m-1764399600](https://polymarket.com/event/btc-updown-15m-1764399600) | $1 | ❌ | DOWN | $-1 | $799 | L1 |
| 30 | 07:15 | [btc-updown-15m-1764400500](https://polymarket.com/event/btc-updown-15m-1764400500) | $2 | ❌ | DOWN | $-2 | $797 | L2 |
| 31 | 07:30 | [btc-updown-15m-1764401400](https://polymarket.com/event/btc-updown-15m-1764401400) | $4 | ❌ | DOWN | $-4 | $793 | L3 |
| 32 | 07:45 | [btc-updown-15m-1764402300](https://polymarket.com/event/btc-updown-15m-1764402300) | $8 | ✅ | UP | +$8 | $801 | - |
| 33 | 08:00 | [btc-updown-15m-1764403200](https://polymarket.com/event/btc-updown-15m-1764403200) | $1 | ✅ | UP | +$1 | $802 | - |
| 34 | 08:15 | [btc-updown-15m-1764404100](https://polymarket.com/event/btc-updown-15m-1764404100) | $1 | ❌ | DOWN | $-1 | $801 | L1 |
| 35 | 08:30 | [btc-updown-15m-1764405000](https://polymarket.com/event/btc-updown-15m-1764405000) | $2 | ✅ | UP | +$2 | $803 | - |
| 36 | 08:45 | [btc-updown-15m-1764405900](https://polymarket.com/event/btc-updown-15m-1764405900) | $1 | ✅ | UP | +$1 | $804 | - |
| 37 | 09:00 | [btc-updown-15m-1764406800](https://polymarket.com/event/btc-updown-15m-1764406800) | $1 | ❌ | DOWN | $-1 | $803 | L1 |
| 38 | 09:15 | [btc-updown-15m-1764407700](https://polymarket.com/event/btc-updown-15m-1764407700) | $2 | ❌ | DOWN | $-2 | $801 | L2 |
| 39 | 09:30 | [btc-updown-15m-1764408600](https://polymarket.com/event/btc-updown-15m-1764408600) | $4 | ✅ | UP | +$4 | $805 | - |
| 40 | 09:45 | [btc-updown-15m-1764409500](https://polymarket.com/event/btc-updown-15m-1764409500) | $1 | ❌ | DOWN | $-1 | $804 | L1 |
| 41 | 10:00 | [btc-updown-15m-1764410400](https://polymarket.com/event/btc-updown-15m-1764410400) | $2 | ✅ | UP | +$2 | $806 | - |
| 42 | 10:15 | [btc-updown-15m-1764411300](https://polymarket.com/event/btc-updown-15m-1764411300) | $1 | ❌ | DOWN | $-1 | $805 | L1 |
| 43 | 10:30 | [btc-updown-15m-1764412200](https://polymarket.com/event/btc-updown-15m-1764412200) | $2 | ✅ | UP | +$2 | $807 | - |
| 44 | 10:45 | [btc-updown-15m-1764413100](https://polymarket.com/event/btc-updown-15m-1764413100) | $1 | ❌ | DOWN | $-1 | $806 | L1 |
| 45 | 11:00 | [btc-updown-15m-1764414000](https://polymarket.com/event/btc-updown-15m-1764414000) | $2 | ✅ | UP | +$2 | $808 | - |
| 46 | 11:15 | [btc-updown-15m-1764414900](https://polymarket.com/event/btc-updown-15m-1764414900) | $1 | ❌ | DOWN | $-1 | $807 | L1 |
| 47 | 11:30 | [btc-updown-15m-1764415800](https://polymarket.com/event/btc-updown-15m-1764415800) | $2 | ✅ | UP | +$2 | $809 | - |
| 48 | 11:45 | [btc-updown-15m-1764416700](https://polymarket.com/event/btc-updown-15m-1764416700) | $1 | ✅ | UP | +$1 | $810 | - |
| 49 | 12:00 | [btc-updown-15m-1764417600](https://polymarket.com/event/btc-updown-15m-1764417600) | $1 | ❌ | DOWN | $-1 | $809 | L1 |
| 50 | 12:15 | [btc-updown-15m-1764418500](https://polymarket.com/event/btc-updown-15m-1764418500) | $2 | ❌ | DOWN | $-2 | $807 | L2 |
| 51 | 12:30 | [btc-updown-15m-1764419400](https://polymarket.com/event/btc-updown-15m-1764419400) | $4 | ✅ | UP | +$4 | $811 | - |
| 52 | 12:45 | [btc-updown-15m-1764420300](https://polymarket.com/event/btc-updown-15m-1764420300) | $1 | ❌ | DOWN | $-1 | $810 | L1 |
| 53 | 13:00 | [btc-updown-15m-1764421200](https://polymarket.com/event/btc-updown-15m-1764421200) | $2 | ✅ | UP | +$2 | $812 | - |
| 54 | 13:15 | [btc-updown-15m-1764422100](https://polymarket.com/event/btc-updown-15m-1764422100) | $1 | ✅ | UP | +$1 | $813 | - |
| 55 | 13:30 | [btc-updown-15m-1764423000](https://polymarket.com/event/btc-updown-15m-1764423000) | $1 | ❌ | DOWN | $-1 | $812 | L1 |
| 56 | 13:45 | [btc-updown-15m-1764423900](https://polymarket.com/event/btc-updown-15m-1764423900) | $2 | ✅ | UP | +$2 | $814 | - |
| 57 | 14:00 | [btc-updown-15m-1764424800](https://polymarket.com/event/btc-updown-15m-1764424800) | $1 | ❌ | DOWN | $-1 | $813 | L1 |
| 58 | 14:15 | [btc-updown-15m-1764425700](https://polymarket.com/event/btc-updown-15m-1764425700) | $2 | ❌ | DOWN | $-2 | $811 | L2 |
| 59 | 14:30 | [btc-updown-15m-1764426600](https://polymarket.com/event/btc-updown-15m-1764426600) | $4 | ✅ | UP | +$4 | $815 | - |
| 60 | 14:45 | [btc-updown-15m-1764427500](https://polymarket.com/event/btc-updown-15m-1764427500) | $1 | ❌ | DOWN | $-1 | $814 | L1 |
| 61 | 15:00 | [btc-updown-15m-1764428400](https://polymarket.com/event/btc-updown-15m-1764428400) | $2 | ✅ | UP | +$2 | $816 | - |
| 62 | 15:15 | [btc-updown-15m-1764429300](https://polymarket.com/event/btc-updown-15m-1764429300) | $1 | ✅ | UP | +$1 | $817 | - |
| 63 | 15:30 | [btc-updown-15m-1764430200](https://polymarket.com/event/btc-updown-15m-1764430200) | $1 | ❌ | DOWN | $-1 | $816 | L1 |
| 64 | 15:45 | [btc-updown-15m-1764431100](https://polymarket.com/event/btc-updown-15m-1764431100) | $2 | ✅ | UP | +$2 | $818 | - |
| 65 | 16:00 | [btc-updown-15m-1764432000](https://polymarket.com/event/btc-updown-15m-1764432000) | $1 | ❌ | DOWN | $-1 | $817 | L1 |
| 66 | 16:15 | [btc-updown-15m-1764432900](https://polymarket.com/event/btc-updown-15m-1764432900) | $2 | ❌ | DOWN | $-2 | $815 | L2 |
| 67 | 16:30 | [btc-updown-15m-1764433800](https://polymarket.com/event/btc-updown-15m-1764433800) | $4 | ✅ | UP | +$4 | $819 | - |
| 68 | 16:45 | [btc-updown-15m-1764434700](https://polymarket.com/event/btc-updown-15m-1764434700) | $1 | ✅ | UP | +$1 | $820 | - |
| 69 | 17:00 | [btc-updown-15m-1764435600](https://polymarket.com/event/btc-updown-15m-1764435600) | $1 | ❌ | DOWN | $-1 | $819 | L1 |
| 70 | 17:15 | [btc-updown-15m-1764436500](https://polymarket.com/event/btc-updown-15m-1764436500) | $2 | ✅ | UP | +$2 | $821 | - |
| 71 | 17:30 | [btc-updown-15m-1764437400](https://polymarket.com/event/btc-updown-15m-1764437400) | $1 | ❌ | DOWN | $-1 | $820 | L1 |
| 72 | 17:45 | [btc-updown-15m-1764438300](https://polymarket.com/event/btc-updown-15m-1764438300) | $2 | ❌ | DOWN | $-2 | $818 | L2 |
| 73 | 18:00 | [btc-updown-15m-1764439200](https://polymarket.com/event/btc-updown-15m-1764439200) | $4 | ❌ | DOWN | $-4 | $814 | L3 |
| 74 | 18:15 | [btc-updown-15m-1764440100](https://polymarket.com/event/btc-updown-15m-1764440100) | $8 | ❌ | DOWN | $-8 | $806 | L4 |
| 75 | 18:30 | [btc-updown-15m-1764441000](https://polymarket.com/event/btc-updown-15m-1764441000) | $16 | ✅ | UP | +$16 | $822 | - |
| 76 | 18:45 | [btc-updown-15m-1764441900](https://polymarket.com/event/btc-updown-15m-1764441900) | $1 | ✅ | UP | +$1 | $823 | - |
| 77 | 19:00 | [btc-updown-15m-1764442800](https://polymarket.com/event/btc-updown-15m-1764442800) | $1 | ✅ | UP | +$1 | $824 | - |
| 78 | 19:15 | [btc-updown-15m-1764443700](https://polymarket.com/event/btc-updown-15m-1764443700) | $1 | ✅ | UP | +$1 | $825 | - |
| 79 | 19:30 | [btc-updown-15m-1764444600](https://polymarket.com/event/btc-updown-15m-1764444600) | $1 | ❌ | DOWN | $-1 | $824 | L1 |
| 80 | 19:45 | [btc-updown-15m-1764445500](https://polymarket.com/event/btc-updown-15m-1764445500) | $2 | ✅ | UP | +$2 | $826 | - |
| 81 | 20:00 | [btc-updown-15m-1764446400](https://polymarket.com/event/btc-updown-15m-1764446400) | $1 | ❌ | DOWN | $-1 | $825 | L1 |
| 82 | 20:15 | [btc-updown-15m-1764447300](https://polymarket.com/event/btc-updown-15m-1764447300) | $2 | ✅ | UP | +$2 | $827 | - |
| 83 | 20:30 | [btc-updown-15m-1764448200](https://polymarket.com/event/btc-updown-15m-1764448200) | $1 | ✅ | UP | +$1 | $828 | - |
| 84 | 20:45 | [btc-updown-15m-1764449100](https://polymarket.com/event/btc-updown-15m-1764449100) | $1 | ✅ | UP | +$1 | $829 | - |
| 85 | 21:00 | [btc-updown-15m-1764450000](https://polymarket.com/event/btc-updown-15m-1764450000) | $1 | ❌ | DOWN | $-1 | $828 | L1 |
| 86 | 21:15 | [btc-updown-15m-1764450900](https://polymarket.com/event/btc-updown-15m-1764450900) | $2 | ✅ | UP | +$2 | $830 | - |
| 87 | 21:30 | [btc-updown-15m-1764451800](https://polymarket.com/event/btc-updown-15m-1764451800) | $1 | ✅ | UP | +$1 | $831 | - |
| 88 | 21:45 | [btc-updown-15m-1764452700](https://polymarket.com/event/btc-updown-15m-1764452700) | $1 | ❌ | DOWN | $-1 | $830 | L1 |
| 89 | 22:00 | [btc-updown-15m-1764453600](https://polymarket.com/event/btc-updown-15m-1764453600) | $2 | ❌ | DOWN | $-2 | $828 | L2 |
| 90 | 22:15 | [btc-updown-15m-1764454500](https://polymarket.com/event/btc-updown-15m-1764454500) | $4 | ❌ | DOWN | $-4 | $824 | L3 |
| 91 | 22:30 | [btc-updown-15m-1764455400](https://polymarket.com/event/btc-updown-15m-1764455400) | $8 | ✅ | UP | +$8 | $832 | - |
| 92 | 22:45 | [btc-updown-15m-1764456300](https://polymarket.com/event/btc-updown-15m-1764456300) | $1 | ❌ | DOWN | $-1 | $831 | L1 |
| 93 | 23:00 | [btc-updown-15m-1764457200](https://polymarket.com/event/btc-updown-15m-1764457200) | $2 | ❌ | DOWN | $-2 | $829 | L2 |
| 94 | 23:15 | [btc-updown-15m-1764458100](https://polymarket.com/event/btc-updown-15m-1764458100) | $4 | ✅ | UP | +$4 | $833 | - |
| 95 | 23:30 | [btc-updown-15m-1764459000](https://polymarket.com/event/btc-updown-15m-1764459000) | $1 | ✅ | UP | +$1 | $834 | - |
| 96 | 23:45 | [btc-updown-15m-1764459900](https://polymarket.com/event/btc-updown-15m-1764459900) | $1 | ❌ | DOWN | $-1 | $833 | L1 |

### 2025-11-30
**Summary:** 96 trades | 49 wins | 47 losses | Max Bet: $16 | Profit: +$35

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764460800](https://polymarket.com/event/btc-updown-15m-1764460800) | $2 | ✅ | UP | +$2 | $835 | - |
| 2 | 00:15 | [btc-updown-15m-1764461700](https://polymarket.com/event/btc-updown-15m-1764461700) | $1 | ❌ | DOWN | $-1 | $834 | L1 |
| 3 | 00:30 | [btc-updown-15m-1764462600](https://polymarket.com/event/btc-updown-15m-1764462600) | $2 | ✅ | UP | +$2 | $836 | - |
| 4 | 00:45 | [btc-updown-15m-1764463500](https://polymarket.com/event/btc-updown-15m-1764463500) | $1 | ✅ | UP | +$1 | $837 | - |
| 5 | 01:00 | [btc-updown-15m-1764464400](https://polymarket.com/event/btc-updown-15m-1764464400) | $1 | ✅ | UP | +$1 | $838 | - |
| 6 | 01:15 | [btc-updown-15m-1764465300](https://polymarket.com/event/btc-updown-15m-1764465300) | $1 | ❌ | DOWN | $-1 | $837 | L1 |
| 7 | 01:30 | [btc-updown-15m-1764466200](https://polymarket.com/event/btc-updown-15m-1764466200) | $2 | ✅ | UP | +$2 | $839 | - |
| 8 | 01:45 | [btc-updown-15m-1764467100](https://polymarket.com/event/btc-updown-15m-1764467100) | $1 | ❌ | DOWN | $-1 | $838 | L1 |
| 9 | 02:00 | [btc-updown-15m-1764468000](https://polymarket.com/event/btc-updown-15m-1764468000) | $2 | ✅ | UP | +$2 | $840 | - |
| 10 | 02:15 | [btc-updown-15m-1764468900](https://polymarket.com/event/btc-updown-15m-1764468900) | $1 | ✅ | UP | +$1 | $841 | - |
| 11 | 02:30 | [btc-updown-15m-1764469800](https://polymarket.com/event/btc-updown-15m-1764469800) | $1 | ❌ | DOWN | $-1 | $840 | L1 |
| 12 | 02:45 | [btc-updown-15m-1764470700](https://polymarket.com/event/btc-updown-15m-1764470700) | $2 | ❌ | DOWN | $-2 | $838 | L2 |
| 13 | 03:00 | [btc-updown-15m-1764471600](https://polymarket.com/event/btc-updown-15m-1764471600) | $4 | ❌ | DOWN | $-4 | $834 | L3 |
| 14 | 03:15 | [btc-updown-15m-1764472500](https://polymarket.com/event/btc-updown-15m-1764472500) | $8 | ✅ | UP | +$8 | $842 | - |
| 15 | 03:30 | [btc-updown-15m-1764473400](https://polymarket.com/event/btc-updown-15m-1764473400) | $1 | ✅ | UP | +$1 | $843 | - |
| 16 | 03:45 | [btc-updown-15m-1764474300](https://polymarket.com/event/btc-updown-15m-1764474300) | $1 | ✅ | UP | +$1 | $844 | - |
| 17 | 04:00 | [btc-updown-15m-1764475200](https://polymarket.com/event/btc-updown-15m-1764475200) | $1 | ✅ | UP | +$1 | $845 | - |
| 18 | 04:15 | [btc-updown-15m-1764476100](https://polymarket.com/event/btc-updown-15m-1764476100) | $1 | ❌ | DOWN | $-1 | $844 | L1 |
| 19 | 04:30 | [btc-updown-15m-1764477000](https://polymarket.com/event/btc-updown-15m-1764477000) | $2 | ❌ | DOWN | $-2 | $842 | L2 |
| 20 | 04:45 | [btc-updown-15m-1764477900](https://polymarket.com/event/btc-updown-15m-1764477900) | $4 | ✅ | UP | +$4 | $846 | - |
| 21 | 05:00 | [btc-updown-15m-1764478800](https://polymarket.com/event/btc-updown-15m-1764478800) | $1 | ❌ | DOWN | $-1 | $845 | L1 |
| 22 | 05:15 | [btc-updown-15m-1764479700](https://polymarket.com/event/btc-updown-15m-1764479700) | $2 | ❌ | DOWN | $-2 | $843 | L2 |
| 23 | 05:30 | [btc-updown-15m-1764480600](https://polymarket.com/event/btc-updown-15m-1764480600) | $4 | ✅ | UP | +$4 | $847 | - |
| 24 | 05:45 | [btc-updown-15m-1764481500](https://polymarket.com/event/btc-updown-15m-1764481500) | $1 | ✅ | UP | +$1 | $848 | - |
| 25 | 06:00 | [btc-updown-15m-1764482400](https://polymarket.com/event/btc-updown-15m-1764482400) | $1 | ❌ | DOWN | $-1 | $847 | L1 |
| 26 | 06:15 | [btc-updown-15m-1764483300](https://polymarket.com/event/btc-updown-15m-1764483300) | $2 | ✅ | UP | +$2 | $849 | - |
| 27 | 06:30 | [btc-updown-15m-1764484200](https://polymarket.com/event/btc-updown-15m-1764484200) | $1 | ✅ | UP | +$1 | $850 | - |
| 28 | 06:45 | [btc-updown-15m-1764485100](https://polymarket.com/event/btc-updown-15m-1764485100) | $1 | ❌ | DOWN | $-1 | $849 | L1 |
| 29 | 07:00 | [btc-updown-15m-1764486000](https://polymarket.com/event/btc-updown-15m-1764486000) | $2 | ✅ | UP | +$2 | $851 | - |
| 30 | 07:15 | [btc-updown-15m-1764486900](https://polymarket.com/event/btc-updown-15m-1764486900) | $1 | ❌ | DOWN | $-1 | $850 | L1 |
| 31 | 07:30 | [btc-updown-15m-1764487800](https://polymarket.com/event/btc-updown-15m-1764487800) | $2 | ❌ | DOWN | $-2 | $848 | L2 |
| 32 | 07:45 | [btc-updown-15m-1764488700](https://polymarket.com/event/btc-updown-15m-1764488700) | $4 | ✅ | UP | +$4 | $852 | - |
| 33 | 08:00 | [btc-updown-15m-1764489600](https://polymarket.com/event/btc-updown-15m-1764489600) | $1 | ✅ | UP | +$1 | $853 | - |
| 34 | 08:15 | [btc-updown-15m-1764490500](https://polymarket.com/event/btc-updown-15m-1764490500) | $1 | ✅ | UP | +$1 | $854 | - |
| 35 | 08:30 | [btc-updown-15m-1764491400](https://polymarket.com/event/btc-updown-15m-1764491400) | $1 | ✅ | UP | +$1 | $855 | - |
| 36 | 08:45 | [btc-updown-15m-1764492300](https://polymarket.com/event/btc-updown-15m-1764492300) | $1 | ✅ | UP | +$1 | $856 | - |
| 37 | 09:00 | [btc-updown-15m-1764493200](https://polymarket.com/event/btc-updown-15m-1764493200) | $1 | ✅ | UP | +$1 | $857 | - |
| 38 | 09:15 | [btc-updown-15m-1764494100](https://polymarket.com/event/btc-updown-15m-1764494100) | $1 | ❌ | DOWN | $-1 | $856 | L1 |
| 39 | 09:30 | [btc-updown-15m-1764495000](https://polymarket.com/event/btc-updown-15m-1764495000) | $2 | ❌ | DOWN | $-2 | $854 | L2 |
| 40 | 09:45 | [btc-updown-15m-1764495900](https://polymarket.com/event/btc-updown-15m-1764495900) | $4 | ❌ | DOWN | $-4 | $850 | L3 |
| 41 | 10:00 | [btc-updown-15m-1764496800](https://polymarket.com/event/btc-updown-15m-1764496800) | $8 | ❌ | DOWN | $-8 | $842 | L4 |
| 42 | 10:15 | [btc-updown-15m-1764497700](https://polymarket.com/event/btc-updown-15m-1764497700) | $16 | ✅ | UP | +$16 | $858 | - |
| 43 | 10:30 | [btc-updown-15m-1764498600](https://polymarket.com/event/btc-updown-15m-1764498600) | $1 | ❌ | DOWN | $-1 | $857 | L1 |
| 44 | 10:45 | [btc-updown-15m-1764499500](https://polymarket.com/event/btc-updown-15m-1764499500) | $2 | ✅ | UP | +$2 | $859 | - |
| 45 | 11:00 | [btc-updown-15m-1764500400](https://polymarket.com/event/btc-updown-15m-1764500400) | $1 | ✅ | UP | +$1 | $860 | - |
| 46 | 11:15 | [btc-updown-15m-1764501300](https://polymarket.com/event/btc-updown-15m-1764501300) | $1 | ❌ | DOWN | $-1 | $859 | L1 |
| 47 | 11:30 | [btc-updown-15m-1764502200](https://polymarket.com/event/btc-updown-15m-1764502200) | $2 | ❌ | DOWN | $-2 | $857 | L2 |
| 48 | 11:45 | [btc-updown-15m-1764503100](https://polymarket.com/event/btc-updown-15m-1764503100) | $4 | ❌ | DOWN | $-4 | $853 | L3 |
| 49 | 12:00 | [btc-updown-15m-1764504000](https://polymarket.com/event/btc-updown-15m-1764504000) | $8 | ✅ | UP | +$8 | $861 | - |
| 50 | 12:15 | [btc-updown-15m-1764504900](https://polymarket.com/event/btc-updown-15m-1764504900) | $1 | ✅ | UP | +$1 | $862 | - |
| 51 | 12:30 | [btc-updown-15m-1764505800](https://polymarket.com/event/btc-updown-15m-1764505800) | $1 | ✅ | UP | +$1 | $863 | - |
| 52 | 12:45 | [btc-updown-15m-1764506700](https://polymarket.com/event/btc-updown-15m-1764506700) | $1 | ✅ | UP | +$1 | $864 | - |
| 53 | 13:00 | [btc-updown-15m-1764507600](https://polymarket.com/event/btc-updown-15m-1764507600) | $1 | ❌ | DOWN | $-1 | $863 | L1 |
| 54 | 13:15 | [btc-updown-15m-1764508500](https://polymarket.com/event/btc-updown-15m-1764508500) | $2 | ✅ | UP | +$2 | $865 | - |
| 55 | 13:30 | [btc-updown-15m-1764509400](https://polymarket.com/event/btc-updown-15m-1764509400) | $1 | ❌ | DOWN | $-1 | $864 | L1 |
| 56 | 13:45 | [btc-updown-15m-1764510300](https://polymarket.com/event/btc-updown-15m-1764510300) | $2 | ✅ | UP | +$2 | $866 | - |
| 57 | 14:00 | [btc-updown-15m-1764511200](https://polymarket.com/event/btc-updown-15m-1764511200) | $1 | ❌ | DOWN | $-1 | $865 | L1 |
| 58 | 14:15 | [btc-updown-15m-1764512100](https://polymarket.com/event/btc-updown-15m-1764512100) | $2 | ❌ | DOWN | $-2 | $863 | L2 |
| 59 | 14:30 | [btc-updown-15m-1764513000](https://polymarket.com/event/btc-updown-15m-1764513000) | $4 | ❌ | DOWN | $-4 | $859 | L3 |
| 60 | 14:45 | [btc-updown-15m-1764513900](https://polymarket.com/event/btc-updown-15m-1764513900) | $8 | ✅ | UP | +$8 | $867 | - |
| 61 | 15:00 | [btc-updown-15m-1764514800](https://polymarket.com/event/btc-updown-15m-1764514800) | $1 | ❌ | DOWN | $-1 | $866 | L1 |
| 62 | 15:15 | [btc-updown-15m-1764515700](https://polymarket.com/event/btc-updown-15m-1764515700) | $2 | ✅ | UP | +$2 | $868 | - |
| 63 | 15:30 | [btc-updown-15m-1764516600](https://polymarket.com/event/btc-updown-15m-1764516600) | $1 | ❌ | DOWN | $-1 | $867 | L1 |
| 64 | 15:45 | [btc-updown-15m-1764517500](https://polymarket.com/event/btc-updown-15m-1764517500) | $2 | ✅ | UP | +$2 | $869 | - |
| 65 | 16:00 | [btc-updown-15m-1764518400](https://polymarket.com/event/btc-updown-15m-1764518400) | $1 | ✅ | UP | +$1 | $870 | - |
| 66 | 16:15 | [btc-updown-15m-1764519300](https://polymarket.com/event/btc-updown-15m-1764519300) | $1 | ✅ | UP | +$1 | $871 | - |
| 67 | 16:30 | [btc-updown-15m-1764520200](https://polymarket.com/event/btc-updown-15m-1764520200) | $1 | ❌ | DOWN | $-1 | $870 | L1 |
| 68 | 16:45 | [btc-updown-15m-1764521100](https://polymarket.com/event/btc-updown-15m-1764521100) | $2 | ✅ | UP | +$2 | $872 | - |
| 69 | 17:00 | [btc-updown-15m-1764522000](https://polymarket.com/event/btc-updown-15m-1764522000) | $1 | ❌ | DOWN | $-1 | $871 | L1 |
| 70 | 17:15 | [btc-updown-15m-1764522900](https://polymarket.com/event/btc-updown-15m-1764522900) | $2 | ❌ | DOWN | $-2 | $869 | L2 |
| 71 | 17:30 | [btc-updown-15m-1764523800](https://polymarket.com/event/btc-updown-15m-1764523800) | $4 | ✅ | UP | +$4 | $873 | - |
| 72 | 17:45 | [btc-updown-15m-1764524700](https://polymarket.com/event/btc-updown-15m-1764524700) | $1 | ❌ | DOWN | $-1 | $872 | L1 |
| 73 | 18:00 | [btc-updown-15m-1764525600](https://polymarket.com/event/btc-updown-15m-1764525600) | $2 | ❌ | DOWN | $-2 | $870 | L2 |
| 74 | 18:15 | [btc-updown-15m-1764526500](https://polymarket.com/event/btc-updown-15m-1764526500) | $4 | ✅ | UP | +$4 | $874 | - |
| 75 | 18:30 | [btc-updown-15m-1764527400](https://polymarket.com/event/btc-updown-15m-1764527400) | $1 | ✅ | UP | +$1 | $875 | - |
| 76 | 18:45 | [btc-updown-15m-1764528300](https://polymarket.com/event/btc-updown-15m-1764528300) | $1 | ✅ | UP | +$1 | $876 | - |
| 77 | 19:00 | [btc-updown-15m-1764529200](https://polymarket.com/event/btc-updown-15m-1764529200) | $1 | ❌ | DOWN | $-1 | $875 | L1 |
| 78 | 19:15 | [btc-updown-15m-1764530100](https://polymarket.com/event/btc-updown-15m-1764530100) | $2 | ❌ | DOWN | $-2 | $873 | L2 |
| 79 | 19:30 | [btc-updown-15m-1764531000](https://polymarket.com/event/btc-updown-15m-1764531000) | $4 | ✅ | UP | +$4 | $877 | - |
| 80 | 19:45 | [btc-updown-15m-1764531900](https://polymarket.com/event/btc-updown-15m-1764531900) | $1 | ✅ | UP | +$1 | $878 | - |
| 81 | 20:00 | [btc-updown-15m-1764532800](https://polymarket.com/event/btc-updown-15m-1764532800) | $1 | ✅ | UP | +$1 | $879 | - |
| 82 | 20:15 | [btc-updown-15m-1764533700](https://polymarket.com/event/btc-updown-15m-1764533700) | $1 | ❌ | DOWN | $-1 | $878 | L1 |
| 83 | 20:30 | [btc-updown-15m-1764534600](https://polymarket.com/event/btc-updown-15m-1764534600) | $2 | ❌ | DOWN | $-2 | $876 | L2 |
| 84 | 20:45 | [btc-updown-15m-1764535500](https://polymarket.com/event/btc-updown-15m-1764535500) | $4 | ✅ | UP | +$4 | $880 | - |
| 85 | 21:00 | [btc-updown-15m-1764536400](https://polymarket.com/event/btc-updown-15m-1764536400) | $1 | ❌ | DOWN | $-1 | $879 | L1 |
| 86 | 21:15 | [btc-updown-15m-1764537300](https://polymarket.com/event/btc-updown-15m-1764537300) | $2 | ❌ | DOWN | $-2 | $877 | L2 |
| 87 | 21:30 | [btc-updown-15m-1764538200](https://polymarket.com/event/btc-updown-15m-1764538200) | $4 | ❌ | DOWN | $-4 | $873 | L3 |
| 88 | 21:45 | [btc-updown-15m-1764539100](https://polymarket.com/event/btc-updown-15m-1764539100) | $8 | ✅ | UP | +$8 | $881 | - |
| 89 | 22:00 | [btc-updown-15m-1764540000](https://polymarket.com/event/btc-updown-15m-1764540000) | $1 | ✅ | UP | +$1 | $882 | - |
| 90 | 22:15 | [btc-updown-15m-1764540900](https://polymarket.com/event/btc-updown-15m-1764540900) | $1 | ❌ | DOWN | $-1 | $881 | L1 |
| 91 | 22:30 | [btc-updown-15m-1764541800](https://polymarket.com/event/btc-updown-15m-1764541800) | $2 | ❌ | DOWN | $-2 | $879 | L2 |
| 92 | 22:45 | [btc-updown-15m-1764542700](https://polymarket.com/event/btc-updown-15m-1764542700) | $4 | ✅ | UP | +$4 | $883 | - |
| 93 | 23:00 | [btc-updown-15m-1764543600](https://polymarket.com/event/btc-updown-15m-1764543600) | $1 | ❌ | DOWN | $-1 | $882 | L1 |
| 94 | 23:15 | [btc-updown-15m-1764544500](https://polymarket.com/event/btc-updown-15m-1764544500) | $2 | ❌ | DOWN | $-2 | $880 | L2 |
| 95 | 23:30 | [btc-updown-15m-1764545400](https://polymarket.com/event/btc-updown-15m-1764545400) | $4 | ❌ | DOWN | $-4 | $876 | L3 |
| 96 | 23:45 | [btc-updown-15m-1764546300](https://polymarket.com/event/btc-updown-15m-1764546300) | $8 | ❌ | DOWN | $-8 | $868 | L4 |

### 2025-12-01
**Summary:** 84 trades | 41 wins | 43 losses | Max Bet: $64 | Profit: +$53

**Skip Events (4):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:00 | 5 | $31 | $32 | 01:00 |
| 03:15 | 5 | $31 | $32 | 04:15 |
| 04:15 | 6 | $63 | $64 | 05:15 |
| 12:00 | 5 | $31 | $32 | 13:00 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764547200](https://polymarket.com/event/btc-updown-15m-1764547200) | $16 | ❌ | DOWN | $-16 | $852 | L5 |
| - | 00:15 | [btc-updown-15m-1764548100](https://polymarket.com/event/btc-updown-15m-1764548100) | - | ⏭️ SKIP | DOWN | - | $852 | - |
| - | 00:30 | [btc-updown-15m-1764549000](https://polymarket.com/event/btc-updown-15m-1764549000) | - | ⏭️ SKIP | DOWN | - | $852 | - |
| - | 00:45 | [btc-updown-15m-1764549900](https://polymarket.com/event/btc-updown-15m-1764549900) | - | ⏭️ SKIP | DOWN | - | $852 | - |
| 2 | 01:00 | [btc-updown-15m-1764550800](https://polymarket.com/event/btc-updown-15m-1764550800) | $32 | ✅ | UP | +$32 | $884 | - |
| 3 | 01:15 | [btc-updown-15m-1764551700](https://polymarket.com/event/btc-updown-15m-1764551700) | $1 | ❌ | DOWN | $-1 | $883 | L1 |
| 4 | 01:30 | [btc-updown-15m-1764552600](https://polymarket.com/event/btc-updown-15m-1764552600) | $2 | ✅ | UP | +$2 | $885 | - |
| 5 | 01:45 | [btc-updown-15m-1764553500](https://polymarket.com/event/btc-updown-15m-1764553500) | $1 | ❌ | DOWN | $-1 | $884 | L1 |
| 6 | 02:00 | [btc-updown-15m-1764554400](https://polymarket.com/event/btc-updown-15m-1764554400) | $2 | ✅ | UP | +$2 | $886 | - |
| 7 | 02:15 | [btc-updown-15m-1764555300](https://polymarket.com/event/btc-updown-15m-1764555300) | $1 | ❌ | DOWN | $-1 | $885 | L1 |
| 8 | 02:30 | [btc-updown-15m-1764556200](https://polymarket.com/event/btc-updown-15m-1764556200) | $2 | ❌ | DOWN | $-2 | $883 | L2 |
| 9 | 02:45 | [btc-updown-15m-1764557100](https://polymarket.com/event/btc-updown-15m-1764557100) | $4 | ❌ | DOWN | $-4 | $879 | L3 |
| 10 | 03:00 | [btc-updown-15m-1764558000](https://polymarket.com/event/btc-updown-15m-1764558000) | $8 | ❌ | DOWN | $-8 | $871 | L4 |
| 11 | 03:15 | [btc-updown-15m-1764558900](https://polymarket.com/event/btc-updown-15m-1764558900) | $16 | ❌ | DOWN | $-16 | $855 | L5 |
| - | 03:30 | [btc-updown-15m-1764559800](https://polymarket.com/event/btc-updown-15m-1764559800) | - | ⏭️ SKIP | UP | - | $855 | - |
| - | 03:45 | [btc-updown-15m-1764560700](https://polymarket.com/event/btc-updown-15m-1764560700) | - | ⏭️ SKIP | DOWN | - | $855 | - |
| - | 04:00 | [btc-updown-15m-1764561600](https://polymarket.com/event/btc-updown-15m-1764561600) | - | ⏭️ SKIP | DOWN | - | $855 | - |
| 12 | 04:15 | [btc-updown-15m-1764562500](https://polymarket.com/event/btc-updown-15m-1764562500) | $32 | ❌ | DOWN | $-32 | $823 | L6 |
| - | 04:30 | [btc-updown-15m-1764563400](https://polymarket.com/event/btc-updown-15m-1764563400) | - | ⏭️ SKIP | UP | - | $823 | - |
| - | 04:45 | [btc-updown-15m-1764564300](https://polymarket.com/event/btc-updown-15m-1764564300) | - | ⏭️ SKIP | DOWN | - | $823 | - |
| - | 05:00 | [btc-updown-15m-1764565200](https://polymarket.com/event/btc-updown-15m-1764565200) | - | ⏭️ SKIP | DOWN | - | $823 | - |
| 13 | 05:15 | [btc-updown-15m-1764566100](https://polymarket.com/event/btc-updown-15m-1764566100) | $64 | ✅ | UP | +$64 | $887 | - |
| 14 | 05:30 | [btc-updown-15m-1764567000](https://polymarket.com/event/btc-updown-15m-1764567000) | $1 | ❌ | DOWN | $-1 | $886 | L1 |
| 15 | 05:45 | [btc-updown-15m-1764567900](https://polymarket.com/event/btc-updown-15m-1764567900) | $2 | ✅ | UP | +$2 | $888 | - |
| 16 | 06:00 | [btc-updown-15m-1764568800](https://polymarket.com/event/btc-updown-15m-1764568800) | $1 | ✅ | UP | +$1 | $889 | - |
| 17 | 06:15 | [btc-updown-15m-1764569700](https://polymarket.com/event/btc-updown-15m-1764569700) | $1 | ❌ | DOWN | $-1 | $888 | L1 |
| 18 | 06:30 | [btc-updown-15m-1764570600](https://polymarket.com/event/btc-updown-15m-1764570600) | $2 | ✅ | UP | +$2 | $890 | - |
| 19 | 06:45 | [btc-updown-15m-1764571500](https://polymarket.com/event/btc-updown-15m-1764571500) | $1 | ❌ | DOWN | $-1 | $889 | L1 |
| 20 | 07:00 | [btc-updown-15m-1764572400](https://polymarket.com/event/btc-updown-15m-1764572400) | $2 | ❌ | DOWN | $-2 | $887 | L2 |
| 21 | 07:15 | [btc-updown-15m-1764573300](https://polymarket.com/event/btc-updown-15m-1764573300) | $4 | ✅ | UP | +$4 | $891 | - |
| 22 | 07:30 | [btc-updown-15m-1764574200](https://polymarket.com/event/btc-updown-15m-1764574200) | $1 | ✅ | UP | +$1 | $892 | - |
| 23 | 07:45 | [btc-updown-15m-1764575100](https://polymarket.com/event/btc-updown-15m-1764575100) | $1 | ✅ | UP | +$1 | $893 | - |
| 24 | 08:00 | [btc-updown-15m-1764576000](https://polymarket.com/event/btc-updown-15m-1764576000) | $1 | ❌ | DOWN | $-1 | $892 | L1 |
| 25 | 08:15 | [btc-updown-15m-1764576900](https://polymarket.com/event/btc-updown-15m-1764576900) | $2 | ✅ | UP | +$2 | $894 | - |
| 26 | 08:30 | [btc-updown-15m-1764577800](https://polymarket.com/event/btc-updown-15m-1764577800) | $1 | ✅ | UP | +$1 | $895 | - |
| 27 | 08:45 | [btc-updown-15m-1764578700](https://polymarket.com/event/btc-updown-15m-1764578700) | $1 | ✅ | UP | +$1 | $896 | - |
| 28 | 09:00 | [btc-updown-15m-1764579600](https://polymarket.com/event/btc-updown-15m-1764579600) | $1 | ❌ | DOWN | $-1 | $895 | L1 |
| 29 | 09:15 | [btc-updown-15m-1764580500](https://polymarket.com/event/btc-updown-15m-1764580500) | $2 | ❌ | DOWN | $-2 | $893 | L2 |
| 30 | 09:30 | [btc-updown-15m-1764581400](https://polymarket.com/event/btc-updown-15m-1764581400) | $4 | ✅ | UP | +$4 | $897 | - |
| 31 | 09:45 | [btc-updown-15m-1764582300](https://polymarket.com/event/btc-updown-15m-1764582300) | $1 | ❌ | DOWN | $-1 | $896 | L1 |
| 32 | 10:00 | [btc-updown-15m-1764583200](https://polymarket.com/event/btc-updown-15m-1764583200) | $2 | ❌ | DOWN | $-2 | $894 | L2 |
| 33 | 10:15 | [btc-updown-15m-1764584100](https://polymarket.com/event/btc-updown-15m-1764584100) | $4 | ❌ | DOWN | $-4 | $890 | L3 |
| 34 | 10:30 | [btc-updown-15m-1764585000](https://polymarket.com/event/btc-updown-15m-1764585000) | $8 | ✅ | UP | +$8 | $898 | - |
| 35 | 10:45 | [btc-updown-15m-1764585900](https://polymarket.com/event/btc-updown-15m-1764585900) | $1 | ✅ | UP | +$1 | $899 | - |
| 36 | 11:00 | [btc-updown-15m-1764586800](https://polymarket.com/event/btc-updown-15m-1764586800) | $1 | ❌ | DOWN | $-1 | $898 | L1 |
| 37 | 11:15 | [btc-updown-15m-1764587700](https://polymarket.com/event/btc-updown-15m-1764587700) | $2 | ❌ | DOWN | $-2 | $896 | L2 |
| 38 | 11:30 | [btc-updown-15m-1764588600](https://polymarket.com/event/btc-updown-15m-1764588600) | $4 | ❌ | DOWN | $-4 | $892 | L3 |
| 39 | 11:45 | [btc-updown-15m-1764589500](https://polymarket.com/event/btc-updown-15m-1764589500) | $8 | ❌ | DOWN | $-8 | $884 | L4 |
| 40 | 12:00 | [btc-updown-15m-1764590400](https://polymarket.com/event/btc-updown-15m-1764590400) | $16 | ❌ | DOWN | $-16 | $868 | L5 |
| - | 12:15 | [btc-updown-15m-1764591300](https://polymarket.com/event/btc-updown-15m-1764591300) | - | ⏭️ SKIP | DOWN | - | $868 | - |
| - | 12:30 | [btc-updown-15m-1764592200](https://polymarket.com/event/btc-updown-15m-1764592200) | - | ⏭️ SKIP | DOWN | - | $868 | - |
| - | 12:45 | [btc-updown-15m-1764593100](https://polymarket.com/event/btc-updown-15m-1764593100) | - | ⏭️ SKIP | DOWN | - | $868 | - |
| 41 | 13:00 | [btc-updown-15m-1764594000](https://polymarket.com/event/btc-updown-15m-1764594000) | $32 | ✅ | UP | +$32 | $900 | - |
| 42 | 13:15 | [btc-updown-15m-1764594900](https://polymarket.com/event/btc-updown-15m-1764594900) | $1 | ❌ | DOWN | $-1 | $899 | L1 |
| 43 | 13:30 | [btc-updown-15m-1764595800](https://polymarket.com/event/btc-updown-15m-1764595800) | $2 | ❌ | DOWN | $-2 | $897 | L2 |
| 44 | 13:45 | [btc-updown-15m-1764596700](https://polymarket.com/event/btc-updown-15m-1764596700) | $4 | ✅ | UP | +$4 | $901 | - |
| 45 | 14:00 | [btc-updown-15m-1764597600](https://polymarket.com/event/btc-updown-15m-1764597600) | $1 | ✅ | UP | +$1 | $902 | - |
| 46 | 14:15 | [btc-updown-15m-1764598500](https://polymarket.com/event/btc-updown-15m-1764598500) | $1 | ✅ | UP | +$1 | $903 | - |
| 47 | 14:30 | [btc-updown-15m-1764599400](https://polymarket.com/event/btc-updown-15m-1764599400) | $1 | ❌ | DOWN | $-1 | $902 | L1 |
| 48 | 14:45 | [btc-updown-15m-1764600300](https://polymarket.com/event/btc-updown-15m-1764600300) | $2 | ✅ | UP | +$2 | $904 | - |
| 49 | 15:00 | [btc-updown-15m-1764601200](https://polymarket.com/event/btc-updown-15m-1764601200) | $1 | ❌ | DOWN | $-1 | $903 | L1 |
| 50 | 15:15 | [btc-updown-15m-1764602100](https://polymarket.com/event/btc-updown-15m-1764602100) | $2 | ❌ | DOWN | $-2 | $901 | L2 |
| 51 | 15:30 | [btc-updown-15m-1764603000](https://polymarket.com/event/btc-updown-15m-1764603000) | $4 | ❌ | DOWN | $-4 | $897 | L3 |
| 52 | 15:45 | [btc-updown-15m-1764603900](https://polymarket.com/event/btc-updown-15m-1764603900) | $8 | ✅ | UP | +$8 | $905 | - |
| 53 | 16:00 | [btc-updown-15m-1764604800](https://polymarket.com/event/btc-updown-15m-1764604800) | $1 | ❌ | DOWN | $-1 | $904 | L1 |
| 54 | 16:15 | [btc-updown-15m-1764605700](https://polymarket.com/event/btc-updown-15m-1764605700) | $2 | ✅ | UP | +$2 | $906 | - |
| 55 | 16:30 | [btc-updown-15m-1764606600](https://polymarket.com/event/btc-updown-15m-1764606600) | $1 | ✅ | UP | +$1 | $907 | - |
| 56 | 16:45 | [btc-updown-15m-1764607500](https://polymarket.com/event/btc-updown-15m-1764607500) | $1 | ❌ | DOWN | $-1 | $906 | L1 |
| 57 | 17:00 | [btc-updown-15m-1764608400](https://polymarket.com/event/btc-updown-15m-1764608400) | $2 | ✅ | UP | +$2 | $908 | - |
| 58 | 17:15 | [btc-updown-15m-1764609300](https://polymarket.com/event/btc-updown-15m-1764609300) | $1 | ✅ | UP | +$1 | $909 | - |
| 59 | 17:30 | [btc-updown-15m-1764610200](https://polymarket.com/event/btc-updown-15m-1764610200) | $1 | ✅ | UP | +$1 | $910 | - |
| 60 | 17:45 | [btc-updown-15m-1764611100](https://polymarket.com/event/btc-updown-15m-1764611100) | $1 | ❌ | DOWN | $-1 | $909 | L1 |
| 61 | 18:00 | [btc-updown-15m-1764612000](https://polymarket.com/event/btc-updown-15m-1764612000) | $2 | ✅ | UP | +$2 | $911 | - |
| 62 | 18:15 | [btc-updown-15m-1764612900](https://polymarket.com/event/btc-updown-15m-1764612900) | $1 | ❌ | DOWN | $-1 | $910 | L1 |
| 63 | 18:30 | [btc-updown-15m-1764613800](https://polymarket.com/event/btc-updown-15m-1764613800) | $2 | ❌ | DOWN | $-2 | $908 | L2 |
| 64 | 18:45 | [btc-updown-15m-1764614700](https://polymarket.com/event/btc-updown-15m-1764614700) | $4 | ✅ | UP | +$4 | $912 | - |
| 65 | 19:00 | [btc-updown-15m-1764615600](https://polymarket.com/event/btc-updown-15m-1764615600) | $1 | ❌ | DOWN | $-1 | $911 | L1 |
| 66 | 19:15 | [btc-updown-15m-1764616500](https://polymarket.com/event/btc-updown-15m-1764616500) | $2 | ❌ | DOWN | $-2 | $909 | L2 |
| 67 | 19:30 | [btc-updown-15m-1764617400](https://polymarket.com/event/btc-updown-15m-1764617400) | $4 | ✅ | UP | +$4 | $913 | - |
| 68 | 19:45 | [btc-updown-15m-1764618300](https://polymarket.com/event/btc-updown-15m-1764618300) | $1 | ✅ | UP | +$1 | $914 | - |
| 69 | 20:00 | [btc-updown-15m-1764619200](https://polymarket.com/event/btc-updown-15m-1764619200) | $1 | ✅ | UP | +$1 | $915 | - |
| 70 | 20:15 | [btc-updown-15m-1764620100](https://polymarket.com/event/btc-updown-15m-1764620100) | $1 | ❌ | DOWN | $-1 | $914 | L1 |
| 71 | 20:30 | [btc-updown-15m-1764621000](https://polymarket.com/event/btc-updown-15m-1764621000) | $2 | ✅ | UP | +$2 | $916 | - |
| 72 | 20:45 | [btc-updown-15m-1764621900](https://polymarket.com/event/btc-updown-15m-1764621900) | $1 | ✅ | UP | +$1 | $917 | - |
| 73 | 21:00 | [btc-updown-15m-1764622800](https://polymarket.com/event/btc-updown-15m-1764622800) | $1 | ✅ | UP | +$1 | $918 | - |
| 74 | 21:15 | [btc-updown-15m-1764623700](https://polymarket.com/event/btc-updown-15m-1764623700) | $1 | ✅ | UP | +$1 | $919 | - |
| 75 | 21:30 | [btc-updown-15m-1764624600](https://polymarket.com/event/btc-updown-15m-1764624600) | $1 | ✅ | UP | +$1 | $920 | - |
| 76 | 21:45 | [btc-updown-15m-1764625500](https://polymarket.com/event/btc-updown-15m-1764625500) | $1 | ✅ | UP | +$1 | $921 | - |
| 77 | 22:00 | [btc-updown-15m-1764626400](https://polymarket.com/event/btc-updown-15m-1764626400) | $1 | ✅ | UP | +$1 | $922 | - |
| 78 | 22:15 | [btc-updown-15m-1764627300](https://polymarket.com/event/btc-updown-15m-1764627300) | $1 | ❌ | DOWN | $-1 | $921 | L1 |
| 79 | 22:30 | [btc-updown-15m-1764628200](https://polymarket.com/event/btc-updown-15m-1764628200) | $2 | ✅ | UP | +$2 | $923 | - |
| 80 | 22:45 | [btc-updown-15m-1764629100](https://polymarket.com/event/btc-updown-15m-1764629100) | $1 | ❌ | DOWN | $-1 | $922 | L1 |
| 81 | 23:00 | [btc-updown-15m-1764630000](https://polymarket.com/event/btc-updown-15m-1764630000) | $2 | ❌ | DOWN | $-2 | $920 | L2 |
| 82 | 23:15 | [btc-updown-15m-1764630900](https://polymarket.com/event/btc-updown-15m-1764630900) | $4 | ✅ | UP | +$4 | $924 | - |
| 83 | 23:30 | [btc-updown-15m-1764631800](https://polymarket.com/event/btc-updown-15m-1764631800) | $1 | ❌ | DOWN | $-1 | $923 | L1 |
| 84 | 23:45 | [btc-updown-15m-1764632700](https://polymarket.com/event/btc-updown-15m-1764632700) | $2 | ❌ | DOWN | $-2 | $921 | L2 |

### 2025-12-02
**Summary:** 96 trades | 59 wins | 37 losses | Max Bet: $16 | Profit: +$47

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764633600](https://polymarket.com/event/btc-updown-15m-1764633600) | $4 | ✅ | UP | +$4 | $925 | - |
| 2 | 00:15 | [btc-updown-15m-1764634500](https://polymarket.com/event/btc-updown-15m-1764634500) | $1 | ✅ | UP | +$1 | $926 | - |
| 3 | 00:30 | [btc-updown-15m-1764635400](https://polymarket.com/event/btc-updown-15m-1764635400) | $1 | ✅ | UP | +$1 | $927 | - |
| 4 | 00:45 | [btc-updown-15m-1764636300](https://polymarket.com/event/btc-updown-15m-1764636300) | $1 | ✅ | UP | +$1 | $928 | - |
| 5 | 01:00 | [btc-updown-15m-1764637200](https://polymarket.com/event/btc-updown-15m-1764637200) | $1 | ✅ | UP | +$1 | $929 | - |
| 6 | 01:15 | [btc-updown-15m-1764638100](https://polymarket.com/event/btc-updown-15m-1764638100) | $1 | ❌ | DOWN | $-1 | $928 | L1 |
| 7 | 01:30 | [btc-updown-15m-1764639000](https://polymarket.com/event/btc-updown-15m-1764639000) | $2 | ❌ | DOWN | $-2 | $926 | L2 |
| 8 | 01:45 | [btc-updown-15m-1764639900](https://polymarket.com/event/btc-updown-15m-1764639900) | $4 | ❌ | DOWN | $-4 | $922 | L3 |
| 9 | 02:00 | [btc-updown-15m-1764640800](https://polymarket.com/event/btc-updown-15m-1764640800) | $8 | ✅ | UP | +$8 | $930 | - |
| 10 | 02:15 | [btc-updown-15m-1764641700](https://polymarket.com/event/btc-updown-15m-1764641700) | $1 | ✅ | UP | +$1 | $931 | - |
| 11 | 02:30 | [btc-updown-15m-1764642600](https://polymarket.com/event/btc-updown-15m-1764642600) | $1 | ✅ | UP | +$1 | $932 | - |
| 12 | 02:45 | [btc-updown-15m-1764643500](https://polymarket.com/event/btc-updown-15m-1764643500) | $1 | ❌ | DOWN | $-1 | $931 | L1 |
| 13 | 03:00 | [btc-updown-15m-1764644400](https://polymarket.com/event/btc-updown-15m-1764644400) | $2 | ✅ | UP | +$2 | $933 | - |
| 14 | 03:15 | [btc-updown-15m-1764645300](https://polymarket.com/event/btc-updown-15m-1764645300) | $1 | ❌ | DOWN | $-1 | $932 | L1 |
| 15 | 03:30 | [btc-updown-15m-1764646200](https://polymarket.com/event/btc-updown-15m-1764646200) | $2 | ✅ | UP | +$2 | $934 | - |
| 16 | 03:45 | [btc-updown-15m-1764647100](https://polymarket.com/event/btc-updown-15m-1764647100) | $1 | ✅ | UP | +$1 | $935 | - |
| 17 | 04:00 | [btc-updown-15m-1764648000](https://polymarket.com/event/btc-updown-15m-1764648000) | $1 | ✅ | UP | +$1 | $936 | - |
| 18 | 04:15 | [btc-updown-15m-1764648900](https://polymarket.com/event/btc-updown-15m-1764648900) | $1 | ❌ | DOWN | $-1 | $935 | L1 |
| 19 | 04:30 | [btc-updown-15m-1764649800](https://polymarket.com/event/btc-updown-15m-1764649800) | $2 | ❌ | DOWN | $-2 | $933 | L2 |
| 20 | 04:45 | [btc-updown-15m-1764650700](https://polymarket.com/event/btc-updown-15m-1764650700) | $4 | ✅ | UP | +$4 | $937 | - |
| 21 | 05:00 | [btc-updown-15m-1764651600](https://polymarket.com/event/btc-updown-15m-1764651600) | $1 | ✅ | UP | +$1 | $938 | - |
| 22 | 05:15 | [btc-updown-15m-1764652500](https://polymarket.com/event/btc-updown-15m-1764652500) | $1 | ❌ | DOWN | $-1 | $937 | L1 |
| 23 | 05:30 | [btc-updown-15m-1764653400](https://polymarket.com/event/btc-updown-15m-1764653400) | $2 | ✅ | UP | +$2 | $939 | - |
| 24 | 05:45 | [btc-updown-15m-1764654300](https://polymarket.com/event/btc-updown-15m-1764654300) | $1 | ✅ | UP | +$1 | $940 | - |
| 25 | 06:00 | [btc-updown-15m-1764655200](https://polymarket.com/event/btc-updown-15m-1764655200) | $1 | ❌ | DOWN | $-1 | $939 | L1 |
| 26 | 06:15 | [btc-updown-15m-1764656100](https://polymarket.com/event/btc-updown-15m-1764656100) | $2 | ❌ | DOWN | $-2 | $937 | L2 |
| 27 | 06:30 | [btc-updown-15m-1764657000](https://polymarket.com/event/btc-updown-15m-1764657000) | $4 | ✅ | UP | +$4 | $941 | - |
| 28 | 06:45 | [btc-updown-15m-1764657900](https://polymarket.com/event/btc-updown-15m-1764657900) | $1 | ❌ | DOWN | $-1 | $940 | L1 |
| 29 | 07:00 | [btc-updown-15m-1764658800](https://polymarket.com/event/btc-updown-15m-1764658800) | $2 | ❌ | DOWN | $-2 | $938 | L2 |
| 30 | 07:15 | [btc-updown-15m-1764659700](https://polymarket.com/event/btc-updown-15m-1764659700) | $4 | ❌ | DOWN | $-4 | $934 | L3 |
| 31 | 07:30 | [btc-updown-15m-1764660600](https://polymarket.com/event/btc-updown-15m-1764660600) | $8 | ✅ | UP | +$8 | $942 | - |
| 32 | 07:45 | [btc-updown-15m-1764661500](https://polymarket.com/event/btc-updown-15m-1764661500) | $1 | ✅ | UP | +$1 | $943 | - |
| 33 | 08:00 | [btc-updown-15m-1764662400](https://polymarket.com/event/btc-updown-15m-1764662400) | $1 | ❌ | DOWN | $-1 | $942 | L1 |
| 34 | 08:15 | [btc-updown-15m-1764663300](https://polymarket.com/event/btc-updown-15m-1764663300) | $2 | ❌ | DOWN | $-2 | $940 | L2 |
| 35 | 08:30 | [btc-updown-15m-1764664200](https://polymarket.com/event/btc-updown-15m-1764664200) | $4 | ❌ | DOWN | $-4 | $936 | L3 |
| 36 | 08:45 | [btc-updown-15m-1764665100](https://polymarket.com/event/btc-updown-15m-1764665100) | $8 | ✅ | UP | +$8 | $944 | - |
| 37 | 09:00 | [btc-updown-15m-1764666000](https://polymarket.com/event/btc-updown-15m-1764666000) | $1 | ✅ | UP | +$1 | $945 | - |
| 38 | 09:15 | [btc-updown-15m-1764666900](https://polymarket.com/event/btc-updown-15m-1764666900) | $1 | ✅ | UP | +$1 | $946 | - |
| 39 | 09:30 | [btc-updown-15m-1764667800](https://polymarket.com/event/btc-updown-15m-1764667800) | $1 | ❌ | DOWN | $-1 | $945 | L1 |
| 40 | 09:45 | [btc-updown-15m-1764668700](https://polymarket.com/event/btc-updown-15m-1764668700) | $2 | ✅ | UP | +$2 | $947 | - |
| 41 | 10:00 | [btc-updown-15m-1764669600](https://polymarket.com/event/btc-updown-15m-1764669600) | $1 | ✅ | UP | +$1 | $948 | - |
| 42 | 10:15 | [btc-updown-15m-1764670500](https://polymarket.com/event/btc-updown-15m-1764670500) | $1 | ❌ | DOWN | $-1 | $947 | L1 |
| 43 | 10:30 | [btc-updown-15m-1764671400](https://polymarket.com/event/btc-updown-15m-1764671400) | $2 | ✅ | UP | +$2 | $949 | - |
| 44 | 10:45 | [btc-updown-15m-1764672300](https://polymarket.com/event/btc-updown-15m-1764672300) | $1 | ✅ | UP | +$1 | $950 | - |
| 45 | 11:00 | [btc-updown-15m-1764673200](https://polymarket.com/event/btc-updown-15m-1764673200) | $1 | ❌ | DOWN | $-1 | $949 | L1 |
| 46 | 11:15 | [btc-updown-15m-1764674100](https://polymarket.com/event/btc-updown-15m-1764674100) | $2 | ✅ | UP | +$2 | $951 | - |
| 47 | 11:30 | [btc-updown-15m-1764675000](https://polymarket.com/event/btc-updown-15m-1764675000) | $1 | ❌ | DOWN | $-1 | $950 | L1 |
| 48 | 11:45 | [btc-updown-15m-1764675900](https://polymarket.com/event/btc-updown-15m-1764675900) | $2 | ✅ | UP | +$2 | $952 | - |
| 49 | 12:00 | [btc-updown-15m-1764676800](https://polymarket.com/event/btc-updown-15m-1764676800) | $1 | ✅ | UP | +$1 | $953 | - |
| 50 | 12:15 | [btc-updown-15m-1764677700](https://polymarket.com/event/btc-updown-15m-1764677700) | $1 | ✅ | UP | +$1 | $954 | - |
| 51 | 12:30 | [btc-updown-15m-1764678600](https://polymarket.com/event/btc-updown-15m-1764678600) | $1 | ❌ | DOWN | $-1 | $953 | L1 |
| 52 | 12:45 | [btc-updown-15m-1764679500](https://polymarket.com/event/btc-updown-15m-1764679500) | $2 | ❌ | DOWN | $-2 | $951 | L2 |
| 53 | 13:00 | [btc-updown-15m-1764680400](https://polymarket.com/event/btc-updown-15m-1764680400) | $4 | ❌ | DOWN | $-4 | $947 | L3 |
| 54 | 13:15 | [btc-updown-15m-1764681300](https://polymarket.com/event/btc-updown-15m-1764681300) | $8 | ✅ | UP | +$8 | $955 | - |
| 55 | 13:30 | [btc-updown-15m-1764682200](https://polymarket.com/event/btc-updown-15m-1764682200) | $1 | ✅ | UP | +$1 | $956 | - |
| 56 | 13:45 | [btc-updown-15m-1764683100](https://polymarket.com/event/btc-updown-15m-1764683100) | $1 | ✅ | UP | +$1 | $957 | - |
| 57 | 14:00 | [btc-updown-15m-1764684000](https://polymarket.com/event/btc-updown-15m-1764684000) | $1 | ✅ | UP | +$1 | $958 | - |
| 58 | 14:15 | [btc-updown-15m-1764684900](https://polymarket.com/event/btc-updown-15m-1764684900) | $1 | ✅ | UP | +$1 | $959 | - |
| 59 | 14:30 | [btc-updown-15m-1764685800](https://polymarket.com/event/btc-updown-15m-1764685800) | $1 | ✅ | UP | +$1 | $960 | - |
| 60 | 14:45 | [btc-updown-15m-1764686700](https://polymarket.com/event/btc-updown-15m-1764686700) | $1 | ✅ | UP | +$1 | $961 | - |
| 61 | 15:00 | [btc-updown-15m-1764687600](https://polymarket.com/event/btc-updown-15m-1764687600) | $1 | ✅ | UP | +$1 | $962 | - |
| 62 | 15:15 | [btc-updown-15m-1764688500](https://polymarket.com/event/btc-updown-15m-1764688500) | $1 | ❌ | DOWN | $-1 | $961 | L1 |
| 63 | 15:30 | [btc-updown-15m-1764689400](https://polymarket.com/event/btc-updown-15m-1764689400) | $2 | ✅ | UP | +$2 | $963 | - |
| 64 | 15:45 | [btc-updown-15m-1764690300](https://polymarket.com/event/btc-updown-15m-1764690300) | $1 | ✅ | UP | +$1 | $964 | - |
| 65 | 16:00 | [btc-updown-15m-1764691200](https://polymarket.com/event/btc-updown-15m-1764691200) | $1 | ✅ | UP | +$1 | $965 | - |
| 66 | 16:15 | [btc-updown-15m-1764692100](https://polymarket.com/event/btc-updown-15m-1764692100) | $1 | ❌ | DOWN | $-1 | $964 | L1 |
| 67 | 16:30 | [btc-updown-15m-1764693000](https://polymarket.com/event/btc-updown-15m-1764693000) | $2 | ✅ | UP | +$2 | $966 | - |
| 68 | 16:45 | [btc-updown-15m-1764693900](https://polymarket.com/event/btc-updown-15m-1764693900) | $1 | ✅ | UP | +$1 | $967 | - |
| 69 | 17:00 | [btc-updown-15m-1764694800](https://polymarket.com/event/btc-updown-15m-1764694800) | $1 | ✅ | UP | +$1 | $968 | - |
| 70 | 17:15 | [btc-updown-15m-1764695700](https://polymarket.com/event/btc-updown-15m-1764695700) | $1 | ✅ | UP | +$1 | $969 | - |
| 71 | 17:30 | [btc-updown-15m-1764696600](https://polymarket.com/event/btc-updown-15m-1764696600) | $1 | ❌ | DOWN | $-1 | $968 | L1 |
| 72 | 17:45 | [btc-updown-15m-1764697500](https://polymarket.com/event/btc-updown-15m-1764697500) | $2 | ❌ | DOWN | $-2 | $966 | L2 |
| 73 | 18:00 | [btc-updown-15m-1764698400](https://polymarket.com/event/btc-updown-15m-1764698400) | $4 | ✅ | UP | +$4 | $970 | - |
| 74 | 18:15 | [btc-updown-15m-1764699300](https://polymarket.com/event/btc-updown-15m-1764699300) | $1 | ✅ | UP | +$1 | $971 | - |
| 75 | 18:30 | [btc-updown-15m-1764700200](https://polymarket.com/event/btc-updown-15m-1764700200) | $1 | ✅ | UP | +$1 | $972 | - |
| 76 | 18:45 | [btc-updown-15m-1764701100](https://polymarket.com/event/btc-updown-15m-1764701100) | $1 | ✅ | UP | +$1 | $973 | - |
| 77 | 19:00 | [btc-updown-15m-1764702000](https://polymarket.com/event/btc-updown-15m-1764702000) | $1 | ✅ | UP | +$1 | $974 | - |
| 78 | 19:15 | [btc-updown-15m-1764702900](https://polymarket.com/event/btc-updown-15m-1764702900) | $1 | ❌ | DOWN | $-1 | $973 | L1 |
| 79 | 19:30 | [btc-updown-15m-1764703800](https://polymarket.com/event/btc-updown-15m-1764703800) | $2 | ✅ | UP | +$2 | $975 | - |
| 80 | 19:45 | [btc-updown-15m-1764704700](https://polymarket.com/event/btc-updown-15m-1764704700) | $1 | ❌ | DOWN | $-1 | $974 | L1 |
| 81 | 20:00 | [btc-updown-15m-1764705600](https://polymarket.com/event/btc-updown-15m-1764705600) | $2 | ❌ | DOWN | $-2 | $972 | L2 |
| 82 | 20:15 | [btc-updown-15m-1764706500](https://polymarket.com/event/btc-updown-15m-1764706500) | $4 | ❌ | DOWN | $-4 | $968 | L3 |
| 83 | 20:30 | [btc-updown-15m-1764707400](https://polymarket.com/event/btc-updown-15m-1764707400) | $8 | ❌ | DOWN | $-8 | $960 | L4 |
| 84 | 20:45 | [btc-updown-15m-1764708300](https://polymarket.com/event/btc-updown-15m-1764708300) | $16 | ✅ | UP | +$16 | $976 | - |
| 85 | 21:00 | [btc-updown-15m-1764709200](https://polymarket.com/event/btc-updown-15m-1764709200) | $1 | ✅ | UP | +$1 | $977 | - |
| 86 | 21:15 | [btc-updown-15m-1764710100](https://polymarket.com/event/btc-updown-15m-1764710100) | $1 | ✅ | UP | +$1 | $978 | - |
| 87 | 21:30 | [btc-updown-15m-1764711000](https://polymarket.com/event/btc-updown-15m-1764711000) | $1 | ✅ | UP | +$1 | $979 | - |
| 88 | 21:45 | [btc-updown-15m-1764711900](https://polymarket.com/event/btc-updown-15m-1764711900) | $1 | ✅ | UP | +$1 | $980 | - |
| 89 | 22:00 | [btc-updown-15m-1764712800](https://polymarket.com/event/btc-updown-15m-1764712800) | $1 | ✅ | UP | +$1 | $981 | - |
| 90 | 22:15 | [btc-updown-15m-1764713700](https://polymarket.com/event/btc-updown-15m-1764713700) | $1 | ❌ | DOWN | $-1 | $980 | L1 |
| 91 | 22:30 | [btc-updown-15m-1764714600](https://polymarket.com/event/btc-updown-15m-1764714600) | $2 | ✅ | UP | +$2 | $982 | - |
| 92 | 22:45 | [btc-updown-15m-1764715500](https://polymarket.com/event/btc-updown-15m-1764715500) | $1 | ✅ | UP | +$1 | $983 | - |
| 93 | 23:00 | [btc-updown-15m-1764716400](https://polymarket.com/event/btc-updown-15m-1764716400) | $1 | ❌ | DOWN | $-1 | $982 | L1 |
| 94 | 23:15 | [btc-updown-15m-1764717300](https://polymarket.com/event/btc-updown-15m-1764717300) | $2 | ❌ | DOWN | $-2 | $980 | L2 |
| 95 | 23:30 | [btc-updown-15m-1764718200](https://polymarket.com/event/btc-updown-15m-1764718200) | $4 | ❌ | DOWN | $-4 | $976 | L3 |
| 96 | 23:45 | [btc-updown-15m-1764719100](https://polymarket.com/event/btc-updown-15m-1764719100) | $8 | ❌ | DOWN | $-8 | $968 | L4 |

### 2025-12-03
**Summary:** 93 trades | 53 wins | 40 losses | Max Bet: $32 | Profit: +$53

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 08:45 | 5 | $31 | $32 | 09:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764720000](https://polymarket.com/event/btc-updown-15m-1764720000) | $16 | ✅ | UP | +$16 | $984 | - |
| 2 | 00:15 | [btc-updown-15m-1764720900](https://polymarket.com/event/btc-updown-15m-1764720900) | $1 | ❌ | DOWN | $-1 | $983 | L1 |
| 3 | 00:30 | [btc-updown-15m-1764721800](https://polymarket.com/event/btc-updown-15m-1764721800) | $2 | ✅ | UP | +$2 | $985 | - |
| 4 | 00:45 | [btc-updown-15m-1764722700](https://polymarket.com/event/btc-updown-15m-1764722700) | $1 | ✅ | UP | +$1 | $986 | - |
| 5 | 01:00 | [btc-updown-15m-1764723600](https://polymarket.com/event/btc-updown-15m-1764723600) | $1 | ✅ | UP | +$1 | $987 | - |
| 6 | 01:15 | [btc-updown-15m-1764724500](https://polymarket.com/event/btc-updown-15m-1764724500) | $1 | ✅ | UP | +$1 | $988 | - |
| 7 | 01:30 | [btc-updown-15m-1764725400](https://polymarket.com/event/btc-updown-15m-1764725400) | $1 | ✅ | UP | +$1 | $989 | - |
| 8 | 01:45 | [btc-updown-15m-1764726300](https://polymarket.com/event/btc-updown-15m-1764726300) | $1 | ✅ | UP | +$1 | $990 | - |
| 9 | 02:00 | [btc-updown-15m-1764727200](https://polymarket.com/event/btc-updown-15m-1764727200) | $1 | ✅ | UP | +$1 | $991 | - |
| 10 | 02:15 | [btc-updown-15m-1764728100](https://polymarket.com/event/btc-updown-15m-1764728100) | $1 | ❌ | DOWN | $-1 | $990 | L1 |
| 11 | 02:30 | [btc-updown-15m-1764729000](https://polymarket.com/event/btc-updown-15m-1764729000) | $2 | ❌ | DOWN | $-2 | $988 | L2 |
| 12 | 02:45 | [btc-updown-15m-1764729900](https://polymarket.com/event/btc-updown-15m-1764729900) | $4 | ✅ | UP | +$4 | $992 | - |
| 13 | 03:00 | [btc-updown-15m-1764730800](https://polymarket.com/event/btc-updown-15m-1764730800) | $1 | ❌ | DOWN | $-1 | $991 | L1 |
| 14 | 03:15 | [btc-updown-15m-1764731700](https://polymarket.com/event/btc-updown-15m-1764731700) | $2 | ✅ | UP | +$2 | $993 | - |
| 15 | 03:30 | [btc-updown-15m-1764732600](https://polymarket.com/event/btc-updown-15m-1764732600) | $1 | ❌ | DOWN | $-1 | $992 | L1 |
| 16 | 03:45 | [btc-updown-15m-1764733500](https://polymarket.com/event/btc-updown-15m-1764733500) | $2 | ❌ | DOWN | $-2 | $990 | L2 |
| 17 | 04:00 | [btc-updown-15m-1764734400](https://polymarket.com/event/btc-updown-15m-1764734400) | $4 | ✅ | UP | +$4 | $994 | - |
| 18 | 04:15 | [btc-updown-15m-1764735300](https://polymarket.com/event/btc-updown-15m-1764735300) | $1 | ❌ | DOWN | $-1 | $993 | L1 |
| 19 | 04:30 | [btc-updown-15m-1764736200](https://polymarket.com/event/btc-updown-15m-1764736200) | $2 | ✅ | UP | +$2 | $995 | - |
| 20 | 04:45 | [btc-updown-15m-1764737100](https://polymarket.com/event/btc-updown-15m-1764737100) | $1 | ✅ | UP | +$1 | $996 | - |
| 21 | 05:00 | [btc-updown-15m-1764738000](https://polymarket.com/event/btc-updown-15m-1764738000) | $1 | ❌ | DOWN | $-1 | $995 | L1 |
| 22 | 05:15 | [btc-updown-15m-1764738900](https://polymarket.com/event/btc-updown-15m-1764738900) | $2 | ✅ | UP | +$2 | $997 | - |
| 23 | 05:30 | [btc-updown-15m-1764739800](https://polymarket.com/event/btc-updown-15m-1764739800) | $1 | ✅ | UP | +$1 | $998 | - |
| 24 | 05:45 | [btc-updown-15m-1764740700](https://polymarket.com/event/btc-updown-15m-1764740700) | $1 | ✅ | UP | +$1 | $999 | - |
| 25 | 06:00 | [btc-updown-15m-1764741600](https://polymarket.com/event/btc-updown-15m-1764741600) | $1 | ✅ | UP | +$1 | $1000 | - |
| 26 | 06:15 | [btc-updown-15m-1764742500](https://polymarket.com/event/btc-updown-15m-1764742500) | $1 | ✅ | UP | +$1 | $1001 | - |
| 27 | 06:30 | [btc-updown-15m-1764743400](https://polymarket.com/event/btc-updown-15m-1764743400) | $1 | ❌ | DOWN | $-1 | $1000 | L1 |
| 28 | 06:45 | [btc-updown-15m-1764744300](https://polymarket.com/event/btc-updown-15m-1764744300) | $2 | ✅ | UP | +$2 | $1002 | - |
| 29 | 07:00 | [btc-updown-15m-1764745200](https://polymarket.com/event/btc-updown-15m-1764745200) | $1 | ❌ | DOWN | $-1 | $1001 | L1 |
| 30 | 07:15 | [btc-updown-15m-1764746100](https://polymarket.com/event/btc-updown-15m-1764746100) | $2 | ❌ | DOWN | $-2 | $999 | L2 |
| 31 | 07:30 | [btc-updown-15m-1764747000](https://polymarket.com/event/btc-updown-15m-1764747000) | $4 | ✅ | UP | +$4 | $1003 | - |
| 32 | 07:45 | [btc-updown-15m-1764747900](https://polymarket.com/event/btc-updown-15m-1764747900) | $1 | ❌ | DOWN | $-1 | $1002 | L1 |
| 33 | 08:00 | [btc-updown-15m-1764748800](https://polymarket.com/event/btc-updown-15m-1764748800) | $2 | ❌ | DOWN | $-2 | $1000 | L2 |
| 34 | 08:15 | [btc-updown-15m-1764749700](https://polymarket.com/event/btc-updown-15m-1764749700) | $4 | ❌ | DOWN | $-4 | $996 | L3 |
| 35 | 08:30 | [btc-updown-15m-1764750600](https://polymarket.com/event/btc-updown-15m-1764750600) | $8 | ❌ | DOWN | $-8 | $988 | L4 |
| 36 | 08:45 | [btc-updown-15m-1764751500](https://polymarket.com/event/btc-updown-15m-1764751500) | $16 | ❌ | DOWN | $-16 | $972 | L5 |
| - | 09:00 | [btc-updown-15m-1764752400](https://polymarket.com/event/btc-updown-15m-1764752400) | - | ⏭️ SKIP | UP | - | $972 | - |
| - | 09:15 | [btc-updown-15m-1764753300](https://polymarket.com/event/btc-updown-15m-1764753300) | - | ⏭️ SKIP | DOWN | - | $972 | - |
| - | 09:30 | [btc-updown-15m-1764754200](https://polymarket.com/event/btc-updown-15m-1764754200) | - | ⏭️ SKIP | DOWN | - | $972 | - |
| 37 | 09:45 | [btc-updown-15m-1764755100](https://polymarket.com/event/btc-updown-15m-1764755100) | $32 | ✅ | UP | +$32 | $1004 | - |
| 38 | 10:00 | [btc-updown-15m-1764756000](https://polymarket.com/event/btc-updown-15m-1764756000) | $1 | ❌ | DOWN | $-1 | $1003 | L1 |
| 39 | 10:15 | [btc-updown-15m-1764756900](https://polymarket.com/event/btc-updown-15m-1764756900) | $2 | ✅ | UP | +$2 | $1005 | - |
| 40 | 10:30 | [btc-updown-15m-1764757800](https://polymarket.com/event/btc-updown-15m-1764757800) | $1 | ❌ | DOWN | $-1 | $1004 | L1 |
| 41 | 10:45 | [btc-updown-15m-1764758700](https://polymarket.com/event/btc-updown-15m-1764758700) | $2 | ❌ | DOWN | $-2 | $1002 | L2 |
| 42 | 11:00 | [btc-updown-15m-1764759600](https://polymarket.com/event/btc-updown-15m-1764759600) | $4 | ❌ | DOWN | $-4 | $998 | L3 |
| 43 | 11:15 | [btc-updown-15m-1764760500](https://polymarket.com/event/btc-updown-15m-1764760500) | $8 | ✅ | UP | +$8 | $1006 | - |
| 44 | 11:30 | [btc-updown-15m-1764761400](https://polymarket.com/event/btc-updown-15m-1764761400) | $1 | ❌ | DOWN | $-1 | $1005 | L1 |
| 45 | 11:45 | [btc-updown-15m-1764762300](https://polymarket.com/event/btc-updown-15m-1764762300) | $2 | ✅ | UP | +$2 | $1007 | - |
| 46 | 12:00 | [btc-updown-15m-1764763200](https://polymarket.com/event/btc-updown-15m-1764763200) | $1 | ❌ | DOWN | $-1 | $1006 | L1 |
| 47 | 12:15 | [btc-updown-15m-1764764100](https://polymarket.com/event/btc-updown-15m-1764764100) | $2 | ❌ | DOWN | $-2 | $1004 | L2 |
| 48 | 12:30 | [btc-updown-15m-1764765000](https://polymarket.com/event/btc-updown-15m-1764765000) | $4 | ✅ | UP | +$4 | $1008 | - |
| 49 | 12:45 | [btc-updown-15m-1764765900](https://polymarket.com/event/btc-updown-15m-1764765900) | $1 | ✅ | UP | +$1 | $1009 | - |
| 50 | 13:00 | [btc-updown-15m-1764766800](https://polymarket.com/event/btc-updown-15m-1764766800) | $1 | ✅ | UP | +$1 | $1010 | - |
| 51 | 13:15 | [btc-updown-15m-1764767700](https://polymarket.com/event/btc-updown-15m-1764767700) | $1 | ✅ | UP | +$1 | $1011 | - |
| 52 | 13:30 | [btc-updown-15m-1764768600](https://polymarket.com/event/btc-updown-15m-1764768600) | $1 | ✅ | UP | +$1 | $1012 | - |
| 53 | 13:45 | [btc-updown-15m-1764769500](https://polymarket.com/event/btc-updown-15m-1764769500) | $1 | ❌ | DOWN | $-1 | $1011 | L1 |
| 54 | 14:00 | [btc-updown-15m-1764770400](https://polymarket.com/event/btc-updown-15m-1764770400) | $2 | ❌ | DOWN | $-2 | $1009 | L2 |
| 55 | 14:15 | [btc-updown-15m-1764771300](https://polymarket.com/event/btc-updown-15m-1764771300) | $4 | ✅ | UP | +$4 | $1013 | - |
| 56 | 14:30 | [btc-updown-15m-1764772200](https://polymarket.com/event/btc-updown-15m-1764772200) | $1 | ✅ | UP | +$1 | $1014 | - |
| 57 | 14:45 | [btc-updown-15m-1764773100](https://polymarket.com/event/btc-updown-15m-1764773100) | $1 | ❌ | DOWN | $-1 | $1013 | L1 |
| 58 | 15:00 | [btc-updown-15m-1764774000](https://polymarket.com/event/btc-updown-15m-1764774000) | $2 | ❌ | DOWN | $-2 | $1011 | L2 |
| 59 | 15:15 | [btc-updown-15m-1764774900](https://polymarket.com/event/btc-updown-15m-1764774900) | $4 | ✅ | UP | +$4 | $1015 | - |
| 60 | 15:30 | [btc-updown-15m-1764775800](https://polymarket.com/event/btc-updown-15m-1764775800) | $1 | ✅ | UP | +$1 | $1016 | - |
| 61 | 15:45 | [btc-updown-15m-1764776700](https://polymarket.com/event/btc-updown-15m-1764776700) | $1 | ✅ | UP | +$1 | $1017 | - |
| 62 | 16:00 | [btc-updown-15m-1764777600](https://polymarket.com/event/btc-updown-15m-1764777600) | $1 | ❌ | DOWN | $-1 | $1016 | L1 |
| 63 | 16:15 | [btc-updown-15m-1764778500](https://polymarket.com/event/btc-updown-15m-1764778500) | $2 | ✅ | UP | +$2 | $1018 | - |
| 64 | 16:30 | [btc-updown-15m-1764779400](https://polymarket.com/event/btc-updown-15m-1764779400) | $1 | ✅ | UP | +$1 | $1019 | - |
| 65 | 16:45 | [btc-updown-15m-1764780300](https://polymarket.com/event/btc-updown-15m-1764780300) | $1 | ❌ | DOWN | $-1 | $1018 | L1 |
| 66 | 17:00 | [btc-updown-15m-1764781200](https://polymarket.com/event/btc-updown-15m-1764781200) | $2 | ✅ | UP | +$2 | $1020 | - |
| 67 | 17:15 | [btc-updown-15m-1764782100](https://polymarket.com/event/btc-updown-15m-1764782100) | $1 | ❌ | DOWN | $-1 | $1019 | L1 |
| 68 | 17:30 | [btc-updown-15m-1764783000](https://polymarket.com/event/btc-updown-15m-1764783000) | $2 | ✅ | UP | +$2 | $1021 | - |
| 69 | 17:45 | [btc-updown-15m-1764783900](https://polymarket.com/event/btc-updown-15m-1764783900) | $1 | ✅ | UP | +$1 | $1022 | - |
| 70 | 18:00 | [btc-updown-15m-1764784800](https://polymarket.com/event/btc-updown-15m-1764784800) | $1 | ✅ | UP | +$1 | $1023 | - |
| 71 | 18:15 | [btc-updown-15m-1764785700](https://polymarket.com/event/btc-updown-15m-1764785700) | $1 | ❌ | DOWN | $-1 | $1022 | L1 |
| 72 | 18:30 | [btc-updown-15m-1764786600](https://polymarket.com/event/btc-updown-15m-1764786600) | $2 | ✅ | UP | +$2 | $1024 | - |
| 73 | 18:45 | [btc-updown-15m-1764787500](https://polymarket.com/event/btc-updown-15m-1764787500) | $1 | ❌ | DOWN | $-1 | $1023 | L1 |
| 74 | 19:00 | [btc-updown-15m-1764788400](https://polymarket.com/event/btc-updown-15m-1764788400) | $2 | ✅ | UP | +$2 | $1025 | - |
| 75 | 19:15 | [btc-updown-15m-1764789300](https://polymarket.com/event/btc-updown-15m-1764789300) | $1 | ✅ | UP | +$1 | $1026 | - |
| 76 | 19:30 | [btc-updown-15m-1764790200](https://polymarket.com/event/btc-updown-15m-1764790200) | $1 | ✅ | UP | +$1 | $1027 | - |
| 77 | 19:45 | [btc-updown-15m-1764791100](https://polymarket.com/event/btc-updown-15m-1764791100) | $1 | ✅ | UP | +$1 | $1028 | - |
| 78 | 20:00 | [btc-updown-15m-1764792000](https://polymarket.com/event/btc-updown-15m-1764792000) | $1 | ❌ | DOWN | $-1 | $1027 | L1 |
| 79 | 20:15 | [btc-updown-15m-1764792900](https://polymarket.com/event/btc-updown-15m-1764792900) | $2 | ✅ | UP | +$2 | $1029 | - |
| 80 | 20:30 | [btc-updown-15m-1764793800](https://polymarket.com/event/btc-updown-15m-1764793800) | $1 | ✅ | UP | +$1 | $1030 | - |
| 81 | 20:45 | [btc-updown-15m-1764794700](https://polymarket.com/event/btc-updown-15m-1764794700) | $1 | ❌ | DOWN | $-1 | $1029 | L1 |
| 82 | 21:00 | [btc-updown-15m-1764795600](https://polymarket.com/event/btc-updown-15m-1764795600) | $2 | ✅ | UP | +$2 | $1031 | - |
| 83 | 21:15 | [btc-updown-15m-1764796500](https://polymarket.com/event/btc-updown-15m-1764796500) | $1 | ✅ | UP | +$1 | $1032 | - |
| 84 | 21:30 | [btc-updown-15m-1764797400](https://polymarket.com/event/btc-updown-15m-1764797400) | $1 | ✅ | UP | +$1 | $1033 | - |
| 85 | 21:45 | [btc-updown-15m-1764798300](https://polymarket.com/event/btc-updown-15m-1764798300) | $1 | ✅ | UP | +$1 | $1034 | - |
| 86 | 22:00 | [btc-updown-15m-1764799200](https://polymarket.com/event/btc-updown-15m-1764799200) | $1 | ❌ | DOWN | $-1 | $1033 | L1 |
| 87 | 22:15 | [btc-updown-15m-1764800100](https://polymarket.com/event/btc-updown-15m-1764800100) | $2 | ❌ | DOWN | $-2 | $1031 | L2 |
| 88 | 22:30 | [btc-updown-15m-1764801000](https://polymarket.com/event/btc-updown-15m-1764801000) | $4 | ✅ | UP | +$4 | $1035 | - |
| 89 | 22:45 | [btc-updown-15m-1764801900](https://polymarket.com/event/btc-updown-15m-1764801900) | $1 | ✅ | UP | +$1 | $1036 | - |
| 90 | 23:00 | [btc-updown-15m-1764802800](https://polymarket.com/event/btc-updown-15m-1764802800) | $1 | ❌ | DOWN | $-1 | $1035 | L1 |
| 91 | 23:15 | [btc-updown-15m-1764803700](https://polymarket.com/event/btc-updown-15m-1764803700) | $2 | ❌ | DOWN | $-2 | $1033 | L2 |
| 92 | 23:30 | [btc-updown-15m-1764804600](https://polymarket.com/event/btc-updown-15m-1764804600) | $4 | ❌ | DOWN | $-4 | $1029 | L3 |
| 93 | 23:45 | [btc-updown-15m-1764805500](https://polymarket.com/event/btc-updown-15m-1764805500) | $8 | ❌ | DOWN | $-8 | $1021 | L4 |

### 2025-12-04
**Summary:** 81 trades | 34 wins | 47 losses | Max Bet: $64 | Profit: +$18

**Skip Events (6):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:00 | 5 | $31 | $32 | 01:00 |
| 05:00 | 5 | $31 | $32 | 06:00 |
| 10:45 | 5 | $31 | $32 | 11:45 |
| 17:30 | 5 | $31 | $32 | 18:30 |
| 18:30 | 6 | $63 | $64 | 19:30 |
| 23:45 | 5 | $31 | $32 | 2025-12-05 00:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764806400](https://polymarket.com/event/btc-updown-15m-1764806400) | $16 | ❌ | DOWN | $-16 | $1005 | L5 |
| - | 00:15 | [btc-updown-15m-1764807300](https://polymarket.com/event/btc-updown-15m-1764807300) | - | ⏭️ SKIP | DOWN | - | $1005 | - |
| - | 00:30 | [btc-updown-15m-1764808200](https://polymarket.com/event/btc-updown-15m-1764808200) | - | ⏭️ SKIP | UP | - | $1005 | - |
| - | 00:45 | [btc-updown-15m-1764809100](https://polymarket.com/event/btc-updown-15m-1764809100) | - | ⏭️ SKIP | UP | - | $1005 | - |
| 2 | 01:00 | [btc-updown-15m-1764810000](https://polymarket.com/event/btc-updown-15m-1764810000) | $32 | ✅ | UP | +$32 | $1037 | - |
| 3 | 01:15 | [btc-updown-15m-1764810900](https://polymarket.com/event/btc-updown-15m-1764810900) | $1 | ❌ | DOWN | $-1 | $1036 | L1 |
| 4 | 01:30 | [btc-updown-15m-1764811800](https://polymarket.com/event/btc-updown-15m-1764811800) | $2 | ✅ | UP | +$2 | $1038 | - |
| 5 | 01:45 | [btc-updown-15m-1764812700](https://polymarket.com/event/btc-updown-15m-1764812700) | $1 | ❌ | DOWN | $-1 | $1037 | L1 |
| 6 | 02:00 | [btc-updown-15m-1764813600](https://polymarket.com/event/btc-updown-15m-1764813600) | $2 | ✅ | UP | +$2 | $1039 | - |
| 7 | 02:15 | [btc-updown-15m-1764814500](https://polymarket.com/event/btc-updown-15m-1764814500) | $1 | ✅ | UP | +$1 | $1040 | - |
| 8 | 02:30 | [btc-updown-15m-1764815400](https://polymarket.com/event/btc-updown-15m-1764815400) | $1 | ✅ | UP | +$1 | $1041 | - |
| 9 | 02:45 | [btc-updown-15m-1764816300](https://polymarket.com/event/btc-updown-15m-1764816300) | $1 | ✅ | UP | +$1 | $1042 | - |
| 10 | 03:00 | [btc-updown-15m-1764817200](https://polymarket.com/event/btc-updown-15m-1764817200) | $1 | ❌ | DOWN | $-1 | $1041 | L1 |
| 11 | 03:15 | [btc-updown-15m-1764818100](https://polymarket.com/event/btc-updown-15m-1764818100) | $2 | ❌ | DOWN | $-2 | $1039 | L2 |
| 12 | 03:30 | [btc-updown-15m-1764819000](https://polymarket.com/event/btc-updown-15m-1764819000) | $4 | ❌ | DOWN | $-4 | $1035 | L3 |
| 13 | 03:45 | [btc-updown-15m-1764819900](https://polymarket.com/event/btc-updown-15m-1764819900) | $8 | ✅ | UP | +$8 | $1043 | - |
| 14 | 04:00 | [btc-updown-15m-1764820800](https://polymarket.com/event/btc-updown-15m-1764820800) | $1 | ❌ | DOWN | $-1 | $1042 | L1 |
| 15 | 04:15 | [btc-updown-15m-1764821700](https://polymarket.com/event/btc-updown-15m-1764821700) | $2 | ❌ | DOWN | $-2 | $1040 | L2 |
| 16 | 04:30 | [btc-updown-15m-1764822600](https://polymarket.com/event/btc-updown-15m-1764822600) | $4 | ❌ | DOWN | $-4 | $1036 | L3 |
| 17 | 04:45 | [btc-updown-15m-1764823500](https://polymarket.com/event/btc-updown-15m-1764823500) | $8 | ❌ | DOWN | $-8 | $1028 | L4 |
| 18 | 05:00 | [btc-updown-15m-1764824400](https://polymarket.com/event/btc-updown-15m-1764824400) | $16 | ❌ | DOWN | $-16 | $1012 | L5 |
| - | 05:15 | [btc-updown-15m-1764825300](https://polymarket.com/event/btc-updown-15m-1764825300) | - | ⏭️ SKIP | UP | - | $1012 | - |
| - | 05:30 | [btc-updown-15m-1764826200](https://polymarket.com/event/btc-updown-15m-1764826200) | - | ⏭️ SKIP | DOWN | - | $1012 | - |
| - | 05:45 | [btc-updown-15m-1764827100](https://polymarket.com/event/btc-updown-15m-1764827100) | - | ⏭️ SKIP | UP | - | $1012 | - |
| 19 | 06:00 | [btc-updown-15m-1764828000](https://polymarket.com/event/btc-updown-15m-1764828000) | $32 | ✅ | UP | +$32 | $1044 | - |
| 20 | 06:15 | [btc-updown-15m-1764828900](https://polymarket.com/event/btc-updown-15m-1764828900) | $1 | ✅ | UP | +$1 | $1045 | - |
| 21 | 06:30 | [btc-updown-15m-1764829800](https://polymarket.com/event/btc-updown-15m-1764829800) | $1 | ❌ | DOWN | $-1 | $1044 | L1 |
| 22 | 06:45 | [btc-updown-15m-1764830700](https://polymarket.com/event/btc-updown-15m-1764830700) | $2 | ✅ | UP | +$2 | $1046 | - |
| 23 | 07:00 | [btc-updown-15m-1764831600](https://polymarket.com/event/btc-updown-15m-1764831600) | $1 | ❌ | DOWN | $-1 | $1045 | L1 |
| 24 | 07:15 | [btc-updown-15m-1764832500](https://polymarket.com/event/btc-updown-15m-1764832500) | $2 | ✅ | UP | +$2 | $1047 | - |
| 25 | 07:30 | [btc-updown-15m-1764833400](https://polymarket.com/event/btc-updown-15m-1764833400) | $1 | ✅ | UP | +$1 | $1048 | - |
| 26 | 07:45 | [btc-updown-15m-1764834300](https://polymarket.com/event/btc-updown-15m-1764834300) | $1 | ✅ | UP | +$1 | $1049 | - |
| 27 | 08:00 | [btc-updown-15m-1764835200](https://polymarket.com/event/btc-updown-15m-1764835200) | $1 | ❌ | DOWN | $-1 | $1048 | L1 |
| 28 | 08:15 | [btc-updown-15m-1764836100](https://polymarket.com/event/btc-updown-15m-1764836100) | $2 | ❌ | DOWN | $-2 | $1046 | L2 |
| 29 | 08:30 | [btc-updown-15m-1764837000](https://polymarket.com/event/btc-updown-15m-1764837000) | $4 | ✅ | UP | +$4 | $1050 | - |
| 30 | 08:45 | [btc-updown-15m-1764837900](https://polymarket.com/event/btc-updown-15m-1764837900) | $1 | ❌ | DOWN | $-1 | $1049 | L1 |
| 31 | 09:00 | [btc-updown-15m-1764838800](https://polymarket.com/event/btc-updown-15m-1764838800) | $2 | ✅ | UP | +$2 | $1051 | - |
| 32 | 09:15 | [btc-updown-15m-1764839700](https://polymarket.com/event/btc-updown-15m-1764839700) | $1 | ✅ | UP | +$1 | $1052 | - |
| 33 | 09:30 | [btc-updown-15m-1764840600](https://polymarket.com/event/btc-updown-15m-1764840600) | $1 | ✅ | UP | +$1 | $1053 | - |
| 34 | 09:45 | [btc-updown-15m-1764841500](https://polymarket.com/event/btc-updown-15m-1764841500) | $1 | ❌ | DOWN | $-1 | $1052 | L1 |
| 35 | 10:00 | [btc-updown-15m-1764842400](https://polymarket.com/event/btc-updown-15m-1764842400) | $2 | ❌ | DOWN | $-2 | $1050 | L2 |
| 36 | 10:15 | [btc-updown-15m-1764843300](https://polymarket.com/event/btc-updown-15m-1764843300) | $4 | ❌ | DOWN | $-4 | $1046 | L3 |
| 37 | 10:30 | [btc-updown-15m-1764844200](https://polymarket.com/event/btc-updown-15m-1764844200) | $8 | ❌ | DOWN | $-8 | $1038 | L4 |
| 38 | 10:45 | [btc-updown-15m-1764845100](https://polymarket.com/event/btc-updown-15m-1764845100) | $16 | ❌ | DOWN | $-16 | $1022 | L5 |
| - | 11:00 | [btc-updown-15m-1764846000](https://polymarket.com/event/btc-updown-15m-1764846000) | - | ⏭️ SKIP | DOWN | - | $1022 | - |
| - | 11:15 | [btc-updown-15m-1764846900](https://polymarket.com/event/btc-updown-15m-1764846900) | - | ⏭️ SKIP | DOWN | - | $1022 | - |
| - | 11:30 | [btc-updown-15m-1764847800](https://polymarket.com/event/btc-updown-15m-1764847800) | - | ⏭️ SKIP | DOWN | - | $1022 | - |
| 39 | 11:45 | [btc-updown-15m-1764848700](https://polymarket.com/event/btc-updown-15m-1764848700) | $32 | ✅ | UP | +$32 | $1054 | - |
| 40 | 12:00 | [btc-updown-15m-1764849600](https://polymarket.com/event/btc-updown-15m-1764849600) | $1 | ✅ | UP | +$1 | $1055 | - |
| 41 | 12:15 | [btc-updown-15m-1764850500](https://polymarket.com/event/btc-updown-15m-1764850500) | $1 | ❌ | DOWN | $-1 | $1054 | L1 |
| 42 | 12:30 | [btc-updown-15m-1764851400](https://polymarket.com/event/btc-updown-15m-1764851400) | $2 | ✅ | UP | +$2 | $1056 | - |
| 43 | 12:45 | [btc-updown-15m-1764852300](https://polymarket.com/event/btc-updown-15m-1764852300) | $1 | ❌ | DOWN | $-1 | $1055 | L1 |
| 44 | 13:00 | [btc-updown-15m-1764853200](https://polymarket.com/event/btc-updown-15m-1764853200) | $2 | ❌ | DOWN | $-2 | $1053 | L2 |
| 45 | 13:15 | [btc-updown-15m-1764854100](https://polymarket.com/event/btc-updown-15m-1764854100) | $4 | ✅ | UP | +$4 | $1057 | - |
| 46 | 13:30 | [btc-updown-15m-1764855000](https://polymarket.com/event/btc-updown-15m-1764855000) | $1 | ❌ | DOWN | $-1 | $1056 | L1 |
| 47 | 13:45 | [btc-updown-15m-1764855900](https://polymarket.com/event/btc-updown-15m-1764855900) | $2 | ❌ | DOWN | $-2 | $1054 | L2 |
| 48 | 14:00 | [btc-updown-15m-1764856800](https://polymarket.com/event/btc-updown-15m-1764856800) | $4 | ✅ | UP | +$4 | $1058 | - |
| 49 | 14:15 | [btc-updown-15m-1764857700](https://polymarket.com/event/btc-updown-15m-1764857700) | $1 | ✅ | UP | +$1 | $1059 | - |
| 50 | 14:30 | [btc-updown-15m-1764858600](https://polymarket.com/event/btc-updown-15m-1764858600) | $1 | ❌ | DOWN | $-1 | $1058 | L1 |
| 51 | 14:45 | [btc-updown-15m-1764859500](https://polymarket.com/event/btc-updown-15m-1764859500) | $2 | ❌ | DOWN | $-2 | $1056 | L2 |
| 52 | 15:00 | [btc-updown-15m-1764860400](https://polymarket.com/event/btc-updown-15m-1764860400) | $4 | ✅ | UP | +$4 | $1060 | - |
| 53 | 15:15 | [btc-updown-15m-1764861300](https://polymarket.com/event/btc-updown-15m-1764861300) | $1 | ❌ | DOWN | $-1 | $1059 | L1 |
| 54 | 15:30 | [btc-updown-15m-1764862200](https://polymarket.com/event/btc-updown-15m-1764862200) | $2 | ✅ | UP | +$2 | $1061 | - |
| 55 | 15:45 | [btc-updown-15m-1764863100](https://polymarket.com/event/btc-updown-15m-1764863100) | $1 | ❌ | DOWN | $-1 | $1060 | L1 |
| 56 | 16:00 | [btc-updown-15m-1764864000](https://polymarket.com/event/btc-updown-15m-1764864000) | $2 | ❌ | DOWN | $-2 | $1058 | L2 |
| 57 | 16:15 | [btc-updown-15m-1764864900](https://polymarket.com/event/btc-updown-15m-1764864900) | $4 | ✅ | UP | +$4 | $1062 | - |
| 58 | 16:30 | [btc-updown-15m-1764865800](https://polymarket.com/event/btc-updown-15m-1764865800) | $1 | ❌ | DOWN | $-1 | $1061 | L1 |
| 59 | 16:45 | [btc-updown-15m-1764866700](https://polymarket.com/event/btc-updown-15m-1764866700) | $2 | ❌ | DOWN | $-2 | $1059 | L2 |
| 60 | 17:00 | [btc-updown-15m-1764867600](https://polymarket.com/event/btc-updown-15m-1764867600) | $4 | ❌ | DOWN | $-4 | $1055 | L3 |
| 61 | 17:15 | [btc-updown-15m-1764868500](https://polymarket.com/event/btc-updown-15m-1764868500) | $8 | ❌ | DOWN | $-8 | $1047 | L4 |
| 62 | 17:30 | [btc-updown-15m-1764869400](https://polymarket.com/event/btc-updown-15m-1764869400) | $16 | ❌ | DOWN | $-16 | $1031 | L5 |
| - | 17:45 | [btc-updown-15m-1764870300](https://polymarket.com/event/btc-updown-15m-1764870300) | - | ⏭️ SKIP | UP | - | $1031 | - |
| - | 18:00 | [btc-updown-15m-1764871200](https://polymarket.com/event/btc-updown-15m-1764871200) | - | ⏭️ SKIP | DOWN | - | $1031 | - |
| - | 18:15 | [btc-updown-15m-1764872100](https://polymarket.com/event/btc-updown-15m-1764872100) | - | ⏭️ SKIP | UP | - | $1031 | - |
| 63 | 18:30 | [btc-updown-15m-1764873000](https://polymarket.com/event/btc-updown-15m-1764873000) | $32 | ❌ | DOWN | $-32 | $999 | L6 |
| - | 18:45 | [btc-updown-15m-1764873900](https://polymarket.com/event/btc-updown-15m-1764873900) | - | ⏭️ SKIP | UP | - | $999 | - |
| - | 19:00 | [btc-updown-15m-1764874800](https://polymarket.com/event/btc-updown-15m-1764874800) | - | ⏭️ SKIP | DOWN | - | $999 | - |
| - | 19:15 | [btc-updown-15m-1764875700](https://polymarket.com/event/btc-updown-15m-1764875700) | - | ⏭️ SKIP | UP | - | $999 | - |
| 64 | 19:30 | [btc-updown-15m-1764876600](https://polymarket.com/event/btc-updown-15m-1764876600) | $64 | ✅ | UP | +$64 | $1063 | - |
| 65 | 19:45 | [btc-updown-15m-1764877500](https://polymarket.com/event/btc-updown-15m-1764877500) | $1 | ✅ | UP | +$1 | $1064 | - |
| 66 | 20:00 | [btc-updown-15m-1764878400](https://polymarket.com/event/btc-updown-15m-1764878400) | $1 | ✅ | UP | +$1 | $1065 | - |
| 67 | 20:15 | [btc-updown-15m-1764879300](https://polymarket.com/event/btc-updown-15m-1764879300) | $1 | ✅ | UP | +$1 | $1066 | - |
| 68 | 20:30 | [btc-updown-15m-1764880200](https://polymarket.com/event/btc-updown-15m-1764880200) | $1 | ✅ | UP | +$1 | $1067 | - |
| 69 | 20:45 | [btc-updown-15m-1764881100](https://polymarket.com/event/btc-updown-15m-1764881100) | $1 | ✅ | UP | +$1 | $1068 | - |
| 70 | 21:00 | [btc-updown-15m-1764882000](https://polymarket.com/event/btc-updown-15m-1764882000) | $1 | ❌ | DOWN | $-1 | $1067 | L1 |
| 71 | 21:15 | [btc-updown-15m-1764882900](https://polymarket.com/event/btc-updown-15m-1764882900) | $2 | ❌ | DOWN | $-2 | $1065 | L2 |
| 72 | 21:30 | [btc-updown-15m-1764883800](https://polymarket.com/event/btc-updown-15m-1764883800) | $4 | ❌ | DOWN | $-4 | $1061 | L3 |
| 73 | 21:45 | [btc-updown-15m-1764884700](https://polymarket.com/event/btc-updown-15m-1764884700) | $8 | ❌ | DOWN | $-8 | $1053 | L4 |
| 74 | 22:00 | [btc-updown-15m-1764885600](https://polymarket.com/event/btc-updown-15m-1764885600) | $16 | ✅ | UP | +$16 | $1069 | - |
| 75 | 22:15 | [btc-updown-15m-1764886500](https://polymarket.com/event/btc-updown-15m-1764886500) | $1 | ❌ | DOWN | $-1 | $1068 | L1 |
| 76 | 22:30 | [btc-updown-15m-1764887400](https://polymarket.com/event/btc-updown-15m-1764887400) | $2 | ✅ | UP | +$2 | $1070 | - |
| 77 | 22:45 | [btc-updown-15m-1764888300](https://polymarket.com/event/btc-updown-15m-1764888300) | $1 | ❌ | DOWN | $-1 | $1069 | L1 |
| 78 | 23:00 | [btc-updown-15m-1764889200](https://polymarket.com/event/btc-updown-15m-1764889200) | $2 | ❌ | DOWN | $-2 | $1067 | L2 |
| 79 | 23:15 | [btc-updown-15m-1764890100](https://polymarket.com/event/btc-updown-15m-1764890100) | $4 | ❌ | DOWN | $-4 | $1063 | L3 |
| 80 | 23:30 | [btc-updown-15m-1764891000](https://polymarket.com/event/btc-updown-15m-1764891000) | $8 | ❌ | DOWN | $-8 | $1055 | L4 |
| 81 | 23:45 | [btc-updown-15m-1764891900](https://polymarket.com/event/btc-updown-15m-1764891900) | $16 | ❌ | DOWN | $-16 | $1039 | L5 |

### 2025-12-05
**Summary:** 72 trades | 31 wins | 41 losses | Max Bet: $512 | Profit: +$62

**Skip Events (7):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 00:45 | 6 | $63 | $64 | 01:45 |
| 01:45 | 7 | $127 | $128 | 02:45 |
| 02:45 | 8 | $255 | $256 | 03:45 |
| 03:45 | 9 | $511 | $512 | 04:45 |
| 08:30 | 5 | $31 | $32 | 09:30 |
| 09:30 | 6 | $63 | $64 | 10:30 |
| 16:30 | 5 | $31 | $32 | 17:30 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| - | 00:00 | [btc-updown-15m-1764892800](https://polymarket.com/event/btc-updown-15m-1764892800) | - | ⏭️ SKIP | UP | - | $1039 | - |
| - | 00:15 | [btc-updown-15m-1764893700](https://polymarket.com/event/btc-updown-15m-1764893700) | - | ⏭️ SKIP | UP | - | $1039 | - |
| - | 00:30 | [btc-updown-15m-1764894600](https://polymarket.com/event/btc-updown-15m-1764894600) | - | ⏭️ SKIP | UP | - | $1039 | - |
| 1 | 00:45 | [btc-updown-15m-1764895500](https://polymarket.com/event/btc-updown-15m-1764895500) | $32 | ❌ | DOWN | $-32 | $1007 | L6 |
| - | 01:00 | [btc-updown-15m-1764896400](https://polymarket.com/event/btc-updown-15m-1764896400) | - | ⏭️ SKIP | UP | - | $1007 | - |
| - | 01:15 | [btc-updown-15m-1764897300](https://polymarket.com/event/btc-updown-15m-1764897300) | - | ⏭️ SKIP | UP | - | $1007 | - |
| - | 01:30 | [btc-updown-15m-1764898200](https://polymarket.com/event/btc-updown-15m-1764898200) | - | ⏭️ SKIP | DOWN | - | $1007 | - |
| 2 | 01:45 | [btc-updown-15m-1764899100](https://polymarket.com/event/btc-updown-15m-1764899100) | $64 | ❌ | DOWN | $-64 | $943 | L7 |
| - | 02:00 | [btc-updown-15m-1764900000](https://polymarket.com/event/btc-updown-15m-1764900000) | - | ⏭️ SKIP | UP | - | $943 | - |
| - | 02:15 | [btc-updown-15m-1764900900](https://polymarket.com/event/btc-updown-15m-1764900900) | - | ⏭️ SKIP | UP | - | $943 | - |
| - | 02:30 | [btc-updown-15m-1764901800](https://polymarket.com/event/btc-updown-15m-1764901800) | - | ⏭️ SKIP | UP | - | $943 | - |
| 3 | 02:45 | [btc-updown-15m-1764902700](https://polymarket.com/event/btc-updown-15m-1764902700) | $128 | ❌ | DOWN | $-128 | $815 | L8 |
| - | 03:00 | [btc-updown-15m-1764903600](https://polymarket.com/event/btc-updown-15m-1764903600) | - | ⏭️ SKIP | UP | - | $815 | - |
| - | 03:15 | [btc-updown-15m-1764904500](https://polymarket.com/event/btc-updown-15m-1764904500) | - | ⏭️ SKIP | DOWN | - | $815 | - |
| - | 03:30 | [btc-updown-15m-1764905400](https://polymarket.com/event/btc-updown-15m-1764905400) | - | ⏭️ SKIP | DOWN | - | $815 | - |
| 4 | 03:45 | [btc-updown-15m-1764906300](https://polymarket.com/event/btc-updown-15m-1764906300) | $256 | ❌ | DOWN | $-256 | $559 | L9 |
| - | 04:00 | [btc-updown-15m-1764907200](https://polymarket.com/event/btc-updown-15m-1764907200) | - | ⏭️ SKIP | UP | - | $559 | - |
| - | 04:15 | [btc-updown-15m-1764908100](https://polymarket.com/event/btc-updown-15m-1764908100) | - | ⏭️ SKIP | DOWN | - | $559 | - |
| - | 04:30 | [btc-updown-15m-1764909000](https://polymarket.com/event/btc-updown-15m-1764909000) | - | ⏭️ SKIP | DOWN | - | $559 | - |
| 5 | 04:45 | [btc-updown-15m-1764909900](https://polymarket.com/event/btc-updown-15m-1764909900) | $512 | ✅ | UP | +$512 | $1071 | - |
| 6 | 05:00 | [btc-updown-15m-1764910800](https://polymarket.com/event/btc-updown-15m-1764910800) | $1 | ✅ | UP | +$1 | $1072 | - |
| 7 | 05:15 | [btc-updown-15m-1764911700](https://polymarket.com/event/btc-updown-15m-1764911700) | $1 | ❌ | DOWN | $-1 | $1071 | L1 |
| 8 | 05:30 | [btc-updown-15m-1764912600](https://polymarket.com/event/btc-updown-15m-1764912600) | $2 | ✅ | UP | +$2 | $1073 | - |
| 9 | 05:45 | [btc-updown-15m-1764913500](https://polymarket.com/event/btc-updown-15m-1764913500) | $1 | ❌ | DOWN | $-1 | $1072 | L1 |
| 10 | 06:00 | [btc-updown-15m-1764914400](https://polymarket.com/event/btc-updown-15m-1764914400) | $2 | ✅ | UP | +$2 | $1074 | - |
| 11 | 06:15 | [btc-updown-15m-1764915300](https://polymarket.com/event/btc-updown-15m-1764915300) | $1 | ❌ | DOWN | $-1 | $1073 | L1 |
| 12 | 06:30 | [btc-updown-15m-1764916200](https://polymarket.com/event/btc-updown-15m-1764916200) | $2 | ✅ | UP | +$2 | $1075 | - |
| 13 | 06:45 | [btc-updown-15m-1764917100](https://polymarket.com/event/btc-updown-15m-1764917100) | $1 | ✅ | UP | +$1 | $1076 | - |
| 14 | 07:00 | [btc-updown-15m-1764918000](https://polymarket.com/event/btc-updown-15m-1764918000) | $1 | ✅ | UP | +$1 | $1077 | - |
| 15 | 07:15 | [btc-updown-15m-1764918900](https://polymarket.com/event/btc-updown-15m-1764918900) | $1 | ✅ | UP | +$1 | $1078 | - |
| 16 | 07:30 | [btc-updown-15m-1764919800](https://polymarket.com/event/btc-updown-15m-1764919800) | $1 | ❌ | DOWN | $-1 | $1077 | L1 |
| 17 | 07:45 | [btc-updown-15m-1764920700](https://polymarket.com/event/btc-updown-15m-1764920700) | $2 | ❌ | DOWN | $-2 | $1075 | L2 |
| 18 | 08:00 | [btc-updown-15m-1764921600](https://polymarket.com/event/btc-updown-15m-1764921600) | $4 | ❌ | DOWN | $-4 | $1071 | L3 |
| 19 | 08:15 | [btc-updown-15m-1764922500](https://polymarket.com/event/btc-updown-15m-1764922500) | $8 | ❌ | DOWN | $-8 | $1063 | L4 |
| 20 | 08:30 | [btc-updown-15m-1764923400](https://polymarket.com/event/btc-updown-15m-1764923400) | $16 | ❌ | DOWN | $-16 | $1047 | L5 |
| - | 08:45 | [btc-updown-15m-1764924300](https://polymarket.com/event/btc-updown-15m-1764924300) | - | ⏭️ SKIP | UP | - | $1047 | - |
| - | 09:00 | [btc-updown-15m-1764925200](https://polymarket.com/event/btc-updown-15m-1764925200) | - | ⏭️ SKIP | DOWN | - | $1047 | - |
| - | 09:15 | [btc-updown-15m-1764926100](https://polymarket.com/event/btc-updown-15m-1764926100) | - | ⏭️ SKIP | DOWN | - | $1047 | - |
| 21 | 09:30 | [btc-updown-15m-1764927000](https://polymarket.com/event/btc-updown-15m-1764927000) | $32 | ❌ | DOWN | $-32 | $1015 | L6 |
| - | 09:45 | [btc-updown-15m-1764927900](https://polymarket.com/event/btc-updown-15m-1764927900) | - | ⏭️ SKIP | UP | - | $1015 | - |
| - | 10:00 | [btc-updown-15m-1764928800](https://polymarket.com/event/btc-updown-15m-1764928800) | - | ⏭️ SKIP | UP | - | $1015 | - |
| - | 10:15 | [btc-updown-15m-1764929700](https://polymarket.com/event/btc-updown-15m-1764929700) | - | ⏭️ SKIP | UP | - | $1015 | - |
| 22 | 10:30 | [btc-updown-15m-1764930600](https://polymarket.com/event/btc-updown-15m-1764930600) | $64 | ✅ | UP | +$64 | $1079 | - |
| 23 | 10:45 | [btc-updown-15m-1764931500](https://polymarket.com/event/btc-updown-15m-1764931500) | $1 | ❌ | DOWN | $-1 | $1078 | L1 |
| 24 | 11:00 | [btc-updown-15m-1764932400](https://polymarket.com/event/btc-updown-15m-1764932400) | $2 | ✅ | UP | +$2 | $1080 | - |
| 25 | 11:15 | [btc-updown-15m-1764933300](https://polymarket.com/event/btc-updown-15m-1764933300) | $1 | ❌ | DOWN | $-1 | $1079 | L1 |
| 26 | 11:30 | [btc-updown-15m-1764934200](https://polymarket.com/event/btc-updown-15m-1764934200) | $2 | ❌ | DOWN | $-2 | $1077 | L2 |
| 27 | 11:45 | [btc-updown-15m-1764935100](https://polymarket.com/event/btc-updown-15m-1764935100) | $4 | ✅ | UP | +$4 | $1081 | - |
| 28 | 12:00 | [btc-updown-15m-1764936000](https://polymarket.com/event/btc-updown-15m-1764936000) | $1 | ❌ | DOWN | $-1 | $1080 | L1 |
| 29 | 12:15 | [btc-updown-15m-1764936900](https://polymarket.com/event/btc-updown-15m-1764936900) | $2 | ❌ | DOWN | $-2 | $1078 | L2 |
| 30 | 12:30 | [btc-updown-15m-1764937800](https://polymarket.com/event/btc-updown-15m-1764937800) | $4 | ❌ | DOWN | $-4 | $1074 | L3 |
| 31 | 12:45 | [btc-updown-15m-1764938700](https://polymarket.com/event/btc-updown-15m-1764938700) | $8 | ✅ | UP | +$8 | $1082 | - |
| 32 | 13:00 | [btc-updown-15m-1764939600](https://polymarket.com/event/btc-updown-15m-1764939600) | $1 | ❌ | DOWN | $-1 | $1081 | L1 |
| 33 | 13:15 | [btc-updown-15m-1764940500](https://polymarket.com/event/btc-updown-15m-1764940500) | $2 | ❌ | DOWN | $-2 | $1079 | L2 |
| 34 | 13:30 | [btc-updown-15m-1764941400](https://polymarket.com/event/btc-updown-15m-1764941400) | $4 | ❌ | DOWN | $-4 | $1075 | L3 |
| 35 | 13:45 | [btc-updown-15m-1764942300](https://polymarket.com/event/btc-updown-15m-1764942300) | $8 | ✅ | UP | +$8 | $1083 | - |
| 36 | 14:00 | [btc-updown-15m-1764943200](https://polymarket.com/event/btc-updown-15m-1764943200) | $1 | ✅ | UP | +$1 | $1084 | - |
| 37 | 14:15 | [btc-updown-15m-1764944100](https://polymarket.com/event/btc-updown-15m-1764944100) | $1 | ❌ | DOWN | $-1 | $1083 | L1 |
| 38 | 14:30 | [btc-updown-15m-1764945000](https://polymarket.com/event/btc-updown-15m-1764945000) | $2 | ❌ | DOWN | $-2 | $1081 | L2 |
| 39 | 14:45 | [btc-updown-15m-1764945900](https://polymarket.com/event/btc-updown-15m-1764945900) | $4 | ✅ | UP | +$4 | $1085 | - |
| 40 | 15:00 | [btc-updown-15m-1764946800](https://polymarket.com/event/btc-updown-15m-1764946800) | $1 | ✅ | UP | +$1 | $1086 | - |
| 41 | 15:15 | [btc-updown-15m-1764947700](https://polymarket.com/event/btc-updown-15m-1764947700) | $1 | ✅ | UP | +$1 | $1087 | - |
| 42 | 15:30 | [btc-updown-15m-1764948600](https://polymarket.com/event/btc-updown-15m-1764948600) | $1 | ❌ | DOWN | $-1 | $1086 | L1 |
| 43 | 15:45 | [btc-updown-15m-1764949500](https://polymarket.com/event/btc-updown-15m-1764949500) | $2 | ❌ | DOWN | $-2 | $1084 | L2 |
| 44 | 16:00 | [btc-updown-15m-1764950400](https://polymarket.com/event/btc-updown-15m-1764950400) | $4 | ❌ | DOWN | $-4 | $1080 | L3 |
| 45 | 16:15 | [btc-updown-15m-1764951300](https://polymarket.com/event/btc-updown-15m-1764951300) | $8 | ❌ | DOWN | $-8 | $1072 | L4 |
| 46 | 16:30 | [btc-updown-15m-1764952200](https://polymarket.com/event/btc-updown-15m-1764952200) | $16 | ❌ | DOWN | $-16 | $1056 | L5 |
| - | 16:45 | [btc-updown-15m-1764953100](https://polymarket.com/event/btc-updown-15m-1764953100) | - | ⏭️ SKIP | UP | - | $1056 | - |
| - | 17:00 | [btc-updown-15m-1764954000](https://polymarket.com/event/btc-updown-15m-1764954000) | - | ⏭️ SKIP | DOWN | - | $1056 | - |
| - | 17:15 | [btc-updown-15m-1764954900](https://polymarket.com/event/btc-updown-15m-1764954900) | - | ⏭️ SKIP | UP | - | $1056 | - |
| 47 | 17:30 | [btc-updown-15m-1764955800](https://polymarket.com/event/btc-updown-15m-1764955800) | $32 | ✅ | UP | +$32 | $1088 | - |
| 48 | 17:45 | [btc-updown-15m-1764956700](https://polymarket.com/event/btc-updown-15m-1764956700) | $1 | ✅ | UP | +$1 | $1089 | - |
| 49 | 18:00 | [btc-updown-15m-1764957600](https://polymarket.com/event/btc-updown-15m-1764957600) | $1 | ✅ | UP | +$1 | $1090 | - |
| 50 | 18:15 | [btc-updown-15m-1764958500](https://polymarket.com/event/btc-updown-15m-1764958500) | $1 | ❌ | DOWN | $-1 | $1089 | L1 |
| 51 | 18:30 | [btc-updown-15m-1764959400](https://polymarket.com/event/btc-updown-15m-1764959400) | $2 | ❌ | DOWN | $-2 | $1087 | L2 |
| 52 | 18:45 | [btc-updown-15m-1764960300](https://polymarket.com/event/btc-updown-15m-1764960300) | $4 | ❌ | DOWN | $-4 | $1083 | L3 |
| 53 | 19:00 | [btc-updown-15m-1764961200](https://polymarket.com/event/btc-updown-15m-1764961200) | $8 | ✅ | UP | +$8 | $1091 | - |
| 54 | 19:15 | [btc-updown-15m-1764962100](https://polymarket.com/event/btc-updown-15m-1764962100) | $1 | ✅ | UP | +$1 | $1092 | - |
| 55 | 19:30 | [btc-updown-15m-1764963000](https://polymarket.com/event/btc-updown-15m-1764963000) | $1 | ✅ | UP | +$1 | $1093 | - |
| 56 | 19:45 | [btc-updown-15m-1764963900](https://polymarket.com/event/btc-updown-15m-1764963900) | $1 | ✅ | UP | +$1 | $1094 | - |
| 57 | 20:00 | [btc-updown-15m-1764964800](https://polymarket.com/event/btc-updown-15m-1764964800) | $1 | ✅ | UP | +$1 | $1095 | - |
| 58 | 20:15 | [btc-updown-15m-1764965700](https://polymarket.com/event/btc-updown-15m-1764965700) | $1 | ❌ | DOWN | $-1 | $1094 | L1 |
| 59 | 20:30 | [btc-updown-15m-1764966600](https://polymarket.com/event/btc-updown-15m-1764966600) | $2 | ❌ | DOWN | $-2 | $1092 | L2 |
| 60 | 20:45 | [btc-updown-15m-1764967500](https://polymarket.com/event/btc-updown-15m-1764967500) | $4 | ✅ | UP | +$4 | $1096 | - |
| 61 | 21:00 | [btc-updown-15m-1764968400](https://polymarket.com/event/btc-updown-15m-1764968400) | $1 | ✅ | UP | +$1 | $1097 | - |
| 62 | 21:15 | [btc-updown-15m-1764969300](https://polymarket.com/event/btc-updown-15m-1764969300) | $1 | ❌ | DOWN | $-1 | $1096 | L1 |
| 63 | 21:30 | [btc-updown-15m-1764970200](https://polymarket.com/event/btc-updown-15m-1764970200) | $2 | ❌ | DOWN | $-2 | $1094 | L2 |
| 64 | 21:45 | [btc-updown-15m-1764971100](https://polymarket.com/event/btc-updown-15m-1764971100) | $4 | ❌ | DOWN | $-4 | $1090 | L3 |
| 65 | 22:00 | [btc-updown-15m-1764972000](https://polymarket.com/event/btc-updown-15m-1764972000) | $8 | ❌ | DOWN | $-8 | $1082 | L4 |
| 66 | 22:15 | [btc-updown-15m-1764972900](https://polymarket.com/event/btc-updown-15m-1764972900) | $16 | ✅ | UP | +$16 | $1098 | - |
| 67 | 22:30 | [btc-updown-15m-1764973800](https://polymarket.com/event/btc-updown-15m-1764973800) | $1 | ✅ | UP | +$1 | $1099 | - |
| 68 | 22:45 | [btc-updown-15m-1764974700](https://polymarket.com/event/btc-updown-15m-1764974700) | $1 | ❌ | DOWN | $-1 | $1098 | L1 |
| 69 | 23:00 | [btc-updown-15m-1764975600](https://polymarket.com/event/btc-updown-15m-1764975600) | $2 | ❌ | DOWN | $-2 | $1096 | L2 |
| 70 | 23:15 | [btc-updown-15m-1764976500](https://polymarket.com/event/btc-updown-15m-1764976500) | $4 | ✅ | UP | +$4 | $1100 | - |
| 71 | 23:30 | [btc-updown-15m-1764977400](https://polymarket.com/event/btc-updown-15m-1764977400) | $1 | ❌ | DOWN | $-1 | $1099 | L1 |
| 72 | 23:45 | [btc-updown-15m-1764978300](https://polymarket.com/event/btc-updown-15m-1764978300) | $2 | ✅ | UP | +$2 | $1101 | - |

### 2025-12-06
**Summary:** 94 trades | 41 wins | 53 losses | Max Bet: $32 | Profit: +$10

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 23:15 | 5 | $31 | $32 | 2025-12-07 00:15 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1764979200](https://polymarket.com/event/btc-updown-15m-1764979200) | $1 | ❌ | DOWN | $-1 | $1100 | L1 |
| 2 | 00:15 | [btc-updown-15m-1764980100](https://polymarket.com/event/btc-updown-15m-1764980100) | $2 | ✅ | UP | +$2 | $1102 | - |
| 3 | 00:30 | [btc-updown-15m-1764981000](https://polymarket.com/event/btc-updown-15m-1764981000) | $1 | ✅ | UP | +$1 | $1103 | - |
| 4 | 00:45 | [btc-updown-15m-1764981900](https://polymarket.com/event/btc-updown-15m-1764981900) | $1 | ❌ | DOWN | $-1 | $1102 | L1 |
| 5 | 01:00 | [btc-updown-15m-1764982800](https://polymarket.com/event/btc-updown-15m-1764982800) | $2 | ❌ | DOWN | $-2 | $1100 | L2 |
| 6 | 01:15 | [btc-updown-15m-1764983700](https://polymarket.com/event/btc-updown-15m-1764983700) | $4 | ✅ | UP | +$4 | $1104 | - |
| 7 | 01:30 | [btc-updown-15m-1764984600](https://polymarket.com/event/btc-updown-15m-1764984600) | $1 | ❌ | DOWN | $-1 | $1103 | L1 |
| 8 | 01:45 | [btc-updown-15m-1764985500](https://polymarket.com/event/btc-updown-15m-1764985500) | $2 | ✅ | UP | +$2 | $1105 | - |
| 9 | 02:00 | [btc-updown-15m-1764986400](https://polymarket.com/event/btc-updown-15m-1764986400) | $1 | ❌ | DOWN | $-1 | $1104 | L1 |
| 10 | 02:15 | [btc-updown-15m-1764987300](https://polymarket.com/event/btc-updown-15m-1764987300) | $2 | ❌ | DOWN | $-2 | $1102 | L2 |
| 11 | 02:30 | [btc-updown-15m-1764988200](https://polymarket.com/event/btc-updown-15m-1764988200) | $4 | ❌ | DOWN | $-4 | $1098 | L3 |
| 12 | 02:45 | [btc-updown-15m-1764989100](https://polymarket.com/event/btc-updown-15m-1764989100) | $8 | ✅ | UP | +$8 | $1106 | - |
| 13 | 03:00 | [btc-updown-15m-1764990000](https://polymarket.com/event/btc-updown-15m-1764990000) | $1 | ✅ | UP | +$1 | $1107 | - |
| 14 | 03:15 | [btc-updown-15m-1764990900](https://polymarket.com/event/btc-updown-15m-1764990900) | $1 | ❌ | DOWN | $-1 | $1106 | L1 |
| 15 | 03:30 | [btc-updown-15m-1764991800](https://polymarket.com/event/btc-updown-15m-1764991800) | $2 | ✅ | UP | +$2 | $1108 | - |
| 16 | 03:45 | [btc-updown-15m-1764992700](https://polymarket.com/event/btc-updown-15m-1764992700) | $1 | ✅ | UP | +$1 | $1109 | - |
| 17 | 04:00 | [btc-updown-15m-1764993600](https://polymarket.com/event/btc-updown-15m-1764993600) | $1 | ❌ | DOWN | $-1 | $1108 | L1 |
| 18 | 04:15 | [btc-updown-15m-1764994500](https://polymarket.com/event/btc-updown-15m-1764994500) | $2 | ✅ | UP | +$2 | $1110 | - |
| 19 | 04:30 | [btc-updown-15m-1764995400](https://polymarket.com/event/btc-updown-15m-1764995400) | $1 | ❌ | DOWN | $-1 | $1109 | L1 |
| 20 | 04:45 | [btc-updown-15m-1764996300](https://polymarket.com/event/btc-updown-15m-1764996300) | $2 | ✅ | UP | +$2 | $1111 | - |
| 21 | 05:00 | [btc-updown-15m-1764997200](https://polymarket.com/event/btc-updown-15m-1764997200) | $1 | ✅ | UP | +$1 | $1112 | - |
| 22 | 05:15 | [btc-updown-15m-1764998100](https://polymarket.com/event/btc-updown-15m-1764998100) | $1 | ❌ | DOWN | $-1 | $1111 | L1 |
| 23 | 05:30 | [btc-updown-15m-1764999000](https://polymarket.com/event/btc-updown-15m-1764999000) | $2 | ❌ | DOWN | $-2 | $1109 | L2 |
| 24 | 05:45 | [btc-updown-15m-1764999900](https://polymarket.com/event/btc-updown-15m-1764999900) | $4 | ✅ | UP | +$4 | $1113 | - |
| 25 | 06:00 | [btc-updown-15m-1765000800](https://polymarket.com/event/btc-updown-15m-1765000800) | $1 | ✅ | UP | +$1 | $1114 | - |
| 26 | 06:15 | [btc-updown-15m-1765001700](https://polymarket.com/event/btc-updown-15m-1765001700) | $1 | ✅ | UP | +$1 | $1115 | - |
| 27 | 06:30 | [btc-updown-15m-1765002600](https://polymarket.com/event/btc-updown-15m-1765002600) | $1 | ❌ | DOWN | $-1 | $1114 | L1 |
| 28 | 06:45 | [btc-updown-15m-1765003500](https://polymarket.com/event/btc-updown-15m-1765003500) | $2 | ✅ | UP | +$2 | $1116 | - |
| 29 | 07:00 | [btc-updown-15m-1765004400](https://polymarket.com/event/btc-updown-15m-1765004400) | $1 | ❌ | DOWN | $-1 | $1115 | L1 |
| 30 | 07:15 | [btc-updown-15m-1765005300](https://polymarket.com/event/btc-updown-15m-1765005300) | $2 | ❌ | DOWN | $-2 | $1113 | L2 |
| 31 | 07:30 | [btc-updown-15m-1765006200](https://polymarket.com/event/btc-updown-15m-1765006200) | $4 | ✅ | UP | +$4 | $1117 | - |
| 32 | 07:45 | [btc-updown-15m-1765007100](https://polymarket.com/event/btc-updown-15m-1765007100) | $1 | ❌ | DOWN | $-1 | $1116 | L1 |
| 33 | 08:00 | [btc-updown-15m-1765008000](https://polymarket.com/event/btc-updown-15m-1765008000) | $2 | ❌ | DOWN | $-2 | $1114 | L2 |
| 34 | 08:15 | [btc-updown-15m-1765008900](https://polymarket.com/event/btc-updown-15m-1765008900) | $4 | ❌ | DOWN | $-4 | $1110 | L3 |
| 35 | 08:30 | [btc-updown-15m-1765009800](https://polymarket.com/event/btc-updown-15m-1765009800) | $8 | ✅ | UP | +$8 | $1118 | - |
| 36 | 08:45 | [btc-updown-15m-1765010700](https://polymarket.com/event/btc-updown-15m-1765010700) | $1 | ❌ | DOWN | $-1 | $1117 | L1 |
| 37 | 09:00 | [btc-updown-15m-1765011600](https://polymarket.com/event/btc-updown-15m-1765011600) | $2 | ✅ | UP | +$2 | $1119 | - |
| 38 | 09:15 | [btc-updown-15m-1765012500](https://polymarket.com/event/btc-updown-15m-1765012500) | $1 | ✅ | UP | +$1 | $1120 | - |
| 39 | 09:30 | [btc-updown-15m-1765013400](https://polymarket.com/event/btc-updown-15m-1765013400) | $1 | ❌ | DOWN | $-1 | $1119 | L1 |
| 40 | 09:45 | [btc-updown-15m-1765014300](https://polymarket.com/event/btc-updown-15m-1765014300) | $2 | ❌ | DOWN | $-2 | $1117 | L2 |
| 41 | 10:00 | [btc-updown-15m-1765015200](https://polymarket.com/event/btc-updown-15m-1765015200) | $4 | ✅ | UP | +$4 | $1121 | - |
| 42 | 10:15 | [btc-updown-15m-1765016100](https://polymarket.com/event/btc-updown-15m-1765016100) | $1 | ❌ | DOWN | $-1 | $1120 | L1 |
| 43 | 10:30 | [btc-updown-15m-1765017000](https://polymarket.com/event/btc-updown-15m-1765017000) | $2 | ✅ | UP | +$2 | $1122 | - |
| 44 | 10:45 | [btc-updown-15m-1765017900](https://polymarket.com/event/btc-updown-15m-1765017900) | $1 | ❌ | DOWN | $-1 | $1121 | L1 |
| 45 | 11:00 | [btc-updown-15m-1765018800](https://polymarket.com/event/btc-updown-15m-1765018800) | $2 | ❌ | DOWN | $-2 | $1119 | L2 |
| 46 | 11:15 | [btc-updown-15m-1765019700](https://polymarket.com/event/btc-updown-15m-1765019700) | $4 | ✅ | UP | +$4 | $1123 | - |
| 47 | 11:30 | [btc-updown-15m-1765020600](https://polymarket.com/event/btc-updown-15m-1765020600) | $1 | ✅ | UP | +$1 | $1124 | - |
| 48 | 11:45 | [btc-updown-15m-1765021500](https://polymarket.com/event/btc-updown-15m-1765021500) | $1 | ❌ | DOWN | $-1 | $1123 | L1 |
| 49 | 12:00 | [btc-updown-15m-1765022400](https://polymarket.com/event/btc-updown-15m-1765022400) | $2 | ❌ | DOWN | $-2 | $1121 | L2 |
| 50 | 12:15 | [btc-updown-15m-1765023300](https://polymarket.com/event/btc-updown-15m-1765023300) | $4 | ✅ | UP | +$4 | $1125 | - |
| 51 | 12:30 | [btc-updown-15m-1765024200](https://polymarket.com/event/btc-updown-15m-1765024200) | $1 | ❌ | DOWN | $-1 | $1124 | L1 |
| 52 | 12:45 | [btc-updown-15m-1765025100](https://polymarket.com/event/btc-updown-15m-1765025100) | $2 | ❌ | DOWN | $-2 | $1122 | L2 |
| 53 | 13:00 | [btc-updown-15m-1765026000](https://polymarket.com/event/btc-updown-15m-1765026000) | $4 | ✅ | UP | +$4 | $1126 | - |
| 54 | 13:15 | [btc-updown-15m-1765026900](https://polymarket.com/event/btc-updown-15m-1765026900) | $1 | ✅ | UP | +$1 | $1127 | - |
| 55 | 13:30 | [btc-updown-15m-1765027800](https://polymarket.com/event/btc-updown-15m-1765027800) | $1 | ✅ | UP | +$1 | $1128 | - |
| 56 | 13:45 | [btc-updown-15m-1765028700](https://polymarket.com/event/btc-updown-15m-1765028700) | $1 | ❌ | DOWN | $-1 | $1127 | L1 |
| 57 | 14:00 | [btc-updown-15m-1765029600](https://polymarket.com/event/btc-updown-15m-1765029600) | $2 | ✅ | UP | +$2 | $1129 | - |
| 58 | 14:15 | [btc-updown-15m-1765030500](https://polymarket.com/event/btc-updown-15m-1765030500) | $1 | ✅ | UP | +$1 | $1130 | - |
| 59 | 14:30 | [btc-updown-15m-1765031400](https://polymarket.com/event/btc-updown-15m-1765031400) | $1 | ✅ | UP | +$1 | $1131 | - |
| 60 | 14:45 | [btc-updown-15m-1765032300](https://polymarket.com/event/btc-updown-15m-1765032300) | $1 | ❌ | DOWN | $-1 | $1130 | L1 |
| 61 | 15:00 | [btc-updown-15m-1765033200](https://polymarket.com/event/btc-updown-15m-1765033200) | $2 | ❌ | DOWN | $-2 | $1128 | L2 |
| 62 | 15:15 | [btc-updown-15m-1765034100](https://polymarket.com/event/btc-updown-15m-1765034100) | $4 | ❌ | DOWN | $-4 | $1124 | L3 |
| 63 | 15:30 | [btc-updown-15m-1765035000](https://polymarket.com/event/btc-updown-15m-1765035000) | $8 | ✅ | UP | +$8 | $1132 | - |
| 64 | 15:45 | [btc-updown-15m-1765035900](https://polymarket.com/event/btc-updown-15m-1765035900) | $1 | ❌ | DOWN | $-1 | $1131 | L1 |
| 65 | 16:00 | [btc-updown-15m-1765036800](https://polymarket.com/event/btc-updown-15m-1765036800) | $2 | ✅ | UP | +$2 | $1133 | - |
| 66 | 16:15 | [btc-updown-15m-1765037700](https://polymarket.com/event/btc-updown-15m-1765037700) | $1 | ❌ | DOWN | $-1 | $1132 | L1 |
| 67 | 16:30 | [btc-updown-15m-1765038600](https://polymarket.com/event/btc-updown-15m-1765038600) | $2 | ❌ | DOWN | $-2 | $1130 | L2 |
| 68 | 16:45 | [btc-updown-15m-1765039500](https://polymarket.com/event/btc-updown-15m-1765039500) | $4 | ❌ | DOWN | $-4 | $1126 | L3 |
| 69 | 17:00 | [btc-updown-15m-1765040400](https://polymarket.com/event/btc-updown-15m-1765040400) | $8 | ❌ | DOWN | $-8 | $1118 | L4 |
| 70 | 17:15 | [btc-updown-15m-1765041300](https://polymarket.com/event/btc-updown-15m-1765041300) | $16 | ✅ | UP | +$16 | $1134 | - |
| 71 | 17:30 | [btc-updown-15m-1765042200](https://polymarket.com/event/btc-updown-15m-1765042200) | $1 | ❌ | DOWN | $-1 | $1133 | L1 |
| 72 | 17:45 | [btc-updown-15m-1765043100](https://polymarket.com/event/btc-updown-15m-1765043100) | $2 | ✅ | UP | +$2 | $1135 | - |
| 73 | 18:00 | [btc-updown-15m-1765044000](https://polymarket.com/event/btc-updown-15m-1765044000) | $1 | ✅ | UP | +$1 | $1136 | - |
| 74 | 18:15 | [btc-updown-15m-1765044900](https://polymarket.com/event/btc-updown-15m-1765044900) | $1 | ❌ | DOWN | $-1 | $1135 | L1 |
| 75 | 18:30 | [btc-updown-15m-1765045800](https://polymarket.com/event/btc-updown-15m-1765045800) | $2 | ❌ | DOWN | $-2 | $1133 | L2 |
| 76 | 18:45 | [btc-updown-15m-1765046700](https://polymarket.com/event/btc-updown-15m-1765046700) | $4 | ❌ | DOWN | $-4 | $1129 | L3 |
| 77 | 19:00 | [btc-updown-15m-1765047600](https://polymarket.com/event/btc-updown-15m-1765047600) | $8 | ❌ | DOWN | $-8 | $1121 | L4 |
| 78 | 19:15 | [btc-updown-15m-1765048500](https://polymarket.com/event/btc-updown-15m-1765048500) | $16 | ✅ | UP | +$16 | $1137 | - |
| 79 | 19:30 | [btc-updown-15m-1765049400](https://polymarket.com/event/btc-updown-15m-1765049400) | $1 | ❌ | DOWN | $-1 | $1136 | L1 |
| 80 | 19:45 | [btc-updown-15m-1765050300](https://polymarket.com/event/btc-updown-15m-1765050300) | $2 | ❌ | DOWN | $-2 | $1134 | L2 |
| 81 | 20:00 | [btc-updown-15m-1765051200](https://polymarket.com/event/btc-updown-15m-1765051200) | $4 | ❌ | DOWN | $-4 | $1130 | L3 |
| 82 | 20:15 | [btc-updown-15m-1765052100](https://polymarket.com/event/btc-updown-15m-1765052100) | $8 | ✅ | UP | +$8 | $1138 | - |
| 83 | 20:30 | [btc-updown-15m-1765053000](https://polymarket.com/event/btc-updown-15m-1765053000) | $1 | ✅ | UP | +$1 | $1139 | - |
| 84 | 20:45 | [btc-updown-15m-1765053900](https://polymarket.com/event/btc-updown-15m-1765053900) | $1 | ✅ | UP | +$1 | $1140 | - |
| 85 | 21:00 | [btc-updown-15m-1765054800](https://polymarket.com/event/btc-updown-15m-1765054800) | $1 | ❌ | DOWN | $-1 | $1139 | L1 |
| 86 | 21:15 | [btc-updown-15m-1765055700](https://polymarket.com/event/btc-updown-15m-1765055700) | $2 | ❌ | DOWN | $-2 | $1137 | L2 |
| 87 | 21:30 | [btc-updown-15m-1765056600](https://polymarket.com/event/btc-updown-15m-1765056600) | $4 | ✅ | UP | +$4 | $1141 | - |
| 88 | 21:45 | [btc-updown-15m-1765057500](https://polymarket.com/event/btc-updown-15m-1765057500) | $1 | ❌ | DOWN | $-1 | $1140 | L1 |
| 89 | 22:00 | [btc-updown-15m-1765058400](https://polymarket.com/event/btc-updown-15m-1765058400) | $2 | ✅ | UP | +$2 | $1142 | - |
| 90 | 22:15 | [btc-updown-15m-1765059300](https://polymarket.com/event/btc-updown-15m-1765059300) | $1 | ❌ | DOWN | $-1 | $1141 | L1 |
| 91 | 22:30 | [btc-updown-15m-1765060200](https://polymarket.com/event/btc-updown-15m-1765060200) | $2 | ❌ | DOWN | $-2 | $1139 | L2 |
| 92 | 22:45 | [btc-updown-15m-1765061100](https://polymarket.com/event/btc-updown-15m-1765061100) | $4 | ❌ | DOWN | $-4 | $1135 | L3 |
| 93 | 23:00 | [btc-updown-15m-1765062000](https://polymarket.com/event/btc-updown-15m-1765062000) | $8 | ❌ | DOWN | $-8 | $1127 | L4 |
| 94 | 23:15 | [btc-updown-15m-1765062900](https://polymarket.com/event/btc-updown-15m-1765062900) | $16 | ❌ | DOWN | $-16 | $1111 | L5 |
| - | 23:30 | [btc-updown-15m-1765063800](https://polymarket.com/event/btc-updown-15m-1765063800) | - | ⏭️ SKIP | UP | - | $1111 | - |
| - | 23:45 | [btc-updown-15m-1765064700](https://polymarket.com/event/btc-updown-15m-1765064700) | - | ⏭️ SKIP | UP | - | $1111 | - |

### 2025-12-07
**Summary:** 86 trades | 45 wins | 41 losses | Max Bet: $64 | Profit: +$76

**Skip Events (3):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 05:00 | 5 | $31 | $32 | 06:00 |
| 21:45 | 5 | $31 | $32 | 22:45 |
| 22:45 | 6 | $63 | $64 | 23:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| - | 00:00 | [btc-updown-15m-1765065600](https://polymarket.com/event/btc-updown-15m-1765065600) | - | ⏭️ SKIP | DOWN | - | $1111 | - |
| 1 | 00:15 | [btc-updown-15m-1765066500](https://polymarket.com/event/btc-updown-15m-1765066500) | $32 | ✅ | UP | +$32 | $1143 | - |
| 2 | 00:30 | [btc-updown-15m-1765067400](https://polymarket.com/event/btc-updown-15m-1765067400) | $1 | ✅ | UP | +$1 | $1144 | - |
| 3 | 00:45 | [btc-updown-15m-1765068300](https://polymarket.com/event/btc-updown-15m-1765068300) | $1 | ❌ | DOWN | $-1 | $1143 | L1 |
| 4 | 01:00 | [btc-updown-15m-1765069200](https://polymarket.com/event/btc-updown-15m-1765069200) | $2 | ✅ | UP | +$2 | $1145 | - |
| 5 | 01:15 | [btc-updown-15m-1765070100](https://polymarket.com/event/btc-updown-15m-1765070100) | $1 | ❌ | DOWN | $-1 | $1144 | L1 |
| 6 | 01:30 | [btc-updown-15m-1765071000](https://polymarket.com/event/btc-updown-15m-1765071000) | $2 | ❌ | DOWN | $-2 | $1142 | L2 |
| 7 | 01:45 | [btc-updown-15m-1765071900](https://polymarket.com/event/btc-updown-15m-1765071900) | $4 | ❌ | DOWN | $-4 | $1138 | L3 |
| 8 | 02:00 | [btc-updown-15m-1765072800](https://polymarket.com/event/btc-updown-15m-1765072800) | $8 | ✅ | UP | +$8 | $1146 | - |
| 9 | 02:15 | [btc-updown-15m-1765073700](https://polymarket.com/event/btc-updown-15m-1765073700) | $1 | ✅ | UP | +$1 | $1147 | - |
| 10 | 02:30 | [btc-updown-15m-1765074600](https://polymarket.com/event/btc-updown-15m-1765074600) | $1 | ❌ | DOWN | $-1 | $1146 | L1 |
| 11 | 02:45 | [btc-updown-15m-1765075500](https://polymarket.com/event/btc-updown-15m-1765075500) | $2 | ✅ | UP | +$2 | $1148 | - |
| 12 | 03:00 | [btc-updown-15m-1765076400](https://polymarket.com/event/btc-updown-15m-1765076400) | $1 | ❌ | DOWN | $-1 | $1147 | L1 |
| 13 | 03:15 | [btc-updown-15m-1765077300](https://polymarket.com/event/btc-updown-15m-1765077300) | $2 | ❌ | DOWN | $-2 | $1145 | L2 |
| 14 | 03:30 | [btc-updown-15m-1765078200](https://polymarket.com/event/btc-updown-15m-1765078200) | $4 | ✅ | UP | +$4 | $1149 | - |
| 15 | 03:45 | [btc-updown-15m-1765079100](https://polymarket.com/event/btc-updown-15m-1765079100) | $1 | ✅ | UP | +$1 | $1150 | - |
| 16 | 04:00 | [btc-updown-15m-1765080000](https://polymarket.com/event/btc-updown-15m-1765080000) | $1 | ❌ | DOWN | $-1 | $1149 | L1 |
| 17 | 04:15 | [btc-updown-15m-1765080900](https://polymarket.com/event/btc-updown-15m-1765080900) | $2 | ❌ | DOWN | $-2 | $1147 | L2 |
| 18 | 04:30 | [btc-updown-15m-1765081800](https://polymarket.com/event/btc-updown-15m-1765081800) | $4 | ❌ | DOWN | $-4 | $1143 | L3 |
| 19 | 04:45 | [btc-updown-15m-1765082700](https://polymarket.com/event/btc-updown-15m-1765082700) | $8 | ❌ | DOWN | $-8 | $1135 | L4 |
| 20 | 05:00 | [btc-updown-15m-1765083600](https://polymarket.com/event/btc-updown-15m-1765083600) | $16 | ❌ | DOWN | $-16 | $1119 | L5 |
| - | 05:15 | [btc-updown-15m-1765084500](https://polymarket.com/event/btc-updown-15m-1765084500) | - | ⏭️ SKIP | UP | - | $1119 | - |
| - | 05:30 | [btc-updown-15m-1765085400](https://polymarket.com/event/btc-updown-15m-1765085400) | - | ⏭️ SKIP | UP | - | $1119 | - |
| - | 05:45 | [btc-updown-15m-1765086300](https://polymarket.com/event/btc-updown-15m-1765086300) | - | ⏭️ SKIP | DOWN | - | $1119 | - |
| 21 | 06:00 | [btc-updown-15m-1765087200](https://polymarket.com/event/btc-updown-15m-1765087200) | $32 | ✅ | UP | +$32 | $1151 | - |
| 22 | 06:15 | [btc-updown-15m-1765088100](https://polymarket.com/event/btc-updown-15m-1765088100) | $1 | ✅ | UP | +$1 | $1152 | - |
| 23 | 06:30 | [btc-updown-15m-1765089000](https://polymarket.com/event/btc-updown-15m-1765089000) | $1 | ✅ | UP | +$1 | $1153 | - |
| 24 | 06:45 | [btc-updown-15m-1765089900](https://polymarket.com/event/btc-updown-15m-1765089900) | $1 | ✅ | UP | +$1 | $1154 | - |
| 25 | 07:00 | [btc-updown-15m-1765090800](https://polymarket.com/event/btc-updown-15m-1765090800) | $1 | ❌ | DOWN | $-1 | $1153 | L1 |
| 26 | 07:15 | [btc-updown-15m-1765091700](https://polymarket.com/event/btc-updown-15m-1765091700) | $2 | ❌ | DOWN | $-2 | $1151 | L2 |
| 27 | 07:30 | [btc-updown-15m-1765092600](https://polymarket.com/event/btc-updown-15m-1765092600) | $4 | ❌ | DOWN | $-4 | $1147 | L3 |
| 28 | 07:45 | [btc-updown-15m-1765093500](https://polymarket.com/event/btc-updown-15m-1765093500) | $8 | ✅ | UP | +$8 | $1155 | - |
| 29 | 08:00 | [btc-updown-15m-1765094400](https://polymarket.com/event/btc-updown-15m-1765094400) | $1 | ❌ | DOWN | $-1 | $1154 | L1 |
| 30 | 08:15 | [btc-updown-15m-1765095300](https://polymarket.com/event/btc-updown-15m-1765095300) | $2 | ✅ | UP | +$2 | $1156 | - |
| 31 | 08:30 | [btc-updown-15m-1765096200](https://polymarket.com/event/btc-updown-15m-1765096200) | $1 | ✅ | UP | +$1 | $1157 | - |
| 32 | 08:45 | [btc-updown-15m-1765097100](https://polymarket.com/event/btc-updown-15m-1765097100) | $1 | ❌ | DOWN | $-1 | $1156 | L1 |
| 33 | 09:00 | [btc-updown-15m-1765098000](https://polymarket.com/event/btc-updown-15m-1765098000) | $2 | ✅ | UP | +$2 | $1158 | - |
| 34 | 09:15 | [btc-updown-15m-1765098900](https://polymarket.com/event/btc-updown-15m-1765098900) | $1 | ❌ | DOWN | $-1 | $1157 | L1 |
| 35 | 09:30 | [btc-updown-15m-1765099800](https://polymarket.com/event/btc-updown-15m-1765099800) | $2 | ✅ | UP | +$2 | $1159 | - |
| 36 | 09:45 | [btc-updown-15m-1765100700](https://polymarket.com/event/btc-updown-15m-1765100700) | $1 | ❌ | DOWN | $-1 | $1158 | L1 |
| 37 | 10:00 | [btc-updown-15m-1765101600](https://polymarket.com/event/btc-updown-15m-1765101600) | $2 | ✅ | UP | +$2 | $1160 | - |
| 38 | 10:15 | [btc-updown-15m-1765102500](https://polymarket.com/event/btc-updown-15m-1765102500) | $1 | ❌ | DOWN | $-1 | $1159 | L1 |
| 39 | 10:30 | [btc-updown-15m-1765103400](https://polymarket.com/event/btc-updown-15m-1765103400) | $2 | ✅ | UP | +$2 | $1161 | - |
| 40 | 10:45 | [btc-updown-15m-1765104300](https://polymarket.com/event/btc-updown-15m-1765104300) | $1 | ❌ | DOWN | $-1 | $1160 | L1 |
| 41 | 11:00 | [btc-updown-15m-1765105200](https://polymarket.com/event/btc-updown-15m-1765105200) | $2 | ✅ | UP | +$2 | $1162 | - |
| 42 | 11:15 | [btc-updown-15m-1765106100](https://polymarket.com/event/btc-updown-15m-1765106100) | $1 | ❌ | DOWN | $-1 | $1161 | L1 |
| 43 | 11:30 | [btc-updown-15m-1765107000](https://polymarket.com/event/btc-updown-15m-1765107000) | $2 | ✅ | UP | +$2 | $1163 | - |
| 44 | 11:45 | [btc-updown-15m-1765107900](https://polymarket.com/event/btc-updown-15m-1765107900) | $1 | ❌ | DOWN | $-1 | $1162 | L1 |
| 45 | 12:00 | [btc-updown-15m-1765108800](https://polymarket.com/event/btc-updown-15m-1765108800) | $2 | ✅ | UP | +$2 | $1164 | - |
| 46 | 12:15 | [btc-updown-15m-1765109700](https://polymarket.com/event/btc-updown-15m-1765109700) | $1 | ❌ | DOWN | $-1 | $1163 | L1 |
| 47 | 12:30 | [btc-updown-15m-1765110600](https://polymarket.com/event/btc-updown-15m-1765110600) | $2 | ✅ | UP | +$2 | $1165 | - |
| 48 | 12:45 | [btc-updown-15m-1765111500](https://polymarket.com/event/btc-updown-15m-1765111500) | $1 | ✅ | UP | +$1 | $1166 | - |
| 49 | 13:00 | [btc-updown-15m-1765112400](https://polymarket.com/event/btc-updown-15m-1765112400) | $1 | ❌ | DOWN | $-1 | $1165 | L1 |
| 50 | 13:15 | [btc-updown-15m-1765113300](https://polymarket.com/event/btc-updown-15m-1765113300) | $2 | ❌ | DOWN | $-2 | $1163 | L2 |
| 51 | 13:30 | [btc-updown-15m-1765114200](https://polymarket.com/event/btc-updown-15m-1765114200) | $4 | ✅ | UP | +$4 | $1167 | - |
| 52 | 13:45 | [btc-updown-15m-1765115100](https://polymarket.com/event/btc-updown-15m-1765115100) | $1 | ✅ | UP | +$1 | $1168 | - |
| 53 | 14:00 | [btc-updown-15m-1765116000](https://polymarket.com/event/btc-updown-15m-1765116000) | $1 | ❌ | DOWN | $-1 | $1167 | L1 |
| 54 | 14:15 | [btc-updown-15m-1765116900](https://polymarket.com/event/btc-updown-15m-1765116900) | $2 | ❌ | DOWN | $-2 | $1165 | L2 |
| 55 | 14:30 | [btc-updown-15m-1765117800](https://polymarket.com/event/btc-updown-15m-1765117800) | $4 | ✅ | UP | +$4 | $1169 | - |
| 56 | 14:45 | [btc-updown-15m-1765118700](https://polymarket.com/event/btc-updown-15m-1765118700) | $1 | ❌ | DOWN | $-1 | $1168 | L1 |
| 57 | 15:00 | [btc-updown-15m-1765119600](https://polymarket.com/event/btc-updown-15m-1765119600) | $2 | ✅ | UP | +$2 | $1170 | - |
| 58 | 15:15 | [btc-updown-15m-1765120500](https://polymarket.com/event/btc-updown-15m-1765120500) | $1 | ❌ | DOWN | $-1 | $1169 | L1 |
| 59 | 15:30 | [btc-updown-15m-1765121400](https://polymarket.com/event/btc-updown-15m-1765121400) | $2 | ✅ | UP | +$2 | $1171 | - |
| 60 | 15:45 | [btc-updown-15m-1765122300](https://polymarket.com/event/btc-updown-15m-1765122300) | $1 | ✅ | UP | +$1 | $1172 | - |
| 61 | 16:00 | [btc-updown-15m-1765123200](https://polymarket.com/event/btc-updown-15m-1765123200) | $1 | ❌ | DOWN | $-1 | $1171 | L1 |
| 62 | 16:15 | [btc-updown-15m-1765124100](https://polymarket.com/event/btc-updown-15m-1765124100) | $2 | ✅ | UP | +$2 | $1173 | - |
| 63 | 16:30 | [btc-updown-15m-1765125000](https://polymarket.com/event/btc-updown-15m-1765125000) | $1 | ✅ | UP | +$1 | $1174 | - |
| 64 | 16:45 | [btc-updown-15m-1765125900](https://polymarket.com/event/btc-updown-15m-1765125900) | $1 | ✅ | UP | +$1 | $1175 | - |
| 65 | 17:00 | [btc-updown-15m-1765126800](https://polymarket.com/event/btc-updown-15m-1765126800) | $1 | ❌ | DOWN | $-1 | $1174 | L1 |
| 66 | 17:15 | [btc-updown-15m-1765127700](https://polymarket.com/event/btc-updown-15m-1765127700) | $2 | ✅ | UP | +$2 | $1176 | - |
| 67 | 17:30 | [btc-updown-15m-1765128600](https://polymarket.com/event/btc-updown-15m-1765128600) | $1 | ✅ | UP | +$1 | $1177 | - |
| 68 | 17:45 | [btc-updown-15m-1765129500](https://polymarket.com/event/btc-updown-15m-1765129500) | $1 | ✅ | UP | +$1 | $1178 | - |
| 69 | 18:00 | [btc-updown-15m-1765130400](https://polymarket.com/event/btc-updown-15m-1765130400) | $1 | ✅ | UP | +$1 | $1179 | - |
| 70 | 18:15 | [btc-updown-15m-1765131300](https://polymarket.com/event/btc-updown-15m-1765131300) | $1 | ✅ | UP | +$1 | $1180 | - |
| 71 | 18:30 | [btc-updown-15m-1765132200](https://polymarket.com/event/btc-updown-15m-1765132200) | $1 | ❌ | DOWN | $-1 | $1179 | L1 |
| 72 | 18:45 | [btc-updown-15m-1765133100](https://polymarket.com/event/btc-updown-15m-1765133100) | $2 | ✅ | UP | +$2 | $1181 | - |
| 73 | 19:00 | [btc-updown-15m-1765134000](https://polymarket.com/event/btc-updown-15m-1765134000) | $1 | ✅ | UP | +$1 | $1182 | - |
| 74 | 19:15 | [btc-updown-15m-1765134900](https://polymarket.com/event/btc-updown-15m-1765134900) | $1 | ❌ | DOWN | $-1 | $1181 | L1 |
| 75 | 19:30 | [btc-updown-15m-1765135800](https://polymarket.com/event/btc-updown-15m-1765135800) | $2 | ✅ | UP | +$2 | $1183 | - |
| 76 | 19:45 | [btc-updown-15m-1765136700](https://polymarket.com/event/btc-updown-15m-1765136700) | $1 | ✅ | UP | +$1 | $1184 | - |
| 77 | 20:00 | [btc-updown-15m-1765137600](https://polymarket.com/event/btc-updown-15m-1765137600) | $1 | ❌ | DOWN | $-1 | $1183 | L1 |
| 78 | 20:15 | [btc-updown-15m-1765138500](https://polymarket.com/event/btc-updown-15m-1765138500) | $2 | ✅ | UP | +$2 | $1185 | - |
| 79 | 20:30 | [btc-updown-15m-1765139400](https://polymarket.com/event/btc-updown-15m-1765139400) | $1 | ✅ | UP | +$1 | $1186 | - |
| 80 | 20:45 | [btc-updown-15m-1765140300](https://polymarket.com/event/btc-updown-15m-1765140300) | $1 | ❌ | DOWN | $-1 | $1185 | L1 |
| 81 | 21:00 | [btc-updown-15m-1765141200](https://polymarket.com/event/btc-updown-15m-1765141200) | $2 | ❌ | DOWN | $-2 | $1183 | L2 |
| 82 | 21:15 | [btc-updown-15m-1765142100](https://polymarket.com/event/btc-updown-15m-1765142100) | $4 | ❌ | DOWN | $-4 | $1179 | L3 |
| 83 | 21:30 | [btc-updown-15m-1765143000](https://polymarket.com/event/btc-updown-15m-1765143000) | $8 | ❌ | DOWN | $-8 | $1171 | L4 |
| 84 | 21:45 | [btc-updown-15m-1765143900](https://polymarket.com/event/btc-updown-15m-1765143900) | $16 | ❌ | DOWN | $-16 | $1155 | L5 |
| - | 22:00 | [btc-updown-15m-1765144800](https://polymarket.com/event/btc-updown-15m-1765144800) | - | ⏭️ SKIP | DOWN | - | $1155 | - |
| - | 22:15 | [btc-updown-15m-1765145700](https://polymarket.com/event/btc-updown-15m-1765145700) | - | ⏭️ SKIP | UP | - | $1155 | - |
| - | 22:30 | [btc-updown-15m-1765146600](https://polymarket.com/event/btc-updown-15m-1765146600) | - | ⏭️ SKIP | UP | - | $1155 | - |
| 85 | 22:45 | [btc-updown-15m-1765147500](https://polymarket.com/event/btc-updown-15m-1765147500) | $32 | ❌ | DOWN | $-32 | $1123 | L6 |
| - | 23:00 | [btc-updown-15m-1765148400](https://polymarket.com/event/btc-updown-15m-1765148400) | - | ⏭️ SKIP | UP | - | $1123 | - |
| - | 23:15 | [btc-updown-15m-1765149300](https://polymarket.com/event/btc-updown-15m-1765149300) | - | ⏭️ SKIP | UP | - | $1123 | - |
| - | 23:30 | [btc-updown-15m-1765150200](https://polymarket.com/event/btc-updown-15m-1765150200) | - | ⏭️ SKIP | DOWN | - | $1123 | - |
| 86 | 23:45 | [btc-updown-15m-1765151100](https://polymarket.com/event/btc-updown-15m-1765151100) | $64 | ✅ | UP | +$64 | $1187 | - |

### 2025-12-08
**Summary:** 96 trades | 55 wins | 41 losses | Max Bet: $16 | Profit: +$55

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1765152000](https://polymarket.com/event/btc-updown-15m-1765152000) | $1 | ❌ | DOWN | $-1 | $1186 | L1 |
| 2 | 00:15 | [btc-updown-15m-1765152900](https://polymarket.com/event/btc-updown-15m-1765152900) | $2 | ✅ | UP | +$2 | $1188 | - |
| 3 | 00:30 | [btc-updown-15m-1765153800](https://polymarket.com/event/btc-updown-15m-1765153800) | $1 | ✅ | UP | +$1 | $1189 | - |
| 4 | 00:45 | [btc-updown-15m-1765154700](https://polymarket.com/event/btc-updown-15m-1765154700) | $1 | ✅ | UP | +$1 | $1190 | - |
| 5 | 01:00 | [btc-updown-15m-1765155600](https://polymarket.com/event/btc-updown-15m-1765155600) | $1 | ✅ | UP | +$1 | $1191 | - |
| 6 | 01:15 | [btc-updown-15m-1765156500](https://polymarket.com/event/btc-updown-15m-1765156500) | $1 | ✅ | UP | +$1 | $1192 | - |
| 7 | 01:30 | [btc-updown-15m-1765157400](https://polymarket.com/event/btc-updown-15m-1765157400) | $1 | ✅ | UP | +$1 | $1193 | - |
| 8 | 01:45 | [btc-updown-15m-1765158300](https://polymarket.com/event/btc-updown-15m-1765158300) | $1 | ❌ | DOWN | $-1 | $1192 | L1 |
| 9 | 02:00 | [btc-updown-15m-1765159200](https://polymarket.com/event/btc-updown-15m-1765159200) | $2 | ✅ | UP | +$2 | $1194 | - |
| 10 | 02:15 | [btc-updown-15m-1765160100](https://polymarket.com/event/btc-updown-15m-1765160100) | $1 | ✅ | UP | +$1 | $1195 | - |
| 11 | 02:30 | [btc-updown-15m-1765161000](https://polymarket.com/event/btc-updown-15m-1765161000) | $1 | ✅ | UP | +$1 | $1196 | - |
| 12 | 02:45 | [btc-updown-15m-1765161900](https://polymarket.com/event/btc-updown-15m-1765161900) | $1 | ✅ | UP | +$1 | $1197 | - |
| 13 | 03:00 | [btc-updown-15m-1765162800](https://polymarket.com/event/btc-updown-15m-1765162800) | $1 | ❌ | DOWN | $-1 | $1196 | L1 |
| 14 | 03:15 | [btc-updown-15m-1765163700](https://polymarket.com/event/btc-updown-15m-1765163700) | $2 | ✅ | UP | +$2 | $1198 | - |
| 15 | 03:30 | [btc-updown-15m-1765164600](https://polymarket.com/event/btc-updown-15m-1765164600) | $1 | ❌ | DOWN | $-1 | $1197 | L1 |
| 16 | 03:45 | [btc-updown-15m-1765165500](https://polymarket.com/event/btc-updown-15m-1765165500) | $2 | ✅ | UP | +$2 | $1199 | - |
| 17 | 04:00 | [btc-updown-15m-1765166400](https://polymarket.com/event/btc-updown-15m-1765166400) | $1 | ✅ | UP | +$1 | $1200 | - |
| 18 | 04:15 | [btc-updown-15m-1765167300](https://polymarket.com/event/btc-updown-15m-1765167300) | $1 | ✅ | UP | +$1 | $1201 | - |
| 19 | 04:30 | [btc-updown-15m-1765168200](https://polymarket.com/event/btc-updown-15m-1765168200) | $1 | ❌ | DOWN | $-1 | $1200 | L1 |
| 20 | 04:45 | [btc-updown-15m-1765169100](https://polymarket.com/event/btc-updown-15m-1765169100) | $2 | ✅ | UP | +$2 | $1202 | - |
| 21 | 05:00 | [btc-updown-15m-1765170000](https://polymarket.com/event/btc-updown-15m-1765170000) | $1 | ❌ | DOWN | $-1 | $1201 | L1 |
| 22 | 05:15 | [btc-updown-15m-1765170900](https://polymarket.com/event/btc-updown-15m-1765170900) | $2 | ✅ | UP | +$2 | $1203 | - |
| 23 | 05:30 | [btc-updown-15m-1765171800](https://polymarket.com/event/btc-updown-15m-1765171800) | $1 | ✅ | UP | +$1 | $1204 | - |
| 24 | 05:45 | [btc-updown-15m-1765172700](https://polymarket.com/event/btc-updown-15m-1765172700) | $1 | ❌ | DOWN | $-1 | $1203 | L1 |
| 25 | 06:00 | [btc-updown-15m-1765173600](https://polymarket.com/event/btc-updown-15m-1765173600) | $2 | ✅ | UP | +$2 | $1205 | - |
| 26 | 06:15 | [btc-updown-15m-1765174500](https://polymarket.com/event/btc-updown-15m-1765174500) | $1 | ✅ | UP | +$1 | $1206 | - |
| 27 | 06:30 | [btc-updown-15m-1765175400](https://polymarket.com/event/btc-updown-15m-1765175400) | $1 | ✅ | UP | +$1 | $1207 | - |
| 28 | 06:45 | [btc-updown-15m-1765176300](https://polymarket.com/event/btc-updown-15m-1765176300) | $1 | ❌ | DOWN | $-1 | $1206 | L1 |
| 29 | 07:00 | [btc-updown-15m-1765177200](https://polymarket.com/event/btc-updown-15m-1765177200) | $2 | ❌ | DOWN | $-2 | $1204 | L2 |
| 30 | 07:15 | [btc-updown-15m-1765178100](https://polymarket.com/event/btc-updown-15m-1765178100) | $4 | ✅ | UP | +$4 | $1208 | - |
| 31 | 07:30 | [btc-updown-15m-1765179000](https://polymarket.com/event/btc-updown-15m-1765179000) | $1 | ❌ | DOWN | $-1 | $1207 | L1 |
| 32 | 07:45 | [btc-updown-15m-1765179900](https://polymarket.com/event/btc-updown-15m-1765179900) | $2 | ❌ | DOWN | $-2 | $1205 | L2 |
| 33 | 08:00 | [btc-updown-15m-1765180800](https://polymarket.com/event/btc-updown-15m-1765180800) | $4 | ✅ | UP | +$4 | $1209 | - |
| 34 | 08:15 | [btc-updown-15m-1765181700](https://polymarket.com/event/btc-updown-15m-1765181700) | $1 | ✅ | UP | +$1 | $1210 | - |
| 35 | 08:30 | [btc-updown-15m-1765182600](https://polymarket.com/event/btc-updown-15m-1765182600) | $1 | ✅ | UP | +$1 | $1211 | - |
| 36 | 08:45 | [btc-updown-15m-1765183500](https://polymarket.com/event/btc-updown-15m-1765183500) | $1 | ✅ | UP | +$1 | $1212 | - |
| 37 | 09:00 | [btc-updown-15m-1765184400](https://polymarket.com/event/btc-updown-15m-1765184400) | $1 | ✅ | UP | +$1 | $1213 | - |
| 38 | 09:15 | [btc-updown-15m-1765185300](https://polymarket.com/event/btc-updown-15m-1765185300) | $1 | ❌ | DOWN | $-1 | $1212 | L1 |
| 39 | 09:30 | [btc-updown-15m-1765186200](https://polymarket.com/event/btc-updown-15m-1765186200) | $2 | ✅ | UP | +$2 | $1214 | - |
| 40 | 09:45 | [btc-updown-15m-1765187100](https://polymarket.com/event/btc-updown-15m-1765187100) | $1 | ❌ | DOWN | $-1 | $1213 | L1 |
| 41 | 10:00 | [btc-updown-15m-1765188000](https://polymarket.com/event/btc-updown-15m-1765188000) | $2 | ✅ | UP | +$2 | $1215 | - |
| 42 | 10:15 | [btc-updown-15m-1765188900](https://polymarket.com/event/btc-updown-15m-1765188900) | $1 | ✅ | UP | +$1 | $1216 | - |
| 43 | 10:30 | [btc-updown-15m-1765189800](https://polymarket.com/event/btc-updown-15m-1765189800) | $1 | ✅ | UP | +$1 | $1217 | - |
| 44 | 10:45 | [btc-updown-15m-1765190700](https://polymarket.com/event/btc-updown-15m-1765190700) | $1 | ❌ | DOWN | $-1 | $1216 | L1 |
| 45 | 11:00 | [btc-updown-15m-1765191600](https://polymarket.com/event/btc-updown-15m-1765191600) | $2 | ✅ | UP | +$2 | $1218 | - |
| 46 | 11:15 | [btc-updown-15m-1765192500](https://polymarket.com/event/btc-updown-15m-1765192500) | $1 | ❌ | DOWN | $-1 | $1217 | L1 |
| 47 | 11:30 | [btc-updown-15m-1765193400](https://polymarket.com/event/btc-updown-15m-1765193400) | $2 | ❌ | DOWN | $-2 | $1215 | L2 |
| 48 | 11:45 | [btc-updown-15m-1765194300](https://polymarket.com/event/btc-updown-15m-1765194300) | $4 | ✅ | UP | +$4 | $1219 | - |
| 49 | 12:00 | [btc-updown-15m-1765195200](https://polymarket.com/event/btc-updown-15m-1765195200) | $1 | ❌ | DOWN | $-1 | $1218 | L1 |
| 50 | 12:15 | [btc-updown-15m-1765196100](https://polymarket.com/event/btc-updown-15m-1765196100) | $2 | ✅ | UP | +$2 | $1220 | - |
| 51 | 12:30 | [btc-updown-15m-1765197000](https://polymarket.com/event/btc-updown-15m-1765197000) | $1 | ❌ | DOWN | $-1 | $1219 | L1 |
| 52 | 12:45 | [btc-updown-15m-1765197900](https://polymarket.com/event/btc-updown-15m-1765197900) | $2 | ✅ | UP | +$2 | $1221 | - |
| 53 | 13:00 | [btc-updown-15m-1765198800](https://polymarket.com/event/btc-updown-15m-1765198800) | $1 | ✅ | UP | +$1 | $1222 | - |
| 54 | 13:15 | [btc-updown-15m-1765199700](https://polymarket.com/event/btc-updown-15m-1765199700) | $1 | ❌ | DOWN | $-1 | $1221 | L1 |
| 55 | 13:30 | [btc-updown-15m-1765200600](https://polymarket.com/event/btc-updown-15m-1765200600) | $2 | ❌ | DOWN | $-2 | $1219 | L2 |
| 56 | 13:45 | [btc-updown-15m-1765201500](https://polymarket.com/event/btc-updown-15m-1765201500) | $4 | ❌ | DOWN | $-4 | $1215 | L3 |
| 57 | 14:00 | [btc-updown-15m-1765202400](https://polymarket.com/event/btc-updown-15m-1765202400) | $8 | ✅ | UP | +$8 | $1223 | - |
| 58 | 14:15 | [btc-updown-15m-1765203300](https://polymarket.com/event/btc-updown-15m-1765203300) | $1 | ❌ | DOWN | $-1 | $1222 | L1 |
| 59 | 14:30 | [btc-updown-15m-1765204200](https://polymarket.com/event/btc-updown-15m-1765204200) | $2 | ✅ | UP | +$2 | $1224 | - |
| 60 | 14:45 | [btc-updown-15m-1765205100](https://polymarket.com/event/btc-updown-15m-1765205100) | $1 | ❌ | DOWN | $-1 | $1223 | L1 |
| 61 | 15:00 | [btc-updown-15m-1765206000](https://polymarket.com/event/btc-updown-15m-1765206000) | $2 | ❌ | DOWN | $-2 | $1221 | L2 |
| 62 | 15:15 | [btc-updown-15m-1765206900](https://polymarket.com/event/btc-updown-15m-1765206900) | $4 | ❌ | DOWN | $-4 | $1217 | L3 |
| 63 | 15:30 | [btc-updown-15m-1765207800](https://polymarket.com/event/btc-updown-15m-1765207800) | $8 | ❌ | DOWN | $-8 | $1209 | L4 |
| 64 | 15:45 | [btc-updown-15m-1765208700](https://polymarket.com/event/btc-updown-15m-1765208700) | $16 | ✅ | UP | +$16 | $1225 | - |
| 65 | 16:00 | [btc-updown-15m-1765209600](https://polymarket.com/event/btc-updown-15m-1765209600) | $1 | ❌ | DOWN | $-1 | $1224 | L1 |
| 66 | 16:15 | [btc-updown-15m-1765210500](https://polymarket.com/event/btc-updown-15m-1765210500) | $2 | ✅ | UP | +$2 | $1226 | - |
| 67 | 16:30 | [btc-updown-15m-1765211400](https://polymarket.com/event/btc-updown-15m-1765211400) | $1 | ❌ | DOWN | $-1 | $1225 | L1 |
| 68 | 16:45 | [btc-updown-15m-1765212300](https://polymarket.com/event/btc-updown-15m-1765212300) | $2 | ❌ | DOWN | $-2 | $1223 | L2 |
| 69 | 17:00 | [btc-updown-15m-1765213200](https://polymarket.com/event/btc-updown-15m-1765213200) | $4 | ✅ | UP | +$4 | $1227 | - |
| 70 | 17:15 | [btc-updown-15m-1765214100](https://polymarket.com/event/btc-updown-15m-1765214100) | $1 | ❌ | DOWN | $-1 | $1226 | L1 |
| 71 | 17:30 | [btc-updown-15m-1765215000](https://polymarket.com/event/btc-updown-15m-1765215000) | $2 | ❌ | DOWN | $-2 | $1224 | L2 |
| 72 | 17:45 | [btc-updown-15m-1765215900](https://polymarket.com/event/btc-updown-15m-1765215900) | $4 | ✅ | UP | +$4 | $1228 | - |
| 73 | 18:00 | [btc-updown-15m-1765216800](https://polymarket.com/event/btc-updown-15m-1765216800) | $1 | ✅ | UP | +$1 | $1229 | - |
| 74 | 18:15 | [btc-updown-15m-1765217700](https://polymarket.com/event/btc-updown-15m-1765217700) | $1 | ❌ | DOWN | $-1 | $1228 | L1 |
| 75 | 18:30 | [btc-updown-15m-1765218600](https://polymarket.com/event/btc-updown-15m-1765218600) | $2 | ✅ | UP | +$2 | $1230 | - |
| 76 | 18:45 | [btc-updown-15m-1765219500](https://polymarket.com/event/btc-updown-15m-1765219500) | $1 | ❌ | DOWN | $-1 | $1229 | L1 |
| 77 | 19:00 | [btc-updown-15m-1765220400](https://polymarket.com/event/btc-updown-15m-1765220400) | $2 | ✅ | UP | +$2 | $1231 | - |
| 78 | 19:15 | [btc-updown-15m-1765221300](https://polymarket.com/event/btc-updown-15m-1765221300) | $1 | ✅ | UP | +$1 | $1232 | - |
| 79 | 19:30 | [btc-updown-15m-1765222200](https://polymarket.com/event/btc-updown-15m-1765222200) | $1 | ✅ | UP | +$1 | $1233 | - |
| 80 | 19:45 | [btc-updown-15m-1765223100](https://polymarket.com/event/btc-updown-15m-1765223100) | $1 | ❌ | DOWN | $-1 | $1232 | L1 |
| 81 | 20:00 | [btc-updown-15m-1765224000](https://polymarket.com/event/btc-updown-15m-1765224000) | $2 | ✅ | UP | +$2 | $1234 | - |
| 82 | 20:15 | [btc-updown-15m-1765224900](https://polymarket.com/event/btc-updown-15m-1765224900) | $1 | ✅ | UP | +$1 | $1235 | - |
| 83 | 20:30 | [btc-updown-15m-1765225800](https://polymarket.com/event/btc-updown-15m-1765225800) | $1 | ✅ | UP | +$1 | $1236 | - |
| 84 | 20:45 | [btc-updown-15m-1765226700](https://polymarket.com/event/btc-updown-15m-1765226700) | $1 | ✅ | UP | +$1 | $1237 | - |
| 85 | 21:00 | [btc-updown-15m-1765227600](https://polymarket.com/event/btc-updown-15m-1765227600) | $1 | ❌ | DOWN | $-1 | $1236 | L1 |
| 86 | 21:15 | [btc-updown-15m-1765228500](https://polymarket.com/event/btc-updown-15m-1765228500) | $2 | ✅ | UP | +$2 | $1238 | - |
| 87 | 21:30 | [btc-updown-15m-1765229400](https://polymarket.com/event/btc-updown-15m-1765229400) | $1 | ✅ | UP | +$1 | $1239 | - |
| 88 | 21:45 | [btc-updown-15m-1765230300](https://polymarket.com/event/btc-updown-15m-1765230300) | $1 | ✅ | UP | +$1 | $1240 | - |
| 89 | 22:00 | [btc-updown-15m-1765231200](https://polymarket.com/event/btc-updown-15m-1765231200) | $1 | ❌ | DOWN | $-1 | $1239 | L1 |
| 90 | 22:15 | [btc-updown-15m-1765232100](https://polymarket.com/event/btc-updown-15m-1765232100) | $2 | ❌ | DOWN | $-2 | $1237 | L2 |
| 91 | 22:30 | [btc-updown-15m-1765233000](https://polymarket.com/event/btc-updown-15m-1765233000) | $4 | ❌ | DOWN | $-4 | $1233 | L3 |
| 92 | 22:45 | [btc-updown-15m-1765233900](https://polymarket.com/event/btc-updown-15m-1765233900) | $8 | ✅ | UP | +$8 | $1241 | - |
| 93 | 23:00 | [btc-updown-15m-1765234800](https://polymarket.com/event/btc-updown-15m-1765234800) | $1 | ❌ | DOWN | $-1 | $1240 | L1 |
| 94 | 23:15 | [btc-updown-15m-1765235700](https://polymarket.com/event/btc-updown-15m-1765235700) | $2 | ❌ | DOWN | $-2 | $1238 | L2 |
| 95 | 23:30 | [btc-updown-15m-1765236600](https://polymarket.com/event/btc-updown-15m-1765236600) | $4 | ❌ | DOWN | $-4 | $1234 | L3 |
| 96 | 23:45 | [btc-updown-15m-1765237500](https://polymarket.com/event/btc-updown-15m-1765237500) | $8 | ✅ | UP | +$8 | $1242 | - |

### 2025-12-09
**Summary:** 93 trades | 49 wins | 44 losses | Max Bet: $32 | Profit: +$48

**Skip Events (1):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
| 09:45 | 5 | $31 | $32 | 10:45 |

| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
| 1 | 00:00 | [btc-updown-15m-1765238400](https://polymarket.com/event/btc-updown-15m-1765238400) | $1 | ✅ | UP | +$1 | $1243 | - |
| 2 | 00:15 | [btc-updown-15m-1765239300](https://polymarket.com/event/btc-updown-15m-1765239300) | $1 | ❌ | DOWN | $-1 | $1242 | L1 |
| 3 | 00:30 | [btc-updown-15m-1765240200](https://polymarket.com/event/btc-updown-15m-1765240200) | $2 | ❌ | DOWN | $-2 | $1240 | L2 |
| 4 | 00:45 | [btc-updown-15m-1765241100](https://polymarket.com/event/btc-updown-15m-1765241100) | $4 | ❌ | DOWN | $-4 | $1236 | L3 |
| 5 | 01:00 | [btc-updown-15m-1765242000](https://polymarket.com/event/btc-updown-15m-1765242000) | $8 | ✅ | UP | +$8 | $1244 | - |
| 6 | 01:15 | [btc-updown-15m-1765242900](https://polymarket.com/event/btc-updown-15m-1765242900) | $1 | ❌ | DOWN | $-1 | $1243 | L1 |
| 7 | 01:30 | [btc-updown-15m-1765243800](https://polymarket.com/event/btc-updown-15m-1765243800) | $2 | ❌ | DOWN | $-2 | $1241 | L2 |
| 8 | 01:45 | [btc-updown-15m-1765244700](https://polymarket.com/event/btc-updown-15m-1765244700) | $4 | ✅ | UP | +$4 | $1245 | - |
| 9 | 02:00 | [btc-updown-15m-1765245600](https://polymarket.com/event/btc-updown-15m-1765245600) | $1 | ✅ | UP | +$1 | $1246 | - |
| 10 | 02:15 | [btc-updown-15m-1765246500](https://polymarket.com/event/btc-updown-15m-1765246500) | $1 | ✅ | UP | +$1 | $1247 | - |
| 11 | 02:30 | [btc-updown-15m-1765247400](https://polymarket.com/event/btc-updown-15m-1765247400) | $1 | ❌ | DOWN | $-1 | $1246 | L1 |
| 12 | 02:45 | [btc-updown-15m-1765248300](https://polymarket.com/event/btc-updown-15m-1765248300) | $2 | ❌ | DOWN | $-2 | $1244 | L2 |
| 13 | 03:00 | [btc-updown-15m-1765249200](https://polymarket.com/event/btc-updown-15m-1765249200) | $4 | ❌ | DOWN | $-4 | $1240 | L3 |
| 14 | 03:15 | [btc-updown-15m-1765250100](https://polymarket.com/event/btc-updown-15m-1765250100) | $8 | ✅ | UP | +$8 | $1248 | - |
| 15 | 03:30 | [btc-updown-15m-1765251000](https://polymarket.com/event/btc-updown-15m-1765251000) | $1 | ✅ | UP | +$1 | $1249 | - |
| 16 | 03:45 | [btc-updown-15m-1765251900](https://polymarket.com/event/btc-updown-15m-1765251900) | $1 | ✅ | UP | +$1 | $1250 | - |
| 17 | 04:00 | [btc-updown-15m-1765252800](https://polymarket.com/event/btc-updown-15m-1765252800) | $1 | ✅ | UP | +$1 | $1251 | - |
| 18 | 04:15 | [btc-updown-15m-1765253700](https://polymarket.com/event/btc-updown-15m-1765253700) | $1 | ❌ | DOWN | $-1 | $1250 | L1 |
| 19 | 04:30 | [btc-updown-15m-1765254600](https://polymarket.com/event/btc-updown-15m-1765254600) | $2 | ❌ | DOWN | $-2 | $1248 | L2 |
| 20 | 04:45 | [btc-updown-15m-1765255500](https://polymarket.com/event/btc-updown-15m-1765255500) | $4 | ❌ | DOWN | $-4 | $1244 | L3 |
| 21 | 05:00 | [btc-updown-15m-1765256400](https://polymarket.com/event/btc-updown-15m-1765256400) | $8 | ❌ | DOWN | $-8 | $1236 | L4 |
| 22 | 05:15 | [btc-updown-15m-1765257300](https://polymarket.com/event/btc-updown-15m-1765257300) | $16 | ✅ | UP | +$16 | $1252 | - |
| 23 | 05:30 | [btc-updown-15m-1765258200](https://polymarket.com/event/btc-updown-15m-1765258200) | $1 | ✅ | UP | +$1 | $1253 | - |
| 24 | 05:45 | [btc-updown-15m-1765259100](https://polymarket.com/event/btc-updown-15m-1765259100) | $1 | ❌ | DOWN | $-1 | $1252 | L1 |
| 25 | 06:00 | [btc-updown-15m-1765260000](https://polymarket.com/event/btc-updown-15m-1765260000) | $2 | ✅ | UP | +$2 | $1254 | - |
| 26 | 06:15 | [btc-updown-15m-1765260900](https://polymarket.com/event/btc-updown-15m-1765260900) | $1 | ❌ | DOWN | $-1 | $1253 | L1 |
| 27 | 06:30 | [btc-updown-15m-1765261800](https://polymarket.com/event/btc-updown-15m-1765261800) | $2 | ✅ | UP | +$2 | $1255 | - |
| 28 | 06:45 | [btc-updown-15m-1765262700](https://polymarket.com/event/btc-updown-15m-1765262700) | $1 | ✅ | UP | +$1 | $1256 | - |
| 29 | 07:00 | [btc-updown-15m-1765263600](https://polymarket.com/event/btc-updown-15m-1765263600) | $1 | ❌ | DOWN | $-1 | $1255 | L1 |
| 30 | 07:15 | [btc-updown-15m-1765264500](https://polymarket.com/event/btc-updown-15m-1765264500) | $2 | ✅ | UP | +$2 | $1257 | - |
| 31 | 07:30 | [btc-updown-15m-1765265400](https://polymarket.com/event/btc-updown-15m-1765265400) | $1 | ✅ | UP | +$1 | $1258 | - |
| 32 | 07:45 | [btc-updown-15m-1765266300](https://polymarket.com/event/btc-updown-15m-1765266300) | $1 | ✅ | UP | +$1 | $1259 | - |
| 33 | 08:00 | [btc-updown-15m-1765267200](https://polymarket.com/event/btc-updown-15m-1765267200) | $1 | ✅ | UP | +$1 | $1260 | - |
| 34 | 08:15 | [btc-updown-15m-1765268100](https://polymarket.com/event/btc-updown-15m-1765268100) | $1 | ✅ | UP | +$1 | $1261 | - |
| 35 | 08:30 | [btc-updown-15m-1765269000](https://polymarket.com/event/btc-updown-15m-1765269000) | $1 | ✅ | UP | +$1 | $1262 | - |
| 36 | 08:45 | [btc-updown-15m-1765269900](https://polymarket.com/event/btc-updown-15m-1765269900) | $1 | ❌ | DOWN | $-1 | $1261 | L1 |
| 37 | 09:00 | [btc-updown-15m-1765270800](https://polymarket.com/event/btc-updown-15m-1765270800) | $2 | ❌ | DOWN | $-2 | $1259 | L2 |
| 38 | 09:15 | [btc-updown-15m-1765271700](https://polymarket.com/event/btc-updown-15m-1765271700) | $4 | ❌ | DOWN | $-4 | $1255 | L3 |
| 39 | 09:30 | [btc-updown-15m-1765272600](https://polymarket.com/event/btc-updown-15m-1765272600) | $8 | ❌ | DOWN | $-8 | $1247 | L4 |
| 40 | 09:45 | [btc-updown-15m-1765273500](https://polymarket.com/event/btc-updown-15m-1765273500) | $16 | ❌ | DOWN | $-16 | $1231 | L5 |
| - | 10:00 | [btc-updown-15m-1765274400](https://polymarket.com/event/btc-updown-15m-1765274400) | - | ⏭️ SKIP | UP | - | $1231 | - |
| - | 10:15 | [btc-updown-15m-1765275300](https://polymarket.com/event/btc-updown-15m-1765275300) | - | ⏭️ SKIP | UP | - | $1231 | - |
| - | 10:30 | [btc-updown-15m-1765276200](https://polymarket.com/event/btc-updown-15m-1765276200) | - | ⏭️ SKIP | DOWN | - | $1231 | - |
| 41 | 10:45 | [btc-updown-15m-1765277100](https://polymarket.com/event/btc-updown-15m-1765277100) | $32 | ✅ | UP | +$32 | $1263 | - |
| 42 | 11:00 | [btc-updown-15m-1765278000](https://polymarket.com/event/btc-updown-15m-1765278000) | $1 | ❌ | DOWN | $-1 | $1262 | L1 |
| 43 | 11:15 | [btc-updown-15m-1765278900](https://polymarket.com/event/btc-updown-15m-1765278900) | $2 | ✅ | UP | +$2 | $1264 | - |
| 44 | 11:30 | [btc-updown-15m-1765279800](https://polymarket.com/event/btc-updown-15m-1765279800) | $1 | ❌ | DOWN | $-1 | $1263 | L1 |
| 45 | 11:45 | [btc-updown-15m-1765280700](https://polymarket.com/event/btc-updown-15m-1765280700) | $2 | ✅ | UP | +$2 | $1265 | - |
| 46 | 12:00 | [btc-updown-15m-1765281600](https://polymarket.com/event/btc-updown-15m-1765281600) | $1 | ❌ | DOWN | $-1 | $1264 | L1 |
| 47 | 12:15 | [btc-updown-15m-1765282500](https://polymarket.com/event/btc-updown-15m-1765282500) | $2 | ✅ | UP | +$2 | $1266 | - |
| 48 | 12:30 | [btc-updown-15m-1765283400](https://polymarket.com/event/btc-updown-15m-1765283400) | $1 | ✅ | UP | +$1 | $1267 | - |
| 49 | 12:45 | [btc-updown-15m-1765284300](https://polymarket.com/event/btc-updown-15m-1765284300) | $1 | ❌ | DOWN | $-1 | $1266 | L1 |
| 50 | 13:00 | [btc-updown-15m-1765285200](https://polymarket.com/event/btc-updown-15m-1765285200) | $2 | ❌ | DOWN | $-2 | $1264 | L2 |
| 51 | 13:15 | [btc-updown-15m-1765286100](https://polymarket.com/event/btc-updown-15m-1765286100) | $4 | ✅ | UP | +$4 | $1268 | - |
| 52 | 13:30 | [btc-updown-15m-1765287000](https://polymarket.com/event/btc-updown-15m-1765287000) | $1 | ❌ | DOWN | $-1 | $1267 | L1 |
| 53 | 13:45 | [btc-updown-15m-1765287900](https://polymarket.com/event/btc-updown-15m-1765287900) | $2 | ✅ | UP | +$2 | $1269 | - |
| 54 | 14:00 | [btc-updown-15m-1765288800](https://polymarket.com/event/btc-updown-15m-1765288800) | $1 | ❌ | DOWN | $-1 | $1268 | L1 |
| 55 | 14:15 | [btc-updown-15m-1765289700](https://polymarket.com/event/btc-updown-15m-1765289700) | $2 | ❌ | DOWN | $-2 | $1266 | L2 |
| 56 | 14:30 | [btc-updown-15m-1765290600](https://polymarket.com/event/btc-updown-15m-1765290600) | $4 | ❌ | DOWN | $-4 | $1262 | L3 |
| 57 | 14:45 | [btc-updown-15m-1765291500](https://polymarket.com/event/btc-updown-15m-1765291500) | $8 | ✅ | UP | +$8 | $1270 | - |
| 58 | 15:00 | [btc-updown-15m-1765292400](https://polymarket.com/event/btc-updown-15m-1765292400) | $1 | ✅ | UP | +$1 | $1271 | - |
| 59 | 15:15 | [btc-updown-15m-1765293300](https://polymarket.com/event/btc-updown-15m-1765293300) | $1 | ✅ | UP | +$1 | $1272 | - |
| 60 | 15:30 | [btc-updown-15m-1765294200](https://polymarket.com/event/btc-updown-15m-1765294200) | $1 | ✅ | UP | +$1 | $1273 | - |
| 61 | 15:45 | [btc-updown-15m-1765295100](https://polymarket.com/event/btc-updown-15m-1765295100) | $1 | ✅ | UP | +$1 | $1274 | - |
| 62 | 16:00 | [btc-updown-15m-1765296000](https://polymarket.com/event/btc-updown-15m-1765296000) | $1 | ✅ | UP | +$1 | $1275 | - |
| 63 | 16:15 | [btc-updown-15m-1765296900](https://polymarket.com/event/btc-updown-15m-1765296900) | $1 | ❌ | DOWN | $-1 | $1274 | L1 |
| 64 | 16:30 | [btc-updown-15m-1765297800](https://polymarket.com/event/btc-updown-15m-1765297800) | $2 | ✅ | UP | +$2 | $1276 | - |
| 65 | 16:45 | [btc-updown-15m-1765298700](https://polymarket.com/event/btc-updown-15m-1765298700) | $1 | ❌ | DOWN | $-1 | $1275 | L1 |
| 66 | 17:00 | [btc-updown-15m-1765299600](https://polymarket.com/event/btc-updown-15m-1765299600) | $2 | ✅ | UP | +$2 | $1277 | - |
| 67 | 17:15 | [btc-updown-15m-1765300500](https://polymarket.com/event/btc-updown-15m-1765300500) | $1 | ❌ | DOWN | $-1 | $1276 | L1 |
| 68 | 17:30 | [btc-updown-15m-1765301400](https://polymarket.com/event/btc-updown-15m-1765301400) | $2 | ✅ | UP | +$2 | $1278 | - |
| 69 | 17:45 | [btc-updown-15m-1765302300](https://polymarket.com/event/btc-updown-15m-1765302300) | $1 | ✅ | UP | +$1 | $1279 | - |
| 70 | 18:00 | [btc-updown-15m-1765303200](https://polymarket.com/event/btc-updown-15m-1765303200) | $1 | ✅ | UP | +$1 | $1280 | - |
| 71 | 18:15 | [btc-updown-15m-1765304100](https://polymarket.com/event/btc-updown-15m-1765304100) | $1 | ✅ | UP | +$1 | $1281 | - |
| 72 | 18:30 | [btc-updown-15m-1765305000](https://polymarket.com/event/btc-updown-15m-1765305000) | $1 | ❌ | DOWN | $-1 | $1280 | L1 |
| 73 | 18:45 | [btc-updown-15m-1765305900](https://polymarket.com/event/btc-updown-15m-1765305900) | $2 | ✅ | UP | +$2 | $1282 | - |
| 74 | 19:00 | [btc-updown-15m-1765306800](https://polymarket.com/event/btc-updown-15m-1765306800) | $1 | ✅ | UP | +$1 | $1283 | - |
| 75 | 19:15 | [btc-updown-15m-1765307700](https://polymarket.com/event/btc-updown-15m-1765307700) | $1 | ✅ | UP | +$1 | $1284 | - |
| 76 | 19:30 | [btc-updown-15m-1765308600](https://polymarket.com/event/btc-updown-15m-1765308600) | $1 | ❌ | DOWN | $-1 | $1283 | L1 |
| 77 | 19:45 | [btc-updown-15m-1765309500](https://polymarket.com/event/btc-updown-15m-1765309500) | $2 | ✅ | UP | +$2 | $1285 | - |
| 78 | 20:00 | [btc-updown-15m-1765310400](https://polymarket.com/event/btc-updown-15m-1765310400) | $1 | ❌ | DOWN | $-1 | $1284 | L1 |
| 79 | 20:15 | [btc-updown-15m-1765311300](https://polymarket.com/event/btc-updown-15m-1765311300) | $2 | ❌ | DOWN | $-2 | $1282 | L2 |
| 80 | 20:30 | [btc-updown-15m-1765312200](https://polymarket.com/event/btc-updown-15m-1765312200) | $4 | ❌ | DOWN | $-4 | $1278 | L3 |
| 81 | 20:45 | [btc-updown-15m-1765313100](https://polymarket.com/event/btc-updown-15m-1765313100) | $8 | ✅ | UP | +$8 | $1286 | - |
| 82 | 21:00 | [btc-updown-15m-1765314000](https://polymarket.com/event/btc-updown-15m-1765314000) | $1 | ❌ | DOWN | $-1 | $1285 | L1 |
| 83 | 21:15 | [btc-updown-15m-1765314900](https://polymarket.com/event/btc-updown-15m-1765314900) | $2 | ✅ | UP | +$2 | $1287 | - |
| 84 | 21:30 | [btc-updown-15m-1765315800](https://polymarket.com/event/btc-updown-15m-1765315800) | $1 | ❌ | DOWN | $-1 | $1286 | L1 |
| 85 | 21:45 | [btc-updown-15m-1765316700](https://polymarket.com/event/btc-updown-15m-1765316700) | $2 | ❌ | DOWN | $-2 | $1284 | L2 |
| 86 | 22:00 | [btc-updown-15m-1765317600](https://polymarket.com/event/btc-updown-15m-1765317600) | $4 | ✅ | UP | +$4 | $1288 | - |
| 87 | 22:15 | [btc-updown-15m-1765318500](https://polymarket.com/event/btc-updown-15m-1765318500) | $1 | ❌ | DOWN | $-1 | $1287 | L1 |
| 88 | 22:30 | [btc-updown-15m-1765319400](https://polymarket.com/event/btc-updown-15m-1765319400) | $2 | ✅ | UP | +$2 | $1289 | - |
| 89 | 22:45 | [btc-updown-15m-1765320300](https://polymarket.com/event/btc-updown-15m-1765320300) | $1 | ❌ | DOWN | $-1 | $1288 | L1 |
| 90 | 23:00 | [btc-updown-15m-1765321200](https://polymarket.com/event/btc-updown-15m-1765321200) | $2 | ❌ | DOWN | $-2 | $1286 | L2 |
| 91 | 23:15 | [btc-updown-15m-1765322100](https://polymarket.com/event/btc-updown-15m-1765322100) | $4 | ✅ | UP | +$4 | $1290 | - |
| 92 | 23:30 | [btc-updown-15m-1765323000](https://polymarket.com/event/btc-updown-15m-1765323000) | $1 | ✅ | UP | +$1 | $1291 | - |
| 93 | 23:45 | [btc-updown-15m-1765323900](https://polymarket.com/event/btc-updown-15m-1765323900) | $1 | ❌ | DOWN | $-1 | $1290 | L1 |

## Comparison: With vs Without Skip Rule

### Without Skip Rule (Pure Martingale)
- Max possible loss streak: 9
- Balance needed for $1 bet: $1023
- Balance needed for $2 bet: $2046

### With Skip Rule (5 losses → skip 1h)
- Max loss streak before skip: 5
- Balance needed for $1 bet: $31
- Balance needed for $2 bet: $62
- Skipped windows: 210
- Skip events: 70

---
*Generated at 2025-12-10T18:09:00.244Z*
