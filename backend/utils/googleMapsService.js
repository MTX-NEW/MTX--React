const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

const client = new Client({});

// Geocode an address to get lat/lng
const geocodeAddress = async (address) => {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

// Calculate distance between two points
const calculateDistance = async (origin, destination) => {
  try {

    if (!origin || !destination) {
   
      return null;
    }
    
    // Get geocode for origin and destination if they are addresses
    let originCoords, destinationCoords;
    
    try {
      // Try to geocode the addresses to get lat/lng
      const originGeocode = await geocodeAddress(origin);
      const destGeocode = await geocodeAddress(destination);
      
      if (!originGeocode || !destGeocode) {
    
        return null;
      }
      
      originCoords = {
        latitude: originGeocode.latitude,
        longitude: originGeocode.longitude
      };
      
      destinationCoords = {
        latitude: destGeocode.latitude,
        longitude: destGeocode.longitude
      };
      

    } catch (geocodeError) {
      console.error("Error geocoding addresses:", geocodeError);
      return null;
    }
    
    // Use Axios to make the Routes API request (client.distancematrix doesn't support the new API)
    const axios = require('axios');
    
    // Construct the request body for Routes API
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: originCoords.latitude,
            longitude: originCoords.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destinationCoords.latitude,
            longitude: destinationCoords.longitude
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "en-US",
      units: "IMPERIAL"
    };
    
    
    // Make the request to the Routes API
    const response = await axios({
      method: 'post',
      url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      data: requestBody
    });
    

    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      // Convert meters to miles
      const distanceInMiles = route.distanceMeters / 1609.34;
      
      // Parse duration string (which is in format like "3600s")
      const durationInSeconds = parseInt(route.duration.replace('s', ''));
      
      const result = {
        distance: {
          value: route.distanceMeters, // in meters
          text: `${distanceInMiles.toFixed(2)} mi` // formatted text
        },
        duration: {
          value: durationInSeconds, // in seconds
          text: `${Math.floor(durationInSeconds / 60)} mins` // formatted text
        }
      };
      
      return result;
    } else {
      console.error("Routes API returned no routes");
      return null;
    }
  } catch (error) {
    console.error('Error calculating distance with Routes API:', error.message);
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data));
    }
    throw error;
  }
};

// Format address from location components
const formatAddress = (location) => {
  let address = location.street_address;
  if (location.building) address += `, ${location.building}`;
  address += `, ${location.city}, ${location.state} ${location.zip}`;
  return address;
};

module.exports = {
  geocodeAddress,
  calculateDistance,
  formatAddress
}; 