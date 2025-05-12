'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('member_locations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'trip_members',
          key: 'member_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'trip_locations',
          key: 'location_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_primary_pickup: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_primary_dropoff: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      location_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('member_locations', ['member_id']);
    await queryInterface.addIndex('member_locations', ['location_id']);
    await queryInterface.addIndex('member_locations', ['is_primary_pickup']);
    await queryInterface.addIndex('member_locations', ['is_primary_dropoff']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('member_locations');
  }
}; 