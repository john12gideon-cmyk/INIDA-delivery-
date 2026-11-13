import type { CustomerDetails, FulfillmentMethod } from '../types'

export type FieldErrors = Partial<Record<keyof CustomerDetails, string>>

/** Accepts 08012345678, 2348012345678, +234 801 234 5678. */
export function isValidNigerianPhone(value: string): boolean {
  const digits = value.replace(/[\s()-]/g, '')
  return /^(\+?234|0)[789][01]\d{8}$/.test(digits)
}

export function validateCustomer(c: CustomerDetails, fulfillment: FulfillmentMethod): FieldErrors {
  const errors: FieldErrors = {}
  if (c.fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
  if (!isValidNigerianPhone(c.phone)) errors.phone = 'Enter a valid Nigerian WhatsApp number.'
  if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) {
    errors.email = 'Enter a valid email or leave it blank.'
  }
  if (fulfillment === 'delivery') {
    if (!c.zoneId) errors.zoneId = 'Choose a delivery zone.'
    if (c.address.trim().length < 5) errors.address = 'Enter your street address.'
    if (c.landmark.trim().length < 2) errors.landmark = 'Add a nearby landmark so the rider finds you fast.'
  }
  return errors
}
