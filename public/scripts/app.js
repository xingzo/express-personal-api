console.log("Sanity Check: JS is working!");

$(document).ready(function(){

// your code

// CREATING A NEW PROJECT
var allProjects = [];

// form to create new todo
var $createProject = $('#create-project');

// listen for submit even on form
// listen for submit even on form
  $createProject.on('submit', function (event) {
    event.preventDefault();

    // serialze form data
    var newProject = $(this).serialize();

    // POST request to create new todo
    $.ajax({
      method: "POST",
      url: '/api/projects',
      data: newProject,
      success: function onCreateSuccess(json) {
        console.log(json);

        // add new todo to `allTodos`
        allProjects.push(json);

        // render all todos to view
        // render();
      }
    });

    // reset the form
    $createTodo[0].reset();
    $createProject.find('input').first().focus();
  });


});
