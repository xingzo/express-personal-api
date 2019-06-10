// require express and other modules
const cron = require("node-cron");

var express = require('express'),
    app = express();

const fetch = require('node-fetch');

// parse incoming urlencoded form data
// and populate the req.body object
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// allow cross origin requests (optional)
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/************
 * DATABASE *
 ************/

var db = require('./models');

/**********
 * ROUTES *
 **********/

// Serve static files from the `/public` directory:
// i.e. `/images`, `/scripts`, `/styles`
app.use(express.static('public'));

/*
 * HTML Endpoints
 */

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * JSON API Endpoints
 */

app.get('/api', function apiIndex(req, res) {
  // TODO: Document all your api endpoints below as a simple hardcoded JSON object.
  // It would be seriously overkill to save any of this to your database.
  // But you should change almost every line of this response.
  res.json({
    woopsIForgotToDocumentAllMyEndpoints: false, // CHANGE ME ;)
    message: "Welcome to my personal api! Here's what you need to know!",
    documentationUrl: "https://github.com/xingzo/express-personal-api/README.md", // CHANGE ME
    baseUrl: "https://dry-sierra-51475.herokuapp.com/", // CHANGE ME
    endpoints: [
      {method: "GET", path: "/api", description: "Describes all available endpoints"},
      {method: "GET", path: "/api/profile", description: "Data about me"}, // CHANGE ME
      {method: "POST", path: "/api/projects", description: "E.g. Create a new project"} // CHANGE ME
    ]
  })
});

// gets all the leads
app.get('/api/leads', async function apiIndex(req, res) {
  // const url = "https://geophysicalinsights.freshsales.io/api/contacts/view/2000309248?sort=emails&sort_type=asc&page=2";
  //   // const url = "https://geophysicalinsights.freshsales.io/api/lookup?q=tim@hoolock-consulting.com&f=email&entities=contact";
  // const response = await fetch(url, {
  //   credentials: 'include',
  //   headers: {
  //     Accept: '*/*',
  //     Host: 'geophysicalinsights.freshsales.io',
  //     'accept-encoding': 'gzip, deflate, br',
  //     Authorization: 'Token token=ruf8KPf1yojVDU8wBczyzg',
  //     'Content-Type': 'text/plain'
  //   },
  // });
  //
  // const data = await response.json();
  //
  // // console.log('async data', data)
  // console.log('type of data', typeof data)
  // console.log('type of response', typeof response)

  // console.log('data.meta', data.meta)

  let duplicates = await fetchAllLeads();
  console.log(duplicates)
  res.json(duplicates)

});

app.get('/api/profile', function apiIndex(req, res) {
  // TODO: Document all your api endpoints below as a simple hardcoded JSON object.
  // It would be seriously overkill to save any of this to your database.
  // But you should change almost every line of this response.
  res.json({

    // message: "Welcome to my personal api! Here's what you need to know about me!",
    // documentationUrl: "https://github.com/xingzo/express-personal-api/README.md",

    name: "Kingsley Nyaosi",
    githubUserName: "xingzo",
    githubLink: "https://github.com/xingzo/",
    githubProfileImage: "https://avatars1.githubusercontent.com/u/34792990?s=400&v=4",
    personalSiteLink: "http://xingzo.io",
    currentCity: "Bay Area",
    skills : [{languages: "javascript, HTML, CSS, jQuery"}, {tools: "bootstrap, github/git"}]
  })
});


//get all projects (index)
app.get('/api/projects', function apiIndex(req, res) {
  // find all todos in db
  db.Project.find(function (err, allProjects) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(allProjects);
    }
  });
});

