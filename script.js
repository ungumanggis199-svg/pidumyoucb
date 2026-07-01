/* ============================================================
   SIKORDA - Kejaksaan Negeri Muna
   script.js - Logika interaksi tampilan awal
   ============================================================ */

/* ---- KONFIGURASI ---- */
// Ganti dengan URL Web App Google Apps Script Anda (deploy sebagai Web App)
const GOOGLE_SCRIPT_URL = "GANTI_DENGAN_URL_APPS_SCRIPT_ANDA";

// Status login jaksa (sederhana, untuk tahap awal)
let isJaksaLoggedIn = false;

/* ============================================================
   1. NAVBAR MOBILE (BURGER MENU)
   ============================================================ */
function toggleMenu() {
  const nav = document.querySelector(".nav-links");
  if (nav) nav.classList.toggle("open");
}

/* ============================================================
   2. MODAL LOGIN JAKSA
   ============================================================ */
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

// Ubah tombol login menjadi logout setelah masuk
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
  isJaksaLoggedIn = false;
  lockJaksaData();
  updateLoginButton();
  alert("Anda telah logout.");
}

/* ============================================================
   3. PROTEKSI DATA (BLUR NAMA TERSANGKA & DETAIL)
   ============================================================ */
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

// Klik "Lihat" detail: wajib login dulu
function requireLogin() {
  if (isJaksaLoggedIn) {
    alert("Membuka detail permohonan...");
    // Di tahap lanjut: tampilkan modal detail lengkap dari data Google Sheet
  } else {
    alert("Silakan login sebagai Jaksa untuk melihat detail permohonan.");
    openLogin();
  }
}

/* ============================================================
   4. FORM - TAMBAH / HAPUS POIN PERMASALAHAN (Bagian D)
   ============================================================ */
function addPoin() {
  const wrap = document.getElementById("permasalahanWrap");
  if (!wrap) return;
  const count = wrap.querySelectorAll(".poin-row").length + 1;
  const row = document.createElement("div");
  row.className = "poin-row";
  row.innerHTML =
    '<input type="text" name="permasalahan[]" placeholder="' + count + '. Tuliskan permasalahan...">' +
    '<button type="button" class="btn-remove" onclick="removePoin(this)">&times;</button>';
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
    inp.placeholder = (i + 1) + ". Tuliskan permasalahan...";
  });
}

/* ============================================================
   5. VALIDASI UKURAN FILE UPLOAD (maks 10MB - Bagian H)
   ============================================================ */
function checkFileSize(input) {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (input.files.length > 0) {
    if (input.files[0].size > maxSize) {
      alert("Ukuran file melebihi 10MB. Silakan unggah file yang lebih kecil.");
      input.value = "";
    }
  }
}

/* ============================================================
   6. SEARCH / FILTER TABEL MONITORING
   ============================================================ */
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

/* ============================================================
   7. NAVIGASI SMOOTH SCROLL (kompensasi tinggi navbar sticky)
   ============================================================ */
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    const navbar = document.querySelector(".navbar");
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
    window.scrollTo({ top: top, behavior: "smooth" });
  }
}

/* ============================================================
   8. INISIALISASI (dijalankan setelah DOM siap)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  // --- 8.1 Tombol login awal ---
  updateLoginButton();

  // --- 8.2 Tutup menu mobile saat link diklik ---
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      const nav = document.querySelector(".nav-links");
      if (nav) nav.classList.remove("open");
    });
  });

  // --- 8.3 Smooth scroll untuk semua link internal (#) ---
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

  // --- 8.4 Highlight menu aktif saat scroll ---
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      const link = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });
  });

  // --- 8.5 Proses LOGIN JAKSA ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = this.username.value.trim();
      const password = this.password.value.trim();

      /* CATATAN KEAMANAN:
         Validasi di bawah hanya contoh untuk tampilan awal.
         Pada tahap produksi, verifikasi HARUS dilakukan di sisi server
         (mis. melalui Google Apps Script / backend), bukan di sisi klien. */
      const DEMO_USER = "jaksa";
      const DEMO_PASS = "muna2026";

      if (username === DEMO_USER && password === DEMO_PASS) {
        isJaksaLoggedIn = true;
        alert("Login berhasil. Selamat datang, Jaksa.");
        closeLogin();
        unlockJaksaData();
        updateLoginButton();
      } else {
        alert("Username atau password salah.");
      }
    });
  }

  // --- 8.6 SUBMIT FORM PERMOHONAN ke Google Sheet ---
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

        // Field teks & radio tunggal
        ["nomor_lp", "nomor_spdp", "nama_tersangka", "pasal", "jaksa_peneliti",
         "jenis_koordinasi", "urgensi", "kronologi", "cara_koordinasi", "nomor_hp"]
          .forEach(key => { data[key] = formData.get(key) || ""; });

        // Field multi-value (checkbox & poin)
        data["permasalahan"] = formData.getAll("permasalahan[]").filter(v => v.trim() !== "").join(" | ");
        data["sudah_dilakukan"] = formData.getAll("sudah_dilakukan[]").join(", ");
        data["dimohon"] = formData.getAll("dimohon[]").join(", ");
        data["dokumen"] = formData.getAll("dokumen[]").join(", ");

        // Generate ID permohonan sederhana + timestamp
        data["id_permohonan"] = "PK-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-5);
        data["timestamp"] = new Date().toLocaleString("id-ID");
        data["status"] = "Menunggu";
        data["catatan_jaksa"] = "";

        // Validasi minimal
        if (!data["nama_tersangka"] || !data["nomor_hp"]) {
          alert("Mohon lengkapi minimal Nama Tersangka dan Nomor HP Penyidik.");
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim Permohonan";
          return;
        }

        // Kirim ke Google Apps Script (Web App)
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        alert("Permohonan berhasil dikirim!\nID Anda: " + data["id_permohonan"]);
        this.reset();

        // Reset poin permasalahan kembali ke satu baris
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

  // --- 8.7 PARTIKEL INTERAKTIF (particles.js) - opsional ---
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

  console.log("SIKORDA - Kejaksaan Negeri Muna berhasil dimuat.");
});
/* ============================================================
   NAVIGASI ANTAR HALAMAN
   ============================================================ */
function goToPermohonan() {
  window.location.href = "permohonan.html";
}
function goToMonitoring() {
  window.location.href = "monitoring.html";
}
document.addEventListener("click", function (e) {
  const modal = document.getElementById("loginModal");
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});
