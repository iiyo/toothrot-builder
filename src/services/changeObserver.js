
function create(app) {
    
    var lastHash, lastFileName;
    var unsavedChanges = false;
    
    var listeners = {
        editorChanged: onEditorChanged,
        editorSaved: onEditorSaved,
        editorFileOpened: onEditorFileOpened
    };
    
    app.on("message", function (data) {
        
        var channel = data.data.message;
        var payload = data.data.messageData;
        
        if (channel in listeners) {
            listeners[channel](payload);
        }
    });
    
    function hasUnsavedChanges() {
        return unsavedChanges;
    }
    
    function onEditorChanged(data) {
        
        if (data.hash === lastHash) {
            return;
        }
        
        if (data.fileName !== lastFileName) {
            lastHash = data.hash;
            lastFileName = data.fileName;
            return;
        }
        
        lastHash = data.hash;
        unsavedChanges = true;
        
        app.broadcast("projectFilesChanged");
    }
    
    function onEditorSaved() {
        
        unsavedChanges = false;
        
        app.broadcast("projectFilesSaved");
    }
    
    function onEditorFileOpened(data) {
        
        unsavedChanges = false;
        lastHash = data.hash;
        lastFileName = data.fileName;
        
        app.broadcast("projectFilesSaved");
    }
    
    return {
        hasUnsavedChanges: hasUnsavedChanges
    };
}

module.exports = create;
