const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const {User, Sequelize} = require('../models/index');
const Op = Sequelize.Op;

const authenticateUser = async (req, res, next) => {
    let message = null;
    try {
        const credentials = auth(req);
        if (credentials) {
            const user = await User.findOne({
                where: {
                    emailAddress: {
                        [Op.eq]: credentials.name
                    }
                }
            });
            if (user) {
                req.currentUser = user;
                const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
                if (authenticated) {
                    console.log(`Authentication successful for username ${user.emailAddress}`)
                    req.currentUser = user;
                } else {
                    message = `Authentication failure for username ${user.emailAddress}`;
                }
            } else {
                message = `User not found for username ${credentials.name}`;
            }
        } else {
            message = `Auth header not found`;
        }
        if (message) {
            console.warn(message);
            res.status(401).json({message: 'Access Denied'});
        } else {
            next();
        }
    } catch
        (error) {
        console.log({error: error.message});
    }
}

module.exports = authenticateUser;
