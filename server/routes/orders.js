const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// יצירת הזמנה
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {
    console.log("CREATE ORDER ROUTE REACHED");
        console.log("USER:", req.user);
        try {

            const {
                order_number,
                customer_name,
                customer_phone,
                customer_address,
                status
            } = req.body;

            const result = await pool.query(
                ` INSERT INTO orders
    (
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        status,
        company,
        customer_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        status,
        req.user.company,
        req.user.id
    ]
            );

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error creating order');

        }
    }
);


// =========================
// רשימת הזמנות
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

            let result;

            if (req.user.role === 'driver') {

                result = await pool.query(`
                    SELECT
                        orders.*,
                        COALESCE(
                            SUM(order_items.price * order_items.quantity),
                            0
                        ) AS total_price
                    FROM orders
                    LEFT JOIN order_items
                        ON orders.id = order_items.order_id
                    WHERE orders.company = $1
                    AND orders.driver_id = $2
                    GROUP BY orders.id
                    ORDER BY orders.id DESC
                `, [
                    req.user.company,
                    req.user.id
                ]);

            } else {

                result = await pool.query(`
                    SELECT
                        orders.*,
                        COALESCE(
                            SUM(order_items.price * order_items.quantity),
                            0
                        ) AS total_price
                    FROM orders
                    LEFT JOIN order_items
                        ON orders.id = order_items.order_id
                    WHERE orders.company = $1
                    GROUP BY orders.id
                    ORDER BY orders.id DESC
                `, [
                    req.user.company
                ]);

            }

            res.json(result.rows);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error fetching orders');

        }
    }
);

// =========================
// פרטי הזמנה
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


            // פרטי ההזמנה

           const orderResult = await pool.query(
    `
    SELECT
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        status,
        is_active,
        company
    FROM orders
    WHERE id = $1
    AND company = $2
    `,
    [id, req.user.company]
);

            if (orderResult.rows.length === 0) {
                return res.status(404).send('Order not found');
            }

            const order = orderResult.rows[0];


            // פריטי ההזמנה

            const itemsResult = await pool.query(
                `
                SELECT
                    id,
                    product_name,
                    quantity,
                    price,
                    sku
                FROM order_items
                WHERE order_id = $1
                ORDER BY id
                `,
                [id]
            );

            const items = itemsResult.rows;


            // תעודות משלוח

            const deliveryNotesResult = await pool.query(
                `
                SELECT
                    id,
                    delivery_note_number,
                    received_by,
                    delivery_at,
                    notes
                FROM delivery_notes
                WHERE order_id = $1
                ORDER BY delivery_at
                `,
                [id]
            );

            const delivery_notes = deliveryNotesResult.rows;


            // החזרות

            const returnsResult = await pool.query(
                `
                SELECT
                    id AS return_id,
                    reason,
                    created_at
                FROM returns
                WHERE order_id = $1
                ORDER BY created_at
                `,
                [id]
            );

            const returns = returnsResult.rows;


            // פריטי החזרה

            const returnedItemsResult = await pool.query(
                `
                SELECT
                    return_items.id AS return_item_id,
                    return_items.return_id,
                    return_items.order_item_id,
                    order_items.product_name,
                    order_items.sku,
                    return_items.quantity_returned
                FROM return_items

                JOIN returns
                    ON returns.id = return_items.return_id

                JOIN order_items
                    ON order_items.id = return_items.order_item_id

                WHERE returns.order_id = $1

                ORDER BY return_items.id
                `,
                [id]
            );

            const returned_items = returnedItemsResult.rows;


            res.json({

                order: {
                    id: order.id,
                    order_number: order.order_number,
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    customer_address: order.customer_address,
                    status: order.status,
                    is_active: order.is_active,
                    company: order.company
                },

                items,

                delivery_notes,

                returns,

                returned_items

            });

        } catch (err) {

            console.error(err);
            res.status(500).send('Error fetching order');

        }
    }
);


// =========================
// עריכת הזמנה
// =========================

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                order_number,
                customer_name,
                customer_phone,
                customer_address
            } = req.body;
            console.log("USER:", req.user);
console.log("ORDER BODY:", req.body);

            const result = await pool.query(
                `
                UPDATE orders
                SET
                    order_number = $1,
                    customer_name = $2,
                    customer_phone = $3,
                    customer_address = $4
                 WHERE id = $5
    AND customer_id = $6
                RETURNING *
                `,
                [
                    order_number,
                    customer_name,
                    customer_phone,
                    customer_address,
                     id,
        req.user.id
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Order not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error updating order');

        }
    }
);


// =========================
// שינוי סטטוס
// =========================

router.patch(
    '/:id/status',
    authenticateToken,
    authorizeRoles(
        'company_admin',
        'employee',
        'driver'
    ),
    async (req, res) => {

        try {

            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = [
                'חדשה',
                'בטיפול',
                'מחכה למלאי',
                'נשלחה',
                'סופקה'
            ];

            if (!validStatuses.includes(status)) {
                return res.status(400).send('Invalid status');
            }

            // נהג יכול לשנות רק ל"סופקה"

            if (
                req.user.role === 'driver' &&
                status !== 'סופקה'
            ) {
                return res
                    .status(403)
                    .send('נהג יכול לשנות רק לסטטוס סופקה');
            }
const result = await pool.query(
    `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    AND company = $3
    RETURNING *
    `,
    [status, id, req.user.company]
);
if (result.rows.length === 0) {
    return res.status(404).send('Order not found');
}

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error updating status');

        }
    }
);

// =========================
// הקצאת נהג להזמנה
// =========================

router.patch(
    '/:id/assign-driver',
    authenticateToken,
    authorizeRoles('company_admin'),
    async (req, res) => {

        try {

            const { id } = req.params;
            const { driver_id } = req.body;

            if (!driver_id) {
                return res.status(400).send('Driver is required');
            }

            // בדיקה שהנהג קיים ושייך לאותה חברה

            const driverResult = await pool.query(
                `
                SELECT id
                FROM users
                WHERE id = $1
                AND company = $2
                AND role = 'driver'
                AND is_active = TRUE
                `,
                [driver_id, req.user.company]
            );

            if (driverResult.rows.length === 0) {
                return res.status(404).send('Driver not found');
            }

            // הקצאת הנהג להזמנה

            const result = await pool.query(
                `
                UPDATE orders
                SET driver_id = $1
                WHERE id = $2
                AND company = $3
                RETURNING *
                `,
                [
                    driver_id,
                    id,
                    req.user.company
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Order not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error assigning driver');

        }
    }
);


// =========================
// השבתת הזמנה
// =========================

router.patch(
    '/:id/deactivate',
    authenticateToken,
    authorizeRoles('customer'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const result = await pool.query(
                `
                 UPDATE orders
    SET is_active = FALSE
    WHERE id = $1
    AND customer_id = $2
    RETURNING *
    `,
    [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Order not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error deactivating order');

        }
    }
);


module.exports = router;