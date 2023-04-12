"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMember = exports.deleteTeam = exports.updateTeam = exports.getTeamByMember = exports.getTeamByLead = exports.getTeam = exports.createTeam = exports.getAllTeams = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const team_1 = __importDefault(require("../models/team"));
const user_1 = __importDefault(require("../models/user"));
const activity_1 = require("./activity");
const record_1 = __importDefault(require("../models/record"));
//get all teams
const getAllTeams = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const teams = await team_1.default.find({ lead: { $ne: null } });
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllTeams = getAllTeams;
//get team by id
const getTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId } = req.params;
        const teams = await team_1.default.findById(teamId)
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeam = getTeam;
//get team by team leads id
const getTeamByLead = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { leadId } = req.params;
        const teams = await team_1.default.find({ lead: leadId })
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamByLead = getTeamByLead;
//get team by team members id
const getTeamByMember = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { memberId } = req.params;
        const teams = await team_1.default.find({ members: memberId })
            .populate({
            path: "lead",
            select: "_id email full_name discord_username image",
        })
            .populate({
            path: "members",
            select: "_id email full_name discord_username image",
        })
            .exec();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamByMember = getTeamByMember;
//create team
const createTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { name, leadId, about, membersId } = req.body;
        let total_salary = 0;
        let aggregated_salary = 0;
        // Validate required fields
        if (!name || !leadId) {
            throw new Error("Please provide a name and lead");
        }
        // Check if lead exists
        const user = await user_1.default.findById(leadId);
        if (!user)
            throw new Error("Invalid lead ID");
        if (membersId) {
            if (!Array.isArray(membersId))
                throw new Error("Invalid members array");
            const members = await user_1.default.find({ _id: { $in: membersId } });
            if (members.length !== membersId.length)
                throw new Error("Invalid member ID");
            const memberRecords = await record_1.default.find({
                user: { $in: membersId },
            });
            // Calculate total salary of members in the group
            total_salary = members.reduce((a, b) => a + b.salary, 0);
            // Calculate aggregated salary of members in the group
            aggregated_salary = memberRecords.reduce((a, b) => a + b.salary, 0);
        }
        const leadRecords = await record_1.default.find({ user: leadId });
        // Calculate total salary of lead in the group
        total_salary = user.salary + total_salary;
        // Calculate aggregated salary of lead in the group
        aggregated_salary =
            leadRecords.reduce((a, b) => a + b.salary, 0) + aggregated_salary;
        const team = new team_1.default({
            name,
            lead: leadId,
            about,
            members: membersId,
            total_salary,
            aggregated_salary,
        });
        await team.save();
        (0, activity_1.createActivity)("Team created", req.user._id);
        res.status(201).json(team);
    }
    catch (error) {
        if (error.code === 11000) {
            res
                .status(409)
                .json({ message: "user cannot be a member of a team twice" });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.createTeam = createTeam;
//update team
const updateTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId } = req.params;
        const teamUpdate = await team_1.default.findById(teamId);
        if (!teamUpdate)
            throw new Error("Team not found");
        const { name, leadId, about, membersId } = req.body;
        // Check if lead exists
        if (leadId) {
            const user = await user_1.default.findById(leadId);
            if (!user)
                throw new Error("Invalid lead ID");
            // getting aggregated salary of old lead
            const oldLead = (await user_1.default.findById(teamUpdate.lead));
            const oldLeadRecords = await record_1.default.find({ user: teamUpdate.lead });
            let oldLeadAggregatedSalary = oldLeadRecords.reduce((a, b) => a + b.salary, 0);
            const leadRecords = await record_1.default.find({ user: leadId });
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
            if (!Array.isArray(membersId))
                throw new Error("Invalid members array");
            const members = await user_1.default.find({ _id: { $in: membersId } });
            if (members.length !== membersId.length)
                throw new Error("Invalid member ID");
            //checking and finding only members id that is not in the model to avoid dublicate of members in a team
            const newMembers = membersId.filter((member) => !teamUpdate.members.includes(member));
            //if there is new members then we will add them to the team
            if (newMembers.length) {
                const memberRecords = await record_1.default.find({
                    user: { $in: newMembers },
                });
                // Calculate total salary of new members in the group
                const members = await user_1.default.find({ _id: { $in: newMembers } });
                const total_salary = members.reduce((a, b) => a + b.salary, 0);
                // Calculate aggregated salary of new members in the group
                const aggregated_salary = memberRecords.reduce((a, b) => a + b.salary, 0);
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
        let updatedTeam = await team_1.default.findByIdAndUpdate({ _id: teamId }, {
            name,
            lead: leadId,
            about,
        }, { new: true }).populate({
            path: "lead",
            select: "_id email full_name discord_username image",
        });
        (0, activity_1.createActivity)(`Team ${updatedTeam === null || updatedTeam === void 0 ? void 0 : updatedTeam.name} was updated`, req.user._id);
        res.status(200).json(updatedTeam);
    }
    catch (error) {
        if (error.code === 11000) {
            res
                .status(409)
                .json({ message: "user cannot be a member of a team twice" });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.updateTeam = updateTeam;
//delete team members
const deleteTeamMember = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const team = await team_1.default.findById(teamId);
        if (!team)
            throw new Error("Team not found");
        const memberIndex = team.members.indexOf(memberId);
        if (memberIndex === -1)
            throw new Error("Member not found");
        const memberRecords = await record_1.default.find({
            user: memberId,
        });
        // Calculate total salary of member in the group that is being deleted and removed it from the team total salary
        const member = await user_1.default.findById(memberId);
        if (member) {
            team.total_salary = team.total_salary - member.salary;
        }
        // Calculate aggregated salary of member in the group that is being deleted and removed it from the team aggregated salary
        let totalAggregateSalary = memberRecords.reduce((a, b) => a + b.salary, 0);
        team.aggregated_salary = team.aggregated_salary - totalAggregateSalary;
        team.members.splice(memberIndex, 1);
        await team.save();
        (0, activity_1.createActivity)(`A member from team ${team.name} was deleted`, req.user._id);
        res.status(200).json({ message: "Member deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTeamMember = deleteTeamMember;
//delete team
const deleteTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await team_1.default.findByIdAndDelete(teamId);
        if (!team)
            throw new Error("Team not found");
        await user_1.default.updateMany({ team: teamId }, { $unset: { team: null } });
        (0, activity_1.createActivity)(`Team ${team.name} was deleted`, req.user._id);
        res.status(200).json({ message: "Team deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTeam = deleteTeam;
//# sourceMappingURL=team.js.map