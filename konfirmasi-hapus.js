// ============================================================================
// konfirmasi-hapus.js — KHUSUS PEMBELI. Menambah kotak konfirmasi "Apakah
// Anda yakin untuk menghapus?" sebelum barang benar-benar hilang dari
// keranjang, saat tombol ✕ (hapus) di baris keranjang ditekan.
//
// Untuk tombol − di stepper, konfirmasinya ditangani di keranjang-stepper.js
// (dia memanggil window.tampilKonfirmasiHapus dari file ini) — pasang
// keduanya di halaman yang sama.
//
// File ini membungkus hapusItem yang sudah ada di script utama pembeli, jadi
// harus dimuat SETELAH script utama itu.
// ============================================================================
(function () {
  const css = [
    '.overlay-konfirmasi { position:fixed; inset:0; background:rgba(20,16,10,.45); z-index:200; display:none; align-items:center; justify-content:center; padding:20px; }',
    '.overlay-konfirmasi.tampil { display:flex; }',
    '.kotak-konfirmasi { background:#fff; border-radius:14px; max-width:320px; width:100%; overflow:hidden; text-align:center; }',
    '.kotak-konfirmasi .pertanyaan { padding:26px 20px; font-size:15px; color:var(--ink); font-family:inherit; }',
    '.kotak-konfirmasi .aksi { display:flex; border-top:1px solid var(--line); }',
    '.kotak-konfirmasi .aksi button { flex:1; padding:15px; border:none; background:none; font-family:inherit; font-size:15px; font-weight:600; cursor:pointer; }',
    '.kotak-konfirmasi .aksi button.batal { color:var(--ink); border-right:1px solid var(--line); }',
    '.kotak-konfirmasi .aksi button.aksi-ya { color:var(--warn); }'
  ].join('\n');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const overlay = document.createElement('div');
  overlay.className = 'overlay-konfirmasi';
  overlay.innerHTML =
    '<div class="kotak-konfirmasi">' +
      '<div class="pertanyaan">Apakah Anda yakin untuk menghapus?</div>' +
      '<div class="aksi">' +
        '<button type="button" class="batal">Tidak</button>' +
        '<button type="button" class="aksi-ya">Ya</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  let konfirmasiAktif = null;

  function tampilKonfirmasiHapus(onYa) {
    konfirmasiAktif = onYa;
    overlay.classList.add('tampil');
  }
  window.tampilKonfirmasiHapus = tampilKonfirmasiHapus; // dipakai juga oleh keranjang-stepper.js

  function tutup() {
    overlay.classList.remove('tampil');
    konfirmasiAktif = null;
  }

  overlay.querySelector('.batal').addEventListener('click', tutup);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) tutup(); });
  overlay.querySelector('.aksi-ya').addEventListener('click', function () {
    const jalankan = konfirmasiAktif;
    tutup();
    if (jalankan) jalankan();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('tampil')) tutup();
  });

  // ---- Bungkus fungsi hapus yang sudah ada ----
  const hapusItemAsli = window.hapusItem;
  window.hapusItem = function (id) {
    tampilKonfirmasiHapus(function () { hapusItemAsli(id); });
  };
})();