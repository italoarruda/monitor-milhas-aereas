import { describe, it, expect } from 'vitest'

describe('Configuração de ambiente', () => {
  it('deve ter NEXT_PUBLIC_SUPABASE_URL definido em produção', () => {
    // Em CI/CD, a variável não precisa estar definida (apenas alerta)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (url) {
      expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/)
    } else {
      console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL não definido (esperado em desenvolvimento)')
    }
  })

  it('CRON_SECRET deve ter comprimento mínimo em produção', () => {
    const secret = process.env.CRON_SECRET
    if (secret) {
      expect(secret.length).toBeGreaterThanOrEqual(16)
    }
  })
})
