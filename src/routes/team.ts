import express from "express";

import {
  grantAccess,
  permissionMiddleware,
  tokenMiddleware,
} from "../middleware";
import {
  createTeam,
  getAllTeams,
  getTeam,
  getTeamByLead,
  getTeamByMember,
  updateTeam,
  deleteTeam,
  deleteTeamMember,
} from "../controllers/team";
const router = express.Router();

router.get("/", tokenMiddleware, permissionMiddleware(["read"]), getAllTeams);

router.get(
  "/:teamId",
  tokenMiddleware,
  grantAccess("readOwn", "team"),
  getTeam
);
router.get(
  "/lead/:leadId",
  tokenMiddleware,
  grantAccess("readOwn", "team"),
  getTeamByLead
);
router.get(
  "/member/:memberId",
  tokenMiddleware,
  grantAccess("readOwn", "team"),
  getTeamByMember
);
router.post("/", tokenMiddleware, grantAccess("createAny", "team"), createTeam);
router.put(
  "/:teamId",
  tokenMiddleware,
  grantAccess("updateAny", "team"),
  updateTeam
);

router.delete(
  "/:teamId/member/:memberUserId",
  tokenMiddleware,
  grantAccess("deleteAny", "team"),
  deleteTeamMember
);
router.delete(
  "/:teamId",
  tokenMiddleware,
  grantAccess("deleteAny", "team"),
  deleteTeam
);

export default router;
