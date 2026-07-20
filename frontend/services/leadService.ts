import { useApiClient } from './http'

export interface LeadInput {
  phone: string
  name?: string
  message?: string
  plan?: string
  kind?: 'contact' | 'upgrade'
  website?: string // honeypot
}

export const leadService = {
  // POST /api/v1/public/lead
  submit(input: LeadInput): Promise<{ ok: boolean }> {
    return useApiClient().post<{ ok: boolean }>('/public/lead', input)
  },
}
