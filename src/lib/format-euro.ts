/** EUR formatting for package / quote UI (en-IE, whole euros). */
export const formatEuro = (value: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value)
