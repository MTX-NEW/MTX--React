import { useResource } from '@/hooks/useResource';
import { createApi } from '@/api/baseApi';

// Create the API service instance first
const vehicleApi = createApi('vehicles');

export const useVehicle = () => {
  const { 
    data: vehicles,
    loading,
    error,
    create,
    update,
    remove,
    refresh 
  } = useResource(vehicleApi, { idField: 'vehicle_id' });

  return {
    vehicles,
    loading,
    error,
    createVehicle: create,
    updateVehicle: update,
    deleteVehicle: remove,
    refreshVehicles: refresh
  };
};