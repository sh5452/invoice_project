const express = require('express');
const router = express.Router();

const pool = require('../db');
const multer = require('multer');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage()
});
// =========================
// יצירת תעודת משלוח
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('driver', 'company_admin'),
     upload.single('delivery_note_image'),
    async (req, res) => {

        try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
            const {
                order_id,
                delivery_note_number,
                received_by,
                notes
            } = req.body;
            console.log("IMAGE BUFFER SIZE:", req.file?.buffer?.length);

            const result = await pool.query(
                `
              INSERT INTO delivery_notes
(
    order_id,
    delivery_note_number,
    delivery_at,
    received_by,
    notes,
    delivery_note_image
)
VALUES ($1, $2, NOW(), $3, $4, $5)
                RETURNING *
                `,
              [
    order_id,
    delivery_note_number,
    received_by,
    notes,
    req.file ? req.file.buffer : null
]
            );
console.log(
    "SAVED IMAGE SIZE:",
    result.rows[0].delivery_note_image?.length
)
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