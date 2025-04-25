const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const TeamMember = mongoose.model("TeamMember", TeamMemberSchema);

module.exports = TeamMember;
