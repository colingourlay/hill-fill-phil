const path = require('path');
const url = require('url');
const getFolderSize = require('get-folder-size');
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const { width, height, scaleFactor } = require('./constants');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: width * scaleFactor,
    height: height * scaleFactor,
    frame: false,
    backgroundColor: '#000',
    resizable: false,
    webPreferences: {
      devTools: !process.env.DIST
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  ipcMain.on('measure', (event, directory) => {
    getFolderSize(directory, (err, size) => {
      if (err) {
        throw err;
      }
      event.sender.send('measurement', size);
    });
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  app.quit();
});
