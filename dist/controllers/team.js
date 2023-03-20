"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMember = exports.deleteTeam = exports.updateTeam = exports.getTeamByMember = exports.getTeamByLead = exports.getTeam = exports.createTeam = exports.getAllTeams = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const team_1 = __importDefault(require("../models/team"));
const user_1 = __importDefault(require("../models/user"));
const getAllTeams = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const teams = await team_1.default.find();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllTeams = getAllTeams;
const getTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId } = req.params;
        const teams = await team_1.default.findById(teamId)
            .populate("lead")
            .populate("members")
            .exec();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeam = getTeam;
const getTeamByLead = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { leadId } = req.params;
        const teams = await team_1.default.find({ lead: leadId })
            .populate("lead")
            .populate("members")
            .exec();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamByLead = getTeamByLead;
const getTeamByMember = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { memberId } = req.params;
        const teams = await team_1.default.find({ members: memberId })
            .populate("lead")
            .populate("members")
            .exec();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamByMember = getTeamByMember;
const createTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { name, leadId, about, membersId } = req.body;
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
        }
        const team = new team_1.default({
            name,
            lead: leadId,
            about,
            members: membersId,
        });
        await team.save();
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
        }
        if (membersId) {
            if (!Array.isArray(membersId))
                throw new Error("Invalid members array");
            const members = await user_1.default.find({ _id: { $in: membersId } });
            if (members.length !== membersId.length)
                throw new Error("Invalid member ID");
        }
        const newMembers = membersId.filter((member) => !teamUpdate.members.includes(member));
        if (newMembers.length) {
            teamUpdate.members.push(...newMembers);
            await teamUpdate.save();
        }
        let updatedTeam = await team_1.default.findByIdAndUpdate({ _id: teamId }, {
            name,
            lead: leadId,
            about,
        }, { new: true }).populate("lead");
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
const deleteTeamMember = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId, memberUserId } = req.params;
        const team = await team_1.default.findById(teamId);
        if (!team)
            throw new Error("Team not found");
        const memberIndex = team.members.indexOf(memberUserId);
        if (memberIndex === -1)
            throw new Error("Member not found");
        team.members.splice(memberIndex, 1);
        await team.save();
        res.status(200).json({ message: "Member deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTeamMember = deleteTeamMember;
const deleteTeam = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await team_1.default.findByIdAndDelete(teamId);
        if (!team)
            throw new Error("Team not found");
        res.status(200).json({ message: "Team deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTeam = deleteTeam;
//# sourceMappingURL=team.js.map