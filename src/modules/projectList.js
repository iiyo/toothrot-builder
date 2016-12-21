
function create (context) {
    
    var element, content, projects, dialogs;
    var each = require("enjoy-core/each");
    var format = require("vrep").format;
    var itemTemplate = "" + require("fs").readFileSync("src/templates/projectListItem.html");
    
    function init () {
        
        element = context.getElement();
        content = element.querySelector(".content");
        projects = context.getService("project");
        dialogs = context.getService("dialog");
        
        updateProjectList();
        
        console.log("Module 'projectList' initialized.");
    }
    
    function updateProjectList () {
        
        var text = "";
        var data = projects.getProjectInfos();
        
        each(function (item) {
            text += format(itemTemplate, {
                path: projects.getProjectFolder(item.name),
                name: item.name
            });
        }, data);
        
        content.innerHTML = text;
    }
    
    function destroy () {
        element = null;
        content = null;
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
            projects.runProject(element.getAttribute("data-project"));
        }
        else if (elementType === "buildButton") {
            projects.buildProject(element.getAttribute("data-project"));
        }
        else if (elementType === "buildDesktopButton") {
            projects.buildProjectForDesktop(element.getAttribute("data-project"));
        }
        else if (elementType === "deleteButton") {
            deleteProject(element.getAttribute("data-project"));
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onmessage: {
            "projectCreated": updateProjectList,
            "projectDeleted": updateProjectList
        },
        onclick: handleClick
    };
}

module.exports = create;
