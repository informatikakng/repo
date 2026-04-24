const apiURL = "https://script.google.com/macros/s/AKfycbx7ImRaOvd0litVRr3b6YO3HCtft6etJnyuXm7EPURKn-4A1uhDUbP0_ccEIS01QdiTcA/exec";

const CACHE_KEY = "mgmp_data";
let allData = [];

const container = document.getElementById("data-container");

showLoading();

// 🔥 CEK CACHE DULU
const cached = localStorage.getItem(CACHE_KEY);

if (cached) {
  allData = JSON.parse(cached);
  renderData(allData);
  console.log("⚡ Load dari cache");
}


// 🔄 FETCH DATA BARU
fetch(apiURL)
  .then(res => res.json())
  .then(data => {
    allData = data;

    // simpan ke cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));

    renderData(allData);
    console.log("🌐 Load dari API");
  })
  .catch(() => {
    if (!cached) showEmpty("Gagal memuat data");
  });

function renderData(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    showEmpty("Belum ada data");
    return;
  }

  data.forEach((item, index) => {
    if (!item.judul) return;

    container.innerHTML += `
      <div class="card">
        <h3>${item.judul}</h3>

        <div>
          <span class="badge">${item.jenis}</span>
          <span class="badge">Kelas ${item.kelas}</span>
        </div>

        <p class="desc">${shortText(item.deskripsi)}</p>

        <div class="meta">
          👤 ${item.nama}<br>
          🏫 ${item.sekolah}
        </div>

        <a href="detail.html?id=${index}" class="btn">🔍 Lihat Detail</a>
      </div>
    `;
  });
}

function shortText(text) {
  if (!text) return "";
  return text.length > 120 ? text.substring(0, 120) + "..." : text;
}

function showLoading() {
  container.innerHTML = `<div class="empty">⏳ Memuat data...</div>`;
}

function showEmpty(msg) {
  container.innerHTML = `<div class="empty">${msg}</div>`;
}

/* FILTER */
document.getElementById("search").addEventListener("input", filterData);
document.getElementById("jenis").addEventListener("change", filterData);
document.getElementById("kelas").addEventListener("change", filterData);

function filterData() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const jenis = document.getElementById("jenis").value;
  const kelas = document.getElementById("kelas").value;

  const filtered = allData.filter(item => {
    return (
      (item.judul || "").toLowerCase().includes(keyword) &&
      (jenis === "" || item.jenis === jenis) &&
      (kelas === "" || item.kelas === kelas)
    );
  });

  renderData(filtered);
}