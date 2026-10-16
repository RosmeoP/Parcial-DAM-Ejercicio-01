const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    title: "Rick & Morty Desktop Explorer",
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0b0f19',
    show: false, // Evita parpadeo blanco antes de cargar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Carga la interfaz HTML local sin depender de servidor web
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Muestra la ventana de forma fluida cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Configurar icono en Dock de macOS si está disponible
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    try {
      app.dock.setIcon(path.join(__dirname, 'assets', 'icon.png'));
    } catch (err) {
      console.warn("No se pudo configurar el icono del Dock:", err.message);
    }
  }

  createWindow();

  app.on('activate', () => {
    // En macOS se suele recrear la ventana al hacer click en el dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar la aplicación cuando todas las ventanas se cierren (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
