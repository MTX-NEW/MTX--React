import React from 'react';
import { format } from 'date-fns';
import DynamicTable, { DefaultTableActions } from '@/components/DynamicTable';

const TripTable = ({ 
  trips, 
  onEdit, 
  onDelete, 
  onView, 
  onCopy, 
  onRecreate,
  isLoading,
  // Batch operations props
  selectedTrips = [],
  onTripSelection,
  onSelectAll,
  selectAll = false
}) => {
  const tripColumns = [
    // Checkbox column for batch selection (only show if onTripSelection is provided)
    ...(onTripSelection ? [{
      header: (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="me-2"
            title="Select All"
          />
          <span>Select</span>
        </div>
      ),
      accessor: 'select',
      cell: (value, row) => (
        <input
          type="checkbox"
          checked={selectedTrips.includes(row.trip_id)}
          onChange={(e) => onTripSelection(row.trip_id, e.target.checked)}
          className="form-check-input"
        />
      ),
    }] : []),
    {
      header: 'Member',
      accessor: 'TripMember',
      cell: (value) => value ? `${value.first_name} ${value.last_name}` : 'N/A',
    },
    {
      header: 'Schedule',
      accessor: 'schedule_type',
      cell: (value) => value || 'N/A',
    },
    {
      header: 'Start Date',
      accessor: 'start_date',
      cell: (value) => value ? format(new Date(value), 'MM/dd/yyyy') : 'N/A',
    },
    {
      header: 'Type',
      accessor: 'trip_type',
      cell: (value) => {
        switch (value) {
          case 'round_trip':
            return 'Round Trip';
          case 'one_way':
            return 'One Way';
          case 'multi_stop':
            return 'Multi-stop';
          default:
            return value || 'N/A';
        }
      },
    },
    {
      header: 'Pickup',
      accessor: 'legs',
      cell: (legs) => {
        if (!legs || legs.length === 0) return 'N/A';
        
        // Find the first leg
        const firstLeg = [...legs].sort((a, b) => a.sequence - b.sequence)[0];
        
        if (!firstLeg || !firstLeg.pickupLocation) return 'N/A';
        
        return firstLeg.pickupLocation.street_address || 'N/A';
      },
    },
    {
      header: 'Dropoff',
      accessor: 'legs',
      cell: (legs) => {
        if (!legs || legs.length === 0) return 'N/A';
        
        // Find the last leg
        const lastLeg = [...legs].sort((a, b) => b.sequence - a.sequence)[0];
        
        if (!lastLeg || !lastLeg.dropoffLocation) return 'N/A';
        
        return lastLeg.dropoffLocation.street_address || 'N/A';
      },
    },
    {
      header: 'Distance',
      accessor: 'total_distance',
      cell: (value) => value ? `${value} miles` : 'N/A',
    },
    {
      header: 'Status',
      accessor: 'legs',
      cell: (legs) => {
        if (!legs || legs.length === 0) return 'N/A';
        
        // Get the status of the first leg
        const firstLeg = [...legs].sort((a, b) => a.sequence - b.sequence)[0];
        
        if (!firstLeg) return 'N/A';
        
        return firstLeg.status || 'Pending';
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      actions: [
        ({ row }) => (
          <DefaultTableActions
            row={row}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row.trip_id)}
            customActions={[
              {
                label: "View",
                className: "view-details-btn",
                title: "View Trip Details",
                onClick: (trip) => onView(trip)
              },
              {
                label: "Copy",
                className: "copy-trip-btn",
                title: "Create a copy of this trip",
                onClick: (trip) => onCopy(trip)
              },
              {
                label: "Add",
                className: "recreate-trip-btn",
                title: "Recreate this trip with new date and time",
                onClick: (trip) => onRecreate(trip)
              }
            ]}
          />
        ),
      ],
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isLoading ? (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading trips...</p>
        </div>
      ) : (
        <DynamicTable
          columns={tripColumns}
          data={trips}
          isLoading={isLoading}
          onDelete={onDelete}
          onEdit={onEdit}
          deleteConfirmMessage={(item) => `Are you sure you want to delete this trip?`}
        />
      )}
    </div>
  );
};

export default TripTable; 