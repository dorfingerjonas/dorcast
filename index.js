const {app, BrowserWindow} = require('electron');
const express = require('express');
const expressApp = express();
const http = require('http').createServer(expressApp);
const getPort = require('get-port');
const settings = {};

(async () => {
    settings.port = await getPort();
    
    http.listen(settings.port, () => {
        console.log(`http://localhost:${settings.port}/`);
    });

    app.whenReady().then(() => {
        expressApp.get('/', (req, res) => {
            res.sendFile(__dirname + '/src/index.html');
        });
    
        createWindow();
    
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0)
                createWindow();
        });
    });
})();

expressApp.use(express.static(__dirname + '/src'));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1560,
        height: 1140,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(`http://localhost:${settings.port}/`);
    mainWindow.webContents.openDevTools();
    mainWindow.focus();
}