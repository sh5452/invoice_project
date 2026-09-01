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
    authorizeRoles('company_admin'),
    async (req, res) => {

        console.log("CREATE USER BODY:", req.body);
        console.log("CREATE USER BY:", req.user);

        try {

            const {
                username,
                fullName,
                email,
                role,
                password
            } = req.body;

            if (!username || !fullName || !email || !role || !password) {
                return res.status(400).send('כל השדות הם חובה');
            }

           if (role === 'company_admin') {
    return res
        .status(403)
        .send('מנהל חברה לא יכול ליצור מנהל נוסף');
}

            const company = req.user.company;

            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `
                INSERT INTO users
                (
                    username,
                    full_name,
                    email,
                    company,
                    role,
                    password_hash
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id,
                    username,
                    full_name,
                    email,
                    company,
                    role,
                    created_at,
                    is_active
                `,
                [
                    username,
                    fullName,
                    email,
                    company,
                    role,
                    passwordHash
                ]
            );

       console.log("USER CREATED:", result.rows[0]);
console.log("BEFORE RESPONSE - HEADERS SENT:", res.headersSent);

return res.status(201).json(result.rows[0]);
           

        } catch (err) {

        console.error("ADD USER ERROR:", err);

    if (res.headersSent) {
        return;
    }

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
    authorizeRoles('company_admin'),
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT *
                FROM users
                ORDER BY created_at DESC
                `
            );

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
    authorizeRoles('company_admin'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                username,
                fullName,
                email,
                company,
                role
            } = req.body;

            const result = await pool.query(
                `
                UPDATE users
                SET username = $1,
                    full_name = $2,
                    email = $3,
                    company = $4,
                    role = $5
                WHERE id = $6
                RETURNING *
                `,
                [
                    username,
                    fullName,
                    email,
                    company,
                    role,
                    id
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('User not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
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
    authorizeRoles('company_admin'),
    async (req, res) => {

        try {

            const { id } = req.params;

            const result = await pool.query(
                `
                UPDATE users
                SET is_active = FALSE
                WHERE id = $1
                RETURNING *
                `,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('User not found');
            }

            res.json(result.rows[0]);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error deactivating user');
        }
    }
);


module.exports = router;