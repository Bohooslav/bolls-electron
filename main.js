import { app, BrowserWindow, shell, Menu, session, Tray } from "electron";
import Store from "electron-store";

let win, tray;

const store = new Store();

function createTray() {
  tray = new Tray("build/tray.png");
  tray.setToolTip("Bolls");

  let trayMenu = Menu.buildFromTemplate([
    {
      label: "Bolls",
      click: () => {
        win.show();
      },
    },
    { type: "separator" },
    {
      label: "New Window",
      accelerator: "CmdOrCtrl+shift+N",
      click: createWindow,
    },
    {
      label: "New Private Window",
      accelerator: "CmdOrCtrl+shift+P",
      click: createPrivateWindow,
    },
    { type: "separator" },
    { role: "quit" },
  ]);
  tray.setContextMenu(trayMenu);
}

const menu = Menu.buildFromTemplate([
  {
    label: "Bolls",
    submenu: [
      {
        label: "New Window",
        accelerator: "CmdOrCtrl+shift+N",
        click: createWindow,
      },
      {
        label: "New Private Window",
        accelerator: "CmdOrCtrl+shift+P",
        click: createPrivateWindow,
      },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  { role: "editMenu" },
  { role: "viewMenu" },
  { role: "windowMenu" },
]);
Menu.setApplicationMenu(menu);

function windowsCount() {
  return BrowserWindow.getAllWindows().filter((b) => {
    return b.isVisible();
  }).length;
}
/**
 * Returns saved window state
 * sets default values if not saved
 * @returns {Object} mainWindowState
 */
function getMainWindowState() {
  let mainWindowState = store.get();
  if (!mainWindowState) {
    mainWindowState = {};
  }

  if (!store.has("width")) {
    mainWindowState.width = 1280;
  }

  if (!store.has("height")) {
    mainWindowState.height = 800;
  }

  if (!store.has("isFullScreen")) {
    mainWindowState.isFullScreen = false;
  }

  if (!store.has("isMaximized")) {
    mainWindowState.isMaximized = false;
  }

  return mainWindowState;
}

function createPrivateWindow() {
  let private_session = session.fromPartition("private");

  let windows_count = windowsCount();
  const mainWindowState = getMainWindowState();

  // Create the browser window.
  let private_win = new BrowserWindow({
    show: false,
    backgroundColor: "#04060c",
    icon: "build/icon.png",
    webPreferences: {
      sandbox: true,
      defaultFontFamily: "sansSerif",
      session: private_session,
    },
    darkTheme: true,
    x: mainWindowState.x + 64 * (windows_count - 1),
    y: mainWindowState.y + 64 * (windows_count - 1),
    width: mainWindowState.width,
    height: mainWindowState.height,
  });

  private_win.loadURL("https://bolls.life", {
    userAgent:
      "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'",
  });

  private_win.once("ready-to-show", () => {
    private_win.show();
  });
  private_win.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
  private_win.on("enter-full-screen", () => {
    private_win.setAutoHideMenuBar(true);
  });
  private_win.on("leave-full-screen", () => {
    private_win.setAutoHideMenuBar(false);
  });
}

function createWindow() {
  // Used to offset every new window to avoid overlaping with existing windows
  let windows_count = windowsCount();
  console.log(getMainWindowState());
  const winState = getMainWindowState();

  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    backgroundColor: "#04060c",
    icon: "build/icon.png",
    webPreferences: {
      sandbox: true,
      defaultFontFamily: "sansSerif",
      devTools: !app.isPackaged,
    },
    darkTheme: true,
    x: winState.x + 64 * windows_count,
    y: winState.y + 64 * windows_count,
    width: winState.width,
    height: winState.height,
  });

  // Register listeners on the window to update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  if (windows_count === 0) {
    // Manage only main window
    win.on("maximize", () => {
      store.set("isMaximized", true);
    });
    win.on("unmaximize", () => {
      store.set("isMaximized", false);
    });
    win.on("resize", () => {
      store.set("width", win.getSize()[0]);
      store.set("height", win.getSize()[1]);
    });
    win.on("move", () => {
      store.set("x", win.getPosition()[0]);
      store.set("y", win.getPosition()[1]);
    });

    if (winState.isMaximized) {
      win.maximize();
    }

    if (winState.isFullScreen) {
      win.setFullScreen(true);
    }
  }

  // win.webContents.openDevTools()
  // win.loadURL('http://0.0.0.0:8000', {userAgent: 'Chrome'})
  win.loadURL("https://bolls.life", {
    userAgent:
      "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0'",
  });
  win.once("ready-to-show", () => {
    win.show();
  });
  win.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  win.on("enter-full-screen", () => {
    win.setAutoHideMenuBar(true);
    if (windows_count === 0) store.set("isFullScreen", true);
  });
  win.on("leave-full-screen", () => {
    win.setAutoHideMenuBar(false);
    if (windows_count === 0) store.set("isFullScreen", false);
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  // I need to clean up all service workers and cache only once
  const didClear = store.get("didClear");
  if (!didClear) {
    session.defaultSession.clearStorageData({ storages: ["serviceworkers"] });
    session.defaultSession.clearStorageData({ storages: ["caches"] });
    // now memorize you did this, but localStorage is not available in main process
    store.set("didClear", "true");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Make OSX work same as all other systems
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
