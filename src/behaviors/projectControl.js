
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
        if (elementType === "runButton") {
            projects.runProject(element.getAttribute(ATTRIBUTE_PROJECT));
        }
        else if (elementType === "buildButton") {
            projects.buildProject(element.getAttribute(ATTRIBUTE_PROJECT));
        }
        else if (elementType === "buildDesktopButton") {
            projects.buildProjectForDesktop(element.getAttribute(ATTRIBUTE_PROJECT));
        }
        else if (elementType === "deleteButton") {
            deleteProject(element.getAttribute(ATTRIBUTE_PROJECT));
        }
        else if (elementType === "project") {
            context.broadcast("changeToProject", element.getAttribute(ATTRIBUTE_PROJECT));
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
