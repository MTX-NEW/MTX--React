module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('trips', 'parent_trip_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'trip_id'
      },
      after: 'end_date' // Add after end_date column
    });

    // Add an index to improve lookup performance
    await queryInterface.addIndex('trips', ['parent_trip_id'], {
      name: 'idx_trips_parent_trip_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index first
    await queryInterface.removeIndex('trips', 'idx_trips_parent_trip_id');
    
    // Then remove the column
    await queryInterface.removeColumn('trips', 'parent_trip_id');
  }
}; 