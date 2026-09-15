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
                companyId,
                customerCompanyId,
                role,
                password
            } = req.body;


          if (
    !username ||
    !fullName ||
    !email ||
    !role ||
    !password
) {
    return res.status(400).send('כל השדות הם חובה');
}


if (
    req.user.role === 'super_admin' &&
    !companyId
) {
    return res.status(400).send('יש לבחור חברה');
}


            // מנהל חברה לא יכול ליצור מנהל חברה נוסף
            if (
                role === 'company_admin' &&
                req.user.role !== 'super_admin'
            ) {
                return res
                    .status(403)
                    .send('מנהל חברה לא יכול ליצור מנהל חברה נוסף');
            }


            let userCompanyId;


            // Super Admin יכול לבחור חברה
            if (req.user.role === 'super_admin') {

                userCompanyId = companyId;

            } else {

                // Company Admin מקבל אוטומטית את החברה שלו
                userCompanyId = req.user.company_id;

            }


            // אם המשתמש אינו לקוח,
            // אין צורך בחברת לקוח
            const finalCustomerCompanyId =
                role === 'customer'
                    ? customerCompanyId || null
                    : null;


            const passwordHash = await bcrypt.hash(
                password,
                10
            );


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
                    password_hash,
                    company_id,
                    customer_company_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    (SELECT name FROM companies WHERE id = $4),
                    CASE
    WHEN $5::INTEGER IS NOT NULL
    THEN (
        SELECT name
        FROM companies
        WHERE id = $5::INTEGER
    )
    ELSE NULL
END,
                    $6,
                    $7,
                    $4,
                    $5
                )
                RETURNING
                    id,
                    username,
                    full_name,
                    email,
                    company,
                    customer_company,
                    company_id,
                    customer_company_id,
                    role,
                    created_at,
                    is_active
                `,
                [
                    username,
                    fullName,
                    email,
                    userCompanyId,
                    finalCustomerCompanyId,
                    role,
                    passwordHash
                ]
            );


            console.log(
                "USER CREATED:",
                result.rows[0]
            );


            return res
                .status(201)
                .json(result.rows[0]);


        } catch (err) {

            console.error(
                "ADD USER ERROR:",
                err
            );


            if (err.code === '23505') {

                return res
                    .status(400)
                    .send('שם המשתמש או האימייל כבר קיימים');

            }


            if (err.code === '23503') {

                return res
                    .status(400)
                    .send('החברה שנבחרה אינה קיימת');

            }


            return res
                .status(500)
                .send('Error creating user');

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


            const baseQuery = `
                SELECT
                    u.id,
                    u.username,
                    u.full_name,
                    u.email,

                    u.company_id,
                    c.name AS company,

                    u.customer_company_id,
                    cc.name AS customer_company,

                    u.role,
                    u.created_at,
                    u.is_active

                FROM users u

                LEFT JOIN companies c
                    ON u.company_id = c.id

                LEFT JOIN companies cc
                    ON u.customer_company_id = cc.id
            `;


            if (req.user.role === 'super_admin') {

                result = await pool.query(
                    `
                    ${baseQuery}
                    ORDER BY u.created_at DESC
                    `
                );

            } else {

                result = await pool.query(
                    `
                    ${baseQuery}
                    WHERE u.company_id = $1
                    ORDER BY u.created_at DESC
                    `,
                    [req.user.company_id]
                );

            }


            res.json(result.rows);


        } catch (err) {

            console.error(err);

            res
                .status(500)
                .send('Error fetching users');

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
                companyId,
                customerCompanyId,
                role
            } = req.body;


            // =========================
            // Super Admin
            // =========================

            if (req.user.role === 'super_admin') {

                const finalCustomerCompanyId =
                    role === 'customer'
                        ? customerCompanyId || null
                        : null;


                const result = await pool.query(
                    `
                    UPDATE users

                    SET
                        username = $1,
                        full_name = $2,
                        email = $3,

                        company_id = $4,

                        company = (
                            SELECT name
                            FROM companies
                            WHERE id = $4
                        ),

                        customer_company_id = $5,

                        customer_company = (
                            SELECT name
                            FROM companies
                            WHERE id = $5
                        ),

                        role = $6

                    WHERE id = $7

                    RETURNING
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        company_id,
                        customer_company_id,
                        role,
                        created_at,
                        is_active
                    `,
                    [
                        username,
                        fullName,
                        email,
                        companyId,
                        finalCustomerCompanyId,
                        role,
                        id
                    ]
                );


                if (result.rows.length === 0) {

                    return res
                        .status(404)
                        .send('User not found');

                }


                return res.json(
                    result.rows[0]
                );

            }


            // =========================
            // Company Admin
            // =========================

            if (role === 'company_admin') {

                return res
                    .status(403)
                    .send(
                        'מנהל חברה לא יכול להגדיר מנהל חברה נוסף'
                    );

            }


            const finalCustomerCompanyId =
                role === 'customer'
                    ? customerCompanyId || null
                    : null;


            const result = await pool.query(
                `
                UPDATE users

                SET
                    username = $1,
                    full_name = $2,
                    email = $3,

                    customer_company_id = $4,

                    customer_company = (
                        SELECT name
                        FROM companies
                        WHERE id = $4
                    ),

                    role = $5

                WHERE id = $6
                AND company_id = $7

                RETURNING
                    id,
                    username,
                    full_name,
                    email,
                    company,
                    customer_company,
                    company_id,
                    customer_company_id,
                    role,
                    created_at,
                    is_active
                `,
                [
                    username,
                    fullName,
                    email,
                    finalCustomerCompanyId,
                    role,
                    id,
                    req.user.company_id
                ]
            );


            if (result.rows.length === 0) {

                return res
                    .status(404)
                    .send(
                        'המשתמש לא נמצא בחברה שלך'
                    );

            }


            res.json(result.rows[0]);


        } catch (err) {

            console.error(err);


            if (err.code === '23505') {

                return res
                    .status(400)
                    .send(
                        'שם המשתמש או האימייל כבר קיימים'
                    );

            }


            if (err.code === '23503') {

                return res
                    .status(400)
                    .send(
                        'החברה שנבחרה אינה קיימת'
                    );

            }


            res
                .status(500)
                .send('Error updating user');

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
                        company_id,
                        customer_company_id,
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
                    AND company_id = $2

                    RETURNING
                        id,
                        username,
                        full_name,
                        email,
                        company,
                        customer_company,
                        company_id,
                        customer_company_id,
                        role,
                        created_at,
                        is_active
                    `,
                    [
                        id,
                        req.user.company_id
                    ]
                );

            }


            if (result.rows.length === 0) {

                return res
                    .status(404)
                    .send(
                        'המשתמש לא נמצא או שאין לך הרשאה להשבית אותו'
                    );

            }


            res.json(result.rows[0]);


        } catch (err) {

            console.error(err);

            res
                .status(500)
                .send(
                    'Error deactivating user'
                );

        }
    }
);


module.exports = router;