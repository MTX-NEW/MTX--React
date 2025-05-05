# Med Trans Express

A comprehensive application for managing medical transportation services.

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL (v8 or higher)

### Initial Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd mtx
   ```

2. Set up environment variables
   ```
   npm run setup
   ```
   This will create a single `.env` file in the root directory with all necessary configuration. You may need to modify this file with your specific settings.

3. Install dependencies
   ```
   npm run install-all
   ```

4. Create the database
   ```
   mysql -u root -p
   ```
   
   In MySQL shell:
   ```sql
   CREATE DATABASE mtx;
   EXIT;
   ```

5. Import the database schema (optional if you want to start with sample data)
   ```
   mysql -u root -p mtx < mtx.sql
   ```

### Running the Application

Start both frontend and backend with a single command:
```
npm run dev
```

This will start:
- Backend API server at http://localhost:5000
- Frontend development server at http://localhost:3000

### Available Commands

- `npm run setup` - Set up environment file
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server (backend only) 


Legs after processing: [
  {
    "pickup_odometer": null,
    "dropoff_odometer": null,
    "leg_distance": null,
    "leg_id": 122,
    "trip_id": 97,
    "driver_id": 11,
    "status": "Assigned",
    "pickup_location": 32727,
    "dropoff_location": 93679,
    "scheduled_pickup": "04:00",
    "actual_pickup": null,
    "scheduled_dropoff": "04:15",
    "actual_dropoff": null,
    "sequence": 1,
    "created_at": "2025-05-01T17:50:27.000Z",
    "updated_at": "2025-05-01T17:51:23.000Z",
    "driver": {
      "id": 11,
      "first_name": "jemmy",
      "last_name": "Macias"
    },
    "pickupLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 32727,
      "street_address": "1035 E JEFFERSON ST",
      "building": "",
      "building_type": "",
      "city": "Phoenix",
      "state": "AZ",
      "zip": "85034",
      "phone": "",
      "location_type": "Urban",
      "recipient_default": false,
      "created_at": "2025-05-01T15:57:38.000Z",
      "updated_at": "2025-05-01T15:57:38.000Z"
    },
    "dropoffLocation": {
      "latitude": 33.398556,
      "longitude": -111.845156,
      "location_id": 93679,
      "street_address": "628 W EMELITA AVE",
      "building": "",
      "building_type": "",
      "city": "Mesa",
      "state": "AZ",
      "zip": "85210",
      "phone": "",
      "location_type": "Urban",
      "recipient_default": false,
      "created_at": "2025-05-01T16:00:26.000Z",
      "updated_at": "2025-05-01T16:00:26.000Z"
    }
  }
]
tripFormUtils.js:327 Final processed trip data: {
  "total_distance": 0,
  "trip_id": 97,
  "member_id": 185,
  "trip_type": "one_way",
  "created_by": 70,
  "schedule_type": "Once",
  "schedule_days": null,
  "start_date": "2025-05-01",
  "end_date": "2025-05-01",
  "created_at": "2025-05-01T17:50:27.000Z",
  "updated_at": "2025-05-01T17:51:23.000Z",
  "TripMember": {
    "member_id": 185,
    "first_name": "michael",
    "last_name": "martinez",
    "program_id": 1,
    "ahcccs_id": "A06960079",
    "insurance_expiry": "0000-00-00",
    "birth_date": "1986-05-10",
    "phone": "480-834-6415",
    "pickup_location": 29611,
    "dropoff_location": 32727,
    "gender": "Male",
    "notes": "",
    "signature": "",
    "created_at": "2025-05-01T15:45:20.000Z",
    "updated_at": "2025-05-01T16:17:16.000Z",
    "Program": {
      "program_id": 1,
      "program_name": "Mercy Care",
      "company_id": 1,
      "company_name": "Atena",
      "address": "123 Main St",
      "city": "Chandler",
      "state": "AZ",
      "postal_code": "10001",
      "phone": "4803708512",
      "created_at": "2025-01-31T22:46:46.000Z",
      "updated_at": "2025-05-01T16:10:27.000Z"
    },
    "memberPickupLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 29611,
      "street_address": "1052 E INDIGO ST",
      "city": "Mesa",
      "state": "AZ",
      "zip": "85203",
      "phone": ""
    },
    "memberDropoffLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 32727,
      "street_address": "1035 E JEFFERSON ST",
      "city": "Phoenix",
      "state": "AZ",
      "zip": "85034",
      "phone": ""
    }
  },
  "creator": {
    "id": 70,
    "first_name": "Owner",
    "last_name": "Tester"
  },
  "legs": [
    {
      "pickup_odometer": null,
      "dropoff_odometer": null,
      "leg_distance": null,
      "leg_id": 122,
      "trip_id": 97,
      "driver_id": 11,
      "status": "Assigned",
      "pickup_location": 32727,
      "dropoff_location": 93679,
      "scheduled_pickup": "04:00",
      "actual_pickup": null,
      "scheduled_dropoff": "04:15",
      "actual_dropoff": null,
      "sequence": 1,
      "created_at": "2025-05-01T17:50:27.000Z",
      "updated_at": "2025-05-01T17:51:23.000Z",
      "driver": {
        "id": 11,
        "first_name": "jemmy",
        "last_name": "Macias"
      },
      "pickupLocation": {
        "latitude": 0,
        "longitude": 0,
        "location_id": 32727,
        "street_address": "1035 E JEFFERSON ST",
        "building": "",
        "building_type": "",
        "city": "Phoenix",
        "state": "AZ",
        "zip": "85034",
        "phone": "",
        "location_type": "Urban",
        "recipient_default": false,
        "created_at": "2025-05-01T15:57:38.000Z",
        "updated_at": "2025-05-01T15:57:38.000Z"
      },
      "dropoffLocation": {
        "latitude": 33.398556,
        "longitude": -111.845156,
        "location_id": 93679,
        "street_address": "628 W EMELITA AVE",
        "building": "",
        "building_type": "",
        "city": "Mesa",
        "state": "AZ",
        "zip": "85210",
        "phone": "",
        "location_type": "Urban",
        "recipient_default": false,
        "created_at": "2025-05-01T16:00:26.000Z",
        "updated_at": "2025-05-01T16:00:26.000Z"
      }
    }
  ],
  "is_one_way": true,
  "special_instructions": {
    "mobility_type": "Ambulatory"
  },
  "client_requirements": [
    {
      "value": "car_seat"
    },
    {
      "value": "call_first"
    },
    {
      "value": "knock"
    }
  ],
  "vehicle_type": [
    {
      "value": "van"
    },
    {
      "value": "sedan"
    }
  ],
  "program_id": 1,
  "company_id": ""
}




Original trip data: {
  "total_distance": 0,
  "trip_id": 97,
  "member_id": 185,
  "trip_type": "Standard",
  "created_by": 70,
  "schedule_type": "Once",
  "schedule_days": null,
  "start_date": "2025-05-01",
  "end_date": "2025-05-01",
  "created_at": "2025-05-01T17:50:27.000Z",
  "updated_at": "2025-05-01T17:51:23.000Z",
  "TripMember": {
    "member_id": 185,
    "first_name": "michael",
    "last_name": "martinez",
    "program_id": 1,
    "ahcccs_id": "A06960079",
    "insurance_expiry": "0000-00-00",
    "birth_date": "1986-05-10",
    "phone": "480-834-6415",
    "pickup_location": 29611,
    "dropoff_location": 32727,
    "gender": "Male",
    "notes": "",
    "signature": "",
    "created_at": "2025-05-01T15:45:20.000Z",
    "updated_at": "2025-05-01T16:17:16.000Z",
    "Program": {
      "program_id": 1,
      "program_name": "Mercy Care",
      "company_id": 1,
      "company_name": "Atena",
      "address": "123 Main St",
      "city": "Chandler",
      "state": "AZ",
      "postal_code": "10001",
      "phone": "4803708512",
      "created_at": "2025-01-31T22:46:46.000Z",
      "updated_at": "2025-05-01T16:10:27.000Z"
    },
    "memberPickupLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 29611,
      "street_address": "1052 E INDIGO ST",
      "city": "Mesa",
      "state": "AZ",
      "zip": "85203",
      "phone": ""
    },
    "memberDropoffLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 32727,
      "street_address": "1035 E JEFFERSON ST",
      "city": "Phoenix",
      "state": "AZ",
      "zip": "85034",
      "phone": ""
    }
  },
  "creator": {
    "id": 70,
    "first_name": "Owner",
    "last_name": "Tester"
  },
  "specialInstructions": {
    "instruction_id": 76,
    "trip_id": 97,
    "mobility_type": "Ambulatory",
    "rides_alone": false,
    "spanish_speaking": false,
    "males_only": false,
    "females_only": false,
    "special_assist": false,
    "pickup_time_exact": false,
    "stay_with_client": false,
    "car_seat": true,
    "extra_person": false,
    "call_first": true,
    "knock": true,
    "van": true,
    "sedan": true,
    "created_at": "2025-05-01T17:50:27.000Z",
    "updated_at": "2025-05-01T17:50:27.000Z"
  },
  "legs": [
    {
      "pickup_odometer": null,
      "dropoff_odometer": null,
      "leg_distance": null,
      "leg_id": 122,
      "trip_id": 97,
      "driver_id": 11,
      "status": "Assigned",
      "pickup_location": 32727,
      "dropoff_location": 93679,
      "scheduled_pickup": "04:00:00",
      "actual_pickup": null,
      "scheduled_dropoff": "04:15:00",
      "actual_dropoff": null,
      "sequence": 1,
      "created_at": "2025-05-01T17:50:27.000Z",
      "updated_at": "2025-05-01T17:51:23.000Z",
      "driver": {
        "id": 11,
        "first_name": "jemmy",
        "last_name": "Macias"
      },
      "pickupLocation": {
        "latitude": 0,
        "longitude": 0,
        "location_id": 32727,
        "street_address": "1035 E JEFFERSON ST",
        "building": "",
        "building_type": "",
        "city": "Phoenix",
        "state": "AZ",
        "zip": "85034",
        "phone": "",
        "location_type": "Urban",
        "recipient_default": false,
        "created_at": "2025-05-01T15:57:38.000Z",
        "updated_at": "2025-05-01T15:57:38.000Z"
      },
      "dropoffLocation": {
        "latitude": 33.398556,
        "longitude": -111.845156,
        "location_id": 93679,
        "street_address": "628 W EMELITA AVE",
        "building": "",
        "building_type": "",
        "city": "Mesa",
        "state": "AZ",
        "zip": "85210",
        "phone": "",
        "location_type": "Urban",
        "recipient_default": false,
        "created_at": "2025-05-01T16:00:26.000Z",
        "updated_at": "2025-05-01T16:00:26.000Z"
      }
    }
  ]
}
tripFormUtils.js:230 Legs before processing: [
  {
    "pickup_odometer": null,
    "dropoff_odometer": null,
    "leg_distance": null,
    "leg_id": 122,
    "trip_id": 97,
    "driver_id": 11,
    "status": "Assigned",
    "pickup_location": 32727,
    "dropoff_location": 93679,
    "scheduled_pickup": "04:00:00",
    "actual_pickup": null,
    "scheduled_dropoff": "04:15:00",
    "actual_dropoff": null,
    "sequence": 1,
    "created_at": "2025-05-01T17:50:27.000Z",
    "updated_at": "2025-05-01T17:51:23.000Z",
    "driver": {
      "id": 11,
      "first_name": "jemmy",
      "last_name": "Macias"
    },
    "pickupLocation": {
      "latitude": 0,
      "longitude": 0,
      "location_id": 32727,
      "street_address": "1035 E JEFFERSON ST",
      "building": "",
      "building_type": "",
      "city": "Phoenix",
      "state": "AZ",
      "zip": "85034",
      "phone": "",
      "location_type": "Urban",
      "recipient_default": false,
      "created_at": "2025-05-01T15:57:38.000Z",
      "updated_at": "2025-05-01T15:57:38.000Z"
    },
    "dropoffLocation": {
      "latitude": 33.398556,
      "longitude": -111.845156,
      "location_id": 93679,
      "street_address": "628 W EMELITA AVE",
      "building": "",
      "building_type": "",
      "city": "Mesa",
      "state": "AZ",
      "zip": "85210",
      "phone": "",
      "location_type": "Urban",
      "recipient_default": false,
      "created_at": "2025-05-01T16:00:26.000Z",
      "updated_at": "2025-05-01T16:00:26.000Z"
    }
  }
]
tripFormUtils.js:234 Processing leg: {
  "pickup_odometer": null,
  "dropoff_odometer": null,
  "leg_distance": null,
  "leg_id": 122,
  "trip_id": 97,
  "driver_id": 11,
  "status": "Assigned",
  "pickup_location": 32727,
  "dropoff_location": 93679,
  "scheduled_pickup": "04:00:00",
  "actual_pickup": null,
  "scheduled_dropoff": "04:15:00",
  "actual_dropoff": null,
  "sequence": 1,
  "created_at": "2025-05-01T17:50:27.000Z",
  "updated_at": "2025-05-01T17:51:23.000Z",
  "driver": {
    "id": 11,
    "first_name": "jemmy",
    "last_name": "Macias"
  },
  "pickupLocation": {
    "latitude": 0,
    "longitude": 0,
    "location_id": 32727,
    "street_address": "1035 E JEFFERSON ST",
    "building": "",
    "building_type": "",
    "city": "Phoenix",
    "state": "AZ",
    "zip": "85034",
    "phone": "",
    "location_type": "Urban",
    "recipient_default": false,
    "created_at": "2025-05-01T15:57:38.000Z",
    "updated_at": "2025-05-01T15:57:38.000Z"
  },
  "dropoffLocation": {
    "latitude": 33.398556,
    "longitude": -111.845156,
    "location_id": 93679,
    "street_address": "628 W EMELITA AVE",
    "building": "",
    "building_type": "",
    "city": "Mesa",
    "state": "AZ",
    "zip": "85210",
    "phone": "",
    "location_type": "Urban",
    "recipient_default": false,
    "created_at": "2025-05-01T16:00:26.000Z",
    "updated_at": "2025-05-01T16:00:26.000Z"
  }
}