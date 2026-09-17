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


            // =========================
            // בדיקות בסיסיות
            // =========================

            if (!order_id) {
                return res.status(400).send('Order is required');
            }

            if (!reason || !reason.trim()) {
                return res.status(400).send('Return reason is required');
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).send('Return items are required');
            }


            // =========================
            // בדיקה שההזמנה שייכת ללקוח
            // =========================

            const orderResult = await pool.query(
                `
                SELECT
                    id,
                    customer_id
                FROM orders
                WHERE id = $1
                AND customer_id = $2
                `,
                [
                    order_id,
                    req.user.id
                ]
            );


            if (orderResult.rows.length === 0) {

                return res
                    .status(404)
                    .send('Order not found');

            }


            // =========================
            // בדיקה שכל הפריטים
            // שייכים להזמנה הזאת
            // =========================

            for (const item of items) {

                const itemResult = await pool.query(
                    `
                    SELECT
                        id,
                        quantity
                    FROM order_items
                    WHERE id = $1
                    AND order_id = $2
                    `,
                    [
                        item.order_item_id,
                        order_id
                    ]
                );


                if (itemResult.rows.length === 0) {

                    return res
                        .status(400)
                        .send('Invalid order item');

                }


                const originalQuantity =
                    Number(itemResult.rows[0].quantity);

                const returnedQuantity =
                    Number(item.quantity_returned);


                if (
                    !Number.isInteger(returnedQuantity) ||
                    returnedQuantity <= 0
                ) {

                    return res
                        .status(400)
                        .send('Invalid return quantity');

                }


                if (returnedQuantity > originalQuantity) {

                    return res
                        .status(400)
                        .send(
                            'Returned quantity cannot exceed ordered quantity'
                        );

                }

            }


            // =========================
            // יצירת ההחזרה
            // =========================

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
                    reason.trim()
                ]
            );


            const return_id =
                returnResult.rows[0].id;


            // =========================
            // שמירת פריטי ההחזרה
            // =========================

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


            // =========================
            // תשובה
            // =========================

            res.json({
                return: returnResult.rows[0],
                items
            });


        } catch (err) {

            console.error(err);

            res.status(500).send(
                'ERROR creating return'
            );

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


            // =========================
            // בדיקה שההחזרה שייכת ללקוח
            // =========================

            const returnResult = await pool.query(
                `
                SELECT
                    returns.id
                FROM returns

                JOIN orders
                    ON orders.id = returns.order_id

                WHERE returns.id = $1
                AND orders.customer_id = $2
                `,
                [
                    return_id,
                    req.user.id
                ]
            );


            if (returnResult.rows.length === 0) {

                return res
                    .status(404)
                    .send('Return not found');

            }


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

            res.status(500).send(
                'ERROR creating return item'
            );

        }
    }
);


module.exports = router;