// Función para cambiar de sección
function mostrarSeccion(seccionId) {
  document.querySelectorAll('.seccion').forEach(seccion => {
    seccion.classList.remove('activa');
  });
  document.getElementById(seccionId).classList.add('activa');

  // Resaltar el botón activo
  document.querySelectorAll("nav button").forEach(button => {
    button.classList.remove("activo");
  });
  document.querySelector(`button[onclick="mostrarSeccion('${seccionId}')"]`).classList.add("activo");
}

// Función para mostrar diferencia de puntos (con colores rojo/verde)
function mostrarDiferencia(actual, arriba, abajo) {
  const difArriba = arriba !== null ? actual - arriba : null;
  const difAbajo = abajo !== null ? actual - abajo : null;
  return `
    <div style="color: #e63946; font-size: 14px; line-height: 1.2;">
      ${difArriba !== null ? (difArriba >= 0 ? "+" : "") + difArriba : "-"}
    </div>
    <div style="color: #06d6a0; font-size: 14px; line-height: 1.2;">
      ${difAbajo !== null ? (difAbajo >= 0 ? "+" : "") + difAbajo : "-"}
    </div>
  `;
}

// Variables globales para guilds y guild principal
let guildsGlobal = [];
window.mainGuildName = "";

// Cargar datos de todas las guilds y tabla global (desde JSON local)
function cargarDatosGuilds() {
  fetch("/guilds/allguilds.json")
    .then(response => response.json())
    .then(data => {
      const guildsTable = document.getElementById("guildsTable");
      guildsTable.innerHTML = "";

      if (!data || data.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="4">No hay datos disponibles</td>`;
        guildsTable.appendChild(noDataRow);
        return;
      }

      const guilds = data.map(g => ({
        ...g,
        numericPoints: parseInt(g.points.replace(/,/g, "")) || 0
      })).sort((a, b) => b.numericPoints - a.numericPoints);

      guildsGlobal = guilds;

      guilds.forEach((guild, index) => {
        const arriba = index > 0 ? guilds[index - 1].numericPoints : null;
        const abajo = index < guilds.length - 1 ? guilds[index + 1].numericPoints : null;

        const tr = document.createElement("tr");
        tr.style.height = "60px";

        tr.innerHTML = `
          <td style="text-align: center;">${index + 1}</td>
          <td>
            <div class="flex-name-img">
              <img src="${guild.logo}" alt="${guild.name}" width="50" height="50" loading="lazy" style="max-height: 50px;">
              <a href="${guild.url}" target="_blank" rel="noopener noreferrer">${guild.name}</a>
            </div>
          </td>
          <td style="text-align: center; font-weight: bold; color: #1db954;">${guild.points}</td>
          <td style="text-align: center;">${mostrarDiferencia(guild.numericPoints, arriba, abajo)}</td>
        `;

        guildsTable.appendChild(tr);
      });

      if (window.mainGuildName) {
        actualizarTopGuild(window.mainGuildName);
      }
    })
    .catch(error => console.error("❌ Error obteniendo datos de todas las guilds:", error));
}

// Cargar datos de jugadores y encabezado de la guild (desde JSON local)
function cargarDatosJugadores() {
  fetch("/guild/guild1.json")
    .then(response => response.json())
    .then(data => {
      document.getElementById("guildName").innerText = data.guildName || "Nombre Desconocido";
      document.getElementById("guildLogo").src = "https://cdn.skymavis.com/mavisx/dlc-central/remote-config/classic-m/custom-guild-avatar/mGfOIl8T.png";
      window.mainGuildName = data.guildName;

      if (guildsGlobal.length > 0) {
        actualizarTopGuild(data.guildName);
      }

      const playersTable = document.getElementById("playersTable");
      playersTable.innerHTML = "";

      const players = data.players.map(p => ({
        ...p,
        numericPoints: parseInt(p.points.replace(/,/g, "")) || 0
      }));

      players.forEach((player, index) => {
        const arriba = index > 0 ? players[index - 1].numericPoints : null;
        const abajo = index < players.length - 1 ? players[index + 1].numericPoints : null;

        const row = document.createElement("tr");
        row.style.height = "60px";

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>
            <div class="flex-name-img">
              <a href="https://axieclassic.com/profile/${player.id}" target="_blank" rel="noopener noreferrer">${player.name}</a>
            </div>
          </td>
          <td class="points" style="color: #1db954;">${player.points}</td>
          <td>${mostrarDiferencia(player.numericPoints, arriba, abajo)}</td>
        `;

        playersTable.appendChild(row);
      });
    })
    .catch(error => console.error("❌ Error al obtener los datos:", error));
}

