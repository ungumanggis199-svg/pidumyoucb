/* ============================================================
   SIKORDA - Kejaksaan Negeri Muna
   script.js - Logika interaksi tampilan awal
   ============================================================ */

// Ganti dengan URL Web App Google Apps Script Anda (deploy sebagai Web App)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZhzBasdie7UqEmTrLucc4NrwkHexypNxwW4To4yUYGOOov51vkqenUSGlsiMUZgIK/exec";

// Status login jaksa (disimpan di sessionStorage)
let isJaksaLoggedIn = sessionStorage.getItem("isJaksaLoggedIn") === "true";

/* 1. Toggle menu burger (mobile) */
function toggleMenu() {
  const nav = document.querySelector(".nav-links");
  const burger = document.querySelector(".burger");

  if (!nav) return;

  nav.classList.toggle("open");

  if (burger) {
    const isOpen = nav.classList.contains("open");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
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
  const errorList = [];

  function addError(name, message) {
    isValid = false;
    errorList.push(message);

    const input = document.querySelector(`[name="${name}"]`);
    if (input) {
      const fieldset = input.closest("fieldset");
      const target = fieldset || input.parentElement;

      const errorEl = document.createElement("small");
      errorEl.textContent = message;
      errorEl.style.color = "#ff6b6b";
      errorEl.style.display = "block";
      errorEl.style.marginTop = "8px";
      errorEl.classList.add("error-msg");

      target.appendChild(errorEl);
    }
  }
   if (!data.nama_penyidik) addError("nama_penyidik", "Nama Penyidik wajib diisi.");
   if (!data.nama_satuan) addError("nama_satuan", "Nama Satuan wajib diisi.");
  if (!data.nomor_lp) addError("nomor_lp", "Nomor Laporan Polisi wajib diisi.");
  if (!data.nomor_spdp) addError("nomor_spdp", "Nomor SPDP wajib diisi.");
  if (!data.nama_tersangka) addError("nama_tersangka", "Nama Tersangka wajib diisi.");
  if (!data.pasal) addError("pasal", "Pasal yang disangkakan wajib diisi.");
  if (!data.jaksa_peneliti) addError("jaksa_peneliti", "Jaksa Peneliti wajib diisi.");

  if (!data.jenis_koordinasi) addError("jenis_koordinasi", "Jenis koordinasi wajib dipilih.");
  if (!data.urgensi) addError("urgensi", "Tingkat urgensi wajib dipilih.");
  if (!data.permasalahan) addError("permasalahan[]", "Permasalahan wajib diisi.");
  if (!data.kronologi) addError("kronologi", "Kronologi singkat wajib diisi.");
  if (!data.sudah_dilakukan) addError("sudah_dilakukan[]", "Minimal satu bagian yang sudah dilakukan wajib dipilih.");
  if (!data.dimohon) addError("dimohon[]", "Minimal satu permohonan kepada Jaksa wajib dipilih.");
  if (!data.dokumen) addError("dokumen[]", "Minimal satu dokumen pendukung wajib dipilih.");
  if (!data.cara_koordinasi) addError("cara_koordinasi", "Cara koordinasi wajib dipilih.");
  if (!data.nomor_hp) addError("nomor_hp", "Nomor HP Penyidik wajib diisi.");

  const fileInput = document.getElementById("fileUpload");
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    isValid = false;
    errorList.push("File pendukung wajib diupload.");

    const uploadBox = document.querySelector(".upload-box");
    if (uploadBox) {
      const errorEl = document.createElement("small");
      errorEl.textContent = "File pendukung wajib diupload.";
      errorEl.style.color = "#ff6b6b";
      errorEl.style.display = "block";
      errorEl.style.marginTop = "8px";
      errorEl.classList.add("error-msg");
      uploadBox.appendChild(errorEl);
    }
  }

  if (!isValid) {
    alert("Form belum lengkap. Mohon isi semua bagian terlebih dahulu.");
  }

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
  if (!input.files || input.files.length === 0) {
    return true;
  }

  const file = input.files[0];
  const maxMb = Number(input.dataset.maxMb || 10);
  const maxSize = maxMb * 1024 * 1024;

  if (file.size > maxSize) {
    alert(
      `Ukuran file "${file.name}" melebihi batas ${maxMb} MB.`
    );

    input.value = "";
    return false;
  }

  return true;
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];

      resolve({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        base64: base64
      });
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file."));
    };

    reader.readAsDataURL(file);
  });
}
function jsonpRequest(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "jsonpCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);

    const script = document.createElement("script");

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout mengambil hasil submit."));
    }, timeout);

    function cleanup() {
      clearTimeout(timer);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window[callbackName];
    }

    window[callbackName] = function (data) {
      cleanup();
      resolve(data);
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "callback=" + encodeURIComponent(callbackName);

    script.onerror = function () {
      cleanup();
      reject(new Error("Gagal mengambil hasil submit."));
    };

    document.body.appendChild(script);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitSubmitResult(clientToken) {
  for (let i = 0; i < 8; i++) {
    await delay(i === 0 ? 500 : 1000);

    const url =
      GOOGLE_SCRIPT_URL +
      "?action=submit_result&client_token=" +
      encodeURIComponent(clientToken);

    const result = await jsonpRequest(url);

    if (result.status === "success" || result.status === "error") {
      return result;
    }
  }

  return {
    status: "pending",
    message: "Data masih diproses."
  };
}

function showSuccessPage(idPermohonan, fileUrl) {
  const form = document.getElementById("formPermohonan");
  const successPage = document.getElementById("successPage");
  const successId = document.getElementById("successIdPermohonan");
  const fileLink = document.getElementById("successFileLink");

  if (successId) {
    successId.textContent = idPermohonan || "-";
  }

  if (fileLink && fileUrl) {
    fileLink.href = fileUrl;
    fileLink.hidden = false;
  }

  if (form) {
    form.style.display = "none";
  }

  if (successPage) {
    successPage.hidden = false;
    successPage.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function resetPermasalahan() {
  const wrap = document.getElementById("permasalahanWrap");

  if (wrap) {
    wrap.innerHTML =
      '<div class="poin-row">' +
      '<input type="text" name="permasalahan[]" placeholder="1. Tuliskan permasalahan...">' +
      '<button type="button" class="btn-remove" onclick="removePoin(this)">&times;</button>' +
      '</div>';
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
   loadJaksaList();
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
async function loadJaksaList() {
  const select = document.getElementById("jaksa_peneliti");
  if (!select) return;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL + "?action=list_jaksa");
    const result = await response.json();

    select.innerHTML = '<option value="">Pilih Jaksa Peneliti</option>';

    if (result.status === "success" && Array.isArray(result.data)) {
      result.data.forEach((nama) => {
        const option = document.createElement("option");
        option.value = nama;
        option.textContent = nama;
        select.appendChild(option);
      });
    }

    if (!result.data || result.data.length === 0) {
      select.innerHTML = '<option value="">Belum ada daftar jaksa</option>';
    }

  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Gagal memuat daftar jaksa</option>';
  }
}
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
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = this.username.value.trim();
    const password = this.password.value.trim();
    const submitBtn = this.querySelector(".btn-submit");

    if (!username || !password) {
      alert("Nomor NIP dan password wajib diisi.");
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Memeriksa...";
      }

      const clientToken =
        "LOGIN-" + Date.now() + "-" + Math.random().toString(36).slice(2);

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "validate_login",
          username: username,
          password: password,
          client_token: clientToken
        })
      });

      const result = await sikordaWaitResult("login_result", clientToken);

      if (result.status === "success") {
        sessionStorage.setItem("isJaksaLoggedIn", "true");
        sessionStorage.setItem("jaksaName", result.nama_jaksa || username);
        sessionStorage.setItem("jaksaUsername", username);
        sessionStorage.setItem("jaksaSessionToken", result.session_token);

        alert("Login berhasil. Selamat datang, " + (result.nama_jaksa || "Jaksa") + ".");

        closeLogin();
        unlockJaksaData();
        updateLoginButton();

        if (typeof applyNamePrivacy === "function") {
          applyNamePrivacy();
        }

        if (typeof renderMonitoringTable === "function") {
          renderMonitoringTable();
        }

      } else {
        alert(result.message || "Nomor NIP atau password salah.");
      }

    } catch (error) {
      console.error(error);
      alert("Login gagal. Silakan coba lagi.");

    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Masuk";
      }
    }
  });
}

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
  // Form permohonan submit
