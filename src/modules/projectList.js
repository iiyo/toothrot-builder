
var ATTRIBUTE_PROJECT = "data-project";

var fs = require("fs");
var fade = require("domfx/fade");
var each = require("enjoy-core/each");
var format = require("vrep").format;

var itemTemplate = "" + fs.readFileSync("src/templates/projectListItem.html");

function create (context) {
    
    var element, content, projects, dialogs;
    
    function init () {
        
        element = context.getElement();
        content = element.querySelector(".content");
        projects = context.getService("project");
        dialogs = context.getService("dialog");
        
        updateProjectList();
        
        console.log("Module 'projectList' initialized.");
        
        setTimeout(function () {
            context.broadcast("goToRealm", "projects");
        }, 10);
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
    
    function handleClick (event, element, elementType) {
        if (elementType === "project") {
            context.broadcast("changeToProject", element.getAttribute(ATTRIBUTE_PROJECT));
            context.broadcast("goToRealm", "editor");
        }
    }
    
    function handleRealmChange (realm) {
        if (realm === "projects") {
            fade.in(element, 0);
        }
        else {
            fade.out(element, 0);
        }
    }
    
    return {
        behaviors: ["projectControl"],
        init: init,
        destroy: destroy,
        onmessage: {
            "projectCreated": updateProjectList,
            "projectDeleted": updateProjectList,
            "goToRealm": handleRealmChange
        },
        onclick: handleClick
    };
}

module.exports = create;
