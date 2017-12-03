/* eslint-disable global-require */

(function () {
    
    var Box = require("t3js");
    var fs = require("fs");
    var config = require("./src/config");
    
    function ensureAppFolderExists () {
        if (!fs.existsSync(config.paths.app)) {
            fs.mkdirSync(config.paths.app);
        }
    }
    
    function ensureProjectsFolderExists () {
        if (!fs.existsSync(config.paths.projects)) {
            fs.mkdirSync(config.paths.projects);
        }
    }
    
    ensureAppFolderExists();
    ensureProjectsFolderExists();
    
    Box.Application.on("error", function (data) {
        console.error(data.data.exception);
    });
    
    Box.Application.addService("notification", require("./src/services/notification"));
    Box.Application.addService("dialog", require("./src/services/dialog"));
    Box.Application.addService("project", require("./src/services/project"));
    
    Box.Application.addBehavior("projectControl", require("./src/behaviors/projectControl"));
    
    Box.Application.addModule("header", require("./src/modules/header"));
    Box.Application.addModule("projectList", require("./src/modules/projectList"));
    Box.Application.addModule("editor", require("./src/modules/editor"));
    
    Box.Application.init(config);
    
}());
