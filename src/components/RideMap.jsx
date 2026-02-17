import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function RideMap({ rides }) {
  const center = rides[0] ? [rides[0].latitude, rides[0].longitude] : [18.5204, 73.8567];

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border bg-white shadow">
      <MapContainer center={center} zoom={8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {rides.map((ride) => (
          <Marker
            key={ride.id}
            position={[ride.latitude, ride.longitude]}
            icon={ride.availableSeats > 0 ? greenIcon : redIcon}
          >
            <Popup>
              <p className="font-semibold">{ride.driver_name}</p>
              <p>{ride.city} - {ride.area}</p>
              <p>{new Date(ride.departure_time).toLocaleString()}</p>
              <p>{ride.availableSeats > 0 ? `${ride.availableSeats} seats available` : 'FULL'}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
