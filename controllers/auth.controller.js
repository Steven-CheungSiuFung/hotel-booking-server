import jwt from "jsonwebtoken";

import User from "../models/user";

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    if(!name) return res.status(400).send("Name is required");
    if(!password || password.length < 6) return res.status(400).send("Password is required and should be min 6 characters long");
    let userExist = await User.findOne({email}).exec();
    if(userExist) return res.status(400).send("Email is taken");

    const user = new User(req.body);
    try {
        await user.save();
        console.log("USER CREATED", user);
        return res.json({ ok: true });
    } catch (error) {
        console.log("CREATE USER FAILED", error);
        return res.status(400).send("Error. Please try again.");
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email) return res.status(400).send("Email is required");
    if(!password) return res.status(400).send("Password is required");

    try {
        let user = await User.findOne({email}).exec();

        if(!user) return res.status(400).send("user not found");

        user.comparePassword(password, (err, isMatch) => {
            if(!isMatch || err) return res.status(400).send("Password is not correct");

            let token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

            res.json({token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                stripe_account_id: user.stripe_account_id,
                stripe_seller: user.stripe_seller,
                stripeSession: user.stripeSession,
            }});

        })
    } catch (error) {
        res.status(400).send("Sign in failed")
    }
}
