const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// הוספת פריט להזמנה
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            const {
                order_id,
                product_name,
                sku,
                quantity,
                unit_type,
                price
            } = req.body;

            const result = await pool.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_name,
                    sku,
                    quantity,
                    unit_type,
                    price
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                `,
                [
                    order_id,
                    product_name,
                    sku,
                    quantity,
                    unit_type,
                    price
                ]
            );

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error adding item');

        }
    }
);


// =========================
// שינוי כמות פריט
// =========================

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            const { id } = req.params;
            const { quantity } = req.body;

            const result = await pool.query(
                `
                UPDATE order_items
                SET quantity = $1
                WHERE id = $2
                RETURNING *
                `,
                [quantity, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Order item not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error updating order item');

        }
    }
);


module.exports = router;