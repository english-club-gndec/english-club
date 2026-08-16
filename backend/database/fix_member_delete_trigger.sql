-- SQL Script to fix member deletion in Supabase
-- Run this in your Supabase SQL Editor to drop the forbidden storage.objects deletion triggers

DROP TRIGGER IF EXISTS trigger_delete_member_image ON members;
DROP TRIGGER IF EXISTS trigger_delete_user_image ON members;
DROP TRIGGER IF EXISTS trigger_delete_user_image ON users;

DROP FUNCTION IF EXISTS delete_member_image_from_storage();
DROP FUNCTION IF EXISTS delete_user_image_from_storage();
