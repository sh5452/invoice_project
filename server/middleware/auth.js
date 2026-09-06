const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access token required');
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        console.log("AUTH USER:", req.user);

        next();

    } catch (err) {

        console.error(err);

        return res
            .status(401)
            .send('Invalid or expired token');
    }
}

function authenticateRefreshToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access token required');
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { ignoreExpiration: true }
        );

        req.user = decoded;

        next();

    } catch (err) {

        console.error(err);

        return res.status(401).send('Invalid token');
    }
}

function authorizeRoles(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        console.log("AUTHORIZE ROLE:", req.user.role);
        console.log("ALLOWED ROLES:", allowedRoles);

        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .send('אין לך הרשאה לבצע פעולה זו');
        }

        next();
    };
}


module.exports = {
    authenticateToken,
    authorizeRoles,
      authenticateRefreshToken
};