// Mostrar el ranking del guild principal
function actualizarTopGuild(guildName) {
  const index = guildsGlobal.findIndex(g => g.name === guildName);
  document.getElementById("guildRank").innerText =
    index !== -1 ? ` ${index + 1}` : "Ranking no disponible";
}

// Cargar y mostrar datos históricos con total y promedio (con colores)
async function cargarDatosHistoricos() {
  const thead = document.getElementById("historicoThead");
  const tbody = document.getElementById("historicoTbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  try {
    const res = await fetch("/historico/historico.json");
    if (!res.ok) throw new Error("Error al obtener datos históricos");
    const data = await res.json();

    if (!data || data.length === 0) {
      thead.innerHTML = `<tr><th colspan="2">No hay datos históricos disponibles</th></tr>`;
      return;
    }

    const fechas = [...new Set(data.flatMap(j => j.pointsHistory.map(p => p.date)))].sort();

    const trHead = document.createElement("tr");
    trHead.innerHTML = `
      <th>Nombre</th>
      <th>Total</th>
      <th>Promedio</th>
      ${fechas.map(f => `<th>${f}</th>`).join("")}
    `;
    thead.appendChild(trHead);

    data.forEach(jugador => {
      const pointsMap = Object.fromEntries(jugador.pointsHistory.map(p => [p.date, p.totalPoints]));
      const total = jugador.pointsHistory.reduce((acc, p) => acc + parseInt(p.totalPoints), 0);
      const promedio = (total / jugador.pointsHistory.length).toFixed(2);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${jugador.nombre}</td>
        <td style="color: #1db954; font-weight: bold;">${total}</td>
        <td style="color: ${promedio < 16 ? 'red' : '#1db954'}; font-weight: bold;">${promedio}</td>
        ${fechas.map(f => `<td style="text-align:center;">${pointsMap[f] ?? "-"}</td>`).join("")}
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("❌ Error cargando datos históricos:", error);
    thead.innerHTML = `<tr><th colspan="2">Error al cargar datos históricos</th></tr>`;
  }
}

// Controlador de sección activa
function onMostrarSeccion(seccionId) {
  mostrarSeccion(seccionId);
  if (seccionId === "guilds") {
    cargarDatosGuilds();
  } else if (seccionId === "nikeladim") {
    cargarDatosJugadores();
  } else if (seccionId === "puntos") {
    cargarDatosHistoricos();
  }
}

// Reemplazar los onclick por eventos con lógica centralizada
document.querySelectorAll("nav button").forEach(button => {
  const seccionId = button.getAttribute("onclick").match(/'(.*)'/)[1];
  button.onclick = () => onMostrarSeccion(seccionId);
});

// Cargar sección principal al inicio
mostrarSeccion("nikeladim");
cargarDatosJugadores();

// Cargar lista de guilds al inicio
document.addEventListener("DOMContentLoaded", cargarDatosGuilds);

function exportarExcel() {
  const tabla = document.getElementById("guildDataTable") || document.getElementById("historicoTbody").parentElement;
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Guild Data" });
  XLSX.writeFile(wb, "guild-data.xlsx");
}

function exportarPDF() {
  const doc = new jspdf.jsPDF('landscape');
  doc.setFontSize(14);
  doc.text("Guild Data", 14, 15);

  const tabla = document.getElementById("guildDataTable") || document.getElementById("historicoTbody").parentElement;
  const filas = Array.from(tabla.querySelectorAll("tr")).map(row =>
      Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText.trim())
  );

  const cabecera = filas.shift();
  doc.autoTable({
      head: [cabecera],
      body: filas,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 }
  });

  doc.save("guild-data.pdf");
}
