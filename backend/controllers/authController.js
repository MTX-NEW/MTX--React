const User = require("../models/User");
const UserType = require("../models/UserType");
const UserGroup = require("../models/UserGroup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { UniqueConstraintError, ValidationError } = require("sequelize");

// Register new user
exports.register = async (req, res) => {
  try {
    // Create new user with pending status (password hashing is handled by User model hooks)
    const newUser = await User.create({
      ...req.body,
      status: 'Pending',
      emp_code: `EMP${Math.floor(Math.random() * 10000)}`,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Return success message and user info without password
    res.status(201).json({
      message: "Registration successful. Your account is pending approval.",
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        username: newUser.username,
        email: newUser.email,
        status: newUser.status
      }
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({
        message: "Registration failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} already exists`,
        })),
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Registration failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({ message: "An error occurred during registration" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the input is an email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username } // Check if the username is an email
        ]
      },
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the user's account is active
    if (user.status !== 'Active') {
      return res.status(403).json({ message: "Your account is not active. Please contact support." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        user_group: user.user_group
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Return user info without sensitive data
    const userWithoutPassword = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      emp_code: user.emp_code,
      status: user.status,
      user_type: user.UserType,
      user_group: user.UserGroup,
      profile_image: user.profile_image
    };

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // The user ID comes from the verified token in the middleware
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "An error occurred while fetching user data" });
  }
}; 