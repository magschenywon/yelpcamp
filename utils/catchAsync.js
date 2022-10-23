module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
//parse in a function, execute it, and catch any error, parse the error to next()
