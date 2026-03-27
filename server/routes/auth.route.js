import { googleAuth, logOut } from "../controllers/auth.controller.js"
import express from "express";
const authRouter = express.Router()


authRouter.post("/google",googleAuth)
authRouter.get("/logout",logOut)


export default authRouter