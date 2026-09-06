const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// יצירת תעודת משלוח
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('driver', 'company_admin'),
    async (req, res) => {

        try {

            const {
                order_id,
                delivery_note_number,
                received_by,
                notes
            } = req.body;

            const result = await pool.query(
                `
                INSERT INTO delivery_notes
                (
                    order_id,
                    delivery_note_number,
                    delivery_at,
                    received_by,
                    notes
                )
                VALUES ($1, $2, NOW(), $3, $4)
                RETURNING *
                `,
                [
                    order_id,
                    delivery_note_number,
                    received_by,
                    notes
                ]
            );

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('ERROR creating delivery note');

        }
    }
);


// =========================
// הצגת כל תעודות המשלוח
// =========================

router.get(
    '/',
    authenticateToken,
    authorizeRoles(
        'company_admin',
        'employee',
        'driver',
        'customer'
    ),
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT *
                FROM delivery_notes
                `
            );

            res.json(result.rows);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error fetching delivery notes');

        }
    }
);


// =========================
// הצגת תעודת משלוח לפי ID
// =========================

router.get(
    '/:id',
    authenticateToken,
    authorizeRoles(
        'company_admin',
        'employee',
        'driver',
        'customer'
    ),
    async (req, res) => {

        try {

            const { id } = req.params;

            const result = await pool.query(
                `
                SELECT *
                FROM delivery_notes
                WHERE id = $1
                `,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Delivery note not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('ERROR fetching delivery note');

        }
    }
);


module.exports = router;