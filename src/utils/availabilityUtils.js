// Time slot utility functions

export const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

/**
 * Checks if a proposed booking overlaps with any existing confirmed booking.
 * For classrooms, checks overlap only if the specific roomNumber matches.
 */
export function checkBookingConflict(newBooking, existingBookings) {
  const { venueId, roomNumber, date, startTime, endTime, id: excludeId } = newBooking;

  const sameDayBookings = existingBookings.filter(
    (b) => b.venueId === venueId && 
           b.date === date && 
           b.id !== excludeId && 
           b.status !== 'cancelled' &&
           b.status !== 'rejected'
  );

  for (const booking of sameDayBookings) {
    // For Classrooms: Only conflict if same specific room number is targeted
    if (venueId === 'classrooms' && roomNumber && booking.roomNumber) {
      if (roomNumber.trim().toLowerCase() !== booking.roomNumber.trim().toLowerCase()) {
        continue; // Different room in classrooms -> no conflict!
      }
    }

    const existingStart = booking.startTime;
    const existingEnd = booking.endTime;

    // Overlap condition: start < existingEnd AND end > existingStart
    if (startTime < existingEnd && endTime > existingStart) {
      return {
        hasConflict: true,
        conflictingBooking: booking
      };
    }
  }

  return { hasConflict: false, conflictingBooking: null };
}

/**
 * Calculates venue utilization stats
 */
export function calculateVenueStats(venues, bookings) {
  const totalVenues = venues.length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  // Find top utilized venue
  const venueCounts = {};
  bookings.forEach(b => {
    if (b.status === 'confirmed' || b.status === 'approved') {
      venueCounts[b.venueId] = (venueCounts[b.venueId] || 0) + 1;
    }
  });

  let topVenueId = null;
  let maxCount = -1;
  Object.entries(venueCounts).forEach(([vid, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topVenueId = vid;
    }
  });

  const topVenue = venues.find(v => v.id === topVenueId) || venues[0];

  return {
    totalVenues,
    totalBookings: bookings.length,
    activeBookings,
    cancelledBookings,
    topVenueName: topVenue ? topVenue.name : 'Internal Auditorium',
    utilizationRate: Math.min(Math.round((activeBookings / (totalVenues * 3)) * 100), 100) || 58
  };
}

/**
 * Format HH:MM to 12-Hour display format
 */
export function formatTime12H(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Format YYYY-MM-DD to friendly string
 */
export function formatDateFriendly(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
