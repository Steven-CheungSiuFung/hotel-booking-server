import express from "express";

import { createConnectAccount, getAccountStatus, getAccountBalance, getPayoutSetting } from "../controllers/stripe.controller";
import { requireSignIn } from "../middlewares";

const router = express.Router();

router.post("/create-connect-account", requireSignIn, createConnectAccount);
router.post("/get-account-status", requireSignIn, getAccountStatus);
router.post("/get-account-balance", requireSignIn, getAccountBalance);
router.post("/get-payout-setting", requireSignIn, getPayoutSetting);


module.exports = router;