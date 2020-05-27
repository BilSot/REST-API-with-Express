const express = require('express');
const bcryptjs = require('bcryptjs');
// const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');
const {User, Sequelize} = require('../models/index');
const authenticateUser = require('./authenticateUser');
// const Op = Sequelize.Op;
const router = express.Router();

function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            res.status = 404;
            next(error);
        }
    }
}

//Get users
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const users = await User.findByPk(user.id, {
        attributes: ['firstName', 'lastName', 'emailAddress']
    });
    res.status(200).json(users);
}));

router.post('/users', [
    check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .isEmail()
        .withMessage('Please provide valid "emailAddress"')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "emailAddress"'),
    check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "password"'),
], async (req, res) => {
    try {
        // Attempt to get the validation result from the Request object.
        const errors = validationResult(req);

        // If there are validation errors...
        if (!errors.isEmpty()) {
            // Use the Array `map()` method to get a list of error messages.
            const errorMessages = errors.array().map(error => error.msg);

            // Return the validation errors to the client.
            return res.status(400).json({ errors: errorMessages });
        }

        // Get user req body
        const user = await req.body;

        // Hash the new user's password.
        user.password = bcryptjs.hashSync(user.password);


        // Add the user to the `users` array.
        await User.create(user);

        // Set the status to 201 Created and end the response.
        return res.location("\\").status(201).end();
    } catch (error) {
        if (error === 'SequelizeUniqueConstraintError') {
            res.status(500).json('The credentials you entered are already in use').end();
        }
        else {
            res.status(500).json('There was a problem with your request')
        }
    }

});

module.exports = router;
