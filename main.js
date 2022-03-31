const { app, BrowserWindow, shell } = require("electron")
const windowStateKeeper = require('electron-window-state')

let win

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
    fullScreen: true
  });

  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    backgroundColor: '#04060c',
    icon: 'build/icon.png',
    webPreferences: {
      sandbox: true,
      defaultFontFamily: 'sansSerif',
    },
    darkTheme: true,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win)

  // win.webContents.openDevTools()
  // win.loadURL('http://0.0.0.0:8000', {userAgent: 'Chrome'})
  win.loadURL('https://bolls.life', {userAgent: "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'"})
  // win.maximize()
  win.setMenuBarVisibility(false)
  win.once('ready-to-show', () => {
    win.show()
  })
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })
}

app.on("ready", createWindow)

// Make OSX work same as all other systems
app.on("window-all-closed", () => {
  app.quit()
})

app.on("activate", () => {
  // On macOS it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

global.sharedObject = {argv: process.argv}
