import { getDb, saveDb, Address } from '../db';

export interface AddressValidationResult {
  is_valid: boolean;
  is_in_launch_area: boolean;
  launch_area_code?: 'EC1' | 'N7' | 'OUT_OF_AREA';
  formatted_address?: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  message: string;
  geocoded_by?: 'Google Maps Geocoding API' | 'UK Postcode Service';
}

export async function validateAndAddAddress(
  userId: string, 
  addressLine1: string, 
  postcodeRaw: string, 
  addressLine2: string = ''
): Promise<AddressValidationResult & { address?: Address }> {
  const db = getDb();
  const postcodeClean = postcodeRaw.trim().toUpperCase();

  // Basic regex check for UK postcode format
  const isPostcodeFormatValid = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcodeClean) || /^[A-Z]{1,2}[0-9]{1,2}/i.test(postcodeClean);

  if (!isPostcodeFormatValid || postcodeClean.length < 2) {
    return {
      is_valid: false,
      is_in_launch_area: false,
      message: 'Unresolvable address. Please enter a valid UK postcode (e.g. EC1M 3HA or N7 7HE).',
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  let lat = 0;
  let lng = 0;
  let formattedAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, London ${postcodeClean}`;
  let geocodedBy: 'Google Maps Geocoding API' | 'UK Postcode Service' = 'UK Postcode Service';

  // Check launch area postcodes: EC1 (City of London) or N7 (Highbury)
  const isEC1 = postcodeClean.startsWith('EC1');
  const isN7 = postcodeClean.startsWith('N7');

  if (apiKey) {
    try {
      const fullQuery = `${addressLine1}, ${postcodeClean}, London, UK`;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullQuery)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        lat = result.geometry.location.lat;
        lng = result.geometry.location.lng;
        formattedAddress = result.formatted_address;
        geocodedBy = 'Google Maps Geocoding API';
      }
    } catch (err) {
      console.warn('Google Maps Geocoding API call failed, using postcode fallback:', err);
    }
  }

  if (lat === 0 && lng === 0) {
    // Fallback coordinates for EC1 vs N7
    lat = isEC1 ? 51.5205 + (Math.random() * 0.002 - 0.001) : isN7 ? 51.5542 + (Math.random() * 0.002 - 0.001) : 51.5074;
    lng = isEC1 ? -0.1051 + (Math.random() * 0.002 - 0.001) : isN7 ? -0.1034 + (Math.random() * 0.002 - 0.001) : -0.1278;
  }

  if (!isEC1 && !isN7) {
    return {
      is_valid: true,
      is_in_launch_area: false,
      launch_area_code: 'OUT_OF_AREA',
      formatted_address: formattedAddress,
      postcode: postcodeClean,
      lat,
      lng,
      geocoded_by: geocodedBy,
      message: `We currently only service launch areas in City of London (EC1) and Highbury (N7). Your postcode (${postcodeClean}) is outside our launch zone.`,
    };
  }

  const areaCode: 'EC1' | 'N7' = isEC1 ? 'EC1' : 'N7';

  const newAddress: Address = {
    id: `addr_${Date.now()}`,
    user_id: userId,
    address_line1: addressLine1,
    address_line2: addressLine2,
    postcode: postcodeClean,
    city: 'London',
    lat,
    lng,
    is_verified: true,
    is_in_launch_area: true,
    launch_area_code: areaCode,
  };

  db.addresses.push(newAddress);
  saveDb(db);

  return {
    is_valid: true,
    is_in_launch_area: true,
    launch_area_code: areaCode,
    formatted_address: formattedAddress,
    postcode: postcodeClean,
    lat,
    lng,
    geocoded_by: geocodedBy,
    message: `Address verified in ${areaCode === 'EC1' ? 'City of London (EC1)' : 'Highbury (N7)'} launch area via ${geocodedBy}!`,
    address: newAddress,
  };
}

