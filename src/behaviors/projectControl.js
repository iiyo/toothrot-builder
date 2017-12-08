
var shell = require("electron").shell;

var ATTRIBUTE_PROJECT_ID = "data-project-id";
var ATTRIBUTE_PROJECT_NAME = "data-project-name";
var SAVE_BUTTON_TYPE = "saveButton";
var SAVE_BUTTON_SELECTOR = "[data-type='" + SAVE_BUTTON_TYPE + "']";

function create (context) {
    
    var projects, dialogs;
    
    function init () {
        
        projects = context.getService("project");
        dialogs = context.getService("dialog");
        
        disableSaveButtons();
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
        
        var projectName, projectId;
        
        if (!element || !element.getAttribute) {
            return;
        }
        
        projectId = element.getAttribute(ATTRIBUTE_PROJECT_ID);
        projectName = element.getAttribute(ATTRIBUTE_PROJECT_NAME);
        
        if (elementType === "runButton") {
            projects.runProject(projectId);
        }
        else if (elementType === SAVE_BUTTON_TYPE) {
            context.broadcast("saveButtonClick");
        }
        else if (elementType === "openFolderButton") {
            shell.openItem(projects.getProjectFolder(projectId));
        }
        else if (elementType === "buildButton") {
            projects.buildProject(projectId);
        }
        else if (elementType === "buildDesktopButton") {
            projects.buildProjectForDesktop(projectId);
        }
        else if (elementType === "deleteButton") {
            deleteProject(projectId);
        }
        else if (elementType === "project") {
            context.broadcast("changeToProject", {
                id: projectId,
                name: projectName
            });
            context.broadcast("goToRealm", "editor");
        }
    }
    
    function getSaveButtons() {
        return Array.prototype.slice.call(
            context.getElement().querySelectorAll(SAVE_BUTTON_SELECTOR) || []
        );
    }
    
    function enableSaveButtons() {
        getSaveButtons().forEach(function (button) {
            button.classList.remove("disabled");
        });
    }
    
    function disableSaveButtons() {
        getSaveButtons().forEach(function (button) {
            button.classList.add("disabled");
        });
    }
    
    function handleProjectFilesChange() {
        enableSaveButtons();
    }
    
    function handleProjectFilesSaved() {
        disableSaveButtons();
    }
    
    return {
        init: init,
        destroy: destroy,
        onclick: handleClick,
        onmessage: {
            projectFilesChanged: handleProjectFilesChange,
            projectFilesSaved: handleProjectFilesSaved,
            goToRealm: disableSaveButtons
        }
    };
}

module.exports = create;
