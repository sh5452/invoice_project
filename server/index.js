const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();


// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());


// =========================
// Routes
// =========================

const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const orderItemsRoutes = require('./routes/orderItems');
const deliveryNotesRoutes = require('./routes/deliveryNotes');
const returnsRoutes = require('./routes/returns');


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


// =========================
// Connect Routes
// =========================

app.use('/orders', ordersRoutes);

app.use('/users', usersRoutes);

app.use('/order-items', orderItemsRoutes);

app.use('/delivery-notes', deliveryNotesRoutes);

app.use('/returns', returnsRoutes);


// =========================
// Server
// =========================

app.listen(5000, () => {

    console.log('Server is running on port 5000');

});