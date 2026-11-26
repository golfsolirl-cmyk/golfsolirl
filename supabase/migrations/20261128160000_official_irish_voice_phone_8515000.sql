-- Official Irish voice line: +353 86 851 5000 (client-confirmed).
-- WhatsApp remains +353 86 600 6202 and is not stored on the drivers row.
-- Keeps the default ops driver row in step with shared/business-details.mjs.
update public.drivers
set phone = '+353 86 851 5000'
where phone in (
  '+353 87 446 4766',
  '087 446 4766',
  '+353874464766',
  '0874464766'
);
