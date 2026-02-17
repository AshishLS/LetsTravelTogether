import { useState } from 'react';
import { geocodeLocation } from '../utils/geo';

const CITY_OPTIONS = ['Pune', 'Mumbai', 'Kolhapur'];

const initialForm = {
  driver_name: '',
  phone: '',
  city: 'Pune',
  area: '',
  vehicle_type: '5-seater',
  total_seats: 1,
  departure_time: ''
};

export default function AddRideForm({ onCreateRide }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'total_seats' ? Number(value) : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { latitude, longitude } = await geocodeLocation(form.area, form.city);
      await onCreateRide({
        ...form,
        latitude,
        longitude,
        total_seats: Number(form.total_seats)
      });
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow">
      <h2 className="text-lg font-semibold text-slate-800">Add Ride (Driver)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required name="driver_name" value={form.driver_name} onChange={handleChange} placeholder="Driver Name" className="rounded-lg border p-2" />
        <input required name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="rounded-lg border p-2" />
        <select name="city" value={form.city} onChange={handleChange} className="rounded-lg border p-2">
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <input required name="area" value={form.area} onChange={handleChange} placeholder="Area" className="rounded-lg border p-2" />
        <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="rounded-lg border p-2">
          <option value="5-seater">5-seater</option>
          <option value="7-seater">7-seater</option>
          <option value="Other">Other</option>
        </select>
        <input required min="1" type="number" name="total_seats" value={form.total_seats} onChange={handleChange} placeholder="Total Seats" className="rounded-lg border p-2" />
        <input required type="datetime-local" name="departure_time" value={form.departure_time} onChange={handleChange} className="rounded-lg border p-2 sm:col-span-2" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-70">
        {submitting ? 'Saving...' : 'Create Ride'}
      </button>
    </form>
  );
}
