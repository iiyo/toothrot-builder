
var prompt = require("../ui/prompt");
var confirm = require("../ui/confirm");

function create () {
    
    function enterProjectName (then) {
        
        prompt({
            title: "Choose a project name",
            message: "What should the project be called?",
            placeholder: "Project name",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept (value) {
            if (value) {
                then(null, value);
            }
            else {
                then(new Error("No project name supplied."));
            }
        }
        
        function onClose () {
            onAccept();
        }
    }
    
    function confirmDeleteProject (name, then) {
        
        confirm({
            title: "Delete project?",
            message: "Do you really want to delete project '" + name + "'? This cannot be undone!",
            okText: "Yes, delete the project",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept () {
            then(true);
        }
        
        function onClose () {
            then(false);
        }
    }
    
    return {
        enterProjectName: enterProjectName,
        confirmDeleteProject: confirmDeleteProject
    };
}

module.exports = create;
