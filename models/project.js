var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  title: String,
  githubLink: String,
  screenShotLink: String,
  description: String
});

var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
