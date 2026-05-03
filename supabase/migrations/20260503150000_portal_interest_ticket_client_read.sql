-- Client read tracking for interest tickets (unread admin replies + mark-read RPC)

alter table public.portal_interest_tickets
  add column if not exists client_last_read_at timestamptz;

comment on column public.portal_interest_tickets.client_last_read_at is
  'Updated when the client opens the ticket thread; used with latest admin message time for unread state.';

create or replace function public.mark_portal_interest_ticket_read(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.portal_interest_tickets
  set
    client_last_read_at = now(),
    updated_at = now()
  where id = p_ticket_id
    and owner_id = auth.uid();
end;
$$;

revoke all on function public.mark_portal_interest_ticket_read(uuid) from public;
grant execute on function public.mark_portal_interest_ticket_read(uuid) to authenticated;
