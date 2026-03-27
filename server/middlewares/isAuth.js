import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies

        if (!token) {
            return res.status(401).json({ message: "No token provided" })
        }

        let verifyToken;
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" })
        }

        req.userId = verifyToken.userId
        next()

    } catch (error) {
        return res.status(500).json({ message: `isAuth error ${error}` })
    }
}

export default isAuth