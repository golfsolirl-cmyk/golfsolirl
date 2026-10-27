-- Public Irish support line moved from 087 446 4766 to 086 851 5000.
-- Keeps the default ops driver row in step with the site, emails, and PDFs.
update public.drivers
set phone = '+353 86 851 5000'
where phone in (
  '+353 87 446 4766',
  '087 446 4766',
  '+353874464766'
);
