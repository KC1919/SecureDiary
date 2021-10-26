const jwt = require("jsonwebtoken");

const verify = async (req, res, next) => {

    try {
        const token = req.cookies["secret"];

        const payload = jwt.verify(token, process.env.JWT_KEY);

        if (payload) {
            req.userId = payload.userId;
            next();
        } else {
            return res.status(401).json("Unauthorized User");
        }
    } catch (error) {
        console.log("Error in verification, internal server error");
        return res.status(500).json({
            message: "Error in verification, internal server error",
            error: error
        });
    }
}

module.exports = verify;