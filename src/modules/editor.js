
var S_KEY = 83;
var LEFT_KEY = 37;
var UP_KEY = 38;
var RIGHT_KEY = 39;
var DOWN_KEY = 40;

var fs = require("fs");
var fade = require("domfx/fade");
var glue = require("domglue");

var debounce = require("../helpers/debounce");

var nodeLinkTemplate = "" + fs.readFileSync("src/templates/nodeLink.html");
var nodeLinkIncomingTemplate = "" + fs.readFileSync("src/templates/nodeLinkIncoming.html");
var nodeErrorTemplate = "" + fs.readFileSync("src/templates/nodeError.html");
var nodeOptionTemplate = "" + fs.readFileSync("src/templates/nodeOption.html");

function isArrowKey (code) {
    return (code === LEFT_KEY || code === UP_KEY || code === RIGHT_KEY || code === DOWN_KEY);
}

function contains (collection, item) {
    return collection.indexOf(item) >= 0;
}

function create (context) {
    
    var element, projectName, view, projects, story, errors, nodeName, dialogs;
    
    var saveDebounced = debounce(save);
    var validateDebounced = debounce(validate);
    var parseNodeDebounced = debounce(parseNode);
    
    function save () {
        if (story) {
            story.save();
        }
    }
    
    function validate () {
        
        var nodeErrors = [];
        
        errors = story.validate();
        
        if (Array.isArray(errors)) {
            errors.forEach(function (error) {
                
                if (error.data && error.data.nodeId === nodeName) {
                    nodeErrors.push(error);
                }
                
                console.log(error);
            });
        }
        
        if (nodeErrors.length) {
            updateNodeErrors(nodeErrors);
        }
    }
    
    function parseNode (then) {
        
        var node, content;
        
        if (!story) {
            return;
        }
        
        console.log("Parsing node '" + nodeName + "'...");
        
        then = then || function () {};
        content = "" + element.querySelector("textarea").value;
        
        node = {
            id: nodeName,
            content: content,
            line: 0
        };
        
        story.parseNodeContent(node, function (errors, parsedNode) {
            
            var node;
            
            if (errors) {
                errors.forEach(function (error) {
                    console.error(error);
                });
                updateNodeErrors(errors);
            }
            else {
                node = story.getNode(nodeName);
                node.content = parsedNode.content;
                node.scripts = parsedNode.scripts;
                node.links = parsedNode.links;
                node.raw = content;
            }
            
            console.log("node/parsedNode:", node, parsedNode);
            
            updateNodeLinks();
            updateIncomingNodeLinks();
            updateNextLink();
            then(errors, node);
        });
    }
    
    function init () {
        dialogs = context.getService("dialog");
        projects = context.getService("project");
        element = context.getElement();
        view = glue.live(element);
    }
    
    function destroy () {
        
        view.destroy();
        
        if (story) {
            story.destroy();
        }
        
        story = null;
        view = null;
        element = null;
        projects = null;
        dialogs = null;
    }
    
    function handleRealmChange (realm) {
        if (realm === "editor") {
            fade.in(element, 0);
        }
        else {
            
            if (story) {
                
                story.destroy();
                
                story = null;
            }
            
            fade.out(element, 0);
        }
    }
    
    function handleProjectChange (name) {
        
        console.log("Project changed to:", name);
        
        projectName = name;
        story = context.getService("story").create(name);
        
        view.update({
            name: name
        });
        
        changeNode("start");
    }
    
    function changeNode (name) {
        
        var node = story.getNode(name);
        
        nodeName = name;
        
        view.update({
            nodeName: name,
            nodeText: node.raw,
            deleteNode: {
                "@data-hidden": nodeName === "start" ? "true" : "false"
            },
            returnToLast: {
                "@checked": node.returnToLast ? "checked" : ""
            }
        });
        
        element.querySelector("textarea").focus();
        
        resetNodeErrors();
        parseNode(function (errors) {
            if (!errors) {
                validate();
            }
        });
        updateNodeOptions();
    }
    
    function createNode (name) {
        story.createNode(name);
        story.save();
        changeNode(name);
    }
    
    function formatError (error) {
        
        var data = error.data || {};
        
        if (data.id === "UNKNOWN_LINK_TARGET") {
            return "The link '" + data.label + "' points to an unknown target node '" + 
                data.target + "'.";
        }
        
        return error.message;
    }
    
    function updateNodeErrors (errors) {
        
        var list = element.querySelector(".nodeErrors");
        var template = glue.template(nodeErrorTemplate);
        
        list.innerHTML = errors.map(function (error) {
            return template.render({
                message: formatError(error)
            });
        }).join("\n");
    }
    
    function updateNodeOptions (editedOption) {
        
        var list = element.querySelector(".nodeOptionsList");
        var options = story.getNode(nodeName).options;
        var template = glue.template(nodeOptionTemplate);
        
        list.innerHTML = options.map(function (option, i) {
            return template.render({
                option: {
                    "@data-count": i,
                    "@data-target": option.target,
                    "@data-value": option.value,
                    "default": {
                        "@data-hidden": +editedOption === i ? "true" : "false",
                        name: option.label
                    },
                    edit: {
                        "@data-hidden": +editedOption === i ? "false" : "true",
                        label: {
                            "@value": option.label
                        },
                        target: {
                            "@value": option.target
                        },
                        value: {
                            "@value": option.value
                        }
                    }
                }
            });
        }).join("\n");
        
        console.log("edited option:", editedOption);
        
        if (editedOption) {
            list.children[editedOption].querySelector("input[name='label']").focus();
        }
    }
    
    function getLinks () {
        return story.getNode(nodeName).links;
    }
    
    function getOptions () {
        return story.getNode(nodeName).options;
    }
    
    function getNodeTargets () {
        
        var targets = [];
        var links = getLinks();
        var options = getOptions();
        
        links.forEach(function (link) {
            if (typeof link.target === "string") {
                if (!contains(targets, link.target)) {
                    targets.push(link.target);
                }
            }
            else {
                Object.keys(link.target).forEach(function (key) {
                    if (!contains(targets, link.target[key])) {
                        targets.push(link.target[key]);
                    }
                });
            }
        });
        
        options.forEach(function (option) {
            if (option.target && !contains(targets, option.target)) {
                targets.push(option.target);
            }
        });
        
        return targets.sort();
    }
    
    function getIncomingLinks () {
        return story.getIncomingLinksForNode(nodeName);
    }
    
    function updateLinks (containerSelector, rawTemplate, links, emptyText) {
        
        var list = element.querySelector(containerSelector);
        var template = glue.template(rawTemplate);
        
        if (!links.length) {
            list.innerHTML = "<i>" + emptyText + "</i>";
            return;
        }
        
        list.innerHTML = links.map(function (target) {
            return template.render({
                link: {
                    "@data-target": target,
                    "@data-exists": story.hasNode(target) ? "true" : "false",
                    name: target
                }
            });
        }).join("\n");
    }
    
    function updateNodeLinks () {
        updateLinks(".nodeLinks", nodeLinkTemplate, getNodeTargets(), "Node links nowhere");
    }
    
    function updateIncomingNodeLinks () {
        updateLinks(
            ".nodeLinksIncoming",
            nodeLinkIncomingTemplate,
            getIncomingLinks(),
            "Nothing links here"
        );
    }
    
    function updateNextLink () {
        
        var message, hasNext;
        var view = glue.live(element.querySelector(".nodeNextLink"));
        var node = story.getNode(nodeName);
        
        if (!node || !node.next) {
            hasNext = false;
            message = "Add next node";
        }
        else {
            hasNext = true;
            message = node.next;
        }
        
        view.update({
            next: {
                "@data-empty": hasNext ? "false" : "true",
                "@data-exists": hasNext && story.hasNode(node.next) ? "true" : "false",
                "@data-target": hasNext ? node.next : "",
                "@data-type": hasNext ? "link" : "addNext",
                text: message
            }
        });
    }
    
    function resetNodeErrors () {
        element.querySelector(".nodeErrors").innerHTML = "";
    }
    
    function addNext () {
        
        var node = story.getNode(nodeName);
        
        if (node.returnToLast) {
            dialogs.confirmRemoveReturnForNext(function (accepted) {
                if (accepted) {
                    node.returnToLast = false;
                    promptAdd();
                }
            });
        }
        else {
            promptAdd();
        }
        
        function promptAdd () {
            dialogs.enterNextNode(function (error, name) {
                
                if (error || !name) {
                    return;
                }
                
                node.next = name;
                updateNextLink();
                validate();
                save();
            });
        }
    }
    
    function toggleReturnToLast () {
        
        var node = story.getNode(nodeName);
        
        if (node.returnToLast) {
            node.returnToLast = false;
        }
        else {
            
            if (node.next) {
                return dialogs.confirmRemoveNextForReturn(nodeName, node.next, function (accepted) {
                    if (accepted) {
                        node.next = null;
                        node.returnToLast = true;
                        update();
                        updateNextLink();
                    }
                });
            }
            
            node.returnToLast = true;
        }
        
        update();
        
        function update() {
            
            view.update({
                returnToLast: {
                    "@checked": node.returnToLast ? "checked" : ""
                }
            });
            
            validate();
            save();
        }
    }
    
    function handleKeyUp (event, element, elementType) {
        
        if (isArrowKey(event.keyCode)) {
            return;
        }
        
        if (elementType === "nodeText") {
            resetNodeErrors();
            parseNodeDebounced(function (errors) {
                if (!errors) {
                    validate();
                }
            });
            saveDebounced();
        }
        else if (event.keyCode === S_KEY && event.ctrlKey) {
            save();
        }
    }
    
    function handleClick (event, element, elementType) {
        
        var target;
        var name = nodeName;
        
        if (elementType === "link") {
            
            target = element.getAttribute("data-target");
            
            if (story.hasNode(target)) {
                changeNode(target);
            }
            else {
                createNode(target);
            }
        }
        else if (elementType === "addNext") {
            addNext();
        }
        else if (elementType === "deleteNode") {
            dialogs.confirmDeleteNode(name, function (accepted) {
                if (accepted) {
                    story.deleteNode(name);
                    story.save();
                    changeNode("start");
                }
            });
        }
        else if (elementType === "returnToLast") {
            toggleReturnToLast();
        }
        else if (elementType === "option") {
            updateNodeOptions(element.getAttribute("data-count"));
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange
        },
        onkeyup: handleKeyUp,
        onclick: handleClick
    };
}

module.exports = create;
