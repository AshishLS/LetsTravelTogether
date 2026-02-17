import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AddRideForm from './components/AddRideForm';
import AdminPanel from './components/AdminPanel';
import ReservationForm from './components/ReservationForm';
import RideList from './components/RideList';
import RideMap from './components/RideMap';
import { ADMIN_PASSWORD, supabase } from './lib/supabaseClient';
import { haversineDistanceKm } from './utils/geo';
import { withSeatStats } from './utils/rideCalculations';

function useRideData() {
  const [rides, setRides] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [{ data: ridesData, error: ridesError }, { data: reservationData, error: reservationError }] = await Promise.all([
      supabase.from('rides').select('*'),
      supabase.from('reservations').select('*')
    ]);

    if (ridesError || reservationError) {
      setError(ridesError?.message || reservationError?.message || 'Failed to load data.');
      return;
    }

    setRides(ridesData || []);
    setReservations(reservationData || []);
  };

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 10000);
    return () => clearInterval(timer);
  }, []);

  return { rides, reservations, setError, fetchAll, error };
}

function Dashboard() {
  const { rides, reservations, fetchAll, setError, error } = useRideData();
  const [viewMode, setViewMode] = useState('list');
  const [cityFilter, setCityFilter] = useState('All');
  const [departureFilter, setDepartureFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRideId, setSelectedRideId] = useState('');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => null
    );
  }, []);

  const enrichedRides = useMemo(() => {
    const base = withSeatStats(rides, reservations).map((ride) => {
      if (!userLocation) return { ...ride, isNearby: false, distanceKm: null };
      const distanceKm = haversineDistanceKm(userLocation.lat, userLocation.lng, ride.latitude, ride.longitude);
      return {
        ...ride,
        distanceKm,
        isNearby: distanceKm <= 10
      };
    });

    return base.filter((ride) => {
      if (cityFilter !== 'All' && ride.city !== cityFilter) return false;
      if (departureFilter && new Date(ride.departure_time) < new Date(departureFilter)) return false;
      if (availableOnly && ride.availableSeats <= 0) return false;
      if (nearbyOnly && !ride.isNearby) return false;
      return true;
    });
  }, [rides, reservations, userLocation, cityFilter, departureFilter, availableOnly, nearbyOnly]);

  const createRide = async (payload) => {
    const { error: createError } = await supabase.from('rides').insert([{ ...payload }]);
    if (createError) throw new Error(createError.message);
    await fetchAll();
  };

  const createReservation = async (payload) => {
    const ride = withSeatStats(rides, reservations).find((item) => item.id === payload.ride_id);
    if (!ride) throw new Error('Invalid ride selected.');
    if (payload.seats_requested > ride.availableSeats) throw new Error('Not enough seats available.');

    const duplicate = reservations.find(
      (reservation) => reservation.ride_id === payload.ride_id && reservation.phone === payload.phone
    );
    if (duplicate) throw new Error('You have already requested this ride with this phone number.');

    const { error: reservationError } = await supabase.from('reservations').insert([
      {
        ...payload,
        status: 'pending'
      }
    ]);
    if (reservationError) throw new Error(reservationError.message);
    await fetchAll();
  };

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-3 sm:p-6">
      <header className="rounded-xl bg-slate-900 p-4 text-white shadow">
        <h1 className="text-2xl font-bold">DSN Ride Pool Dashboard</h1>
        <p className="text-sm text-slate-200">Coordinate rides for Pune, Mumbai, and Kolhapur travelers.</p>
      </header>

      {error && <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <AddRideForm onCreateRide={createRide} />
        <ReservationForm rides={withSeatStats(rides, reservations)} onCreateReservation={createReservation} />
      </div>

      <section className="rounded-xl bg-white p-4 shadow">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {['All', 'Pune', 'Mumbai', 'Kolhapur'].map((city) => (
            <button key={city} onClick={() => setCityFilter(city)} className={`rounded-full px-3 py-1 text-sm ${cityFilter === city ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
              {city}
            </button>
          ))}
          <input type="datetime-local" value={departureFilter} onChange={(e) => setDepartureFilter(e.target.value)} className="rounded-lg border p-2 text-sm" />
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} /> Available {'>'} 0</label>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={nearbyOnly} onChange={(e) => setNearbyOnly(e.target.checked)} /> Show Only Nearby Rides</label>
          <button onClick={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))} className="ml-auto rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">{viewMode === 'list' ? 'Switch to Map' : 'Switch to List'}</button>
        </div>

        {viewMode === 'list' ? (
          <RideList rides={enrichedRides} onRequestRide={(rideId) => setSelectedRideId(rideId)} />
        ) : (
          <RideMap rides={enrichedRides} />
        )}
      </section>

      {selectedRideId && (
        <div className="fixed inset-x-4 bottom-4 rounded-lg bg-white p-3 shadow-lg">
          <p className="text-sm">Selected ride for request: <span className="font-semibold">{selectedRideId}</span>. Fill the Request Seat form above.</p>
          <button onClick={() => setSelectedRideId('')} className="mt-2 rounded bg-slate-700 px-3 py-1 text-xs text-white">Close</button>
        </div>
      )}
    </main>
  );
}

function AdminRoute() {
  const { rides, reservations, fetchAll } = useRideData();
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);

  const handleAuth = (event) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthorized(true);
    else alert('Invalid admin password');
  };

  const updateReservation = async (id, status) => {
    if (status === 'approved') {
      const reservation = reservations.find((item) => item.id === id);
      const ride = withSeatStats(rides, reservations).find((item) => item.id === reservation.ride_id);
      if (!ride || reservation.seats_requested > ride.availableSeats) {
        alert('Cannot approve. Not enough seats available.');
        return;
      }
    }
    const { error } = await supabase.rpc('admin_update_reservation_status', {
      p_reservation_id: id,
      p_status: status,
      p_admin_password: ADMIN_PASSWORD
    });
    if (error) {
      alert(error.message);
      return;
    }
    await fetchAll();
  };

  const updateRide = async (id, payload) => {
    const { error } = await supabase.rpc('admin_update_ride', {
      p_ride_id: id,
      p_area: payload.area,
      p_city: payload.city,
      p_vehicle_type: payload.vehicle_type,
      p_total_seats: payload.total_seats,
      p_departure_time: payload.departure_time,
      p_admin_password: ADMIN_PASSWORD
    });
    if (error) {
      alert(error.message);
      return;
    }
    await fetchAll();
  };

  const deleteRide = async (id) => {
    const { error } = await supabase.rpc('admin_delete_ride', {
      p_ride_id: id,
      p_admin_password: ADMIN_PASSWORD
    });
    if (error) {
      alert(error.message);
      return;
    }
    await fetchAll();
  };

  if (!authorized) {
    return (
      <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-5 shadow">
        <h1 className="mb-3 text-xl font-semibold">Admin Access</h1>
        <form onSubmit={handleAuth} className="space-y-3">
          <input type="password" placeholder="Enter Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border p-2" />
          <button className="w-full rounded-lg bg-slate-900 py-2 text-white">Enter /admin</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
      <AdminPanel
        rides={withSeatStats(rides, reservations)}
        reservations={reservations}
        onUpdateReservation={updateReservation}
        onUpdateRide={updateRide}
        onDeleteRide={deleteRide}
      />
    </main>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== '/admin' && (
        <div className="p-2 text-center text-sm">
          <a className="text-blue-700 underline" href="/admin">Go to Admin Panel</a>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
