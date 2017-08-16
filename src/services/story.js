
var fs = require("fs");
var toothrot = require("toothrot");

function create (app) {
    
    function createInstance (name) {
        
        var projects = app.getService("project");
        var story = projects.getAstFile(name);
        
        function getSectionNames () {
            return Object.keys(story.sections);
        }
        
        function hasNode (name) {
            return (name in story.nodes);
        }
        
        function getNode (name) {
            return story.nodes[name];
        }
        
        function createNode (name) {
            
            if (hasNode(name)) {
                return;
            }
            
            story.nodes[name] = {
                id: name,
                line: 0,
                scripts: [],
                links: [],
                options: [],
                returnToLast: false,
                raw: "",
                content: "",
                section: "default"
            };
        }
        
        function deleteNode (name) {
            if (name in story.nodes) {
                delete story.nodes[name];
            }
        }
        
        function validate () {
            return toothrot.validate(story);
        }
        
        function save () {
            story.meta.saveTime = Date.now();
            fs.writeFileSync(projects.getAstFilePath(name), JSON.stringify(story, null, 4));
        }
        
        function parseNodeContent (node, then) {
            toothrot.parseNodeContent(node, then);
        }
        
        function getIncomingLinksForNode (name) {
            return Object.keys(story.nodes).filter(function (key) {
                
                var found = false;
                var node = story.nodes[key];
                
                if (node.next === name) {
                    return true;
                }
                
                node.links.some(function (link) {
                    
                    if (typeof link.target === "string" && link.target === name) {
                        found = true;
                        return true;
                    }
                    else {
                        Object.keys(link.target).some(function (key) {
                            
                            if (link.target[key] === name) {
                                found = true;
                                return true;
                            }
                            
                            return false;
                        });
                    }
                    
                    return false;
                });
                
                if (!found) {
                    node.options.some(function (option) {
                        
                        if (option.target === name) {
                            found = true;
                            return true;
                        }
                        
                        return false;
                    });
                }
                
                return found;
                
            }).map(function (key) {
                return story.nodes[key].id;
            }).sort();
        }
        
        function destroy () {
            story = null;
        }
        
        return {
            destroy: destroy,
            getSectionNames: getSectionNames,
            getNode: getNode,
            validate: validate,
            save: save,
            parseNodeContent: parseNodeContent,
            getIncomingLinksForNode: getIncomingLinksForNode,
            hasNode: hasNode,
            createNode: createNode,
            deleteNode: deleteNode
        };
    }
    
    return {
        create: createInstance
    };
}

module.exports = create;
