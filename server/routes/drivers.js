const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');


// =========================
// הצגת נהגי החברה
// =========================

router.get(
    '/',
    authenticateToken,
    authorizeRoles('company_admin'),
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT
                    id,
                    username,
                    full_name
                FROM users
                WHERE company = $1
                AND role = 'driver'
                AND is_active = TRUE
                ORDER BY full_name
                `,
                [req.user.company]
            );

            res.json(result.rows);

        } catch (err) {

            console.error(err);
            res.status(500).send('Error fetching drivers');

        }
    }
);


module.exports = router;