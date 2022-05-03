import User from "../models/user";
import  queryString from "query-string";
import Hotel from "../models/hotel";
import Order from "../models/order";

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

export const getSessionId = async (req, res) => {


    try {
        // 1. get hotel details
        const {hotelId} = req.body;
        const hotel = await Hotel.findById(hotelId).populate("postedBy").exec();

        // 2. 15% charge as app fee
        const fee = hotel.price * 0.15
        
        // 3. create Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],

        // 4. item details    
            line_items: [{
              name: 'hotel booking',
              amount: hotel.price * 100, // in cents
              currency: 'usd',
              quantity: 1,
            }],
        
        // 5. create payment intent with app fee
            payment_intent_data: {
              application_fee_amount: fee * 100, // in cents
              transfer_data: {
                destination: hotel.postedBy.stripe_account_id,
              },
            },
            mode: 'payment',
            success_url: `${process.env.STRIPE_SUCCESS_URL}/${hotel._id}`,
            cancel_url: process.env.STRIPE_CANCEL_URL,
          });

        // 6. add session object to user in db
        const user = await User.findByIdAndUpdate(req.user._id, {stripeSession: session}).exec();

        // 7. send the link to frontend
        res.send({
            sessionURL: session.url
        });

    } catch (error) {
        console.log(error);
    }
}

export const stripeCheckoutSuccess = async (req, res) => {
    try {
        // 1. get data
        const { hotelId } = req.body;
        const user = await User.findById(req.user._id).exec();
        const session = await stripe.checkout.sessions.retrieve(user.stripeSession.id);
        // 2. create order
        if (session.payment_status === "paid") {
            // check if order already exist
            const orderExist = await Order.findOne({"session.id": session.id}).exec();
            if (orderExist) {
                res.json({success: true});
            } else {
                // create order if not exist
                let newOrder = await new Order({
                    hotel: hotelId,
                    session: session,
                    orderedBy: user._id,
                }).save();
                // remove user's stripeSession
                await User.findByIdAndUpdate(user._id, {
                    $set: { stripeSession: {} }
                });
                // send sucess response
                res.json({success: true});
            }
        }
    } catch (error) {
        console.log("STRIPE CHECKOUT SUCCESS ERROR ===> ", error);
    }
}