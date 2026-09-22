// ============================================================================
// keranjang-stepper.js — KHUSUS HALAMAN PEMBELI. Mengganti teks statis "x1" di
// tiap baris keranjang jadi tombol stepper (− dan +), sama seperti di kasir.
// Menekan − sampai 0 langsung menghapus barisnya (disamakan dengan kasir),
// bukan dibiarkan di angka 0.
//
// Keranjang pembeli hanya dipakai untuk menyusun pesan WhatsApp, jadi TIDAK
// ada pengecekan batas stok di sini (beda dengan kasir) — pembeli bebas
// menambah jumlah, dan stok sebenarnya baru dicek nanti pas barang diambil.
//
// Tombol stepper memakai kelas .qty-ctl yang sudah ada di style pembeli
// (dipakai juga di jendela detail produk), jadi tampilannya otomatis serasi
// tanpa CSS tambahan.
//
// File ini harus dimuat SETELAH script utama di index.html, karena memakai
// fungsi dan variabel di dalamnya (keranjang, renderKeranjang, hapusItem).
// ============================================================================
(function () {
  function ubahJumlah(id, delta) {
    const item = keranjang[id];
    if (!item) return;
    const baru = item.jumlah + delta;
    if (baru <= 0) {
      delete keranjang[id];
    } else {
      item.jumlah = baru;
    }
    renderKeranjang();
  }
  window.ubahJumlahKeranjangPembeli = ubahJumlah; // dipakai oleh onclick di bawah

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
      stepper.className = 'qty-ctl';
      stepper.innerHTML =
        '<button type="button" aria-label="Kurangi jumlah">\u2212</button>' +
        '<span>' + lamaJml.textContent.replace(/^x/, '') + '</span>' +
        '<button type="button" aria-label="Tambah jumlah">+</button>';

      const tombolKurang = stepper.children[0];
      const tombolTambah = stepper.children[2];
      tombolKurang.addEventListener('click', function () { ubahJumlah(id, -1); });
      tombolTambah.addEventListener('click', function () { ubahJumlah(id, 1); });

      lamaJml.replaceWith(stepper);
    });
  }

  const renderKeranjangAsli = window.renderKeranjang;
  window.renderKeranjang = function () {
    renderKeranjangAsli.apply(this, arguments);
    pasangStepper();
  };
})();