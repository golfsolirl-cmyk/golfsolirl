-- Admin can quote each client trip add-on request; clients can close their own tickets.

alter table public.portal_interest_tickets
  add column if not exists admin_quote_eur numeric(12, 2);

comment on column public.portal_interest_tickets.admin_quote_eur is
  'Optional EUR quote set by admin for this transfers / golf / hotels request; shown on the client trip desk total.';

create or replace function public.close_my_portal_interest_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.portal_interest_tickets
  set
    status = 'closed',
    updated_at = now()
  where id = p_ticket_id
    and owner_id = auth.uid()
    and status is distinct from 'closed';

  if not found then
    -- No-op if already closed or not owned; avoid leaking existence
    return;
  end if;
end;
$$;

revoke all on function public.close_my_portal_interest_ticket(uuid) from public;
grant execute on function public.close_my_portal_interest_ticket(uuid) to authenticated;

comment on function public.close_my_portal_interest_ticket(uuid) is
  'Client removes an add-on request from their trip builder (sets status=closed).';
