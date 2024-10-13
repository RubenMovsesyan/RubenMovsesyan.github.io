const ANIMATION_TIME = 600; // saw animation time in milliseconds
var projects_array = [];


function fetch_JSON_to_project_string(project_data) {
    var name = project_data.name;
    var link = project_data.href;
    var image = project_data.image;

    return `<a class="project-grid" href="${link}">
                    <div class="grid-project-text">${name}</div>
                    <div class="grid-project-img">
                        <img src="${image}" />
                    </div>
                </a>`;
}

async function fetch_array() {
    await fetch('./res/projects.json')
        .then((response) => response.json())
        .then((json) => {
            projects_array = json.projects;
        });

        $('#project-container').html(fetch_JSON_to_project_string(projects_array[0]));
}

fetch_array();

window.onload = function() {
    $(function() {
        var saw = $('#saw-img');
        var project = $('#project-container');
        var project_index = 0;
        var grid_text;


        // Add functionality to spin saw and change the project displayed for both the left and right buttons
        $('#left').click(function() {
            project_index--;
            project_index += projects_array.length;
            project_index %= projects_array.length;
            grid_text = fetch_JSON_to_project_string(projects_array[project_index]);

            saw.addClass('rotate-center-reverse');
            project.addClass('rotate-project-reverse');
            saw.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                function (e) {
                    saw.removeClass('rotate-center-reverse');
                }
            );

            project.one('webkitAnimationStart oanimationstart msAnimationStart animationstart',
                function (e) {
                    setTimeout(() => {
                        project.html(grid_text)
                    }, ANIMATION_TIME / 2);
                }
            );

            project.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                function (e) {
                    project.removeClass('rotate-project-reverse');
                }
            );
        });

        $('#right').click(function() {
            project_index++;
            project_index %= projects_array.length;
            grid_text = fetch_JSON_to_project_string(projects_array[project_index]);

            saw.addClass('rotate-center');
            project.addClass('rotate-project');
            saw.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                function (e) {
                    saw.removeClass('rotate-center');
                }
            );

            project.one('webkitAnimationStart oanimationstart msAnimationStart animationstart',
                function (e) {
                    setTimeout(() => {
                        project.html(grid_text)
                    }, ANIMATION_TIME / 2);
                }
            );

            project.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                function (e) {
                    project.removeClass('rotate-project');
                }
            );
        });
    });
}