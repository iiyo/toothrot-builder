
var each = require("enjoy-core/each");
var fade = require("domfx/fade");
var glue = require("domglue");

var ATTRIBUTE_REALM = "data-realm";

function create (context) {
    
    var dialogs, projects, element, view;
    
    function init () {
        
        element = context.getElement();
        dialogs = context.getService("dialog");
        projects = context.getService("project");
        
        view = glue.live(element);
        
        console.log("Module 'header' initialized.");
    }
    
    function destroy () {
        
        view.destroy();
        
        view = null;
        dialogs = null;
        projects = null;
        element = null;
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
        else if (elementType === "goToProjects") {
            context.broadcast("goToRealm", "projects");
        }
    }
    
    function handleRealmChange (realm) {
        console.log("Realm changed to:", realm, element.querySelectorAll("[" + ATTRIBUTE_REALM + "]"));
        each(fade.out, element.querySelectorAll("[" + ATTRIBUTE_REALM + "]"));
        setTimeout(function () {
            each(fade.in, element.querySelectorAll("[" + ATTRIBUTE_REALM + "='" + realm + "']"));
        }, 100);
    }
    
    function handleProjectChange (name) {
        view.update({
            name: name,
            button: {
                "@data-project": name
            }
        });
    }
    
    return {
        behaviors: ["projectControl"],
        init: init,
        destroy: destroy,
        onclick: handleClick,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange
        }
    };
    
}

module.exports = create;
