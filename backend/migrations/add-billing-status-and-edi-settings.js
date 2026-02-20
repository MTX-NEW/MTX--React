const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const skipIfExists = async (fn) => {
      try {
        await fn();
      } catch (err) {
        if (err.message && (err.message.includes('already exists') || err.message.includes('Duplicate'))) return;
        throw err;
      }
    };

    // Add billing status columns to trips table
    await skipIfExists(() => queryInterface.addColumn('trips', 'billing_status', {
      type: DataTypes.ENUM('unbilled', 'ready_for_billing', 'claim_generated', 'billed', 'paid'),
      defaultValue: 'unbilled',
      after: 'total_distance'
    }));

    // Insert default EDI client settings (only if table is empty)
    try {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM edi_client_settings'
      );
      if (existing[0].count === 0) {
        // Only insert columns that exist on all schemas (omit created_at/updated_at in case table was created without them)
        await queryInterface.bulkInsert('edi_client_settings', [{
          sender_id: 'MTXPROVIDER',
          receiver_id: 'AHCCCS',
          receiver_name: 'ARIZONA HEALTH CARE',
          interchange_control_version: '00501',
          default_provider_npi: '1234567890', // This should be updated with actual NPI
          default_taxonomy: '343900000X', // Transportation services
          mileage_rate: 2.50,
          base_transport_rate: 25.00,
          is_active: true
        }], {});
      }
    } catch (err) {
      // Table might not exist yet, or column mismatch (e.g. no created_at), skip insert
      if (err.message.includes("doesn't exist") || err.message.includes('Unknown column')) return;
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns from trips table
    await queryInterface.removeColumn('trips', 'billing_status');

    // Remove EDI settings
    await queryInterface.bulkDelete('edi_client_settings', {}, {});
  }
};
