/**
 * Website Kelurahan Wakangka
 * Script Utama: Navigasi, Google Sheets CSV, Galeri, dll.
 *
 * Cara mengubah sumber data Google Sheets:
 * 1. Buka Google Sheets Anda
 * 2. Klik File → Share → Publish to Web
 * 3. Pilih sheet yang diinginkan, format: CSV
 * 4. Klik Publish dan salin URL-nya
 * 5. Tempel URL tersebut pada variabel CONFIG di bawah
 */

// =============================================
// KONFIGURASI - UBAH URL SESUAI GOOGLE SHEETS
// =============================================
const CONFIG = {
  // Ganti URL berikut dengan URL CSV Google Sheets Anda
  // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID
  BERITA_URL: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/export?format=csv&gid=0",
  PENGUMUMAN_URL: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/export?format=csv&gid=1",
  LAYANAN_URL: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/export?format=csv&gid=2",

  // Timeout fetch dalam milidetik
  FETCH_TIMEOUT: 8000,
};

// =============================================
// INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSmoothScroll();
  initHamburger();
  initAOS();
  initTabs();
  initGallery();
  loadBerita();
  loadPengumuman();
  loadLayanan();
  initActiveNavLink();
  initScrollToTop();
});

// =============================================
// NAVBAR
// =============================================
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function initActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${entry.target.id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

// =============================================
// HAMBURGER MENU
// =============================================
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
  });

  // Tutup menu saat klik link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
    });
  });
}

// =============================================
// SMOOTH SCROLL
// =============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        const offset = 70; // tinggi navbar
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

// =============================================
// AOS ANIMATE
// =============================================
function initAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }
}

// =============================================
// TAB BERITA / PENGUMUMAN
// =============================================
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetEl = document.getElementById(`tab-${target}`);
      if (targetEl) targetEl.classList.add("active");
    });
  });
}

// =============================================
// FETCH HELPER
// =============================================
async function fetchCSV(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (err) => reject(err),
      });
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// =============================================
// LOAD BERITA
// =============================================
async function loadBerita() {
  const container = document.getElementById("berita-container");
  if (!container) return;

  container.innerHTML = renderSpinner("Memuat berita terbaru...");

  try {
    const data = await fetchCSV(CONFIG.BERITA_URL);

    if (!data || data.length === 0) {
      container.innerHTML = renderEmpty("Belum ada berita yang dipublikasikan.");
      return;
    }

    container.innerHTML = `<div class="grid-3">${data
      .slice(0, 6)
      .map((item) => renderNewsCard(item))
      .join("")}</div>`;
  } catch (err) {
    console.warn("Gagal memuat berita dari Google Sheets:", err.message);
    container.innerHTML = renderBeritaFallback();
  }
}

function renderNewsCard(item) {
  const judul = item.judul || item.Judul || "Tanpa Judul";
  const tanggal = item.tanggal || item.Tanggal || "-";
  const kategori = item.kategori || item.Kategori || "Berita";
  const ringkasan = item.ringkasan || item.Ringkasan || item.isi || item.Isi || "Klik untuk membaca selengkapnya.";
  const link = item.link || item.Link || "#";

  return `
    <div class="news-card" data-aos="fade-up">
      <div class="news-card-img">
        <i class="fas fa-newspaper"></i>
      </div>
      <div class="news-card-body">
        <div class="news-meta">
          <span class="news-badge">${escapeHtml(kategori)}</span>
          <span><i class="fas fa-calendar-alt"></i> ${escapeHtml(tanggal)}</span>
        </div>
        <h4>${escapeHtml(judul)}</h4>
        <p>${escapeHtml(ringkasan.substring(0, 120))}${ringkasan.length > 120 ? "..." : ""}</p>
        <a href="${link}" class="btn-read" target="_blank" rel="noopener">
          Baca Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>`;
}

function renderBeritaFallback() {
  const beritaContoh = [
    {
      judul: "Rapat Koordinasi Pengembangan Wilayah Kelurahan Wakangka",
      tanggal: "Oktober 2025",
      kategori: "Pemerintahan",
      ringkasan: "Pemerintah Kelurahan Wakangka mengadakan rapat koordinasi untuk membahas program pengembangan wilayah dan infrastruktur tahun 2025.",
    },
    {
      judul: "Kegiatan Gotong Royong Bersama Warga Wakangka",
      tanggal: "Oktober 2025",
      kategori: "Sosial",
      ringkasan: "Seluruh lapisan masyarakat Kelurahan Wakangka bersatu dalam kegiatan gotong royong membersihkan lingkungan dan fasilitas umum.",
    },
    {
      judul: "Potensi Ekowisata Hutan Lambusango Semakin Dikenal",
      tanggal: "September 2025",
      kategori: "Wisata",
      ringkasan: "Kawasan Hutan Lambusango yang berbatasan dengan Kelurahan Wakangka semakin dikenal sebagai destinasi ekowisata unggulan di Kabupaten Buton.",
    },
  ];

  return `
    <div class="error-notice">
      <i class="fas fa-info-circle"></i>
      Menampilkan data contoh. Hubungkan Google Sheets untuk data terkini.
    </div>
    <div class="grid-3">
      ${beritaContoh.map((item) => renderNewsCard({ ...item, link: "#" })).join("")}
    </div>`;
}

