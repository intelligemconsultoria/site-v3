-- KV Store Table for Edge Functions
-- This table is used by the server edge functions for key-value storage

CREATE TABLE IF NOT EXISTS kv_store_a91235ef (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_a91235ef(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_kv_store_updated_at 
    BEFORE UPDATE ON kv_store_a91235ef 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE kv_store_a91235ef ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to access this table
CREATE POLICY "Service role can manage kv_store" ON kv_store_a91235ef
    FOR ALL USING (true);