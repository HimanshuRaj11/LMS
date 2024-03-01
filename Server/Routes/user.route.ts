import express from "express"
const router = express.Router();

import { activateUser, registerUser } from "../controllers/user.controller";

router.post('/register', registerUser)
router.post('/activate-user', activateUser)


export const UserRoute = router;