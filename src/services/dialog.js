
var prompt = require("../ui/prompt");
var confirm = require("../ui/confirm");
var newFileDialog = require("../ui/newFileDialog");

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
    
    //
    // isAllowedFileName(fileName, fileType)
    // then(error, values)
    //
    function showNewFileDialog(isAllowedFileName, fileTypes, then) {
        
        newFileDialog({
            onAccept: onAccept,
            onClose: onClose,
            isAllowedFileName: isAllowedFileName,
            fileTypes: fileTypes
        });
        
        function onAccept(values) {
            then(null, {
                fileType: values.fileType,
                fileName: values.fileName
            });
        }
        
        function onClose() {
            then(new Error("Dialog canceled."));
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
    
    function confirmDiscardChanges(then) {
        
        confirm({
            title: "Discard changes?",
            message: "There are unsaved changes! Do you wish to discard them?",
            okText: "Yes, discard the changes",
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
    
    function confirmDeleteFile(fileName, then) {
        
        confirm({
            title: "Delete file?",
            message: "Do you really want to delete '" + fileName + "'? This can't be undone!",
            okText: "Yes, delete the file",
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
        confirmDiscardChanges: confirmDiscardChanges,
        confirmDeleteFile: confirmDeleteFile,
        showNewFileDialog: showNewFileDialog,
        enterNextNode: enterNextNode
    };
}

module.exports = create;
