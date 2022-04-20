import expressJWT from "express-jwt";

//req.user._id
export const requireSignIn = expressJWT({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
})