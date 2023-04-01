import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import TeamModel from "../models/team";
import User, { IUser } from "../models/user";
import ActivityModel from "../models/activity";
import { createActivity } from "./activity";
import RecordModel from "../models/record";

//get all teams
const getAllTeams = asyncHandler(async (req: Request, res: Response) => {
  try {
    const teams = await TeamModel.find({ lead: { $ne: null } });
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//get team by id
const getTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teams = await TeamModel.findById(teamId)
      .populate({
        path: "lead",
        select: "_id email full_name image",
      })
      .populate({
        path: "members",
        select: "_id email full_name image",
      })
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//get team by team leads id
const getTeamByLead = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const teams = await TeamModel.find({ lead: leadId })
      .populate({
        path: "lead",
        select: "_id email full_name image",
      })
      .populate({
        path: "members",
        select: "_id email full_name image",
      })
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//get team by team members id
const getTeamByMember = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const teams = await TeamModel.find({ members: memberId })
      .populate({
        path: "lead",
        select: "_id email full_name image",
      })
      .populate({
        path: "members",
        select: "_id email full_name image",
      })
      .exec();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//create team
const createTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, leadId, about, membersId } = req.body;
    let total_salary = 0;
    let aggregated_salary = 0;
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
      const memberRecords = await RecordModel.find({
        user: { $in: membersId },
      });
      // Calculate total salary of members in the group
      total_salary = members.reduce((a, b) => a + b.salary, 0);
      // Calculate aggregated salary of members in the group
      aggregated_salary = memberRecords.reduce((a, b) => a + b.salary, 0);
    }
    const leadRecords = await RecordModel.find({ user: leadId });
    // Calculate total salary of lead in the group
    total_salary = user.salary + total_salary;
    // Calculate aggregated salary of lead in the group
    aggregated_salary =
      leadRecords.reduce((a, b) => a + b.salary, 0) + aggregated_salary;

    const team = new TeamModel({
      name,
      lead: leadId,
      about,
      members: membersId,
      total_salary,
      aggregated_salary,
    });
    await team.save();
    createActivity("Team created", req.user._id);
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

//update team
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
      // getting aggregated salary of old lead
      const oldLead = (await User.findById(teamUpdate.lead)) as IUser;
      const oldLeadRecords = await RecordModel.find({ user: teamUpdate.lead });
      let oldLeadAggregatedSalary = oldLeadRecords.reduce(
        (a, b) => a + b.salary,
        0
      );
      const leadRecords = await RecordModel.find({ user: leadId });
      // Calculate total salary of new lead in the group and removed the old lead salary
      teamUpdate.total_salary =
        user.salary + teamUpdate.total_salary - oldLead.salary;
      // Calculate aggregated salary of new lead in the group and removed the old lead aggregated salary
      teamUpdate.aggregated_salary =
        leadRecords.reduce((a, b) => a + b.salary, 0) +
        teamUpdate.aggregated_salary -
        oldLeadAggregatedSalary;
    }
    // Check if members exists
    if (membersId) {
      // validating if it was an array that was passed in the request body
      if (!Array.isArray(membersId)) throw new Error("Invalid members array");
      const members = await User.find({ _id: { $in: membersId } });
      if (members.length !== membersId.length)
        throw new Error("Invalid member ID");
      //checking and finding only members id that is not in the model to avoid dublicate of members in a team
      const newMembers = membersId.filter(
        (member: any) => !teamUpdate.members.includes(member)
      );
      //if there is new members then we will add them to the team
      if (newMembers.length) {
        const memberRecords = await RecordModel.find({
          user: { $in: newMembers },
        });
        // Calculate total salary of new members in the group
        const members = await User.find({ _id: { $in: newMembers } });
        const total_salary = members.reduce((a, b) => a + b.salary, 0);
        // Calculate aggregated salary of new members in the group
        const aggregated_salary = memberRecords.reduce(
          (a, b) => a + b.salary,
          0
        );
        //updating the team model total salary and aggregated salary
        teamUpdate.total_salary = teamUpdate.total_salary + total_salary;
        teamUpdate.aggregated_salary =
          teamUpdate.aggregated_salary + aggregated_salary;
        //pushing the new members to the team model
        teamUpdate.members.push(...newMembers);
      }
    }
    //saving the team model
    await teamUpdate.save();

    let updatedTeam = await TeamModel.findByIdAndUpdate(
      { _id: teamId },
      {
        name,
        lead: leadId,
        about,
      },
      { new: true }
    ).populate({
      path: "lead",
      select: "_id email full_name image",
    });
    createActivity(`Team ${updatedTeam?.name} was updated`, req.user._id);

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

//delete team members
const deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const team = await TeamModel.findById(teamId);
    if (!team) throw new Error("Team not found");
    const memberIndex = team.members.indexOf(memberId as any);
    if (memberIndex === -1) throw new Error("Member not found");
    const memberRecords = await RecordModel.find({
      user: memberId,
    });
    // Calculate total salary of member in the group that is being deleted and removed it from the team total salary
    const member = await User.findById(memberId);
    if (member) {
      team.total_salary = team.total_salary - member.salary;
    }
    // Calculate aggregated salary of member in the group that is being deleted and removed it from the team aggregated salary
    let totalAggregateSalary = memberRecords.reduce((a, b) => a + b.salary, 0);
    team.aggregated_salary = team.aggregated_salary - totalAggregateSalary;
    team.members.splice(memberIndex, 1);
    await team.save();
    createActivity(`A member from team ${team.name} was deleted`, req.user._id);
    res.status(200).json({ message: "Member deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//delete team
const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const team = await TeamModel.findByIdAndDelete(teamId);
    if (!team) throw new Error("Team not found");
    createActivity(`Team ${team.name} was deleted`, req.user._id);
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