// =============================================
// LOAD PENGUMUMAN
// =============================================
async function loadPengumuman() {
  const container = document.getElementById("pengumuman-container");
  if (!container) return;

  container.innerHTML = renderSpinner("Memuat pengumuman...");

  try {
    const data = await fetchCSV(CONFIG.PENGUMUMAN_URL);

    if (!data || data.length === 0) {
      container.innerHTML = renderEmpty("Belum ada pengumuman saat ini.");
      return;
    }

    container.innerHTML = data
      .slice(0, 8)
      .map((item) => renderPengumumanItem(item))
      .join("");
  } catch (err) {
    console.warn("Gagal memuat pengumuman:", err.message);
    container.innerHTML = renderPengumumanFallback();
  }
}

function renderPengumumanItem(item) {
  const judul = item.judul || item.Judul || "Tanpa Judul";
  const tanggal = item.tanggal || item.Tanggal || "-";
  const isi = item.isi || item.Isi || item.ringkasan || item.Ringkasan || "";
  const penting = (item.penting || item.Penting || "").toLowerCase() === "ya";

  return `
    <div class="pengumuman-item ${penting ? "penting" : ""}">
      <div class="pengumuman-icon">
        <i class="fas ${penting ? "fa-exclamation-circle" : "fa-bullhorn"}"></i>
      </div>
      <div class="pengumuman-body">
        <div class="pengumuman-meta">
          <span><i class="fas fa-calendar-alt"></i> ${escapeHtml(tanggal)}</span>
          ${penting ? '<span class="badge-penting">PENTING</span>' : ""}
        </div>
        <h4>${escapeHtml(judul)}</h4>
        ${isi ? `<p>${escapeHtml(isi)}</p>` : ""}
      </div>
    </div>`;
}

function renderPengumumanFallback() {
  const contoh = [
    { judul: "Jadwal Pelayanan Administrasi Kelurahan Wakangka", tanggal: "Oktober 2025", isi: "Pelayanan administrasi dibuka setiap hari Senin–Jumat pukul 08.00–15.00 WITA.", penting: "ya" },
    { judul: "Imbauan Menjaga Kebersihan Lingkungan", tanggal: "Oktober 2025", isi: "Seluruh warga diimbau untuk menjaga kebersihan dan tidak membuang sampah sembarangan.", penting: "tidak" },
    { judul: "Pendaftaran Program Bantuan Sosial Tahap II", tanggal: "September 2025", isi: "Pendaftaran program bantuan sosial tahap II dibuka hingga akhir bulan. Hubungi kantor kelurahan untuk informasi lebih lanjut.", penting: "ya" },
  ];

  return `
    <div class="error-notice">
      <i class="fas fa-info-circle"></i>
      Menampilkan data contoh. Hubungkan Google Sheets untuk data terkini.
    </div>
    ${contoh.map((item) => renderPengumumanItem(item)).join("")}`;
}

// =============================================
// LOAD LAYANAN
// =============================================
async function loadLayanan() {
  const container = document.getElementById("layanan-container");
  if (!container) return;

  container.innerHTML = renderSpinner("Memuat daftar layanan...");

  try {
    const data = await fetchCSV(CONFIG.LAYANAN_URL);

    if (!data || data.length === 0) {
      container.innerHTML = renderLayananFallback();
      return;
    }

    container.innerHTML = `<div class="grid-4">${data
      .map((item) => renderLayananCard(item))
      .join("")}</div>`;
  } catch (err) {
    console.warn("Gagal memuat layanan:", err.message);
    container.innerHTML = renderLayananFallback();
  }
}

