const bcrypt = require('bcryptjs');
const User = require('../models/user');

const authController = {
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        username,
        password: hashedPassword
      });

      req.session.userId = user.id;
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ message: 'Username already exists' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      req.session.userId = user.id;
      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['id', 'username']
      });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;