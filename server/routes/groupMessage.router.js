import express from "express"
import { sendGroupMessage, getGroupMessages } from "../controllers/group.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
const groupMessageRouter = express.Router()
groupMessageRouter.post("/send/:groupId" , protectRoute,sendGroupMessage)
groupMessageRouter.get("/:groupId", protectRoute, getGroupMessages)

export default groupMessageRouter;