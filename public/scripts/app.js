console.log("Sanity Check: JS is working!");

$(document).ready(function(){

  var allProjects = [];

  // form to create new project
  var $createProject = $('#create-project');

  // listen for submit even on form
  $createProject.on('submit', function (event) {
    event.preventDefault();

    // serialze form data
    var newProject = $(this).serialize();

    // POST request to create new project
    $.ajax({
      method: "POST",
      url: '/api/projects',
      data: newProject,

      success: function onCreateSuccess(json) {
        console.log(json);

      }
    });

    // reset the form
    $createProject[0].reset();
    $createProject.find('input').first().focus();
  });



  $projectList = $('#projectTarget');

  $.ajax({
    method: "GET",
    url: '/api/projects',
    success: handleSuccess
  });


  $projectList.on('click', '.deleteBtn', function() {
    console.log('clicked delete button to', '/api/projects/'+$(this).attr('data-id'));
    $.ajax({
      method: 'DELETE',
      url: '/api/projects/'+$(this).attr('data-id')
      // success: deleteProjectSuccess,
      // error: deleteProjectError
    });
  });

  function getProjectHtml(project) {
  return `<hr>
          <p>
            <b class="project-title">${project.title}</b>
            <span class="edit-input" style="display: none">
              <input type="text" value="${project.title}" />
              <button class="edit-project-submit-button" data-id="${project._id}">Save</button>
            </span>
            <button class="edit-project-button">Edit</button>
            <br>
            <button type="button" name="button" class="deleteBtn btn btn-danger pull-right" data-id=${project._id}>Delete</button>
          </p>
          `;
}

  function getAllProjectsHtml(projects) {
    console.log(projects);
    return projects.map(el => getProjectHtml(el) ).join("");
  }

  function render () {
    // empty existing posts from view
    $projectList.empty();

    // pass `allProjects` into the template function
    var projectsHTML = getAllProjectsHtml(allProjects);

    // append html to the view
    $projectList.append(projectsHTML);
  }

  function handleSuccess(json) {
    allProjects = json;
    render();
  }


});
