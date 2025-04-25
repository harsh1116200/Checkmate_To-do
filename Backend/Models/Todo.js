const mongoose = require('mongoose');


const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  // priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "teammembers" }, // HARSH-CHANGES
  progress: { type: Number, default: 0 } 
});


const Todo = mongoose.model('Todo', TodoSchema);

module.exports = Todo;
