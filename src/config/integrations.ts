interface FutureIntegrationConfig {
  readonly enabled: boolean
  readonly label: string
  readonly envKeys: readonly string[]
}

interface IntegrationRegistry {
  readonly supabase: FutureIntegrationConfig
  readonly stripe: FutureIntegrationConfig
  readonly resend: FutureIntegrationConfig
}

const getOptionalEnv = (key: string) => {
  const value = import.meta.env[key as keyof ImportMetaEnv]

  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }

  return value
}

export const integrationRegistry: IntegrationRegistry = {
  supabase: {
    enabled: Boolean(getOptionalEnv('VITE_SUPABASE_URL') && getOptionalEnv('VITE_SUPABASE_ANON_KEY')),
    label: 'Enquiries, group preferences, trip details, and customer notes kept together from first message to final itinerary',
    envKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  },
  stripe: {
    enabled: Boolean(getOptionalEnv('VITE_STRIPE_PUBLISHABLE_KEY')),
    label:
      '20% deposit upfront, with the remaining 80% due within 14 days of booking. T&Cs apply and deposits are non-refundable',
    envKeys: ['VITE_STRIPE_PUBLISHABLE_KEY']
  },
  resend: {
    enabled: Boolean(getOptionalEnv('VITE_RESEND_AUDIENCE_ID')),
    label: 'Polished confirmations, follow-ups, and itinerary emails that keep the whole group in the loop',
    envKeys: ['VITE_RESEND_AUDIENCE_ID']
  }
}
