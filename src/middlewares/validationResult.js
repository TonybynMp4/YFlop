const { validationResult } = require("express-validator")

module.exports = (req, res, next) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        next();
    } catch (err) {
        next(err);
    }
}