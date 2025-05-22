const twilio = require('twilio');
require('dotenv').config();

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials are available
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not found in environment variables. SMS functionality will not work.');
}

/**
 * Format phone number to E.164 format required by Twilio
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Properly formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a US number (assuming US for this application)
  if (cleaned.length === 10) {
    // Add US country code
    return '+1' + cleaned;
  } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    // Number already has US country code
    return '+' + cleaned;
  } else if (cleaned.length > 11) {
    // Might be an international number, keep as is but add + if needed
    return cleaned.charAt(0) === '+' ? cleaned : '+' + cleaned;
  } else {
    // Invalid number format
    console.warn(`Invalid phone number format: ${phoneNumber}`);
    return '+1' + cleaned; // Still try to send with the given number
  }
};

/**
 * Send SMS notification to a driver when assigned to a trip
 * Simplified to only require driver ID, name and phone
 * @param {Object} driver - Driver data with minimal info (id, first_name, phone)
 * @param {Object} tripInfo - Information about the trip
 * @returns {Promise} - Promise that resolves with message data or rejects with error
 */
const sendDriverAssignmentSMS = async (driver, tripInfo) => {
  if (!client) {
    throw new Error('Twilio client not initialized. Check your environment variables.');
  }

  if (!driver || !driver.phone) {
    throw new Error('Driver phone number is required to send SMS.');
  }

  if (!twilioPhone) {
    throw new Error('Twilio phone number not configured in environment variables.');
  }

  // Extract just the info we need and log it
  const driverInfo = {
    id: driver.id,
    name: driver.first_name,
    phone: driver.phone
  };
  
  console.log(`Sending SMS to driver: ${driverInfo.id} - ${driverInfo.name}`);
  
  try {
    // Format the phone number properly
    const formattedPhone = formatPhoneNumber(driverInfo.phone);
    console.log(`Sending SMS to driver number: ${formattedPhone}`);
    
    // Format the message
    const message = `Hello ${driverInfo.name}, you have been assigned to a trip on ${tripInfo.date} at ${tripInfo.time}. Pickup at: ${tripInfo.pickup_location}, Dropoff at: ${tripInfo.dropoff_location}. Please log in to the system for more details.`;

    // Send the message
    const sentMessage = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log(`SMS sent to driver ${driverInfo.id}. Message SID: ${sentMessage.sid}`);
    return sentMessage;
  } catch (error) {
    console.error('Error sending SMS to driver:', error);
    throw error;
  }
};

module.exports = {
  sendDriverAssignmentSMS,
  formatPhoneNumber
}; 