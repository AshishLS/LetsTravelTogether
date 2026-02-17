export async function geocodeLocation(area, city) {
  const query = encodeURIComponent(`${area}, ${city}, Maharashtra, India`);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
  if (!response.ok) {
    throw new Error('Unable to geocode location.');
  }
  const data = await response.json();
  if (!data.length) {
    throw new Error('No coordinates found for this location.');
  }
  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon)
  };
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
