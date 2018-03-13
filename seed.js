// This file allows us to seed our application with data
// simply run: `node seed.js` from the root of this project folder.

var db = require('./models');
var x = 4;

var new_project = [
                  {title: "finDining",
                  githubLink: "https://github.com/SF-WDI/project1-findining",
                  screenShotLink: "https://github.com/SF-WDI/project1-findining",
                  description: "Ruby on Rails Food truck finder app"},

                  {title: "GAConnect",
                  githubLink: "https://github.com/kjkeaston/ga-connect",
                  screenShotLink: "https://github.com/SF-WDI/project1-findining",
                  description: "Ruby on Rails social networking site"},

                  {title: "RacerGame",
                  githubLink: "https://github.com/xingzo/racer-game",
                  screenShotLink: "https://github.com/SF-WDI/project1-findining",
                  description: "Javascript Racing Game"},

                  {title: "Trivia Game",
                githubLink: "https://github.com/Manjilan/trivia-game",
                screenShotLink: "https://github.com/SF-WDI/project1-findining",
                description: "Ruby console/terminal trivia game"},

              ];


db.Project.remove({}, function(err, projects) {
  console.log('removed all projects');
  db.Project.create(new_project, function(err, project){
    if (err){
      return console.log("Error:", err);
    }

    console.log('recreated all projects');
    console.log("created", new_project.length, "projects");

    // console.log("Created new ", project._id)
    process.exit(); // we're all done! Exit the program.
  });

});
