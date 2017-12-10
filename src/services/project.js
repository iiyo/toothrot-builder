
var fs = require("original-fs");
var rimraf = require("rimraf");
var normalize = require("path").normalize;
var patchFs = require("electron-patch-fs");
var toothrot = require("toothrot");
var readStoryFiles = require("toothrot/src/utils/readStoryFiles");

var parse = toothrot.parse;

var STORY_FILE_PATTERN = /\.trot\.(md|ext\.md)$/;
var SCREEN_FILE_PATTERN = /\.html$/;
var TEMPLATE_FILE_PATTERN = /\.html$/;
var STYLESHEET_FILE_PATTERN = /\.css$/;

function create (app) {
    
    function createProject(name, then) {
        
        var folder = getProjectFolder(name);
        
        toothrot.init(folder, function () {
            
            initProjectName(name);
            
            app.broadcast("projectCreated", name);
            
            if (then) {
                then();
            }
        });
    }
    
    function initProjectName(name) {
        
        var info = getProjectInfo(name);
        var storyPath = getMainStoryFilePath(name);
        var storyLines = getMainStoryFile(name).split("\n");
        
        info.name = name;
        
        storyLines.shift();
        storyLines.unshift("# " + name);
        
        fs.writeFileSync(storyPath, storyLines.join("\n"));
        saveProjectInfo(name, info);
    }
    
    function getProjectsFolder() {
        return app.getGlobalConfig().paths.projects;
    }
    
    function getProjectFolder(name) {
        return normalize(getProjectsFolder() + "/" + name + "/");
    }
    
    function getProjectBuildFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/build/");
    }
    
    function getProjectInfoFilePath(projectId) {
        return normalize(getProjectFolder(projectId) + "/project.json");
    }
    
    function getStoryFileFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/resources/");
    }
    
    function getScreenFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/resources/screens/");
    }
    
    function getTemplateFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/resources/templates/");
    }
    
    function getStylesheetFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/files/style/");
    }
    
    function getMainStoryFilePath(projectId) {
        return normalize(getStoryFileFolder(projectId) + "/story.trot.md");
    }
    
    function getAstFilePath(name) {
        return normalize(getProjectFolder(name) + "/resources/ast.json");
    }
    
    function getProjectInfo(name) {
        
        var info = JSON.parse("" + fs.readFileSync(getProjectInfoFilePath(name)));
        
        info.__toothrotBuilder = {
            projectId: name
        };
        
        return info;
    }
    
    function saveProjectInfo(name, info) {
        
        if (info.__toothrotBuilder) {
            delete info.__toothrotBuilder;
        }
        
        fs.writeFileSync(getProjectInfoFilePath(name), JSON.stringify(info));
    }
    
    function getProjectIds() {
        return fs.readdirSync(getProjectsFolder());
    }
    
    function getProjectInfos() {
        return getProjectIds().map(getProjectInfo);
    }
    
    function notify(title, message, timeout) {
        return app.getService("notification").notify(title, message, timeout);
    }
    
    function buildProjectFor(platform, name, then) {
        
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
    
    function buildProject(name, then) {
        buildProjectFor("browser", name, then);
    }
    
    function buildProjectForDesktop(name, then) {
        buildProjectFor("desktop", name, then);
    }
    
    function runProject(name) {
        
        var folder = getProjectFolder(name);
        
        buildProject(name, function () {
            window.open(normalize("file://" + folder + "/build/browser/index.html"));
        });
    }
    
    function deleteProject(name) {
        
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
    
    function parseStoryFile(name, then) {
        return toothrot.parse(getMainStoryFile(name), then);
    }
    
    function parseStory(projectId, then) {
        parse(readStoryFiles(getStoryFileFolder(projectId)), then);
    }
    
    function getMainStoryFile(name) {
        return "" + fs.readFileSync(getMainStoryFilePath(name));
    }
    
    function getStoryFile(projectId, fileName) {
        return "" + fs.readFileSync(getStoryFilePath(projectId, fileName));
    }
    
    function getScreenFile(projectId, fileName) {
        return "" + fs.readFileSync(getScreenFilePath(projectId, fileName));
    }
    
    function getTemplateFile(projectId, fileName) {
        return "" + fs.readFileSync(getTemplateFilePath(projectId, fileName));
    }
    
    function getStylesheet(projectId, fileName) {
        return "" + fs.readFileSync(getStylesheetPath(projectId, fileName));
    }
    
    function getStoryFilePath(projectId, fileName) {
        return normalize(getStoryFileFolder(projectId) + "/" + fileName);
    }
    
    function getScreenFilePath(projectId, fileName) {
        return normalize(getScreenFolder(projectId) + "/" + fileName);
    }
    
    function getTemplateFilePath(projectId, fileName) {
        return normalize(getTemplateFolder(projectId) + "/" + fileName);
    }
    
    function getStylesheetPath(projectId, fileName) {
        return normalize(getStylesheetFolder(projectId) + "/" + fileName);
    }
    
    function getStoryFileNames(projectId) {
        
        var path = getStoryFileFolder(projectId);
        var allFiles = fs.readdirSync(path);
        
        return allFiles.filter(function (fileName) {
            return STORY_FILE_PATTERN.test(fileName);
        });
    }
    
    function getScreenFileNames(projectId) {
        
        var path = getScreenFolder(projectId);
        var allFiles = fs.readdirSync(path);
        
        return allFiles.filter(function (fileName) {
            return SCREEN_FILE_PATTERN.test(fileName);
        });
    }
    
    function getTemplateFileNames(projectId) {
        
        var path = getTemplateFolder(projectId);
        var allFiles = fs.readdirSync(path);
        
        return allFiles.filter(function (fileName) {
            return TEMPLATE_FILE_PATTERN.test(fileName);
        });
    }
    
    function getStylesheetFileNames(projectId) {
        
        var path = getStylesheetFolder(projectId);
        var allFiles = fs.readdirSync(path);
        
        return allFiles.filter(function (fileName) {
            return STYLESHEET_FILE_PATTERN.test(fileName);
        });
    }
    
    function getAstFile(name, then) {
        
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
    
    function saveStoryFile(projectId, fileName, content) {
        fs.writeFileSync(getStoryFilePath(projectId, fileName), content);
    }
    
    function saveScreenFile(projectId, fileName, content) {
        fs.writeFileSync(getScreenFilePath(projectId, fileName), content);
    }
    
    function saveTemplateFile(projectId, fileName, content) {
        fs.writeFileSync(getTemplateFilePath(projectId, fileName), content);
    }
    
    function saveStylesheet(projectId, fileName, content) {
        fs.writeFileSync(getStylesheetPath(projectId, fileName), content);
    }
    
    function deleteStoryFile(projectId, fileName) {
        fs.unlinkSync(getStoryFilePath(projectId, fileName));
    }
    
    function deleteScreenFile(projectId, fileName) {
        fs.unlinkSync(getScreenFilePath(projectId, fileName));
    }
    
    function deleteTemplateFile(projectId, fileName) {
        fs.unlinkSync(getTemplateFilePath(projectId, fileName));
    }
    
    function deleteStylesheet(projectId, fileName) {
        fs.unlinkSync(getStylesheetPath(projectId, fileName));
    }
    
    return {
        createProject: createProject,
        getProjectInfo: getProjectInfo,
        getProjectInfoFilePath: getProjectInfoFilePath,
        getProjectInfos: getProjectInfos,
        getProjectIds: getProjectIds,
        getProjectFolder: getProjectFolder,
        buildProject: buildProject,
        buildProjectForDesktop: buildProjectForDesktop,
        runProject: runProject,
        deleteProject: deleteProject,
        parseStoryFile: parseStoryFile,
        parseStory: parseStory,
        getStoryFileNames: getStoryFileNames,
        getScreenFileNames: getScreenFileNames,
        getTemplateFileNames: getTemplateFileNames,
        getStylesheetFileNames: getStylesheetFileNames,
        getStoryFile: getStoryFile,
        getScreenFile: getScreenFile,
        getTemplateFile: getTemplateFile,
        getStylesheet: getStylesheet,
        getMainStoryFile: getMainStoryFile,
        getAstFilePath: getAstFilePath,
        getAstFile: getAstFile,
        deleteStoryFile: deleteStoryFile,
        deleteScreenFile: deleteScreenFile,
        deleteTemplateFile: deleteTemplateFile,
        deleteStylesheet: deleteStylesheet,
        saveStoryFile: saveStoryFile,
        saveScreenFile: saveScreenFile,
        saveTemplateFile: saveTemplateFile,
        saveStylesheet: saveStylesheet
    };
}

module.exports = create;
