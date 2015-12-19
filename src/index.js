/* global require, Notification */

(function () {
    
    var fs = require("fs");
    var toothrot = require("toothrot");
    var normalize = require("path").normalize;
    var format = require("vrep").format;
    var confirm = require("./src/confirm.js");
    
    var projectTemplate = document.querySelector("*[data-template-name=project]").innerHTML;
    var main = document.getElementById("main");
    var content = document.getElementById("content");
    
    main.addEventListener("click", function (event) {
        
        var target = event.target;
        var action = target.getAttribute("data-action");
        var path = target.getAttribute("data-project");
        
        if (action === "selectFolder") {
            selectDir(function (path) {
                
                var projectFile = readProjectFile(path);
                
                if (!projectFile) {
                    console.log("No project file found in directory.");
                    confirm(
                        "Create new project?",
                        "No project found in folder. Create new project here?",
                        function (yes) {
                            if (yes) {
                                createProject(path);
                            }
                        }
                    );
                }
                else {
                    console.log("Project file found in directory.");
                    importProject(path, projectFile);
                }
            });
        }
        else if (action === "build") {
            buildProject(path);
        }
        else if (action === "run") {
            runBrowser(path);
        }
    });
    
    function selectDir (then) {
        
        var chooser = document.createElement("input");
        
        chooser.setAttribute("type", "file");
        chooser.setAttribute("nwdirectory", "nwdirectory");
        
        chooser.addEventListener("change", function(evt) {
            console.log(chooser.value);
            then(chooser.value);
        });
        
        chooser.click();  
    }
    
    function readProjectFile (path) {
        
        var file = normalize(path + "/project.json");
        
        try {
            return JSON.parse("" + fs.readFileSync(file));
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    
    function createProject (path) {
        
        console.log("Creating new project in " + path);
        
        toothrot.init(path, function () {
            
            var info = JSON.parse("" + fs.readFileSync(normalize(path + "/project.json")));
            
            addProject(path, info);
        });
    }
    
    function importProject (path, info) {
        console.log("Importing project from " + path);
        addProject(path, info);
    }
    
    function addProject (path, info) {
        
        var data = loadProjectData();
        
        data[path] = {
            name: info.name,
            path: path,
            added: Date.now()
        };
        
        saveProjectData(data);
        
        updateProjectList();
    }
    
    function loadProjectData () {
        return JSON.parse(localStorage.getItem("toothrotProjects") || "{}");
    }
    
    function saveProjectData (data) {
        localStorage.setItem("toothrotProjects", JSON.stringify(data));
    }
    
    function updateProjectList () {
        
        var key;
        var data = loadProjectData();
        var text = "";
        
        for (key in data) {
            text += format(projectTemplate, {
                path: key,
                name: data[key].name
            })
        }
        
        content.innerHTML = text;
    }
    
    function buildProject (path, then) {
        
        then = then || function () {};
        
        toothrot.build(path, null, false, function () {
            
            var info = updateProjectInfo(path);
            
            updateProjectList();
            
            notify(
                info.name + " built successfully!",
                "The Toothrot Engine project '" + info.name +"' has been built " +
                "in " + path
            );
            
            then();
        });
    }
    
    function updateProjectInfo (path) {
        
        var file = normalize(path + "/project.json");
        var data = loadProjectData();
        var info = JSON.parse("" + fs.readFileSync(file));
        
        data[path].name = info.name;
        data[path].updated = Date.now();
        
        saveProjectData(data);
        
        return info;
    }
    
    function notify (title, message, timeout) {
        
        var notification = new Notification(title, {
            icon: "style/spanner-hammer.png",
            body: message
        });
        
        setTimeout(function () {
            notification.close();
        }, timeout || 4000);
    }
    
    function runBrowser (path) {
        buildProject(path, function () {
            
            var win = window.open(normalize("file://" + path + "/build/browser/index.html"));
            
            win.resizeTo(800, 600);
        });
    }
    
    updateProjectList();
    
}());
