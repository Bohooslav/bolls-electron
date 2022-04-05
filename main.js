const { app, BrowserWindow, shell, Menu, session, Tray } = require("electron")
const windowStateKeeper = require('electron-window-state')

let win, tray, mainWindowState

function createTray() {
  tray = new Tray('build/tray.png')
  tray.setToolTip('Bolls')

  let trayMenu = Menu.buildFromTemplate([
    { label: 'Bolls', click: () => { win.show() } },
    { type: 'separator' },
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+shift+N',
      click: createWindow
    },
    {
      label: 'New Private Window',
      accelerator: 'CmdOrCtrl+shift+P',
      click: createPrivateWindow
    },
    { type: 'separator' },
    { role:'quit' }
  ])
  tray.setContextMenu(trayMenu)
}

const menu = Menu.buildFromTemplate([{
  label: 'Bolls',
  submenu: [
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+shift+N',
      click: createWindow
    },
    {
      label: 'New Private Window',
      accelerator: 'CmdOrCtrl+shift+P',
      click: createPrivateWindow
    },
    { type: 'separator' },
    { role: 'quit' }
  ]
},
{ role: 'editMenu' },
{ role: 'viewMenu' },
{ role: 'windowMenu' }
])
Menu.setApplicationMenu(menu)

function windowsCount() {
  return BrowserWindow.getAllWindows()
    .filter(b => {
      return b.isVisible()
    })
    .length
  }
  

function createWindow() {
  // Used to offset every new window to avoid overlaping with existing windows
  let windows_count = windowsCount()

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
    x: mainWindowState.x + 64 * (windows_count - 1),
    y: mainWindowState.y + 64 * (windows_count - 1),
    width: mainWindowState.width,
    height: mainWindowState.height,
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win)

  // win.webContents.openDevTools()
  // win.loadURL('http://0.0.0.0:8000', {userAgent: 'Chrome'})
  win.loadURL('https://bolls.life', { userAgent: "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'" })
  // win.setMenuBarVisibility(false)
  win.once('ready-to-show', () => {
    win.show()
  })
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })

  win.on('enter-full-screen', () => {
    win.setAutoHideMenuBar(true)
  })
  win.on('leave-full-screen', () => {
    win.setAutoHideMenuBar(false)
  })
}


function createPrivateWindow() {
  let private_session = session.fromPartition('private')

  let windows_count = windowsCount()

  // Create the browser window.
  let private_win = new BrowserWindow({
    show: false,
    backgroundColor: '#04060c',
    icon: 'build/icon.png',
    webPreferences: {
      sandbox: true,
      defaultFontFamily: 'sansSerif',
      session: private_session
    },
    darkTheme: true,
    x: mainWindowState.x + 64 * (windows_count - 1),
    y: mainWindowState.y + 64 * (windows_count - 1),
    width: mainWindowState.width,
    height: mainWindowState.height,
  })

  private_win.loadURL('https://bolls.life', { userAgent: "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'" })

  private_win.once('ready-to-show', () => {
    private_win.show()
  })
  private_win.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })
  private_win.on('enter-full-screen', () => {
    private_win.setAutoHideMenuBar(true)
  })
  private_win.on('leave-full-screen', () => {
    private_win.setAutoHideMenuBar(false)
  })
}

app.on("ready", () => {
  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
    fullScreen: true
  });
  createWindow()
  createTray()
})

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

global.sharedObject = { argv: process.argv }
