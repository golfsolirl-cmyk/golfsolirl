-- Public Irish support line moved from 086 851 5000 back to 087 446 4766.
-- Keeps the default ops driver row in step with the site, emails, and PDFs.
update public.drivers
set phone = '+353 87 446 4766'
where phone in (
  '+353 86 851 5000',
  '086 851 5000',
  '086 8515000',
  '+353868515000',
  '0868515000'
);
