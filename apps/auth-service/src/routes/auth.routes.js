const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth.middleware');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/token');
const { loginAttemptsTotal, userRegistrationsTotal } = require('../utils/metrics');
const { validateRegisterInput, validateLoginInput } = require('../utils/validation');

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * @openapi
 * /:
 *   get:
 *     summary: Service welcome endpoint
 *     responses:
 *       200:
 *         description: Auth service is running
 *         content:
 *           application/json:
 *             example:
 *               message: CloudGuard AI Auth Service is running
 */
// Simple home route to confirm the service is running.
router.get('/', (req, res) => {
  res.json({
    message: 'CloudGuard AI Auth Service is running',
  });
});

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Test User
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: User already exists
 */
// Register a new user.
// Passwords are hashed before storage, even though this is still only in memory.
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  const validationErrors = validateRegisterInput({ name, email, password });

  if (validationErrors.length > 0) {
    userRegistrationsTotal.inc({ status: 'validation_failed' });

    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      userRegistrationsTotal.inc({ status: 'duplicate' });

      return res.status(409).json({
        message: 'User already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Never return the password or password hash in an API response.
    userRegistrationsTotal.inc({ status: 'success' });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid email or password
 */
// Login an existing user and return a real JWT token.
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const validationErrors = validateLoginInput({ email, password });

  if (validationErrors.length > 0) {
    loginAttemptsTotal.inc({ status: 'failure' });

    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      loginAttemptsTotal.inc({ status: 'failure' });

      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      loginAttemptsTotal.inc({ status: 'failure' });

      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    loginAttemptsTotal.inc({ status: 'success' });

    return res.json({
      message: 'Login successful',
      token: generateToken(user),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Authentication token is required or invalid
 */
// Protected route.
// A valid JWT must be sent as: Authorization: Bearer <token>
router.get('/profile', authenticate, (req, res) => {
  return res.json({
    message: 'Profile fetched successfully',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = router;
