
var fs = require("fs");
var format = require("vrep").format;
var dialog = require("./dialog");
var template = "" + fs.readFileSync("src/templates/prompt.html");

function prompt (options) {
    
    var config = options || {};
    
    var values = {
        title: config.title || "",
        message: config.message || "Your input is required.",
        okText: config.okText || "OK",
        cancelText: config.cancelText || "Cancel",
        defaultValue: config.defaultValue || "",
        placeholder: config.placeholder || ""
    };
    
    dialog(format(template, values), {
        onAccept: onAccept,
        onClose: config.onClose
    });
    
    function onAccept (values) {
        if (config.onAccept) {
            config.onAccept(values ? values.value : null);
        }
    }
}

module.exports = prompt;
