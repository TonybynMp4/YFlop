const { body } = require("express-validator");

const Validators = {
    email: body('email')
		.notEmpty()
		.trim()
		.isEmail()
		.withMessage('Invalid email')
		.normalizeEmail(),
    password: body('password').notEmpty().trim().isStrongPassword({
        minLength: 10,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('Password is too weak'),
	username: body('username').notEmpty().trim()
	.isAlphanumeric()
	.withMessage('Username must be alphanumeric')
	.isLowercase()
	.withMessage('Username must be lowercase')
	.isLength({ min: 3, max: 20 })
	.withMessage('Username must be between 3 and 20 characters long')
	.matches(/^[a-z0-9-_]+$/)
	.withMessage('Username can only contain lowercase letters, numbers, dashes and underscores')
}

module.exports = Validators;