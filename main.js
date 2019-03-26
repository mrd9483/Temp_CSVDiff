const { app, ipcMain } = require('electron');
const path = require('path');
const Window = require('./window')

let resultsWindow = null;

// In the main process.
global.sharedObject = {
    csv: {}
}

function main() {
    let mainWindow = new Window({
        file: path.join('renderers', 'index.html')
    });

    //window.setMenu(null);

    ipcMain.on('show-results', (event, results) => {
        // if addTodoWin does not already exist
        if (!resultsWindow) {
            // create a new add todo window
            resultsWindow = new Window({
                file: path.join('renderers', 'results.html'),
                // close with the main window
                parent: mainWindow
            });

            resultsWindow.once('show', () => {
                resultsWindow.webContents.openDevTools();
                resultsWindow.webContents.send('results', results);
            });

            // cleanup
            resultsWindow.on('closed', () => {
                resultsWindow = null
            });
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

// Wait until the app is ready
app.once('ready', main);