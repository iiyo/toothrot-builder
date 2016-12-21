
var ATTRIBUTE_PROJECT_NAME = "data-project";

function create (context) {
    
    var dialogs, projects;
    
    function init () {
        dialogs = context.getService("dialog");
        projects = context.getService("project");
        console.log("Module 'header' initialized.");
    }
    
    function destroy () {
        dialogs = null;
        projects = null;
    }
    
    function addProject () {
        dialogs.enterProjectName(function (error, name) {
            
            console.log("Chosen project name: ", name);
            
            if (name) {
                projects.createProject(name);
            }
        });
    }
    
    function handleClick (event, element, elementType) {
        if (elementType === "addProjectButton") {
            addProject();
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onclick: handleClick
    };
    
}

module.exports = create;
