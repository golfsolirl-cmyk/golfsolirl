-- Client read tracking for interest tickets (unread admin replies + mark-read RPC)

alter table public.portal_interest_tickets
  add column if not exists client_last_read_at timestamptz;

comment on column public.portal_interest_tickets.client_last_read_at is
  'Updated when the client opens the ticket thread; used with latest admin message time for unread state.';

drop policy if exists "portal_interest_tickets_update_own_read" on public.portal_interest_tickets;

create policy "portal_interest_tickets_update_own_read"
  on public.portal_interest_tickets for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
