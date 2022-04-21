import User from "../models/user";
import  queryString from "query-string";

const stripe = require("stripe")(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req, res) => {
    const user = await User.findById(req.user._id).exec();

    if (!user.stripe_account_id) {
        const account = await stripe.accounts.create({type: "express"});
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
        email: user.email || undefined,
    });

    const link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
    res.send(link);
}

const updateDelayDays = async (accountId) => {
    try {
        const account = await stripe.accounts.update(accountId, {
            settings: {
                payouts: {
                    schedule: {
                        delay_days: 7,
                    },
                },
            },
        });
        return account;
    } catch (error) {
        console.log(error);
    }
    
}

export const getAccountStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).exec();
        const account = await stripe.accounts.retrieve(user.stripe_account_id);
        const updatedAccount = await updateDelayDays(account.id);
        const updatedUser = await User.findByIdAndUpdate(
            user._id, 
            {stripe_seller: updatedAccount}, 
            {new: true}
        ).select("-password").exec();
        res.json(updatedUser);
    } catch (error) {
        console.log(error);
    }
    
}

export const getAccountBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).exec();
        const account = await stripe.balance.retrieve({stripeAccount: user.stripe_account_id});
        res.json(account.pending);
    } catch (error) {
        console.log(error);
    }
    
}

export const getPayoutSetting = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).exec();
        const loginLink = await stripe.accounts.createLoginLink(
            user.stripe_account_id, 
            {redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL}
        );
        res.json(loginLink);
    } catch (error) {
        console.log(error);
    }
    
}