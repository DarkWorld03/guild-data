const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la raíz
app.use(express.static(path.join(__dirname)));

// Ruta raíz muestra loader.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "loader.html"));
});

// Ruta explícita para index.html
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
