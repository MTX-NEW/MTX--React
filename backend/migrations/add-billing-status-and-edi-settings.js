const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add billing status columns to trips table
    await queryInterface.addColumn('trips', 'billing_status', {
      type: DataTypes.ENUM('unbilled', 'ready_for_billing', 'claim_generated', 'billed', 'paid'),
      defaultValue: 'unbilled',
      after: 'total_distance'
    });

    // Insert default EDI client settings
    await queryInterface.bulkInsert('edi_client_settings', [{
      sender_id: 'MTXPROVIDER',
      receiver_id: 'AHCCCS',
      receiver_name: 'ARIZONA HEALTH CARE',
      interchange_control_version: '00501',
      default_provider_npi: '1234567890', // This should be updated with actual NPI
      default_taxonomy: '343900000X', // Transportation services
      mileage_rate: 2.50,
      base_transport_rate: 25.00,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns from trips table
    await queryInterface.removeColumn('trips', 'billing_status');

    // Remove EDI settings
    await queryInterface.bulkDelete('edi_client_settings', {}, {});
  }
};
