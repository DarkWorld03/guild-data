const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la raíz (index.html, script.js, style.css, y carpetas)
app.use(express.static(path.join(__dirname)));

// Ruta raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
