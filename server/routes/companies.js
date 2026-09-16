const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// הצגת חברות
// =========================

router.get(
    '/',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {
        try {

            const { parent_only } = req.query;

            let query = `
                SELECT
                    id,
                    name,
                    created_at,
                    is_active,
                    is_parent_company,
                    parent_company_id
                FROM companies
                WHERE is_active = TRUE
            `;

            const params = [];

            if (parent_only === 'true') {
                query += `
                    AND is_parent_company = TRUE
                `;
            }

            query += `
                ORDER BY name ASC
            `;

            const result = await pool.query(
                query,
                params
            );

            res.json(result.rows);

        } catch (err) {

            console.error(
                'GET COMPANIES ERROR:',
                err
            );

            res.status(500).send(
                'Error fetching companies'
            );
        }
    }
);
// =========================
// הוספת חברה
// =========================

router.post(
    '/',
    authenticateToken,
    authorizeRoles('super_admin', 'company_admin'),
    async (req, res) => {

        try {

            const { name } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).send('יש להזין שם חברה');
            }

            const companyName = name.trim();

            const result = await pool.query(
                `
                INSERT INTO companies (name)
                VALUES ($1)
                RETURNING
                    id,
                    name,
                    created_at,
                    is_active
                `,
                [companyName]
            );

            res.status(201).json(result.rows[0]);

        } catch (err) {

            console.error(
                'CREATE COMPANY ERROR:',
                err
            );

            if (err.code === '23505') {
                return res
                    .status(400)
                    .send('החברה כבר קיימת');
            }

            res
                .status(500)
                .send('Error creating company');
        }
    }
);


module.exports = router;