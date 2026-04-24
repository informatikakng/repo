const apiURL = "https://script.google.com/macros/s/AKfycbx7ImRaOvd0litVRr3b6YO3HCtft6etJnyuXm7EPURKn-4A1uhDUbP0_ccEIS01QdiTcA/exec";

// 🔑 KEY CACHE
const CACHE_KEY = "mgmp_data";
const CACHE_TIME_KEY = "mgmp_time";
const MAX_AGE = 1000 * 60 * 10; // 10 menit

// ambil ID dari URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const container = document.getElementById("detail-container");

// tampilkan loading
container.innerHTML = "<p>⏳ Memuat data...</p>";

// ============================
// 🔥 FUNGSI UTAMA
// ============================

init();

function init() {
  const cached = localStorage.getItem(CACHE_KEY);
  const lastUpdate = localStorage.getItem(CACHE_TIME_KEY);
  const now = Date.now();

  // ✅ 1. kalau ada cache → langsung tampil
  if (cached) {
    const data = JSON.parse(cached);
    renderFromData(data);
  }

  // ✅ 2. cek apakah perlu refresh data
  if (!lastUpdate || now - lastUpdate > MAX_AGE) {
    fetchData();
  }
}

// ============================
// 🔄 FETCH DATA BARU
// ============================

function fetchData() {
  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      // simpan ke cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now());

      console.log("🌐 Data diperbarui dari API");

      renderFromData(data);
    })
    .catch(err => {
      console.error("Gagal fetch:", err);
      if (!localStorage.getItem(CACHE_KEY)) {
        container.innerHTML = "<p>❌ Gagal memuat data</p>";
      }
    });
}

// ============================
// 📄 RENDER DATA
// ============================

function renderFromData(data) {
  const item = data[id];

  if (!item) {
    container.innerHTML = "<p>Data tidak ditemukan</p>";
    return;
  }

  renderDetail(item);
}

function renderDetail(item) {
  container.innerHTML = `
    <h2>${item.judul}</h2>

    <p><b>Materi:</b> ${item.materi}</p>
    <p><b>Kelas:</b> ${item.kelas}</p>
    <p><b>Jenis:</b> ${item.jenis}</p>

    <p><b>Guru:</b> ${item.nama}</p>
    <p><b>Sekolah:</b> ${item.sekolah}</p>

    <hr>

    <p>${formatText(item.deskripsi)}</p>

    <a href="${item.link}" target="_blank" class="btn">📥 Download File</a>

    <div class="preview">
      ${getPreview(item.link)}
    </div>
  `;
}

// ============================
// 🔧 HELPER
// ============================

// format enter (\n jadi <br>)
function formatText(text) {
  if (!text) return "";
  return text.replace(/\n/g, "<br>");
}

// preview file drive
function getPreview(link) {
  if (!link) return "<p>Tidak ada file</p>";

  if (link.includes("drive.google.com")) {
    let previewLink = link.replace("/view", "/preview");
    return `<iframe src="${previewLink}"></iframe>`;
  }

  return `<p>Preview tidak tersedia</p>`;
}