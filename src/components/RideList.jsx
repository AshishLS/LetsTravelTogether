export default function RideList({ rides, onRequestRide }) {
  if (!rides.length) {
    return <p className="rounded-xl bg-white p-4 shadow">No rides available for selected filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {rides.map((ride) => (
        <article
          key={ride.id}
          className={`rounded-xl border p-4 shadow ${ride.isFull ? 'border-red-300 bg-red-50' : 'bg-white'} ${ride.isNearby ? 'ring-2 ring-amber-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{ride.driver_name}</h3>
            <div className="flex gap-2">
              {ride.isNearby && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Nearby</span>}
              {ride.isFull && <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">FULL</span>}
            </div>
          </div>
          <p className="text-sm text-slate-700">{ride.city} • {ride.area}</p>
          <p className="text-sm text-slate-700">Departure: {new Date(ride.departure_time).toLocaleString()}</p>
          <p className="text-sm text-slate-700">Vehicle: {ride.vehicle_type}</p>
          <p className="text-sm text-slate-700">Total Seats: {ride.total_seats}</p>
          <p className="text-sm text-slate-700">Booked Seats: {ride.bookedSeats}</p>
          <p className="text-sm font-semibold text-slate-800">Available Seats: {ride.availableSeats}</p>
          <button
            disabled={ride.isFull}
            onClick={() => onRequestRide(ride.id)}
            className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Request Seat
          </button>
        </article>
      ))}
    </div>
  );
}
