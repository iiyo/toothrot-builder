/* global __dirname, process */

var win;

var electron = require("electron");
var path = require("path");
var url = require("url");

var toothrot = require("toothrot");

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

global.toothrot = toothrot;

function start () {
    
    win = new BrowserWindow({
        width: 980,
        height: 600,
        frame: true,
        icon: path.join(__dirname, "style/icons/icon64.png")
    });
    
    win.setMenu(null);
    
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
    }));
    
    // win.webContents.openDevTools();
    
    win.on("closed", function () {
        win = null;
    });
}

app.on("ready", start);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (win === null) {
        start();
    }
});
