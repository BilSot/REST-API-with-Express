const asyncHandler = (callbackFunc) => {
    return async (req, res, next) => {
        try {
            await callbackFunc(req, res, next)
        } catch (error) {
            res.status = 404;
            next(error);
        }
    }
};

module.exports = asyncHandler;
