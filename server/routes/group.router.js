import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getMyGroups, editName, changeAdmin, addMember, removeMember, deleteGroup, removeSelf } from "../controllers/group.controller.js";

const groupRouter = express.Router();
groupRouter.post('/create', protectRoute, createGroup);
groupRouter.get('/get', protectRoute, getMyGroups);
groupRouter.put('/editName/:groupId', protectRoute, editName);
groupRouter.put('/changeAdmin/:groupId', protectRoute, changeAdmin);
groupRouter.put('/addMember/:groupId', protectRoute, addMember);
groupRouter.put('/removeMember/:groupId', protectRoute, removeMember);
groupRouter.put('/removeSelf/:groupId', protectRoute, removeSelf);
groupRouter.delete('/delete/:groupId', protectRoute, deleteGroup);

export default groupRouter;