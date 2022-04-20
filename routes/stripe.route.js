import express from "express";

import { createConnectAccount, getAccountStatus } from "../controllers/stripe.controller";
import { requireSignIn } from "../middlewares";

const router = express.Router();

router.post("/create-connect-account", requireSignIn, createConnectAccount);
router.post("/get-account-status", requireSignIn, getAccountStatus);


module.exports = router;