function renderLayananCard(item) {
  const nama = item.nama || item.Nama || item.layanan || item.Layanan || "Layanan";
  const persyaratan = item.persyaratan || item.Persyaratan || "-";
  const waktu = item.waktu || item.Waktu || item.estimasi || item.Estimasi || "1-3 hari kerja";
  const ikon = item.ikon || item.Ikon || "📄";
  const deskripsi = item.deskripsi || item.Deskripsi || "";

  return `
    <div class="layanan-card" data-aos="fade-up">
      <div class="layanan-icon">${escapeHtml(ikon)}</div>
      <h4>${escapeHtml(nama)}</h4>
      ${deskripsi ? `<p class="layanan-desc">${escapeHtml(deskripsi)}</p>` : ""}
      <div class="layanan-requirements">
        <strong>Persyaratan:</strong>
        <p>${escapeHtml(persyaratan)}</p>
      </div>
      <div class="layanan-footer">
        <span class="duration"><i class="fas fa-clock"></i> ${escapeHtml(waktu)}</span>
      </div>
    </div>`;
}

function renderLayananFallback() {
  const layanan = [
    { ikon: "📋", nama: "Surat Keterangan Domisili", persyaratan: "KTP, KK, Surat Pengantar RT/RW", waktu: "1 hari kerja", deskripsi: "Surat keterangan tempat tinggal resmi warga kelurahan." },
    { ikon: "📝", nama: "Surat Pengantar KTP/KK", persyaratan: "KK lama, Surat Pengantar RT/RW, Fotokopi KTP", waktu: "1 hari kerja", deskripsi: "Pengantar untuk pengurusan KTP dan Kartu Keluarga baru." },
    { ikon: "💼", nama: "Surat Keterangan Usaha", persyaratan: "KTP, KK, Foto usaha", waktu: "1-2 hari kerja", deskripsi: "Keterangan resmi bagi warga yang memiliki usaha di wilayah kelurahan." },
    { ikon: "🏠", nama: "Surat Keterangan Tidak Mampu", persyaratan: "KTP, KK, Surat Pengantar RT/RW", waktu: "1-2 hari kerja", deskripsi: "Untuk keperluan beasiswa, biaya kesehatan, dan bantuan sosial lainnya." },
    { ikon: "👶", nama: "Surat Keterangan Kelahiran", persyaratan: "KTP Orang Tua, KK, Surat Keterangan Lahir dari RS/Bidan", waktu: "1 hari kerja", deskripsi: "Pengantar untuk pembuatan akta kelahiran anak." },
    { ikon: "⚰️", nama: "Surat Keterangan Kematian", persyaratan: "KTP Almarhum, KK, Surat dari RT/RW", waktu: "1 hari kerja", deskripsi: "Dokumen resmi pencatatan kematian warga kelurahan." },
    { ikon: "🎓", nama: "Surat Keterangan untuk Beasiswa", persyaratan: "KTP, KK, Surat SKTM, Bukti Pendaftaran", waktu: "1-2 hari kerja", deskripsi: "Mendukung pengajuan beasiswa bagi warga berprestasi." },
    { ikon: "🔗", nama: "Legalisir Dokumen", persyaratan: "Dokumen asli + Fotokopi, KTP", waktu: "1 hari kerja", deskripsi: "Legalisir surat dan dokumen yang diterbitkan oleh kelurahan." },
  ];

  return `
    <div class="error-notice">
      <i class="fas fa-info-circle"></i>
      Menampilkan layanan standar. Hubungkan Google Sheets untuk data terkini.
    </div>
    <div class="grid-4">
      ${layanan.map((item) => renderLayananCard(item)).join("")}
    </div>`;
}

// =============================================
// GALERI LIGHTBOX
// =============================================
function initGallery() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxCaption = document.getElementById("lightbox-caption");

  if (!lightbox) return;

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const caption = item.querySelector(".gallery-caption");
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (lightboxCaption && caption) {
          lightboxCaption.textContent = caption.textContent;
        }
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

// =============================================
// SCROLL TO TOP
// =============================================
function initScrollToTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =============================================
// HELPERS
// =============================================
function renderSpinner(text = "Memuat data...") {
  return `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${text}</p>
    </div>`;
}

function renderEmpty(text = "Tidak ada data.") {
  return `
    <div class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>${text}</p>
    </div>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =============================================
// KONTAK - FORM KE WHATSAPP
// =============================================
const kontakForm = document.getElementById("kontak-form");
if (kontakForm) {
  kontakForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("nama")?.value || "";
    const pesan = document.getElementById("pesan")?.value || "";
    const nomor = "628xxxxxxxxxx"; // Ganti dengan nomor WA Kelurahan

    const text = encodeURIComponent(
      `*Pesan dari Website Kelurahan Wakangka*\n\nNama: ${nama}\nPesan: ${pesan}`
    );
    window.open(`https://wa.me/${nomor}?text=${text}`, "_blank");
  });
}
