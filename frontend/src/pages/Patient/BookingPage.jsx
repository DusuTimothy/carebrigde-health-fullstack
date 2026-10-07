import React from 'react';
import BookAppointment from '../../components/portal/BookAppointment.jsx';
import { useSearchParams } from 'react-router-dom';

/**
 * Booking route. If the ?guest=1 flag is present (public CTAs), render the
 * standalone guest flow. Otherwise it's the authenticated patient flow and is
 * wrapped by the portal layout via the router.
 */
export default function BookingPage() {
  const [params] = useSearchParams();
  const guest = params.get('guest') === '1';

  return (
    <div className={guest ? 'mx-auto w-full max-w-5xl px-4 py-8 md:px-6' : ''}>
      <BookAppointment guestMode={guest} />
    </div>
  );
}