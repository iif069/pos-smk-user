// ============================================================================
// keranjang-stepper.js — KHUSUS HALAMAN PEMBELI. Mengganti teks statis "x1" di
// tiap baris keranjang jadi tombol stepper (− dan +), disamakan ukurannya
// dengan stepper di keranjang kasir (kecil dan ramping, bukan sebesar stepper
// di jendela detail produk).
//
// Menekan − saat jumlahnya tinggal 1 akan menghapus barisnya — kalau
// konfirmasi-hapus.js juga dipasang di halaman ini, akan muncul dulu kotak
// "Apakah Anda yakin untuk menghapus?"; kalau tidak, langsung terhapus.
//
// Keranjang pembeli hanya dipakai untuk menyusun pesan WhatsApp, jadi TIDAK
// ada pengecekan batas stok di sini (beda dengan kasir) — pembeli bebas
// menambah jumlah, dan stok sebenarnya baru dicek nanti pas barang diambil.
//
// File ini harus dimuat SETELAH script utama di index.html, karena memakai
// fungsi dan variabel di dalamnya (keranjang, renderKeranjang).
// ============================================================================
(function () {
  // Ukuran & warna disamakan persis dengan .jml-ctl di kasir, supaya stepper
  // di baris keranjang tidak sebesar stepper di jendela detail produk (.qty-ctl).
  const css = [
    '.jml-ctl { display:flex; align-items:center; gap:4px; border:1px solid var(--line); border-radius:6px; padding:1px 4px; }',
    '.jml-ctl button { width:26px; height:26px; border:none; background:none; font-size:14px; cursor:pointer; color:var(--ink); font-family:inherit; }',
    '.jml-ctl span { min-width:14px; text-align:center; font-size:13px; }'
  ].join('\n');
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function hapusSekarang(id) {
    delete keranjang[id];
    renderKeranjang();
  }

  function ubahJumlah(id, delta) {
    const item = keranjang[id];
    if (!item) return;
    const baru = item.jumlah + delta;
    if (baru > 0) {
      item.jumlah = baru;
      renderKeranjang();
      return;
    }
    // Jumlah jadi 0: konfirmasi dulu kalau konfirmasi-hapus.js terpasang,
    // kalau tidak, hapus langsung (tetap aman dipakai sendirian).
    if (typeof window.tampilKonfirmasiHapus === 'function') {
      window.tampilKonfirmasiHapus(function () { hapusSekarang(id); });
    } else {
      hapusSekarang(id);
    }
  }

  function pasangStepper() {
    document.querySelectorAll('#daftar-keranjang .baris-item').forEach(function (baris) {
      const lamaJml = baris.querySelector('.jml');
      if (!lamaJml) return; // sudah diganti, atau strukturnya beda dari yang diharapkan

      const tombolHapus = baris.querySelector('.hapus');
      const id = tombolHapus && tombolHapus.getAttribute('onclick')
        ? (tombolHapus.getAttribute('onclick').match(/'([^']+)'/) || [])[1]
        : null;
      if (!id) return;

      const stepper = document.createElement('div');
      stepper.className = 'jml-ctl';
      stepper.innerHTML =
        '<button type="button" aria-label="Kurangi jumlah">\u2212</button>' +
        '<span>' + lamaJml.textContent.replace(/^x/, '') + '</span>' +
        '<button type="button" aria-label="Tambah jumlah">+</button>';

      stepper.children[0].addEventListener('click', function () { ubahJumlah(id, -1); });
      stepper.children[2].addEventListener('click', function () { ubahJumlah(id, 1); });

      lamaJml.replaceWith(stepper);
    });
  }

  const renderKeranjangAsli = window.renderKeranjang;
  window.renderKeranjang = function () {
    renderKeranjangAsli.apply(this, arguments);
    pasangStepper();
  };
})();