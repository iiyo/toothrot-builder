
var fs = require("fs");
var fade = require("domfx/fade");
var loader = require("monaco-loader");

function create(context) {
    
    var monaco, editor, element, editorElement, editorFrame, projects;
    
    function init() {
        
        element = context.getElement();
        editorFrame = document.querySelector(".editor-frame");
        editorElement = document.querySelector(".editor-content");
        projects = context.getService("project");
        
        fade.out(element, 0);
        fade.out(editorFrame, 0);
        
        loader().then(function (monacoEditor) {
            monaco = monacoEditor;
            editor = monaco.editor.create(editorElement, {
                value: "",
                language: "markdown",
                lineNumbers: true,
                scrollBeyondLastLine: true,
                readOnly: false,
                automaticLayout: true,
                theme: "vs-dark",
                dragAndDrop: true,
                folding: true,
                renderWhitespace: "boundary",
                rulers: [100],
                wordWrap: "on",
                minimap: {
                    enabled: false
                }
            });
            console.log("Editor created:", editor);
        });
    }
    
    function destroy() {
        editorElement = null;
        element = null;
    }
    
    function loadJsFile(path) {
        monaco.editor.create(
            editorElement,
            {
                value: "" + fs.readFileSync(path)
            }
        );
    }
    
    function handleRealmChange (realm) {
        if (realm === "editor") {
            fade.in(element, 0);
            fade.in(editorFrame, 0);
        }
        else {
            fade.out(element, 0);
            fade.out(editorFrame, 0);
        }
    }
    
    function handleProjectChange (name) {
        editor.setValue(projects.getStoryFile(name));
        editor.updateOptions({
            language: "markdown"
        });
    }
    
    return {
        init: init,
        destroy: destroy,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange
        }
    };
}

module.exports = create;
