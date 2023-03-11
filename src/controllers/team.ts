import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import TeamModel from "../models/team";
import User from "../models/user";

const getAllTeams = asyncHandler(async (req: Request, res: Response) => {
  try {
    const teams = await TeamModel.find();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const getTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teams = await TeamModel.findById(teamId)
      .populate("lead")
      .populate("members")
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const getTeamByLead = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const teams = await TeamModel.find({ lead: leadId })
      .populate("lead")
      .populate("members")
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const getTeamByMember = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const teams = await TeamModel.find({ members: memberId })
      .populate("lead")
      .populate("members")
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const createTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, leadId, about, membersId } = req.body;
    // Validate required fields
    if (!name || !leadId) {
      throw new Error("Please provide a name and lead");
    }

    // Check if lead exists
    const user = await User.findById(leadId);
    if (!user) throw new Error("Invalid lead ID");
    if (membersId) {
      if (!Array.isArray(membersId)) throw new Error("Invalid members array");

      const members = await User.find({ _id: { $in: membersId } });
      if (members.length !== membersId.length)
        throw new Error("Invalid member ID");
    }

    const team = new TeamModel({
      name,
      lead: leadId,
      about,
      members: membersId,
    });
    await team.save();
    res.status(201).json(team);
  } catch (error: any) {
    if (error.code === 11000) {
      res
        .status(409)
        .json({ message: "user cannot be a member of a team twice" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamUpdate = await TeamModel.findById(teamId);
    if (!teamUpdate) throw new Error("Team not found");
    const { name, leadId, about, membersId } = req.body;

    // Check if lead exists
    if (leadId) {
      const user = await User.findById(leadId);
      if (!user) throw new Error("Invalid lead ID");
    }
    if (membersId) {
      if (!Array.isArray(membersId)) throw new Error("Invalid members array");
      const members = await User.find({ _id: { $in: membersId } });
      if (members.length !== membersId.length)
        throw new Error("Invalid member ID");
    }

    const newMembers = membersId.filter(
      (member: any) => !teamUpdate.members.includes(member)
    );
    if (newMembers.length) {
      teamUpdate.members.push(...newMembers);
      await teamUpdate.save();
    }

    let updatedTeam = await TeamModel.findByIdAndUpdate(
      { _id: teamId },
      {
        name,
        lead: leadId,
        about,
      },
      { new: true }
    ).populate("lead");
    res.status(200).json(updatedTeam);
  } catch (error: any) {
    if (error.code === 11000) {
      res
        .status(409)
        .json({ message: "user cannot be a member of a team twice" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

const deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId, memberUserId } = req.params;
    const team = await TeamModel.findById(teamId);
    if (!team) throw new Error("Team not found");
    const memberIndex = team.members.indexOf(memberUserId as any);
    if (memberIndex === -1) throw new Error("Member not found");
    team.members.splice(memberIndex, 1);
    await team.save();
    res.status(200).json({ message: "Member deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const team = await TeamModel.findByIdAndDelete(teamId);
    if (!team) throw new Error("Team not found");
    res.status(200).json({ message: "Team deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export {
  getAllTeams,
  createTeam,
  getTeam,
  getTeamByLead,
  getTeamByMember,
  updateTeam,
  deleteTeam,
  deleteTeamMember,
};
