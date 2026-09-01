const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// יצירת החזרה + פריטי החזרה
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            console.log("RETURN BODY:", req.body);

            const {
                order_id,
                reason,
                items
            } = req.body;


            // יצירת ההחזרה

            const returnResult = await pool.query(
                `
                INSERT INTO returns
                (
                    order_id,
                    reason
                )
                VALUES ($1, $2)
                RETURNING *
                `,
                [
                    order_id,
                    reason
                ]
            );

            const return_id = returnResult.rows[0].id;


            // שמירת פריטי ההחזרה

            for (const item of items) {

                await pool.query(
                    `
                    INSERT INTO return_items
                    (
                        return_id,
                        order_item_id,
                        quantity_returned
                    )
                    VALUES ($1, $2, $3)
                    `,
                    [
                        return_id,
                        item.order_item_id,
                        item.quantity_returned
                    ]
                );

            }


            res.json({
                return: returnResult.rows[0],
                items
            });

        } catch (err) {

            console.error(err);
            res.status(500).send('ERROR creating return');

        }
    }
);


// =========================
// הוספת פריט להחזרה
// =========================

router.post(
    '/items',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            const {
                return_id,
                order_item_id,
                quantity_returned
            } = req.body;

            const result = await pool.query(
                `
                INSERT INTO return_items
                (
                    return_id,
                    order_item_id,
                    quantity_returned
                )
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                [
                    return_id,
                    order_item_id,
                    quantity_returned
                ]
            );

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('ERROR creating return item');

        }
    }
);


module.exports = router;