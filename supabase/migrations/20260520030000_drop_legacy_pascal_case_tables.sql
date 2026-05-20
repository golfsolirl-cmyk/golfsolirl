-- Orphan tables (PascalCase) are not used by Golf Sol Ireland — the app uses snake_case
-- tables (profiles, enquiries, transfer_bookings, etc.). RLS was enabled with no policies,
-- which blocks API access but triggers Security Advisor INFO lint 0008.
-- Safe to remove; recreate from backup if you intentionally stored data here.

drop table if exists public."VerificationToken" cascade;
drop table if exists public."Session" cascade;
drop table if exists public."Account" cascade;
drop table if exists public."User" cascade;
drop table if exists public."Booking" cascade;
drop table if exists public."Complaint" cascade;
drop table if exists public."DesignSettings" cascade;
drop table if exists public."Enquiry" cascade;
