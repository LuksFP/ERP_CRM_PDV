export function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  let pos = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i] ?? '0') * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits[12] ?? '0')) return false

  sum = 0
  pos = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i] ?? '0') * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === parseInt(digits[13] ?? '0')
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i] ?? '0') * (10 - i)
  let result = (sum * 10) % 11
  if (result === 10 || result === 11) result = 0
  if (result !== parseInt(digits[9] ?? '0')) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i] ?? '0') * (11 - i)
  result = (sum * 10) % 11
  if (result === 10 || result === 11) result = 0
  return result === parseInt(digits[10] ?? '0')
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-')
}
