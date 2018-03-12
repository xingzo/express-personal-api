var mongoose = require("mongoose");
mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/personal-api");
mongoose.Promise = global.Promise;  // use native Promise

module.exports.Project = require("./project.js");
