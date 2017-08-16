
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
    
    function enterNextNode (then) {
        
        prompt({
            title: "Choose the next node",
            message: "Please enter the name of the next node",
            placeholder: "Next node name",
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
    
    function confirmDeleteNode (name, then) {
        
        confirm({
            title: "Delete node?",
            message: "Do you really want to delete node '" + name + "'? This cannot be undone!",
            okText: "Yes, delete the node",
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
    
    function confirmRemoveNextForReturn (name, next, then) {
        
        confirm({
            title: "Conflict: return versus next",
            message: "A node cannot have a return to the last node and a next node. <br /><br />" +
                "Remove the link to the next node?",
            okText: "Yes, remove next",
            cancelText: "No, keep it",
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
        confirmDeleteProject: confirmDeleteProject,
        confirmDeleteNode: confirmDeleteNode,
        confirmRemoveNextForReturn: confirmRemoveNextForReturn,
        enterNextNode: enterNextNode
    };
}

module.exports = create;
