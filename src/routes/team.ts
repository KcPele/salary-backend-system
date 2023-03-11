import express from "express";

import { grantAccess, tokenMiddleware } from "../middleware";
import {
  createTeam,
  getAllTeams,
  getTeam,
  getTeamByLead,
  getTeamByMember,
  updateTeam,
  deleteTeam,
} from "../controllers/team";
const router = express.Router();

router.get("/", tokenMiddleware, grantAccess("readAny", "team"), getAllTeams);

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
  "/:teamId",
  tokenMiddleware,
  grantAccess("deleteAny", "team"),
  deleteTeam
);
export default router;
