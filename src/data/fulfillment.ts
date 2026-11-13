import type { DeliveryZone } from '../types'

// Flat delivery fees per zone. Edit to match INIDA's real rates.
export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'uyo', label: 'Within Uyo', fee: 1500 },
  { id: 'uyo-outskirts', label: 'Uyo Outskirts (Ewet, Use Offot, Nwaniba)', fee: 2000 },
  { id: 'ikot-ekpene', label: 'Ikot Ekpene', fee: 3000 },
  { id: 'eket', label: 'Eket', fee: 3500 },
  { id: 'oron', label: 'Oron', fee: 4000 },
]

// PLACEHOLDER pickup details. Replace with INIDA's real location before launch.
export const PICKUP_LOCATION = {
  name: 'INIDA Pickup Point',
  address: '12 Oron Road, Uyo, Akwa Ibom',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Oron+Road+Uyo+Akwa+Ibom',
  hours: [
    { days: 'Mon – Fri', time: '9:00am – 6:00pm' },
    { days: 'Saturday', time: '10:00am – 4:00pm' },
  ],
}
