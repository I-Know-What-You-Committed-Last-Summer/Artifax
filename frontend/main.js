const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200, // Slightly wider to accommodate DevTools neatly
    height: 800,
    icon: path.join(__dirname, './public/artifax-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  mainWindow.webContents.openDevTools();

  // 1. CHECK IF RUNNING IN DEVELOPMENT MODE
  // Vite usually runs on 5173, Create-React-App/Webpack usually runs on 3000
  // Adjust the port number below to match your terminal's local server port
  const isDev = !app.isPackaged;
  const devServerUrl = 'http://localhost:3000'; 

  if (isDev) {
    // Load the live development server with hot-reloading active
    mainWindow.loadURL(devServerUrl).catch(() => {
      console.log("Failed to connect to dev server, falling back to build file.");
      mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
    });
  } else {
    // Load the static bundled files for the packaged production build
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})