
var fs = require("original-fs");
var rimraf = require("rimraf");
var normalize = require("path").normalize;
var patchFs = require("electron-patch-fs");
var toothrot = require("toothrot");

function create (app) {
    
    function createProject (name, then) {
        
        var folder = getProjectFolder(name);
        
        console.log("Creating new project in: ", folder);
        
        toothrot.init(folder, function () {
            
            initProjectName(name);
            
            app.broadcast("projectCreated", name);
            
            if (then) {
                then();
            }
        });
    }
    
    function initProjectName (name) {
        
        var info = getProjectInfo(name);
        var storyPath = getStoryFilePath(name);
        var storyLines = getStoryFile(name).split("\n");
        
        info.name = name;
        
        storyLines.shift();
        storyLines.unshift("# " + name);
        
        fs.writeFileSync(storyPath, storyLines.join("\n"));
        saveProjectInfo(name, info);
    }
    
    function getProjectsFolder () {
        return app.getGlobalConfig().paths.projects;
    }
    
    function getProjectFolder (name) {
        return normalize(getProjectsFolder() + "/" + name + "/");
    }
    
    function getProjectBuildFolder (name) {
        return normalize(getProjectFolder(name) + "/build/");
    }
    
    function getProjectInfoFilePath (name) {
        return normalize(getProjectFolder(name) + "/project.json");
    }
    
    function getStoryFilePath (name) {
        return normalize(getProjectFolder(name) + "/resources/story.trot.md");
    }
    
    function getAstFilePath (name) {
        return normalize(getProjectFolder(name) + "/resources/ast.json");
    }
    
    function getProjectInfo (name) {
        return JSON.parse("" + fs.readFileSync(getProjectInfoFilePath(name)));
    }
    
    function saveProjectInfo (name, info) {
        fs.writeFileSync(getProjectInfoFilePath(name), JSON.stringify(info));
    }
    
    function getProjectNames () {
        return fs.readdirSync(getProjectsFolder());
    }
    
    function getProjectInfos () {
        return getProjectNames().map(getProjectInfo);
    }
    
    function notify (title, message, timeout) {
        return app.getService("notification").notify(title, message, timeout);
    }
    
    function buildProjectFor (platform, name, then) {
        
        var folder = getProjectFolder(name);
        var outputDir = getProjectBuildFolder(name);
        
        then = then || function () {};
        
        patchFs.patch();
        
        toothrot.build(folder, outputDir, platform === "desktop", function (error) {
            
            var info = getProjectInfo(name);
            
            patchFs.unpatch();
            
            if (error) {
                
                notify(
                    info.name + " cannot be built!",
                    error !== null && typeof error === "object" && error.message ?
                        error.message :
                        error
                );
                
                then(error);
                
                return;
            }
            
            notify(
                info.name + " built successfully!",
                "The Toothrot Engine project '" + info.name +"' has been built " +
                "in " + folder
            );
            
            then();
        });
    }
    
    function buildProject (name, then) {
        buildProjectFor("browser", name, then);
    }
    
    function buildProjectForDesktop (name, then) {
        buildProjectFor("desktop", name, then);
    }
    
    function runProject (name) {
        
        var folder = getProjectFolder(name);
        
        buildProject(name, function () {
            window.open(normalize("file://" + folder + "/build/browser/index.html"));
        });
    }
    
    function deleteProject (name) {
        
        var folder = getProjectFolder(name);
        
        patchFs.patch();
        rimraf.sync(folder);
        patchFs.unpatch();
        
        app.broadcast("projectDeleted", name);
        
        notify(
            "Project '" + name + "' deleted",
            "Project '" + name + "' (" + folder + ") has been deleted."
        );
    }
    
    function parseStoryFile (name, then) {
        return toothrot.parse(getStoryFile(name), then);
    }
    
    function getStoryFile (name) {
        return "" + fs.readFileSync(getStoryFilePath(name));
    }
    
    function getAstFile (name, then) {
        
        var ast;
        var path = getAstFilePath(name);
        
        if (!fs.existsSync(path)) {
            return parseStoryFile(name, then);
        }
        
        ast = JSON.parse("" + fs.readFileSync(path));
        
        if (typeof then === "function") {
            return then(null, ast);
        }
        
        return ast;
    }
    
    return {
        createProject: createProject,
        getProjectInfo: getProjectInfo,
        getProjectInfoFilePath: getProjectInfoFilePath,
        getProjectInfos: getProjectInfos,
        getProjectNames: getProjectNames,
        getProjectFolder: getProjectFolder,
        buildProject: buildProject,
        buildProjectForDesktop: buildProjectForDesktop,
        runProject: runProject,
        deleteProject: deleteProject,
        parseStoryFile: parseStoryFile,
        getStoryFile: getStoryFile,
        getAstFilePath: getAstFilePath,
        getAstFile: getAstFile
    };
}

module.exports = create;
