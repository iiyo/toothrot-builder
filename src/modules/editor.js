
var crypto = require("crypto");
var fade = require("domfx/fade");
var loader = require("monaco-loader");
var domglue = require("domglue");
var contains = require("enjoy-core/contains");

var registerLanguage = require("../utils/trotLanguage").register;

var STORY_FILE_TYPE = "story";
var SCREEN_FILE_TYPE = "screen";
var TEMPLATE_FILE_TYPE = "template";
var STYLESHEET_FILE_TYPE = "stylesheet";

var STORY_FILE_LANGUAGE = "toothrot";
var SCREEN_FILE_LANGUAGE = "html";
var TEMPLATE_FILE_LANGUAGE = "html";
var STYLESHEET_FILE_LANGUAGE = "css";

var DEFAULT_EDITOR_LANGUAGE = STORY_FILE_LANGUAGE;
var DEFAULT_STORY_FILE_NAME = "story.trot.md";

var FILE_LIST_TYPE = "fileSelect";
var FILE_LIST_ITEM_TYPE = "fileOption";

var FILE_LIST_SELECTOR = "[data-type='" + FILE_LIST_TYPE + "']";
var EDITOR_FRAME_SELECTOR = ".editor-frame";
var EDITOR_CONTENT_SELECTOR = ".editor-content";

var FILE_GROUP_ATTRIBUTE = "data-file-type";
var FILE_LANGUAGE_ATTRIBUTE = "data-file-language";

var DELETE_BUTTON_TYPE = "deleteFileButton";

var KEY_CODE_S = 49;

var ERROR_DECORATION_CLASS = "line-error";

var PROTECTED_FILES = ["story.trot.md", "main.html", "pause.html"];

