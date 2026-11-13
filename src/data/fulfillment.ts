// Delivery zones/fees live in the shared catalog so the server charges identically.
export { DELIVERY_ZONES } from '../../supabase/functions/_shared/catalog'

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
