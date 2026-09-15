const express = require('express');
const router = express.Router();

const pool = require('../db');
const bcrypt = require('bcrypt');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// הוספת משתמש
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {

        console.log("CREATE USER BODY:", req.body);
        console.log("CREATE USER BY:", req.user);

        try {

            const {
                username,
                fullName,
                email,
                company,
                customerCompany,
                role,
                password
            } = req.body;

            if (
                !username ||
                !fullName ||
                !email ||
                !role ||
                !password ||
                !company
            ) {
                return res.status(400).send('כל השדות הם חובה');
            }

            if (
                role === 'company_admin' &&
                req.user.role !== 'super_admin'
            ) {
                return res
                    .status(403)
                    .send('מנהל חברה לא יכול ליצור מנהל חברה נוסף');
            }

            let userCompany;

            if (req.user.role === 'super_admin') {
                userCompany = company;
            } else {
                userCompany = req.user.company;
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `
                INSERT INTO users
                (
                    username,
                    full_name,
                    email,
                    company,
                    customer_company,
                    role,
                    password_hash
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                    id,
                    username,
                    full_name,
                    email,
                    company,
                    customer_company,
                    role,
                    created_at,
                    is_active
                `,
                [
                    username,
                    fullName,
                    email,
                    userCompany,
                    role === 'customer'
                        ? customerCompany
                        : null,
                    role,
                    passwordHash
                ]
            );

            console.log("USER CREATED:", result.rows[0]);

            return res.status(201).json(result.rows[0]);

        } catch (err) {

            console.error("ADD USER ERROR:", err);

            if (err.code === '23505') {
                return res
                    .status(400)
                    .send('שם המשתמש או האימייל כבר קיימים');
            }

            return res.status(500).send('Error creating user');
        }
    }
);


// =========================
// הצגת משתמשים
// =========================

router.get(
    '/',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {

        try {

            let result;

            if (req.user.role === 'super_admin') {

                result = await pool.query(
                    `
                    SELECT
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        role,
                        created_at,
                        is_active
                    FROM users
                    ORDER BY created_at DESC
                    `
                );

            } else {

                result = await pool.query(
                    `
                    SELECT
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        role,
                        created_at,
                        is_active
                    FROM users
                    WHERE company = $1
                    ORDER BY created_at DESC
                    `,
                    [req.user.company]
                );

            }

            res.json(result.rows);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error fetching users');

        }
    }
);


// =========================
// עריכת משתמש
// =========================

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                username,
                fullName,
                email,
                company,
                customerCompany,
                role
            } = req.body;


            // =========================
            // Super Admin
            // =========================

            if (req.user.role === 'super_admin') {

                const result = await pool.query(
                    `
                    UPDATE users
                    SET
                        username = $1,
                        full_name = $2,
                        email = $3,
                        company = $4,
                        customer_company = $5,
                        role = $6
                    WHERE id = $7
                    RETURNING
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        role,
                        created_at,
                        is_active
                    `,
                    [
                        username,
                        fullName,
                        email,
                        company,
                        role === 'customer'
                            ? customerCompany
                            : null,
                        role,
                        id
                    ]
                );

                if (result.rows.length === 0) {
                    return res.status(404).send('User not found');
                }

                return res.json(result.rows[0]);

            }


            // =========================
            // Company Admin
            // =========================

            if (role === 'company_admin') {

                return res
                    .status(403)
                    .send('מנהל חברה לא יכול להגדיר מנהל חברה נוסף');

            }

            const result = await pool.query(
                `
                UPDATE users
                SET
                    username = $1,
                    full_name = $2,
                    email = $3,
                    company = $4,
                    customer_company = $5,
                    role = $6
                WHERE id = $7
                AND company = $8
                RETURNING
                    id,
                    username,
                    full_name,
                    email,
                    company,
                    customer_company,
                    role,
                    created_at,
                    is_active
                `,
                [
                    username,
                    fullName,
                    email,
                    req.user.company,
                    role === 'customer'
                        ? customerCompany
                        : null,
                    role,
                    id,
                    req.user.company
                ]
            );

            if (result.rows.length === 0) {

                return res
                    .status(404)
                    .send('המשתמש לא נמצא בחברה שלך');

            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);

            if (err.code === '23505') {
                return res
                    .status(400)
                    .send('שם המשתמש או האימייל כבר קיימים');
            }

            res.status(500).send('Error updating user');

        }
    }
);


// =========================
// השבתת משתמש
// =========================

router.patch(
    '/:id/deactivate',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {

        try {

            const { id } = req.params;

            let result;

            if (req.user.role === 'super_admin') {

                result = await pool.query(
                    `
                    UPDATE users
                    SET is_active = FALSE
                    WHERE id = $1
                    RETURNING
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        role,
                        created_at,
                        is_active
                    `,
                    [id]
                );

            } else {

                result = await pool.query(
                    `
                    UPDATE users
                    SET is_active = FALSE
                    WHERE id = $1
                    AND company = $2
                    RETURNING
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        role,
                        created_at,
                        is_active
                    `,
                    [
                        id,
                        req.user.company
                    ]
                );

            }


            if (result.rows.length === 0) {

                return res
                    .status(404)
                    .send('המשתמש לא נמצא או שאין לך הרשאה להשבית אותו');

            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error deactivating user');

        }
    }
);


module.exports = router;