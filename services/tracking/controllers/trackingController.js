import redis from '../config/db.js';

const GEOFENCES = {
  toronto: {
    lat: 43.6532,
    lng: -79.3832,
    radius: 0.05
  },
  vancouver: {
    lat: 49.2827,
    lng: -123.1207,
    radius: 0.05
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const checkGeofences = (lat, lng, loadId) => {
  const events = [];

  for (const [name, fence] of Object.entries(GEOFENCES)) {
    const distance = calculateDistance(lat, lng, fence.lat, fence.lng);
    if (distance <= fence.radius * 111) {
      events.push({
        loadId,
        location: name,
        type: 'geofence_entered',
        timestamp: new Date()
      });
    }
  }

  return events;
};

export const updateLocation = async (req, res) => {
  try {
    const { loadId, lat, lng, speed, heading } = req.body;

    if (!loadId || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'loadId, lat and lng are required'
      });
    }

    const locationData = {
      loadId,
      lat,
      lng,
      speed: speed || 0,
      heading: heading || 0,
      timestamp: new Date().toISOString()
    };

    // Store in Redis with 2 hour expiry
    await redis.setex(
      `location:${loadId}`,
      7200,
      JSON.stringify(locationData)
    );

    // Publish to Redis channel for WebSocket fan-out
    await redis.publish(
      'location_updates',
      JSON.stringify(locationData)
    );

    // Check geofences
    const geofenceEvents = checkGeofences(lat, lng, loadId);

    if (geofenceEvents.length > 0) {
      for (const event of geofenceEvents) {
        await redis.publish(
          'geofence_events',
          JSON.stringify(event)
        );
      }
    }

    res.json({
      success: true,
      message: 'Location updated',
      geofenceEvents
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { loadId } = req.params;

    const data = await redis.get(`location:${loadId}`);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No location data found for this load'
      });
    }

    res.json({
      success: true,
      location: JSON.parse(data)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const keys = await redis.keys('location:*');

    if (keys.length === 0) {
      return res.json({
        success: true,
        locations: []
      });
    }

    const locations = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get(key);
        return JSON.parse(data);
      })
    );

    res.json({
      success: true,
      locations
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};