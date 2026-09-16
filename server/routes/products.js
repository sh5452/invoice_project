const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// ========================================
// הצגת מוצרים
// ========================================

router.get(
    '/',
    authenticateToken,
    authorizeRoles(
        'super_admin',
        'company_admin',
        'customer'
    ),
    async (req, res) => {

        try {

            let result;

            // =========================
            // Super Admin
            // =========================

            if (req.user.role === 'super_admin') {

                const { company_id } = req.query;

                if (!company_id) {
                    return res.status(400).send(
                        'יש לבחור חברה'
                    );
                }

                result = await pool.query(
                    `
                    SELECT
                        id,
                        company_id,
                        sku,
                        name,
                        price,
                        pack_size,
                        is_active,
                        created_at
                    FROM products
                    WHERE company_id = $1
                    AND is_active = TRUE
                    ORDER BY name
                    `,
                    [company_id]
                );

            }

            // =========================
            // Company Admin
            // =========================

            else if (req.user.role === 'company_admin') {

                result = await pool.query(
                    `
                    SELECT
                        id,
                        company_id,
                        sku,
                        name,
                        price,
                        pack_size,
                        is_active,
                        created_at
                    FROM products
                    WHERE company_id = $1
                    AND is_active = TRUE
                    ORDER BY name
                    `,
                    [req.user.company_id]
                );

            }

            // =========================
            // Customer
            // =========================

            else if (req.user.role === 'customer') {

                result = await pool.query(
                    `
                    SELECT
                        id,
                        company_id,
                        sku,
                        name,
                        price,
                        pack_size,
                        is_active,
                        created_at
                    FROM products
                    WHERE company_id = $1
                    AND is_active = TRUE
                    ORDER BY name
                    `,
                    [req.user.company_id]
                );

            }

            res.json(result.rows);

        } catch (err) {

            console.error('GET PRODUCTS ERROR:', err);

            res.status(500).send(
                'Error fetching products'
            );
        }
    }
);


// ========================================
// הוספת מוצר
// Super Admin + Company Admin
// ========================================

router.post(
    '/',
    authenticateToken,
    authorizeRoles(
        'super_admin',
        'company_admin'
    ),
    async (req, res) => {

        try {

            const {
                companyId,
                sku,
                name,
                price,
                packSize
            } = req.body;

            if (
                !sku ||
                !name ||
                price === undefined ||
                !packSize
            ) {
                return res.status(400).send(
                    'יש למלא את כל פרטי המוצר'
                );
            }

            let userCompanyId;

            // Super Admin יכול לבחור חברה
            if (req.user.role === 'super_admin') {

                if (!companyId) {
                    return res.status(400).send(
                        'יש לבחור חברה'
                    );
                }

                userCompanyId = companyId;

            } else {

                // Company Admin מוגבל לחברה שלו
                userCompanyId = req.user.company_id;

            }

            const result = await pool.query(
                `
                INSERT INTO products
                (
                    company_id,
                    sku,
                    name,
                    price,
                    pack_size
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
                `,
                [
                    userCompanyId,
                    sku,
                    name,
                    price,
                    packSize
                ]
            );

            res.status(201).json(
                result.rows[0]
            );

        } catch (err) {

            console.error(
                'CREATE PRODUCT ERROR:',
                err
            );

            if (err.code === '23505') {

                return res.status(400).send(
                    'המק"ט כבר קיים בחברה הזאת'
                );
            }

            res.status(500).send(
                'Error creating product'
            );
        }
    }
);


// ========================================
// עריכת מוצר
// Super Admin + Company Admin
// ========================================

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles(
        'super_admin',
        'company_admin'
    ),
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                sku,
                name,
                price,
                packSize
            } = req.body;

            if (
                !sku ||
                !name ||
                price === undefined ||
                !packSize
            ) {
                return res.status(400).send(
                    'יש למלא את כל פרטי המוצר'
                );
            }

            let result;

            // =========================
            // Super Admin
            // =========================

            if (req.user.role === 'super_admin') {

                result = await pool.query(
                    `
                    UPDATE products
                    SET
                        sku = $1,
                        name = $2,
                        price = $3,
                        pack_size = $4
                    WHERE id = $5
                    RETURNING *
                    `,
                    [
                        sku,
                        name,
                        price,
                        packSize,
                        id
                    ]
                );

            }

            // =========================
            // Company Admin
            // =========================

            else {

                result = await pool.query(
                    `
                    UPDATE products
                    SET
                        sku = $1,
                        name = $2,
                        price = $3,
                        pack_size = $4
                    WHERE id = $5
                    AND company_id = $6
                    RETURNING *
                    `,
                    [
                        sku,
                        name,
                        price,
                        packSize,
                        id,
                        req.user.company_id
                    ]
                );

            }

            if (result.rows.length === 0) {

                return res.status(404).send(
                    'Product not found'
                );
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(
                'UPDATE PRODUCT ERROR:',
                err
            );

            if (err.code === '23505') {

                return res.status(400).send(
                    'המק"ט כבר קיים בחברה הזאת'
                );
            }

            res.status(500).send(
                'Error updating product'
            );
        }
    }
);


// ========================================
// השבתת מוצר
// ========================================

router.patch(
    '/:id/deactivate',
    authenticateToken,
    authorizeRoles(
        'super_admin',
        'company_admin'
    ),
    async (req, res) => {

        try {

            let result;

            if (req.user.role === 'super_admin') {

                result = await pool.query(
                    `
                    UPDATE products
                    SET is_active = FALSE
                    WHERE id = $1
                    RETURNING *
                    `,
                    [req.params.id]
                );

            } else {

                result = await pool.query(
                    `
                    UPDATE products
                    SET is_active = FALSE
                    WHERE id = $1
                    AND company_id = $2
                    RETURNING *
                    `,
                    [
                        req.params.id,
                        req.user.company_id
                    ]
                );

            }

            if (result.rows.length === 0) {

                return res.status(404).send(
                    'Product not found'
                );
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(
                'DEACTIVATE PRODUCT ERROR:',
                err
            );

            res.status(500).send(
                'Error deactivating product'
            );
        }
    }
);


module.exports = router;