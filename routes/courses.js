const express = require('express');
const { check, validationResult } = require('express-validator');
const {User, Course} = require('../models/index');
const authenticateUser = require('./authenticateUser');
const asyncHandler = require('./asyncHandler');
const router = express.Router();

/*
GET all the courses, including the information of the Users assigned to them
 */
router.get('/courses', asyncHandler(async(req, res) => {
    const allCourses = await Course.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName', 'emailAddress']
            }
        ]
    });
    res.status(200).json(allCourses);
}));

/*
GET the course with the matching id, including the information of the User assigned to it
 */
router.get('/courses/:id', asyncHandler(async(req, res, next) => {
    let course = await Course.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
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
        let err = new Error("Course not found");
        err.status = 404;
        next(err);
    }
}));

/*
POST for new course creation, assigned to the authenticated user
 */
router.post('/courses', [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"')
], authenticateUser, asyncHandler(async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }else{
        const user = req.currentUser;
        let newCourse = {...req.body};
        newCourse.userId = user.id;
        const newlyCreatedCourse = await Course.create(newCourse);
        return res.status(201).location(`courses/${newlyCreatedCourse.id}`).end();
    }
}));

/*
PUT method/editing a course - which is allowed only if the authenticated user is assigned to the course selected
 */
router.put('/courses/:id', authenticateUser, [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"')
    ], asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages});
    }else {
        const user = req.currentUser;
        let course = await Course.findByPk(req.params.id);
        if (course) {
            if(course.userId === user.id) {
                await course.update(req.body);
                res.status(204).end();
            }else{
                let err = new Error("Course can not be updated by this user.");
                err.status = 403;
                next(err);
            }
        } else {
            let err = new Error("Course not found");
            err.status = 404;
            next(err);
        }
    }
}));

/*
DELETE a course - which is allowed only if the authenticated user is assigned to the course selected
 */
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res, next) => {
    const user = req.currentUser;
    let course = await Course.findByPk(req.params.id);
    if(course){
        if(course.userId === user.id) {
            await course.destroy();
            res.status(204).end();
        }else{
            let err = new Error("Course can not be updated by this user.");
            err.status = 403;
            next(err);
        }
    }else{
        let err = new Error("Course not found");
        err.status = 404;
        next(err);
    }
}));

module.exports = router;
