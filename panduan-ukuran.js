// ============================================================================
// panduan-ukuran.js — tautan "Panduan ukuran" di samping tulisan "Ukuran" pada
// jendela detail produk kasir. Diklik, gambar panduan ukurannya terbuka besar.
//
// Gambar panduan berbeda per produk. Sumbernya sheet "Gambar": tambahkan baris
// dengan kolom
//     Nama Produk = nama persis seperti di sheet Produk (mis. Baju Praktek)
//     Varian      = Panduan Ukuran
//     Gambar      = link foto (rumus lh3 yang sama seperti foto produk)
// Produk yang belum punya baris seperti itu tidak menampilkan tautannya.
// (Batik bertahun, mis. "Baju Batik 2025", otomatis memakai panduan milik
// "Baju Batik" kalau tidak punya baris sendiri.)
//
// File ini harus dimuat SETELAH script utama di Index_Kasir.html, karena
// memakai fungsi dan variabel di dalamnya.
// ============================================================================
(function () {
  const css = [
    '.label-chip.ada-panduan { display:flex; justify-content:space-between; align-items:center; gap:8px; }',
    '.tautan-panduan { border:none; background:none; padding:4px 0; font-family:inherit; font-size:13px; font-weight:600; color:var(--accent); cursor:pointer; text-decoration:underline; text-underline-offset:2px; }',
    '.lightbox-panduan { position:fixed; inset:0; z-index:150; background:rgba(20,16,10,.6); display:none; align-items:center; justify-content:center; padding:16px; }',
    '.lightbox-panduan.tampil { display:flex; }',
    '.lightbox-kotak { background:#fff; border-radius:14px; width:100%; max-width:720px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; }',
    '.lightbox-kepala { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:12px 14px; border-bottom:1px solid var(--line); flex-shrink:0; }',
    '.lightbox-kepala span { font-size:14px; font-weight:700; }',
    '.lightbox-kepala button { width:32px; height:32px; border:none; border-radius:50%; background:#f1efe9; color:var(--ink); font-size:15px; cursor:pointer; flex-shrink:0; }',
    '.lightbox-isi { overflow:auto; padding:12px; text-align:center; }',
    '.lightbox-isi img { max-width:100%; height:auto; display:block; margin:0 auto; }',
    '.lightbox-pesan { font-size:13px; color:var(--muted); padding:24px 0; }'
  ].join('\n');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---- Jendela gambar ----
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-panduan';
  lightbox.id = 'lightbox-panduan';
  lightbox.innerHTML =
    '<div class="lightbox-kotak">' +
      '<div class="lightbox-kepala"><span id="lightbox-judul"></span>' +
        '<button type="button" id="lightbox-tutup" aria-label="Tutup">✕</button></div>' +
      '<div class="lightbox-isi" id="lightbox-isi"></div>' +
    '</div>';
  document.body.appendChild(lightbox);

  let nomorBuka = 0; // supaya gambar yang terlambat datang tidak muncul di jendela yang sudah ditutup/berganti

  function tutupPanduan() {
    nomorBuka++;
    lightbox.classList.remove('tampil');
    document.getElementById('lightbox-isi').innerHTML = '';
  }

  function bukaPanduan(url, namaProduk) {
    const nomor = ++nomorBuka;
    document.getElementById('lightbox-judul').textContent = 'Panduan ukuran · ' + namaProduk;
    const isi = document.getElementById('lightbox-isi');
    isi.innerHTML = '<div class="lightbox-pesan">Memuat gambar...</div>';
    lightbox.classList.add('tampil');

    const img = new Image();
    img.alt = 'Panduan ukuran ' + namaProduk;
    img.onload = function () {
      if (nomor !== nomorBuka) return;
      isi.innerHTML = '';
      isi.appendChild(img);
    };
    img.onerror = function () {
      if (nomor !== nomorBuka) return;
      isi.innerHTML = '<div class="lightbox-pesan">Gambar panduan belum bisa dimuat.</div>';
    };
    img.src = (typeof kecilkanGambar === 'function') ? kecilkanGambar(url, 1400) : url;
  }

  document.getElementById('lightbox-tutup').addEventListener('click', tutupPanduan);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) tutupPanduan(); // klik di luar kotak
  });
  // Esc menutup gambar dulu, bukan jendela detail produk di belakangnya
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('tampil')) {
      e.stopPropagation();
      tutupPanduan();
    }
  }, true);

  // ---- Sisipkan tautan di jendela detail produk ----
  function panduanProduk(grup) {
    const baris = grup.rows.find(function (r) { return r.PanduanUkuran; });
    return baris ? baris.PanduanUkuran : '';
  }

  function sisipkanTautan() {
    if (!modalTerbuka) return;
    const grup = grupProduk.find(function (g) { return g.key === modalTerbuka; });
    if (!grup) return;
    const url = panduanProduk(grup);
    if (!url) return;

    document.querySelectorAll('#modal-konten .label-chip').forEach(function (label) {
      if (label.textContent.trim() !== 'Ukuran') return;
      label.classList.add('ada-panduan');
      const tombol = document.createElement('button');
      tombol.type = 'button';
      tombol.className = 'tautan-panduan';
      tombol.textContent = 'Panduan ukuran';
      tombol.addEventListener('click', function () { bukaPanduan(url, grup.nama); });
      label.appendChild(tombol);
    });
  }

  // Jendela detail dibangun ulang tiap kali pilihan berubah, jadi tautannya
  // disisipkan lagi setelah setiap pembangunan ulang.
  const renderModalAsli = window.renderModal;
  window.renderModal = function () {
    renderModalAsli.apply(this, arguments);
    sisipkanTautan();
  };
})();
