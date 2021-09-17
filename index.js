const { app, BrowserWindow, Menu } = require("electron");

let mainWindow;

const applicationMenu = Menu.buildFromTemplate([]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  mainWindow.loadURL("http://localhost:4200");

  Menu.setApplicationMenu(applicationMenu);

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
