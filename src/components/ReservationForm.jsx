import { useState } from 'react';

export default function ReservationForm({ rides, onCreateReservation }) {
  const [form, setForm] = useState({
    passenger_name: '',
    phone: '',
    ride_id: rides[0]?.id || '',
    seats_requested: 1
  });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'seats_requested' ? Number(value) : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await onCreateReservation(form);
      setMessage('Request submitted as pending.');
      setForm((prev) => ({ ...prev, passenger_name: '', phone: '', seats_requested: 1 }));
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow">
      <h2 className="text-lg font-semibold text-slate-800">Request Seat (Passenger)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required name="passenger_name" placeholder="Passenger Name" value={form.passenger_name} onChange={handleChange} className="rounded-lg border p-2" />
        <input required name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="rounded-lg border p-2" />
        <select required name="ride_id" value={form.ride_id} onChange={handleChange} className="rounded-lg border p-2 sm:col-span-2">
          <option value="">Select Ride</option>
          {rides.map((ride) => (
            <option key={ride.id} value={ride.id}>
              {ride.driver_name} - {ride.city} ({ride.area}) [{ride.availableSeats} seats]
            </option>
          ))}
        </select>
        <input min="1" type="number" required name="seats_requested" value={form.seats_requested} onChange={handleChange} className="rounded-lg border p-2" />
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
      <button className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white">Submit Request</button>
    </form>
  );
}
