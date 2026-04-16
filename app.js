// ============================================================
// PRODEF — app.js  v5.0
// IDs del dashboard: player-name, player-tecnica,
//   player-tactica, player-fisico, player-comentario,
//   login-box, dashboard  ← NEVER CHANGE
// ============================================================

import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

console.log("🔥 PRODEF — Firebase listo");


// ──────────────────────────────────────────────────────────
// 🔐 LOGIN
// ──────────────────────────────────────────────────────────
window.login = async function () {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  clearError();

  if (!email || !password) {
    showError("Ingresa correo y contraseña.");
    return;
  }

  try {
    const cred  = await signInWithEmailAndPassword(auth, email, password);
    const { uid } = cred.user;
    console.log("✅ Login exitoso:", uid);

    await getPlayerData(uid);
    await getPlayerHistory(uid);

  } catch (err) {
    console.error("❌ Login error:", err.code);
    showError("Correo o contraseña incorrectos.");
  }
};


// ──────────────────────────────────────────────────────────
// 🚪 LOGOUT
// ──────────────────────────────────────────────────────────
window.logout = async function () {
  try {
    await signOut(auth);
    console.log("👋 Sesión cerrada");

    document.getElementById("dashboard").style.display  = "none";
    document.getElementById("login-box").style.display  = "block";
    document.getElementById("email").value    = "";
    document.getElementById("password").value = "";
    clearError();

  } catch (err) {
    console.error("❌ Logout error:", err);
  }
};


// ──────────────────────────────────────────────────────────
// 📋 DATOS DEL JUGADOR
// ──────────────────────────────────────────────────────────
async function getPlayerData(uid) {
  try {
    const snap = await getDoc(doc(db, "players", uid));

    if (!snap.exists()) {
      console.warn("⚠️ Sin documento en players/" + uid);
      showError("No se encontraron datos del jugador.");
      return;
    }

    const data = snap.data();
    console.log("📊 Datos cargados:", data);

    // Ocultar login → mostrar dashboard
    document.getElementById("login-box").style.display  = "none";
    document.getElementById("dashboard").style.display  = "block";

    // Primer nombre para el saludo
    const firstName = (data.NOMBRE || "Jugador").split(" ")[0];

    // ─── IDs del DOM — NO CAMBIAR ───────────────────────
    document.getElementById("player-name").textContent      = firstName;
    document.getElementById("player-tecnica").textContent   = data.TECNICA   ?? "—";
    document.getElementById("player-tactica").textContent   = data.TACTICA   ?? "—";
    document.getElementById("player-fisico").textContent    = data.FISICO    ?? "—";
    document.getElementById("player-comentario").textContent =
      data.COMENTARIO || "Sin comentario registrado.";

  } catch (err) {
    console.error("❌ Error cargando jugador:", err);
    showError("Error al cargar los datos. Intenta de nuevo.");
  }
}


// ──────────────────────────────────────────────────────────
// 📅 HISTORIAL
// ──────────────────────────────────────────────────────────
async function getPlayerHistory(uid) {
  console.log("📅 Cargando historial:", uid);

  try {
    const ref      = collection(db, "players", uid, "sessions");
    const q        = query(ref, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("⚠️ Sin sesiones para:", uid);
      renderHistory([]);
      return;
    }

    const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`✅ ${sessions.length} sesión(es):`, sessions);
    renderHistory(sessions);

  } catch (err) {
    console.error("❌ Error cargando historial:", err);
    renderHistory(null);
  }
}


// ──────────────────────────────────────────────────────────
// 🎨 RENDER HISTORIAL
// ──────────────────────────────────────────────────────────
function renderHistory(sessions) {
  const container = document.getElementById("history-list");

  if (sessions === null) {
    container.innerHTML = `
      <p class="history-empty">
        ⚠️ No se pudo cargar el historial. Verifica tu conexión.
      </p>`;
    return;
  }

  if (sessions.length === 0) {
    container.innerHTML = `
      <p class="history-empty">
        No hay evaluaciones registradas aún.
      </p>`;
    return;
  }

  container.innerHTML = sessions.map(s => `
    <div class="history-session">
      <p class="history-session-date">
        <i class="fas fa-calendar-alt"></i> ${formatDate(s.date)}
      </p>
      <div class="history-stats-row">
        <div class="history-stat">
          <span class="history-stat-label">Técnica</span>
          <span class="history-stat-value">${s.tecnica ?? "—"}</span>
        </div>
        <div class="history-stat">
          <span class="history-stat-label">Táctica</span>
          <span class="history-stat-value">${s.tactica ?? "—"}</span>
        </div>
        <div class="history-stat">
          <span class="history-stat-label">Físico</span>
          <span class="history-stat-value">${s.fisico ?? "—"}</span>
        </div>
      </div>
      ${s.comentario
        ? `<p class="history-session-comentario">${s.comentario}</p>`
        : ""}
    </div>
  `).join("");
}


// ──────────────────────────────────────────────────────────
// 🛠 UTILS
// ──────────────────────────────────────────────────────────
function formatDate(raw) {
  if (!raw) return "Fecha no disponible";
  if (typeof raw.toDate === "function") {
    return raw.toDate().toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric"
    });
  }
  const d = new Date(raw);
  if (!isNaN(d)) {
    return d.toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric"
    });
  }
  return String(raw);
}

function showError(msg) {
  const el = document.getElementById("login-error");
  if (el) el.textContent = msg;
}

function clearError() {
  const el = document.getElementById("login-error");
  if (el) el.textContent = "";
}