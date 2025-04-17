/**
 * Arizona city classifications for urban and rural areas
 * Used to automatically set building type in member location forms
 */

const arizonaCityClassification = {
  "Apache Junction": "Urban",
  "Avondale": "Urban",
  "Benson": "Urban",
  "Bisbee": "Urban",
  "Buckeye": "Urban",
  "Bullhead City": "Urban",
  "Camp Verde": "Urban",
  "Carefree": "Urban",
  "Casa Grande": "Urban",
  "Cave Creek": "Urban",
  "Chandler": "Urban",
  "Chino Valley": "Urban",
  "Clarkdale": "Urban",
  "Clifton": "Urban",
  "Colorado City": "Rural",
  "Coolidge": "Urban",
  "Cottonwood": "Urban",
  "Dewey-Humboldt": "Urban",
  "Douglas": "Urban",
  "Duncan": "Rural",
  "Eagar": "Urban",
  "El Mirage": "Urban",
  "Eloy": "Urban",
  "Flagstaff": "Urban",
  "Florence": "Urban",
  "Fountain Hills": "Urban",
  "Fredonia": "Rural",
  "Gila Bend": "Rural",
  "Gilbert": "Urban",
  "Glendale": "Urban",
  "Globe": "Urban",
  "Goodyear": "Urban",
  "Guadalupe": "Urban",
  "Hayden": "Rural",
  "Holbrook": "Urban",
  "Huachuca City": "Rural",
  "Jerome": "Rural",
  "Kearny": "Rural",
  "Kingman": "Urban",
  "Lake Havasu City": "Urban",
  "Litchfield Park": "Urban",
  "Mammoth": "Rural",
  "Marana": "Urban",
  "Maricopa": "Urban",
  "Mesa": "Urban",
  "Miami": "Rural",
  "Nogales": "Urban",
  "Oro Valley": "Urban",
  "Page": "Urban",
  "Paradise Valley": "Urban",
  "Parker": "Urban",
  "Patagonia": "Rural",
  "Payson": "Urban",
  "Peoria": "Urban",
  "Phoenix": "Urban",
  "Pima": "Urban",
  "Pinetop-Lakeside": "Urban",
  "Prescott": "Urban",
  "Prescott Valley": "Urban",
  "Quartzsite": "Rural",
  "Queen Creek": "Urban",
  "Safford": "Urban",
  "Sahuarita": "Urban",
  "San Luis": "Urban",
  "Scottsdale": "Urban",
  "Sedona": "Urban",
  "Show Low": "Urban",
  "Sierra Vista": "Urban",
  "Snowflake": "Urban",
  "Somerton": "Urban",
  "South Tucson": "Urban",
  "Springerville": "Rural",
  "St. Johns": "Urban",
  "Star Valley": "Rural",
  "Superior": "Rural",
  "Surprise": "Urban",
  "Taylor": "Urban",
  "Tempe": "Urban",
  "Thatcher": "Urban",
  "Tolleson": "Urban",
  "Tombstone": "Rural",
  "Tucson": "Urban",
  "Tusayan": "Rural",
  "Wellton": "Rural",
  "Wickenburg": "Urban",
  "Willcox": "Urban",
  "Williams": "Urban",
  "Winkelman": "Rural",
  "Winslow": "Urban",
  "Youngtown": "Urban",
  "Yuma": "Urban"
};

/**
 * Get the classification (Urban or Rural) for a given city
 * @param {string} city - The name of the city
 * @returns {string} - Returns "Urban" or "Rural" based on the city, or null if city not found
 */
export const getCityClassification = (city) => {
  // Normalize the city name by trimming and converting to title case
  const normalizedCity = city?.trim();
  
  if (!normalizedCity) return null;
  
  // Check for exact match first
  if (arizonaCityClassification[normalizedCity]) {
    return arizonaCityClassification[normalizedCity];
  }
  
  // Try case-insensitive match
  const cityKey = Object.keys(arizonaCityClassification).find(
    key => key.toLowerCase() === normalizedCity.toLowerCase()
  );
  
  return cityKey ? arizonaCityClassification[cityKey] : null;
};

export default arizonaCityClassification; 