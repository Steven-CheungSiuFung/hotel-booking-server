import User from "../models/user";
import  queryString from "query-string";

const stripe = require("stripe")(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req, res) => {
    const user = await User.findById(req.user._id).exec();

    if (!user.stripe_account_id) {
        const account = await stripe.accounts.create({type: "express"});
        console.log(account);
        user.stripe_account_id = account.id;
        user.save();
    }
    // create login link base on account id
    let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: "account_onboarding",
    });
    // prefill any info
    accountLink = Object.assign(accountLink, {
        "stripe_user[email]": user.email ||undefined,
    });

    const link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
    res.send(link);
}