-- ============================================
-- Polymarket Auto-Trading Bot Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EVENTS TABLE (Market Configurations)
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Market identification
    crypto VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug_pattern VARCHAR(100) NOT NULL DEFAULT '{crypto}-updown-15m-{timestamp}',

    -- Trading configuration
    trading_window_seconds INTEGER NOT NULL DEFAULT 10,
    threshold DECIMAL(4,3) NOT NULL DEFAULT 0.99,
    bet_amount_usdc DECIMAL(10,2) NOT NULL DEFAULT 10.00,

    -- Status
    enabled BOOLEAN NOT NULL DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT events_crypto_unique UNIQUE(crypto)
);

-- ============================================
-- TRADES TABLE (Trade History)
-- ============================================
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Market info
    market_slug VARCHAR(100) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,

    -- Trade details
    side VARCHAR(4) NOT NULL CHECK (side IN ('UP', 'DOWN')),
    token_id VARCHAR(100) NOT NULL,
    bet_amount DECIMAL(10,2) NOT NULL,
    entry_price DECIMAL(5,4) NOT NULL,

    -- Execution status
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'filled', 'failed', 'cancelled')),
    order_id VARCHAR(100),
    transaction_hash VARCHAR(100),

    -- Outcome (after market resolution)
    outcome VARCHAR(10) CHECK (outcome IN ('won', 'lost', 'pending', NULL)),
    payout DECIMAL(10,2),

    -- Errors
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    CONSTRAINT trades_market_slug_unique UNIQUE(market_slug)
);

CREATE INDEX idx_trades_event_id ON trades(event_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_outcome ON trades(outcome);

-- ============================================
-- WORKER_LOGS TABLE (Worker Activity Logs)
-- ============================================
CREATE TABLE worker_logs (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    worker_id VARCHAR(50) NOT NULL,

    -- Job info
    job_id VARCHAR(100),
    market_slug VARCHAR(100),

    -- Log entry
    level VARCHAR(10) NOT NULL DEFAULT 'info'
        CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    metadata JSONB,

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_worker_logs_event_id ON worker_logs(event_id);
CREATE INDEX idx_worker_logs_created_at ON worker_logs(created_at DESC);
CREATE INDEX idx_worker_logs_level ON worker_logs(level);

-- ============================================
-- PRICE_SNAPSHOTS TABLE (Price History for Charts)
-- ============================================
CREATE TABLE price_snapshots (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    market_slug VARCHAR(100) NOT NULL,

    up_price DECIMAL(5,4) NOT NULL,
    down_price DECIMAL(5,4) NOT NULL,

    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_snapshots_market_slug ON price_snapshots(market_slug);
CREATE INDEX idx_price_snapshots_captured_at ON price_snapshots(captured_at DESC);

-- Partition or cleanup old price snapshots (keep last 24 hours)
-- This would be handled by a cron job in production

-- ============================================
-- SETTINGS TABLE (Global Settings)
-- ============================================
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Default settings
INSERT INTO settings (key, value) VALUES
    ('global_enabled', 'true'),
    ('dry_run', 'false'),
    ('log_level', '"info"'),
    ('retry_after_end_seconds', '15');

-- Default events (cryptos)
INSERT INTO events (crypto, name, trading_window_seconds, threshold, bet_amount_usdc)
VALUES
    ('btc', 'BTC 15-min Up/Down', 60, 0.99, 10.00),
    ('eth', 'ETH 15-min Up/Down', 10, 0.99, 10.00),
    ('sol', 'SOL 15-min Up/Down', 10, 0.99, 10.00);

-- ============================================
-- VIEWS
-- ============================================

-- Trade statistics view
CREATE VIEW trade_stats AS
SELECT
    e.id as event_id,
    e.crypto,
    e.name,
    COUNT(t.id) as total_trades,
    COUNT(CASE WHEN t.status = 'filled' THEN 1 END) as filled_trades,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_trades,
    COUNT(CASE WHEN t.outcome = 'won' THEN 1 END) as won_trades,
    COUNT(CASE WHEN t.outcome = 'lost' THEN 1 END) as lost_trades,
    COALESCE(SUM(CASE WHEN t.outcome = 'won' THEN t.payout ELSE 0 END), 0) as total_payout,
    COALESCE(SUM(t.bet_amount), 0) as total_bet,
    CASE
        WHEN COUNT(CASE WHEN t.outcome IN ('won', 'lost') THEN 1 END) > 0
        THEN ROUND(
            COUNT(CASE WHEN t.outcome = 'won' THEN 1 END)::decimal /
            COUNT(CASE WHEN t.outcome IN ('won', 'lost') THEN 1 END) * 100,
            2
        )
        ELSE 0
    END as win_rate
FROM events e
LEFT JOIN trades t ON e.id = t.event_id
GROUP BY e.id, e.crypto, e.name;

-- Recent trades view
CREATE VIEW recent_trades AS
SELECT
    t.*,
    e.crypto,
    e.name as event_name
FROM trades t
JOIN events e ON t.event_id = e.id
ORDER BY t.created_at DESC
LIMIT 100;
