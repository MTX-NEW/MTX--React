/**
 * Arizona city classifications for urban and rural areas
 * Used to automatically set building type in member location forms
 */

const arizonaCityClassification = {
  "Apache Junction": "Urban",
  "Avondale": "Rural",
  "Benson": "Rural",
  "Bisbee": "Rural",
  "Buckeye": "Urban",
  "Bullhead City": "Rural",
  "Camp Verde": "Rural",
  "Carefree": "Urban",
  "Casa Grande": "Urban",
  "Cave Creek": "Rural",
  "Chandler": "Urban",
  "Chino Valley": "Rural",
  "Clarkdale": "Rural",
  "Clifton": "Rural",
  "Colorado City": "Rural",
  "Coolidge": "Rural",
  "Cottonwood": "Rural",
  "Dewey-Humboldt": "Rural",
  "Douglas": "Rural",
  "Duncan": "Rural",
  "Eagar": "Rural",
  "El Mirage": "Rural",
  "Eloy": "Rural",
  "Flagstaff": "Rural",
  "Florence": "Rural",
  "Fountain Hills": "Urban",
  "Fredonia": "Rural",
  "Gila Bend": "Rural",
  "Gilbert": "Urban",
  "Glendale": "Urban",
  "Globe": "Rural",
  "Goodyear": "Urban",
  "Guadalupe": "Rural",
  "Hayden": "Rural",
  "Holbrook": "Rural",
  "Huachuca City": "Rural",
  "Jerome": "Rural",
  "Kearny": "Rural",
  "Kingman": "Rural",
  "Lake Havasu City": "Rural",
  "Litchfield Park": "Urban",
  "Mammoth": "Rural",
  "Marana": "Rural",
  "Maricopa": "Rural",
  "Mesa": "Urban",
  "Miami": "Rural",
  "Nogales": "Rural",
  "Oro Valley": "Rural",
  "Page": "Rural",
  "Paradise Valley": "Urban",
  "Parker": "Rural",
  "Patagonia": "Rural",
  "Payson": "Rural",
  "Peoria": "Urban",
  "Phoenix": "Urban",
  "Pima": "Rural",
  "Pinetop-Lakeside": "Rural",
  "Prescott": "Rural",
  "Prescott Valley": "Rural",
  "Quartzsite": "Rural",
  "Queen Creek": "Rural",
  "Safford": "Rural",
  "Sahuarita": "Rural",
  "San Luis": "Rural",
  "Scottsdale": "Urban",
  "Sedona": "Rural",
  "Show Low": "Rural",
  "Sierra Vista": "Rural",
  "Snowflake": "Rural",
  "Somerton": "Rural",
  "South Tucson": "Rural",
  "Springerville": "Rural",
  "St. Johns": "Rural",
  "Star Valley": "Rural",
  "Superior": "Rural",
  "Surprise": "Urban",
  "Taylor": "Rural",
  "Tempe": "Urban",
  "Thatcher": "Rural",
  "Tolleson": "Rural",
  "Tombstone": "Rural",
  "Tucson": "Urban",
  "Tusayan": "Rural",
  "Wellton": "Rural",
  "Wickenburg": "Urban",
  "Willcox": "Rural",
  "Williams": "Rural",
  "Winkelman": "Rural",
  "Winslow": "Rural",
  "Youngtown": "Urban",
  "Yuma": "Urban",
  "Arizona": "Urban",
  "Anthem": "Urban",
  "Sun City": "Urban"
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