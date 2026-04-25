const apiURL = "https://script.google.com/macros/s/AKfycbx7ImRaOvd0litVRr3b6YO3HCtft6etJnyuXm7EPURKn-4A1uhDUbP0_ccEIS01QdiTcA/exec";

const CACHE_KEY = "mgmp_data";

let allData = [];
let filteredData = [];

// 🔥 PAGINATION
let currentPage = 1;
const perPage = 12;

const container = document.getElementById("data-container");

showLoading();

// ============================
// 🔥 LOAD CACHE DULU
// ============================

const cached = localStorage.getItem(CACHE_KEY);

if (cached) {
  allData = JSON.parse(cached);
  filteredData = allData;
  renderData(filteredData);
  console.log("⚡ Load dari cache");
}

// ============================
// 🌐 FETCH DATA BARU
// ============================

fetch(apiURL)
  .then(res => res.json())
  .then(data => {
    allData = data;
    filteredData = allData;

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));

    renderData(filteredData);
    console.log("🌐 Load dari API");
  })
  .catch(() => {
    if (!cached) showEmpty("Gagal memuat data");
  });

// ============================
// 📄 RENDER DATA (PAGINATION)
// ============================

function renderData(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    showEmpty("Belum ada data");
    return;
  }

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageData = data.slice(start, end);

  pageData.forEach((item, index) => {
    if (!item.judul) return;

    const realIndex = start + index;

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

        <a href="detail.html?id=${realIndex}" class="btn">🔍 Lihat Detail</a>
      </div>
    `;
  });

  renderPagination(data.length);
}

// ============================
// 🔘 PAGINATION UI
// ============================

function renderPagination(total) {
  const totalPages = Math.ceil(total / perPage);
  const maxVisible = 5; // jumlah angka tengah

  let html = `<div class="pagination">`;

  // tombol prev
  html += `<button onclick="prevPage()">◀</button>`;

  // halaman pertama
  if (currentPage > 3) {
    html += `<button onclick="goPage(1)">1</button>`;
    html += `<span>...</span>`;
  }

  // range tengah
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }

  // halaman terakhir
  if (currentPage < totalPages - 2) {
    html += `<span>...</span>`;
    html += `<button onclick="goPage(${totalPages})">${totalPages}</button>`;
  }

  // tombol next
  html += `<button onclick="nextPage(${totalPages})">▶</button>`;

  html += `</div>`;

  document.getElementById("pagination-container").innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  renderData(filteredData);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderData(filteredData);
  }
}

function nextPage(totalPages) {
  if (currentPage < totalPages) {
    currentPage++;
    renderData(filteredData);
  }
}

// ============================
// 🔍 FILTER
// ============================

document.getElementById("search").addEventListener("input", filterData);
document.getElementById("jenis").addEventListener("change", filterData);
document.getElementById("kelas").addEventListener("change", filterData);

function filterData() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const jenis = document.getElementById("jenis").value;
  const kelas = document.getElementById("kelas").value;

  filteredData = allData.filter(item => {
    return (
      (item.judul || "").toLowerCase().includes(keyword) &&
      (jenis === "" || item.jenis === jenis) &&
      (kelas === "" || item.kelas === kelas)
    );
  });

  currentPage = 1; // reset ke halaman pertama
  renderData(filteredData);
}

// ============================
// 🔧 HELPER
// ============================

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
