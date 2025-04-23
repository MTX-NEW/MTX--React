import * as yup from 'yup';

export const tripSchema = yup.object().shape({
  member_id: yup.number().required('Member is required'),
  created_by: yup.number().required('Created by is required'),
  pickup_location: yup.number().required('Pickup location is required'),
  dropoff_location: yup.number().required('Dropoff location is required'),
  trip_distance: yup.number().nullable(),
  schedule_type: yup.string().required('Schedule type is required'),
  schedule_days: yup.string().when('schedule_type', {
    is: 'Blanket', 
    then: () => yup.string().required('Schedule days are required for blanket trips'),
    otherwise: () => yup.string().nullable()
  }),
  start_date: yup.date().required('Start date is required'),
  end_date: yup.date().when('schedule_type', {
    is: 'Blanket',
    then: () => yup.date().required('End date is required for blanket trips'),
    otherwise: () => yup.date().nullable()
  }),
  appt_time: yup.string().nullable(),
  pickup_time: yup.string().required('Pickup time is required'),
  trip_type: yup.string().required('Trip type is required'),
  is_one_way: yup.mixed(),
  return_pickup_time: yup.string().when('trip_type', {
    is: 'round_trip',
    then: () => yup.string().required('Return pickup time is required for round trips'),
    otherwise: () => yup.string().nullable()
  }),
  mobility_type: yup.string().required('Mobility type is required'),
  rides_alone: yup.boolean(),
  spanish_speaking: yup.boolean(),
  males_only: yup.boolean(),
  females_only: yup.boolean(),
  special_assist: yup.boolean(),
  pickup_time_exact: yup.boolean(),
  stay_with_client: yup.boolean(),
  car_seat: yup.boolean(),
  extra_person: yup.boolean(),
  call_first: yup.boolean(),
  knock: yup.boolean(),
  van: yup.boolean(),
  sedan: yup.boolean(),
  status: yup.string()
});

export const locationSchema = yup.object().shape({
  street_address: yup.string().required('Street address is required'),
  building: yup.string().nullable(),
  building_type: yup.string().required('Building type is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip: yup.string().required('ZIP code is required'),
  location_type: yup.string().required('Location type is required'),
  recipient_default: yup.boolean()
});

export const memberSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  program_id: yup.number().nullable(),
  ahcccs_id: yup.string().nullable(),
  insurance_expiry: yup.date().nullable(),
  birth_date: yup.date().nullable(),
  phone: yup.string().nullable(),
  gender: yup.string().required('Gender is required'),
  notes: yup.string().nullable()
}); 