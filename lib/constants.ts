export const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Puedo decir frases básicas' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Puedo mantener una conversación' },
  { id: 'advanced', label: 'Advanced', desc: 'Puedo debatir temas complejos' },
] as const

export const PLANS = [
  { slug: 'session', name: '1 Sesión', price: 30, sessions: 1, tag: 'Pruébalo' },
  { slug: 'duo', name: '2 Sesiones', price: 50, sessions: 2, tag: 'Popular' },
  { slug: 'monthly', name: 'Mensual', price: 100, sessions: 4, tag: 'Mejor valor' },
] as const

export const PAYMENT_METHODS = [
  { id: 'yape', label: 'Yape', settingKey: 'yape_number' },
  { id: 'plin', label: 'Plin', settingKey: 'plin_number' },
] as const
