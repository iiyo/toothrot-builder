/* global require, module */

(function () {
    
    var transform = require("transform-js").transform;
    
    var SHOW_DURATION = 300;
    var HIDE_DURATION = 300;
    
    function confirm (title, message, then) {
        
        var container = document.createElement("div");
        
        container.setAttribute("class", "DialogContainer ConfirmDialogContainer");
        container.setAttribute("data-type", "DialogContainer");
        
        container.innerHTML = '' +
            '<div class="Dialog ConfirmDialog" data-type="Dialog">' +
                '<h2 class="Title">' + title + '</h2>' +
                '<p class="Message">' + message + '</p>' +
                '<div class="ButtonBar">' +
                    '<a class="Button CancelButton" data-type="Button" data-value="no">Cancel</a>' +
                    '<a class="Button OkButton" data-type="Button" data-value="yes">OK</a>' +
                '</div>' +
            '</div>';
        
        container.addEventListener("click", function (event) {
            
            var target = event.target;
            var type = target.getAttribute("data-type");
            var value = target.getAttribute("data-value");
            
            if (type === "Button") {
                hide(container, function () {
                    container.parentNode.removeChild(container);
                    then(value === "yes" ? true : false);
                });
            }
            else if (type === "DialogContainer") {
                hide(container, function () {
                    container.parentNode.removeChild(container);
                    then(false);
                });
            }
        });
        
        container.style.opacity = "0";
        document.body.appendChild(container);
        
        show(container);
    }
    
    function show (element, then) {
        transform(0, 1, function (v) { element.style.opacity = v; }, {
            duration: SHOW_DURATION
        }, then);
    }
    
    function hide (element, then) {
        transform(1, 0, function (v) { element.style.opacity = v; }, {
            duration: HIDE_DURATION
        }, then);
    }
    
    module.exports = confirm;
    
}());
