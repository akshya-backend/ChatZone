import jwt from "jsonwebtoken";
import User from "../models/User-model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            // If token is not present, render landing page
            return res.redirect("/");
        }

        const decodedToken = jwt.verify(token, process.env.JwtsecretKey);
        const user = await User.findOne({ email: decodedToken.email }).select("-password");
        if (!user) {
            // If user is not found, clear cookie and render landing page
            res.clearCookie('token');
            return res.redirect("/")
            
        }
        // Token is present and user is found, proceed to the next middleware
        req.id=user._id
        next();
    } catch (error) {
        // Handle any errors and render landing page
        console.error("Error in verifyJWT middleware:", error);
        res.render("landingPage")
    }
};
