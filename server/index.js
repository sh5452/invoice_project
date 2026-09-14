const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles, authenticateRefreshToken } = require('./middleware/auth');
const app = express();


// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Invoice server is running!');
});

// =========================
// Routes
// =========================

const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const orderItemsRoutes = require('./routes/orderItems');
const deliveryNotesRouter = require('./routes/deliveryNote');
const returnsRoutes = require('./routes/returns');
const driversRouter = require('./routes/drivers');


// =========================
// DB
// =========================

const pool = require('./db');


// =========================
// Test DB
// =========================

app.get('/test_db', async (req, res) => {

    try {

        const result = await pool.query('SELECT NOW()');

        res.json(result.rows);

    } catch (err) {

        console.error(err);
        res.status(500).send('DataBase error');

    }

});


// =========================
// Login
// =========================

app.post('/login', async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res
                .status(400)
                .send('שם משתמש וסיסמה הם חובה');

        }


        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE username = $1
            AND is_active = true
            `,
            [username]
        );


        if (result.rows.length === 0) {

            return res
                .status(401)
                .send('שם משתמש או סיסמה שגויים');

        }


        const user = result.rows[0];


        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );


        if (!passwordMatch) {

            return res
                .status(401)
                .send('שם משתמש או סיסמה שגויים');

        }


        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
               company: user.company

            },
            process.env.JWT_SECRET,
            {
               expiresIn: '2h'
            }
        );


        res.json({

            message: 'התחברות הצליחה',

            token,

            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                company: user.company,
                role: user.role
            }

        });


    } catch (err) {

        console.error(err);

        res.status(500).send('Error during login');

    }

});

app.post('/refresh-token', authenticateRefreshToken, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT id, username, role, company
            FROM users
            WHERE id = $1
            AND company = $2
            AND is_active = true
            `,
            [req.user.id, req.user.company]
        );

        if (result.rows.length === 0) {
            return res.status(401).send('User not found');
        }

        const user = result.rows[0];

        const newToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                company: user.company
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        );

        res.json({
            token: newToken
        });

    } catch (err) {

        console.error(err);
        res.status(500).send('Error refreshing token');

    }

});
// =========================
// Connect Routes
// =========================

app.use('/orders', ordersRoutes);

app.use('/users', usersRoutes);

app.use('/order-items', orderItemsRoutes);

app.use('/delivery-notes', deliveryNotesRouter);

app.use('/returns', returnsRoutes);

app.use('/drivers', driversRouter);


// =========================
// Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});