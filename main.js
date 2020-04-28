let { app, BrowserWindow } = require("electron")

function createWindow () {
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
  })
  win.loadURL('https://bolls.life')
  win.maximize()
  win.setMenuBarVisibility(false)
  win.once('ready-to-show', () => {
    win.show()
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
