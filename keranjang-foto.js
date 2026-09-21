// ============================================================================
// keranjang-foto.js — foto produk di tiap baris keranjang, seperti keranjang
// marketplace: foto di kiri, nama + varian di kanan atasnya, jumlah dan harga
// di bawahnya. Jadi lebih mudah dikenali sekilas (mis. batik motif 2024 vs 2025)
// daripada teks polos.
//
// File yang sama dipakai di halaman kasir DAN halaman pembeli. Dia tidak
// mengubah cara kerja keranjang: setelah keranjang selesai digambar seperti
// biasa, foto disisipkan ke tiap baris dan tata letaknya dirapikan lewat CSS.
// Foto yang dipakai sesuai varian yang dipilih (bukan cuma foto umum produk).
//
// File ini harus dimuat SETELAH script utama di index.html, karena memakai
// fungsi dan variabel di dalamnya.
// ============================================================================
(function () {
  const css = [
    '.baris-item.dengan-foto { display:grid; grid-template-columns:64px minmax(0,1fr) auto; grid-template-areas:"foto info hapus" "foto qty sub"; column-gap:12px; row-gap:8px; align-items:center; padding:12px 0; }',
    '.baris-item.dengan-foto .foto-keranjang { grid-area:foto; align-self:start; }',
    '.baris-item.dengan-foto .info { grid-area:info; align-self:start; min-width:0; }',
    '.baris-item.dengan-foto .jml-ctl, .baris-item.dengan-foto .jml { grid-area:qty; justify-self:start; }',
    '.baris-item.dengan-foto .subtotal { grid-area:sub; width:auto; font-weight:700; }',
    '.baris-item.dengan-foto .hapus { grid-area:hapus; align-self:start; justify-self:end; }',
    '.foto-keranjang { width:64px; height:64px; border:1px solid var(--line); border-radius:10px; background:#fff; overflow:hidden; display:flex; align-items:center; justify-content:center; }',
    '.foto-keranjang img { width:100%; height:100%; object-fit:contain; display:block; }',
    '.foto-keranjang.kosong-foto { background:#ecebe6; color:var(--muted); }',
    '.foto-keranjang svg { width:26px; height:26px; opacity:.4; }'
  ].join('\n');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function buatFoto(produk) {
    const kotak = document.createElement('div');
    kotak.className = 'foto-keranjang';

    function tampilkanKosong() {
      kotak.classList.add('kosong-foto');
      kotak.innerHTML = (typeof IKON_FOTO_KOSONG !== 'undefined') ? IKON_FOTO_KOSONG : '';
    }

    const url = produk && produk.Gambar;
    if (!url) { tampilkanKosong(); return kotak; }

    const img = document.createElement('img');
    img.alt = String(produk['Nama Produk'] || '');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = tampilkanKosong; // foto gagal dimuat: ganti placeholder, bukan ikon rusak
    img.src = (typeof kecilkanGambar === 'function') ? kecilkanGambar(url, 160) : url;
    kotak.appendChild(img);
    return kotak;
  }

  function hiasBaris() {
    const wadah = document.getElementById('daftar-keranjang');
    if (!wadah) return;
    const baris = wadah.querySelectorAll('.baris-item');
    const item = Object.values(keranjang);
    if (!baris.length || baris.length !== item.length) return; // keranjang kosong / tidak sinkron: biarkan apa adanya

    baris.forEach(function (el, i) {
      if (el.classList.contains('dengan-foto')) return;
      el.classList.add('dengan-foto');
      el.insertBefore(buatFoto(item[i].produk), el.firstChild);
    });
  }

  // Keranjang dibangun ulang tiap ada perubahan, jadi foto disisipkan lagi
  // setelah setiap pembangunan ulang.
  const renderKeranjangAsli = window.renderKeranjang;
  window.renderKeranjang = function () {
    renderKeranjangAsli.apply(this, arguments);
    hiasBaris();
  };
})();