//********************************************************
// get one project (show)
app.get('/api/projects/:id', function (req, res) {
  // get todo id from url params (`req.params`)
  var projectId = req.params.id;

  // find todo in db by id
  db.Project.findOne({ _id: projectId }, function (err, foundProject) {
    if (err) {
      if (err.name === "CastError") {
        res.status(404).json({ error: "Nothing found by this ID." });
      } else {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.json(foundProject);
    }
  });
});


//********************************************************
// create new project (create)
app.post('/api/projects', function apiIndex(req, res) {
 // create new project with form data (`req.body`)
 var newProject = new db.Project(req.body);

 // save new project in db
 newProject.save(function (err, savedProject) {
   if (err) {
     res.status(500).json({ error: err.message });
   } else {
     res.json(savedProject);
   }
 });
});

//********************************************************
// delete project
app.delete('/api/projects/:id' , function (req, res) {
 // get project id from url params (`req.params`)
 var projectId = req.params.id;

 // find project in db by id and remove
 db.Project.findOneAndRemove({ _id: projectId }, function (err, deletedProject) {
   if (err) {
     res.status(500).json({ error: err.message });
   } else {
     res.json(deletedProject);
   }
 });
});


//********************************************************
// update todo
app.put('/api/projects/:id', function (req, res) {
  // get todo id from url params (`req.params`)
  var projectId = req.params.id;

  // find todo in db by id
  db.Project.findOne({ _id: projectId }, function (err, foundProject) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // update the todos's attributes
      foundProject.title = req.body.title;
      foundProject.description = req.body.description;
      foundProject.githubLink = req.body.githubLink;
      foundProject.screenShotLink = req.body.screenShotLink;

      // save updated todo in db
      foundProject.save(function (err, savedProject) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(savedProject);
        }
      });
    }
  });
});

/**********
 * FIND DUPLICATES *
 **********/
const findDuplicates = (list, type) =>{

  let emails = {};
  let dups = {};

  // //loop through the list
  // list.forEach((person) =>{
  //   //find the active email
  //   for(let i = 0; i < person.emails.length; i++){
  //     if(person.emails[i].is_primary === true){
  //       let email = person.emails[i].value;
  //       //if it already exists, we found a duplicate
  //       if(emails[email]){
  //         emails[email]++;
  //         dups[email] = 0;
  //       }else{
  //         emails[email] = 1;
  //       }
  //
  //     }
  //   }
  // })


  //loop through the list
  list.forEach((person) =>{
    //find the active email
    let email = person.email;
    console.log(email)

    if(emails[email]){
      emails[email]++;
      dups[email] = 0;
    }else{
      emails[email] = 1;
    }

  })

  let keys = Object.keys(dups);

  console.log("here are the dups from contacts");

  keys.forEach((key) =>{
    console.log(key)
  })

  return dups;

}


/**********
 * FETCH ALL CONTACTS *
 **********/
const fetchAllContacts = async () => {

  let page = 1;
  let contacts = []
  while(page !== 0 ){
    let url = `https://geophysicalinsights.freshsales.io/api/contacts/view/2000309248?sort=emails&sort_type=asc&page=${page}`;
    let response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: '*/*',
        Host: 'geophysicalinsights.freshsales.io',
        'accept-encoding': 'gzip, deflate, br',
        Authorization: 'Token token=ruf8KPf1yojVDU8wBczyzg',
        'Content-Type': 'text/plain'
      },
    });
    const data = await response.json();
    contacts = [...contacts, ...data.contacts]

    if(page === data.meta.total_pages){
      page = 0;
    }else{
      page++;
    }
  }
  //now we have all the CONTACTS

  let keys = findDuplicates(contacts, "contacts");

  return keys;

  // console.log('async data', data)
  // console.log('data.meta', data.meta.total_pages)
}


/**********
 * FETCH ALL LEADS *
 **********/
const fetchAllLeads = async () => {

  let page = 1;
  let leads = []
  while(page !== 0 ){
    let url = `https://geophysicalinsights.freshsales.io/api/leads/view/2000309239?sort=emails&sort_type=asc&page=${page}`;
    let response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: '*/*',
        Host: 'geophysicalinsights.freshsales.io',
        'accept-encoding': 'gzip, deflate, br',
        Authorization: 'Token token=ruf8KPf1yojVDU8wBczyzg',
        'Content-Type': 'text/plain'
      },
    });
    const data = await response.json();
    // console.log(data)
    leads = [...leads, ...data.leads]

    //uncomment here to test 1 page
    // page = 0;
    // page++

    if(page === data.meta.total_pages){
      page = 0;
    }else{
      page++;
    }
  }
  //now we have all the LEADS

  let keys = findDuplicates(leads, "contacts");

  return keys;

  // console.log('async data', data)
  // console.log('data.meta', data.meta.total_pages)
}
/**********
 * SCRIPT *
 **********/

  // fetchAllLeads();

 cron.schedule("* * 21 * *", () => {
   console.log("running a task every minute");

   //look for duplicates in contacts
   // fetchAllContacts();
 })



/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});
