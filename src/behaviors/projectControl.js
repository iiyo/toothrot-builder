
var shell = require("electron").shell;

var ATTRIBUTE_PROJECT = "data-project";

function create (context) {
    
    var projects, dialogs;
    
    function init () {
        projects = context.getService("project");
        dialogs = context.getService("dialog");
    }
    
    function destroy () {
        projects = null;
        dialogs = null;
    }
    
    function deleteProject (name) {
        dialogs.confirmDeleteProject(name, function (accepted) {
            if (accepted) {
                projects.deleteProject(name);
            }
        });
    }
    
    function handleClick (event, element, elementType) {
        
        var projectName;
        
        if (!element || !element.getAttribute) {
            return;
        }
        
        projectName = element.getAttribute(ATTRIBUTE_PROJECT);
        
        if (elementType === "runButton") {
            projects.runProject(projectName);
        }
        else if (elementType === "openFolderButton") {
            shell.openItem(projects.getProjectFolder(projectName));
        }
        else if (elementType === "buildButton") {
            projects.buildProject(projectName);
        }
        else if (elementType === "buildDesktopButton") {
            projects.buildProjectForDesktop(projectName);
        }
        else if (elementType === "deleteButton") {
            deleteProject(projectName);
        }
        else if (elementType === "project") {
            context.broadcast("changeToProject", projectName);
            context.broadcast("goToRealm", "editor");
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onclick: handleClick
    };
}

module.exports = create;
