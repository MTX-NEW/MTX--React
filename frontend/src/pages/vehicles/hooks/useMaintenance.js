import { useResource } from '@/hooks/useResource';
import { maintenanceApi } from '@/api/baseApi';

export const useMaintenance = () => {
  const { 
    data: maintenanceRecords,
    loading,
    error,
    create: createRecord,
    remove: deleteRecord,
    refresh: refreshRecords,
    setData
  } = useResource(maintenanceApi, { idField: 'id' });

  const updateMaintenanceWithDetails = async (id, data) => {
    try {
      // First update main record
      const updatedMain = await maintenanceApi.update(id, data);
      
      // Then update services/parts if needed
      if (data.services) {
        await maintenanceApi.updateServices(id, data.services);
      }
      if (data.parts) {
        await maintenanceApi.updateParts(id, data.parts);
      }
      
      // Update the local state with the new data
      setData(prev => prev.map(item => 
        item.id === id ? { ...updatedMain.data } : item
      ));
      
      return updatedMain.data;
    } catch (error) {
      console.error('Error updating maintenance:', error);
      throw error;
    }
  };

  const getVehicleMaintenance = async (vehicleId) => {
    try {
      const response = await maintenanceApi.getVehicleHistory(vehicleId);
      return response.data;
    } catch (error) {
      console.error('Error getting vehicle maintenance:', error);
      throw error;
    }
  };

  return {
    maintenanceRecords,
    loading,
    error,
    createMaintenance: createRecord,
    deleteMaintenance: deleteRecord,
    refreshMaintenance: refreshRecords,
    updateMaintenance: updateMaintenanceWithDetails,
    getVehicleMaintenance
  };
}; 