/* ============================================================
   SIKORDA - Kejaksaan Negeri Muna
   script.js - Logika interaksi tampilan awal
   ============================================================ */

// Ganti dengan URL Web App Google Apps Script Anda (deploy sebagai Web App)
const GOOGLE_SCRIPT_URL = "GANTI_DENGAN_URL_APPS_SCRIPT_ANDA";

// Status login jaksa (disimpan di sessionStorage)
let isJaksaLoggedIn = sessionStorage.getItem("isJaksaLoggedIn") === "true";

/* 1. Toggle menu burger (mobile) */
function toggleMenu() {
  const nav = document.querySelector(".nav-links");
  if (nav) nav.classList.toggle("open");
}

/* 2. Modal login jaksa */
function openLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("show");
}
function closeLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("show");
}

// Tutup modal jika klik di luar box
window.addEventListener("click", (e) => {
  const modal = document.getElementById("loginModal");
  if (e.target === modal) closeLogin();
});

/* 3. Update tombol login/logout */
function updateLoginButton() {
  const btn = document.querySelector(".btn-login");
  if (!btn) return;
  if (sessionStorage.getItem("isJaksaLoggedIn") === "true") {
    btn.textContent = "Logout";
    btn.onclick = logoutJaksa;
  } else {
    btn.textContent = "Login Jaksa";
    btn.onclick = openLogin;
  }
}

/* 4. Logout jaksa */
function logoutJaksa() {
  sessionStorage.removeItem("isJaksaLoggedIn");
  lockJaksaData();
  updateLoginButton();
  alert("Anda telah logout.");
}

/* 5. Proteksi data (blur/unblur nama tersangka dan detail) */
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

/* 6. Validasi form permohonan */
function clearFormErrors() {
  document.querySelectorAll("small.error-msg").forEach(el => el.remove());
}
function validateForm(data) {
  clearFormErrors();
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
      errorEl.classList.add("error-msg");
      input.parentElement.appendChild(errorEl);
    }
  });

  return isValid;
}

/* 7. Tambah/hapus poin permasalahan */
function addPoin() {
  const wrap = document.getElementById("permasalahanWrap");
  if (!wrap) return;
  const count = wrap.querySelectorAll(".poin-row").length + 1;
  const row = document.createElement("div");
  row.className = "poin-row";
  row.innerHTML =
    `<input type="text" name="permasalahan[]" placeholder="${count}. Tuliskan permasalahan...">` +
    `<button type="button" class="btn-remove" onclick="removePoin(this)">&times;</button>`;
  wrap.appendChild(row);
}
function removePoin(btn) {
  const wrap = document.getElementById("permasalahanWrap");
  if (!wrap) return;
  if (wrap.querySelectorAll(".poin-row").length > 1) {
    btn.parentElement.remove();
    renumberPoin();
  } else {
    alert("Minimal harus ada satu poin permasalahan.");
  }
}
function renumberPoin() {
  document.querySelectorAll("#permasalahanWrap .poin-row input").forEach((inp, i) => {
    inp.placeholder = `${i + 1}. Tuliskan permasalahan...`;
  });
}

/* 8. Validasi ukuran file upload (maks 10MB) */
function checkFileSize(input) {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (input.files.length > 0) {
    if (input.files[0].size > maxSize) {
      alert("Ukuran file melebihi 10MB. Silakan unggah file yang lebih kecil.");
      input.value = "";
    }
  }
}

/* 9. Filter tabel monitoring */
function filterTable() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;
  const keyword = searchBox.value.toLowerCase();
  const rows = document.querySelectorAll("#monitorBody tr");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
}

/* 10. Smooth scroll untuk link internal */
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    const navbar = document.querySelector(".navbar");
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
    window.scrollTo({ top: top, behavior: "smooth" });
  }
}

/* 11. Navigasi antar halaman (opsional) */
function goToPermohonan() {
  window.location.href = "permohonan.html";
}
function goToMonitoring() {
  window.location.href = "monitoring.html";
}

/* 12. Inisialisasi */
document.addEventListener("DOMContentLoaded", () => {
  updateLoginButton();

  // Tutup menu mobile saat link diklik
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      const nav = document.querySelector(".nav-links");
      if (nav) nav.classList.remove("open");
    });
  });

  // Smooth scroll untuk link internal (#)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      const id = this.getAttribute("href").substring(1);
      if (document.getElementById(id)) {
        e.preventDefault();
        scrollToSection(id);
        const nav = document.querySelector(".nav-links");
        if (nav) nav.classList.remove("open");
      }
    });
  });

  // Highlight menu aktif saat scroll
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });
  });

  // Login form submit
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = this.username.value.trim();
      const password = this.password.value.trim();

      // Demo login validation (replace with server-side validation)
      const DEMO_USER = "jaksa";
      const DEMO_PASS = "muna2026";

      if (username === DEMO_USER && password === DEMO_PASS) {
        sessionStorage.setItem("isJaksaLoggedIn", "true");
        alert("Login berhasil. Selamat datang, Jaksa.");
        closeLogin();
        unlockJaksaData();
        updateLoginButton();
      } else {
        alert("Username atau password salah.");
      }
    });
  }

  // Form permohonan submit
  const formPermohonan = document.getElementById("formPermohonan");
  if (formPermohonan) {
    formPermohonan.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector(".btn-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim...";

      try {
        const formData = new FormData(this);
        const data = {};

        // Ambil data form
        ["nomor_lp", "nomor_spdp", "nama_tersangka", "pasal", "jaksa_peneliti",
         "jenis_koordinasi", "urgensi", "kronologi", "cara_koordinasi", "nomor_hp"]
          .forEach(key => { data[key] = formData.get(key) || ""; });

        data["permasalahan"] = formData.getAll("permasalahan[]").filter(v => v.trim() !== "").join(" | ");
        data["sudah_dilakukan"] = formData.getAll("sudah_dilakukan[]").join(", ");
        data["dimohon"] = formData.getAll("dimohon[]").join(", ");
        data["dokumen"] = formData.getAll("dokumen[]").join(", ");

        // Validasi form
        if (!validateForm(data)) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim Permohonan";
          return;
        }

        // Generate ID permohonan dan timestamp
        data["id_permohonan"] = "PK-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-5);
        data["timestamp"] = new Date().toLocaleString("id-ID");
        data["status"] = "Menunggu";
        data["catatan_jaksa"] = "";

        // Kirim ke Google Apps Script Web App
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        alert("Permohonan berhasil dikirim!\nID Anda: " + data["id_permohonan"]);
        this.reset();

        // Reset poin permasalahan ke satu baris
        const wrap = document.getElementById("permasalahanWrap");
        if (wrap) {
          wrap.innerHTML =
            '<div class="poin-row">' +
            '<input type="text" name="permasalahan[]" placeholder="1. Tuliskan permasalahan...">' +
            '<button type="button" class="btn-remove" onclick="removePoin(this)">&times;</button>' +
            '</div>';
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat mengirim. Silakan coba lagi.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Permohonan";
      }
    });
  }

  // Particles.js inisialisasi (opsional)
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: { value: 45, density: { enable: true, value_area: 900 } },
        color: { value: ["#c9a24b", "#7b1113"] },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3.5, random: true },
        line_linked: {
          enable: true, distance: 150,
          color: "#c9a24b", opacity: 0.35, width: 1
        },
        move: { enable: true, speed: 1.8, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 160, line_linked: { opacity: 0.6 } },
          push: { particles_nb: 3 }
        }
      },
      retina_detect: true
    });
  }
});