function create(context) {
    
    var monaco, editor, element, editorElement, editorFrame, projects, fileList;
    var view, dialogs, changes;
    var oldDecorations = [];
    
    var current = {
        project: null,
        fileName: null,
        fileType: STORY_FILE_TYPE
    };
    
    function init() {
        
        element = context.getElement();
        view = domglue.live(element);
        fileList = element.querySelector(FILE_LIST_SELECTOR);
        editorFrame = document.querySelector(EDITOR_FRAME_SELECTOR);
        editorElement = document.querySelector(EDITOR_CONTENT_SELECTOR);
        
        projects = context.getService("project");
        changes = context.getService("changeObserver");
        dialogs = context.getService("dialog");
        
        fade.out(element, 0);
        fade.out(editorFrame, 0);
        
        loader().then(function (monacoEditor) {
            
            monaco = monacoEditor;
            
            registerLanguage(monaco);
            
            editor = monaco.editor.create(editorElement, {
                value: "",
                language: DEFAULT_EDITOR_LANGUAGE,
                lineNumbers: true,
                scrollBeyondLastLine: true,
                readOnly: false,
                automaticLayout: true,
                theme: "toothrot",
                dragAndDrop: true,
                folding: true,
                renderWhitespace: "boundary",
                rulers: [100],
                wordWrap: "on",
                minimap: {
                    enabled: false
                }
            });
            
            editor.onDidChangeModelContent(onContentChange);
            editor.onKeyDown(onKeyDown);
        });
    }
    
    function destroy() {
        editorElement = null;
        editorFrame = null;
        fileList = null;
        element = null;
        projects = null;
    }
    
    function updateFileControls() {
        
        clearFileList();
        
        addFileGroup(
            "Story Files",
            projects.getStoryFileNames(current.project),
            STORY_FILE_LANGUAGE,
            STORY_FILE_TYPE
        );
        
        addFileGroup(
            "Screens",
            projects.getScreenFileNames(current.project),
            SCREEN_FILE_LANGUAGE,
            SCREEN_FILE_TYPE
        );
        
        addFileGroup(
            "Templates",
            projects.getTemplateFileNames(current.project),
            TEMPLATE_FILE_LANGUAGE,
            TEMPLATE_FILE_TYPE
        );
        
        addFileGroup(
            "Stylesheets",
            projects.getStylesheetFileNames(current.project),
            STYLESHEET_FILE_LANGUAGE,
            STYLESHEET_FILE_TYPE
        );
        
        updateFileButtons();
    }
    
    function updateFileButtons() {
        view.update({
            deleteButton: {
                "@data-state": contains(PROTECTED_FILES, current.fileName) ? "disabled" : "enabled"
            }
        });
    }
    
    function clearFileList() {
        fileList.innerHTML = "";
    }
    
    function addFileGroup(label, files, language, fileType) {
        
        var group = document.createElement("optgroup");
        
        group.setAttribute("label", label);
        group.setAttribute(FILE_GROUP_ATTRIBUTE, fileType);
        
        files.forEach(function (file) {
            
            var option = document.createElement("option");
            
            option.value = file;
            option.innerHTML = file;
            
            if (current.fileName === file) {
                option.setAttribute("selected", "selected");
            }
            
            option.setAttribute("data-type", FILE_LIST_ITEM_TYPE);
            option.setAttribute(FILE_LANGUAGE_ATTRIBUTE, language);
            
            group.appendChild(option);
        });
        
        fileList.appendChild(group);
    }
    
    function openFile(fileName, language, fileType) {
        
        var value;
        
        language = language || STORY_FILE_LANGUAGE;
        fileType = fileType || STORY_FILE_TYPE;
        
        current.fileName = fileName;
        current.fileType = fileType;
        
        if (fileType === STORY_FILE_TYPE) {
            value = projects.getStoryFile(current.project, fileName);
        }
        else if (fileType === SCREEN_FILE_TYPE) {
            value = projects.getScreenFile(current.project, fileName);
        }
        else if (fileType === TEMPLATE_FILE_TYPE) {
            value = projects.getTemplateFile(current.project, fileName);
        }
        else if (fileType === STYLESHEET_FILE_TYPE) {
            value = projects.getStylesheet(current.project, fileName);
        }
        
        if (value) {
            
            context.broadcast("editorFileOpened", {
                fileName: fileName,
                hash: createHash(value)
            });
            
            editor.setValue(value);
            monaco.editor.setModelLanguage(editor.getModel(), language);
            
            if (fileType === STORY_FILE_TYPE) {
                validate();
            }
            
            updateFileControls();
        }
    }
    
    function save() {
        if (current.fileType === STORY_FILE_TYPE) {
            projects.saveStoryFile(current.project, current.fileName, editor.getValue());
            context.broadcast("editorSaved");
        }
        else if (current.fileType === SCREEN_FILE_TYPE) {
            projects.saveScreenFile(current.project, current.fileName, editor.getValue());
            context.broadcast("editorSaved");
        }
        else if (current.fileType === TEMPLATE_FILE_TYPE) {
            projects.saveTemplateFile(current.project, current.fileName, editor.getValue());
            context.broadcast("editorSaved");
        }
        else if (current.fileType === STYLESHEET_FILE_TYPE) {
            projects.saveStylesheet(current.project, current.fileName, editor.getValue());
            context.broadcast("editorSaved");
        }
        else {
            console.error("Saving failed. Unknown file type '" + current.fileType + "'.");
        }
    }
    
    function deleteFile() {
        if (current.fileType === STORY_FILE_TYPE) {
            projects.deleteStoryFile(current.project, current.fileName);
            context.broadcast("fileDeleted");
        }
        else if (current.fileType === SCREEN_FILE_TYPE) {
            projects.deleteScreenFile(current.project, current.fileName);
            context.broadcast("fileDeleted");
        }
        else if (current.fileType === TEMPLATE_FILE_TYPE) {
            projects.deleteTemplateFile(current.project, current.fileName);
            context.broadcast("fileDeleted");
        }
        else if (current.fileType === STYLESHEET_FILE_TYPE) {
            projects.deleteStylesheet(current.project, current.fileName);
            context.broadcast("fileDeleted");
        }
        else {
            console.error("Deleting failed. Unknown file type '" + current.fileType + "'.");
        }
    }
    
    function validate() {
        projects.parseStory(current.project, function (errors) {
            displayErrors(errors);
            context.broadcast("storyValidated", errors || []);
        });
    }
    
    function displayErrors(errors) {
        
        var newDecorations = [];
        
        (errors || []).filter(function (error) {
            return error.isToothrotError;
        }).forEach(function (error) {
            
            var locationParts = error.message.split("@");
            var line = parseInt(locationParts.pop(), 10);
            
            var file = locationParts.join("@").split(" ").pop().
                replace("<", "").replace(">", "").replace("(", "").replace(")", "");
            
            if (file === current.fileName) {
                pushLineError(line);
            }
            else if (isHierarchyError(error) && current.fileType === STORY_FILE_TYPE) {
                
                line = findHierarchy();
                
                if (line > 0) {
                    pushLineError(line);
                }
            }
        });
        
        oldDecorations = editor.deltaDecorations(oldDecorations, newDecorations);
        
        function pushLineError(line) {
            newDecorations.push({
                range: new monaco.Range(line, 1, line, 2),
                options: {
                    isWholeLine: true,
                    linesDecorationsClassName: ERROR_DECORATION_CLASS
                }
            });
        }
    }
    
    function isHierarchyError(error) {
        return (
            error.id === "CIRCULAR_HIERARCHY" ||
            error.id === "HIERARCHY_JSON_ERROR"
        );
    }
    
    function findHierarchy() {
        
        var content = editor.getValue();
        
        return content.split("@hierarchy")[0].split("\n").length;
    }
    
    function revealLocation(targetLocation) {
        
        if (current.fileName === targetLocation.file) {
            reveal();
        }
        else {
            ifShouldOpenFile(function () {
                openFile(targetLocation.file);
                reveal();
            });
        }
        
        function reveal() {
            editor.revealRangeAtTop(
                new monaco.Range(targetLocation.line, 1, targetLocation.line, 2)
            );
        }
    }
    
    function onContentChange() {
        context.broadcast("editorChanged", {
            fileName: current.fileName,
            hash: createHash(editor.getValue())
        });
    }
    
    function handleRealmChange(realm) {
        if (realm === "editor") {
            fade.in(element, 0);
            fade.in(editorFrame, 0);
        }
        else {
            fade.out(element, 0);
            fade.out(editorFrame, 0);
        }
    }
    
    function handleProjectChange(data) {
        
        current.project = data.id;
        current.fileName = DEFAULT_STORY_FILE_NAME;
        
        updateFileControls();
        
        view.update({
           projectTitle: current.project 
        });
        
        editor.setValue(projects.getMainStoryFile(data.id));
        monaco.editor.setModelLanguage(editor.getModel(), STORY_FILE_LANGUAGE);
        
        validate();
    }
    
    function handleChange(event, target, type) {
        if (type === FILE_LIST_TYPE) {
            handleOptionClick(target.options[target.selectedIndex]);
        }
    }
    
    function ifShouldOpenFile(then) {
        if (changes.hasUnsavedChanges()) {
            dialogs.confirmDiscardChanges(function (accepted) {
                if (accepted) {
                    then();
                }
                else {
                    updateFileControls();
                }
            });
        }
        else {
            then();
        }
    }
    
    function ifShouldDeleteFile(then) {
        dialogs.confirmDeleteFile(current.fileName, function (accepted) {
            if (accepted) {
                then();
            }
        });
    }
    
    function handleOptionClick(option) {
        ifShouldOpenFile(function () {
            openFile(
                option.value,
                option.getAttribute(FILE_LANGUAGE_ATTRIBUTE),
                option.parentNode.getAttribute(FILE_GROUP_ATTRIBUTE)
            );
        });
    }
    
    function handleDeleteClick() {
        ifShouldDeleteFile(function () {
            deleteFile();
            openFile(DEFAULT_STORY_FILE_NAME);
        });
    }
    
    function onKeyDown(event) {
        if (event.ctrlKey && event.keyCode === KEY_CODE_S) {
            save();
            validate();
        }
    }
    
    function onClick(event, target, type) {
        if (type === DELETE_BUTTON_TYPE) {
            handleDeleteClick();
        }
    }
    
    function createHash(content) {
        return crypto.createHash("md5").update(content).digest("hex");
    }
    
    return {
        init: init,
        destroy: destroy,
        onchange: handleChange,
        onkeydown: onKeyDown,
        onclick: onClick,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange,
            locationLinkClicked: revealLocation,
            saveButtonClick: save
        }
    };
}

module.exports = create;
