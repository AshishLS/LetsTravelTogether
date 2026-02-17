import { useMemo, useState } from 'react';

const cities = ['Pune', 'Mumbai', 'Kolhapur'];

export default function AdminPanel({ rides, reservations, onUpdateReservation, onUpdateRide, onDeleteRide }) {
  const [editRide, setEditRide] = useState(null);

  const analytics = useMemo(() => {
    return cities.map((city) => {
      const cityRides = rides.filter((ride) => ride.city === city);
      return {
        city,
        totalRides: cityRides.length,
        totalSeats: cityRides.reduce((sum, ride) => sum + ride.total_seats, 0),
        availableSeats: cityRides.reduce((sum, ride) => sum + ride.availableSeats, 0)
      };
    });
  }, [rides]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">City Analytics</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {analytics.map((cityStats) => (
            <div key={cityStats.city} className="rounded-lg border p-3">
              <p className="font-semibold">{cityStats.city}</p>
              <p>Total rides: {cityStats.totalRides}</p>
              <p>Total seats: {cityStats.totalSeats}</p>
              <p>Available seats: {cityStats.availableSeats}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Reservation Requests</h2>
        <div className="space-y-2">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border p-3 text-sm">
              <p>{reservation.passenger_name} ({reservation.phone}) requested {reservation.seats_requested} seat(s)</p>
              <p>Status: <span className="font-semibold">{reservation.status}</span></p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => onUpdateReservation(reservation.id, 'approved')} className="rounded bg-emerald-600 px-2 py-1 text-white">Approve</button>
                <button onClick={() => onUpdateReservation(reservation.id, 'rejected')} className="rounded bg-red-600 px-2 py-1 text-white">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Manage Rides</h2>
        <div className="space-y-2">
          {rides.map((ride) => (
            <div key={ride.id} className="rounded-lg border p-3 text-sm">
              {editRide === ride.id ? (
                <EditRideForm ride={ride} onSave={onUpdateRide} onCancel={() => setEditRide(null)} onSaved={() => setEditRide(null)} />
              ) : (
                <>
                  <p className="font-semibold">{ride.driver_name} - {ride.city} ({ride.area})</p>
                  <p>{new Date(ride.departure_time).toLocaleString()}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => setEditRide(ride.id)} className="rounded bg-blue-600 px-2 py-1 text-white">Edit</button>
                    <button onClick={() => onDeleteRide(ride.id)} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EditRideForm({ ride, onSave, onCancel, onSaved }) {
  const [form, setForm] = useState({
    area: ride.area,
    city: ride.city,
    vehicle_type: ride.vehicle_type,
    total_seats: ride.total_seats,
    departure_time: ride.departure_time.slice(0, 16)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(ride.id, form);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="w-full rounded border p-2" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
      <select className="w-full rounded border p-2" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}>
        {cities.map((city) => <option key={city}>{city}</option>)}
      </select>
      <input className="w-full rounded border p-2" value={form.vehicle_type} onChange={(e) => setForm((prev) => ({ ...prev, vehicle_type: e.target.value }))} />
      <input className="w-full rounded border p-2" type="number" min="1" value={form.total_seats} onChange={(e) => setForm((prev) => ({ ...prev, total_seats: Number(e.target.value) }))} />
      <input className="w-full rounded border p-2" type="datetime-local" value={form.departure_time} onChange={(e) => setForm((prev) => ({ ...prev, departure_time: e.target.value }))} />
      <div className="flex gap-2">
        <button className="rounded bg-emerald-600 px-2 py-1 text-white">Save</button>
        <button type="button" onClick={onCancel} className="rounded bg-slate-600 px-2 py-1 text-white">Cancel</button>
      </div>
    </form>
  );
}
