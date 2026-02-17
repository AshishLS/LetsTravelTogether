export function withSeatStats(rides, reservations) {
  return rides
    .map((ride) => {
      const approvedSeats = reservations
        .filter((reservation) => reservation.ride_id === ride.id && reservation.status === 'approved')
        .reduce((sum, reservation) => sum + reservation.seats_requested, 0);

      const availableSeats = Math.max(ride.total_seats - approvedSeats, 0);
      return {
        ...ride,
        bookedSeats: approvedSeats,
        availableSeats,
        isFull: availableSeats === 0
      };
    })
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
}
