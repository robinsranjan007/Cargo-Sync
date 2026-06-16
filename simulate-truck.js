import fetch from 'node-fetch';

const LOAD_ID = '6a31ad0db7ab516c434bca5e';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzFhZDBkYjdhYjUxNmM0MzRiY2E1ZSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoiZGlzcGF0Y2hlciIsImlhdCI6MTc4MTY0MDQ2MiwiZXhwIjoxNzgxNjQxMzYyfQ.FcxBdD3nUs_w4GJUb70tGcFp81zA6z-levpXICtgGFU';

// Route from Toronto to Vancouver — coordinates along the way
const route = [
  { lat: 43.6532, lng: -79.3832, name: 'Toronto, ON' },
  { lat: 43.7315, lng: -79.7624, name: 'Mississauga, ON' },
  { lat: 43.4516, lng: -80.4925, name: 'Kitchener, ON' },
  { lat: 43.0000, lng: -81.2000, name: 'London, ON' },
  { lat: 42.9849, lng: -82.4212, name: 'Sarnia, ON' },
  { lat: 46.4908, lng: -84.3453, name: 'Sault Ste Marie, ON' },
  { lat: 48.3809, lng: -89.2477, name: 'Thunder Bay, ON' },
  { lat: 49.8951, lng: -97.1384, name: 'Winnipeg, MB' },
  { lat: 50.4452, lng: -104.6189, name: 'Regina, SK' },
  { lat: 51.0447, lng: -114.0719, name: 'Calgary, AB' },
  { lat: 51.0486, lng: -115.3572, name: 'Banff, AB' },
  { lat: 50.6745, lng: -120.3273, name: 'Kamloops, BC' },
  { lat: 49.2827, lng: -123.1207, name: 'Vancouver, BC' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateTruck = async () => {
  console.log('🚛 Starting truck simulation — Toronto to Vancouver');
  console.log(`Load ID: ${LOAD_ID}`);
  console.log('-------------------------------------------');

  for (let i = 0; i < route.length; i++) {
    const point = route[i];

    try {
      const response = await fetch('http://localhost:3003/api/tracking/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          loadId: LOAD_ID,
          lat: point.lat,
          lng: point.lng,
          speed: 95,
          heading: 270
        })
      });

      const data = await response.json();

      console.log(`📍 ${point.name}`);
      console.log(`   Lat: ${point.lat} · Lng: ${point.lng}`);

      if (data.geofenceEvents && data.geofenceEvents.length > 0) {
        console.log(`🔔 GEOFENCE TRIGGERED: ${data.geofenceEvents[0].location}`);
      }

      console.log('');

    } catch (error) {
      console.error(`Error at ${point.name}:`, error.message);
    }

    await sleep(2000);
  }

  console.log('✅ Simulation complete — truck arrived in Vancouver');
};

simulateTruck();