const express = require('express');
const { check, validationResult } = require('express-validator');
const {User, Course, Sequelize} = require('../models/index');
const Op = Sequelize.Op;
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

router.get('/courses', asyncHandler(async(req, res, next) => {
    const allCourses = await Course.findAll({
        include: [
            {
                model: User
            }
        ]
    });
    res.status(200).json(allCourses);
}));

router.get('/courses/:id', asyncHandler(async(req, res, next) => {
    let course = await Course.findByPk(req.params.id, {
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName', 'emailAddress']
            }
        ]
    });
    if(course) {
        res.status(200).json(course);
    }else{
        next();
    }
}));

router.post('/courses', [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"'),
    check('userId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "userId"')
], asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }else{
        await Course.create(req.body);
        return res.location("\\").status(201).end();
    }
}));

router.put('/courses/:id', [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"')
    ], asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({errors: errorMessages});
    }else {
        let course = await Course.findByPk(req.params.id);
        if (course) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            let err = new Error("Course not found");
            next(err);
        }
    }
}));

module.exports = router;
