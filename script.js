/* ============================================================
   SIKORDA - Kejaksaan Negeri Muna
   script.js - Logika interaksi tampilan awal
   ============================================================ */

const GOOGLE_SCRIPT_URL = "GANTI_DENGAN_URL_APPS_SCRIPT_ANDA";
let isJaksaLoggedIn = sessionStorage.getItem("isJaksaLoggedIn") === "true";

function updateLoginButton() {
  const btn = document.querySelector(".btn-login");
  if (!btn) return;
  if (isJaksaLoggedIn) {
    btn.textContent = "Logout";
    btn.onclick = logoutJaksa;
  } else {
    btn.textContent = "Login Jaksa";
    btn.onclick = openLogin;
  }
}

function logoutJaksa() {
  sessionStorage.removeItem("isJaksaLoggedIn");
  updateLoginButton();
  alert("Anda telah logout.");
}

// Tambahkan di fungsi login
if (username === DEMO_USER && password === DEMO_PASS) {
  sessionStorage.setItem("isJaksaLoggedIn", "true");
  alert("Login berhasil. Selamat datang, Jaksa.");
  updateLoginButton();
}

function toggleMenu() {
  const nav = document.querySelector(".nav-links");
  if (nav) nav.classList.toggle("open");
}

function openLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("show");
}
function closeLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("show");
}

function updateLoginButton() {
  const btn = document.querySelector(".btn-login");
  if (!btn) return;
  if (isJaksaLoggedIn) {
    btn.textContent = "Logout";
    btn.onclick = logoutJaksa;
  } else {
    btn.textContent = "Login Jaksa";
    btn.onclick = openLogin;
  }
}

function logoutJaksa() {
  sessionStorage.removeItem("isJaksaLoggedIn");
  lockJaksaData();
  updateLoginButton();
  alert("Anda telah logout.");
}

function unlockJaksaData() {
  document.querySelectorAll(".blur-data").forEach(el => {
    el.classList.add("unblurred");
    if (el.dataset.real) el.textContent = el.dataset.real;
  });
}

function lockJaksaData() {
  document.querySelectorAll(".blur-data").forEach(el => {
    el.classList.remove("unblurred");
    if (el.dataset.real) el.textContent = "Rahasia";
  });
}

function validateForm(data) {
  let isValid = true;
  const errors = {};

  if (!data["nama_tersangka"]) {
    isValid = false;
    errors["nama_tersangka"] = "Nama Tersangka wajib diisi.";
  }
  if (!data["nomor_hp"]) {
    isValid = false;
    errors["nomor_hp"] = "Nomor HP wajib diisi.";
  }

  Object.keys(errors).forEach((key) => {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) {
      const errorEl = document.createElement("small");
      errorEl.textContent = errors[key];
      errorEl.style.color = "red";
      input.parentElement.appendChild(errorEl);
    }
  });

  return isValid;
}
document.addEventListener("DOMContentLoaded", () => {
  updateLoginButton();
  console.log("SIKORDA - Kejaksaan Negeri Muna berhasil dimuat.");
});
document.addEventListener("click", function (e) {
  const modal = document.getElementById("loginModal");
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});
