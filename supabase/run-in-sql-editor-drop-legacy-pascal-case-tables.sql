-- Removes unused PascalCase tables (not referenced in this repo).
-- Fixes Security Advisor INFO: rls_enabled_no_policy on Account, Booking, etc.
-- Skip this script if you still need data from these tables — export first.

drop table if exists public."VerificationToken" cascade;
drop table if exists public."Session" cascade;
drop table if exists public."Account" cascade;
drop table if exists public."User" cascade;
drop table if exists public."Booking" cascade;
drop table if exists public."Complaint" cascade;
drop table if exists public."DesignSettings" cascade;
drop table if exists public."Enquiry" cascade;
