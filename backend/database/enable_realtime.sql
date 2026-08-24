-- SQL Script to enable Supabase Realtime replication on PostgreSQL tables
-- Run this script in the Supabase SQL Editor to enable background real-time updates without refreshing:

ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
