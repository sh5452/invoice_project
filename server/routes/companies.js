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

            const result = await pool.query(
                `
                SELECT
                    id,
                    name,
                    created_at,
                    is_active

                FROM companies

                WHERE is_active = TRUE

                ORDER BY name ASC
                `
            );

            res.json(result.rows);

        } catch (err) {

            console.error(
                'GET COMPANIES ERROR:',
                err
            );

            res
                .status(500)
                .send('Error fetching companies');

        }

    }
);


module.exports = router;