// Form permohonan submit
const formPermohonan = document.getElementById("formPermohonan");

if (formPermohonan) {
  formPermohonan.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector(".btn-submit");

    try {
      const formData = new FormData(this);
      const data = {};

      [
        "nama_penyidik",
        "nama_satuan",
        "nomor_lp",
        "nomor_spdp",
        "nama_tersangka",
        "pasal",
        "jaksa_peneliti",
        "jenis_koordinasi",
        "urgensi",
        "kronologi",
        "cara_koordinasi",
        "nomor_hp"
      ].forEach(key => {
        data[key] = (formData.get(key) || "").trim();
      });

      data["permasalahan"] = formData
        .getAll("permasalahan[]")
        .map(v => v.trim())
        .filter(v => v !== "")
        .join(" | ");

      data["sudah_dilakukan"] = formData.getAll("sudah_dilakukan[]").join(", ");
      data["dimohon"] = formData.getAll("dimohon[]").join(", ");
      data["dokumen"] = formData.getAll("dokumen[]").join(", ");

      if (!validateForm(data)) {
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";
      }

      const clientToken = "SIKORDA-" + Date.now() + "-" + Math.random().toString(36).slice(2);
      data["client_token"] = clientToken;

      const fileInput = document.getElementById("fileUpload");

      if (fileInput && fileInput.files.length > 0) {
        data["file_upload"] = await fileToBase64(fileInput.files[0]);
      }

      data["timestamp"] = new Date().toLocaleString("id-ID");
      data["status"] = "Menunggu";
      data["catatan_jaksa"] = "";

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      const result = await waitSubmitResult(clientToken);

      if (result.status === "success") {
        showSuccessPage(result.id_permohonan, result.file_url);
        this.reset();
        resetPermasalahan();
        clearFormErrors();
      } else {
        showSuccessPage("ID sedang diproses. Silakan cek spreadsheet atau monitoring.", "");
      }

    } catch (err) {
      console.error(err);
      showSuccessPage("Terjadi kesalahan saat mengambil ID. Silakan cek spreadsheet.", "");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Permohonan";
      }
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
function sikordaJsonpRequest(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "sikordaCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);

    const script = document.createElement("script");

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout mengambil data."));
    }, timeout);

    function cleanup() {
      clearTimeout(timer);

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      delete window[callbackName];
    }

    window[callbackName] = function (data) {
      cleanup();
      resolve(data);
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "callback=" + encodeURIComponent(callbackName);

    script.onerror = function () {
      cleanup();
      reject(new Error("Gagal mengambil data."));
    };

    document.body.appendChild(script);
  });
}

function sikordaDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sikordaWaitResult(action, clientToken) {
  for (let i = 0; i < 8; i++) {
    await sikordaDelay(i === 0 ? 500 : 1000);

    const url =
      GOOGLE_SCRIPT_URL +
      "?action=" +
      encodeURIComponent(action) +
      "&client_token=" +
      encodeURIComponent(clientToken);

    const result = await sikordaJsonpRequest(url);

    if (result.status === "success" || result.status === "error") {
      return result;
    }
  }

  return {
    status: "pending",
    message: "Data masih diproses."
  };
}
