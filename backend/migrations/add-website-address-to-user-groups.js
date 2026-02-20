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

    // Add website column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'website', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'email'
    }));

    // Add address column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'address', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'website'
    }));

    // Make short_name nullable (modify existing column)
    try {
      await queryInterface.changeColumn('user_groups', 'short_name', {
        type: Sequelize.STRING(10),
        allowNull: true
      });
    } catch (err) {
      // Column might already be nullable or not exist, ignore
      if (!err.message.includes('Unknown column')) throw err;
    }

    // Make email nullable (since we're now using website instead)
    try {
      await queryInterface.changeColumn('user_groups', 'email', {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      });
    } catch (err) {
      // Column might already be nullable or not exist, ignore
      if (!err.message.includes('Unknown column')) throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns
    await queryInterface.removeColumn('user_groups', 'website');
    await queryInterface.removeColumn('user_groups', 'address');

    // Revert short_name to required
    await queryInterface.changeColumn('user_groups', 'short_name', {
      type: Sequelize.STRING(10),
      allowNull: false
    });

    // Revert email to required
    await queryInterface.changeColumn('user_groups', 'email', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });
  }
};
