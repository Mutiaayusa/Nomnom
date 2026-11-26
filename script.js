/* ========================================================
   NomNom Web - Full Application Logic
   (Terhubung ke Backend PHP & Database MySQL dengan Fallback Lokal)
   ======================================================== */

// ====== 1. KONFIGURASI TOKO & API ======
const API_URL = {
  auth: 'auth.php',
  pesanan: 'pesanan.php',
  katalog: 'katalog.php',
  pengaturan: 'pengaturan.php'
};

const DEFAULT_CONFIG = {
  storeName: "NomNom",
  instagram: "nomnom.mtr",
  poClose: "Jumat, 20.00 WITA",
  pickup: "Sabtu, 10.00 - 15.00",
  poOpen: true,
  contactPhone: "081234567890",
  admin: {
    username: "admin",
    password: "admin123"
  },
  bankAccounts: [
    { bank: "BCA", number: "0561928374", holder: "NomNom Official" },
    { bank: "Mandiri", number: "1610009876543", holder: "NomNom Official" }
  ]
};

let CONFIG = { ...DEFAULT_CONFIG };
try {
  const savedCfg = localStorage.getItem("nomnom_config");
  if(savedCfg) CONFIG = { ...DEFAULT_CONFIG, ...JSON.parse(savedCfg) };
} catch(e){}

const saveConfig = () => {
  try { localStorage.setItem("nomnom_config", JSON.stringify(CONFIG)); } catch(e){}
};

// ====== 2. KATALOG MENU (PRODUK & PAKET) ======
const rp = n => "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ART = {
  kimbab:`<svg viewBox="0 0 120 120" role="img" aria-label="Irisan kimbab"><circle cx="60" cy="60" r="52" fill="#173b2c"/><circle cx="60" cy="60" r="43" fill="#fbfaf5"/><circle cx="46" cy="50" r="9" fill="#f08a24"/><circle cx="72" cy="48" r="8" fill="#ffc83d"/><circle cx="60" cy="72" r="9" fill="#4c9a52"/><circle cx="76" cy="70" r="6" fill="#d92d20"/><circle cx="42" cy="72" r="5" fill="#8a5a3c"/></svg>`,
  kebab:`<svg viewBox="0 0 120 120" role="img" aria-label="Kebab"><g transform="rotate(-28 60 60)"><rect x="34" y="14" width="52" height="92" rx="22" fill="#f1c98a"/><rect x="34" y="62" width="52" height="44" rx="14" fill="#c9cdd2"/><ellipse cx="60" cy="22" rx="20" ry="9" fill="#d92d20"/><ellipse cx="52" cy="20" rx="9" ry="5" fill="#4c9a52"/><ellipse cx="70" cy="21" rx="8" ry="4" fill="#ffc83d"/></g></svg>`,
  sate:`<svg viewBox="0 0 120 120" role="img" aria-label="Sate pusut"><g transform="rotate(-35 60 60)"><rect x="8" y="57" width="104" height="5" rx="2.5" fill="#a9763f"/><rect x="30" y="42" width="60" height="36" rx="18" fill="#a45a2a"/><circle cx="44" cy="52" r="3" fill="#f6e7c8"/><circle cx="62" cy="48" r="3" fill="#f6e7c8"/><circle cx="76" cy="58" r="3" fill="#f6e7c8"/><circle cx="52" cy="68" r="3" fill="#f6e7c8"/><circle cx="70" cy="70" r="3" fill="#f6e7c8"/></g></svg>`,
  duo:`<svg viewBox="0 0 120 120" role="img" aria-label="Kimbab dan kebab"><circle cx="40" cy="62" r="28" fill="#173b2c"/><circle cx="40" cy="62" r="23" fill="#fbfaf5"/><circle cx="33" cy="56" r="5" fill="#f08a24"/><circle cx="47" cy="58" r="4" fill="#ffc83d"/><circle cx="40" cy="70" r="5" fill="#4c9a52"/><g transform="rotate(-25 84 58)"><rect x="68" y="26" width="32" height="64" rx="14" fill="#f1c98a"/><rect x="68" y="58" width="32" height="32" rx="10" fill="#c9cdd2"/><ellipse cx="84" cy="32" rx="12" ry="6" fill="#d92d20"/></g></svg>`,
  komplit:`<svg viewBox="0 0 150 120" role="img" aria-label="Kimbab, kebab, dan sate pusut"><circle cx="38" cy="66" r="24" fill="#173b2c"/><circle cx="38" cy="66" r="19" fill="#fbfaf5"/><circle cx="32" cy="61" r="4" fill="#f08a24"/><circle cx="44" cy="63" r="4" fill="#ffc83d"/><circle cx="38" cy="73" r="4" fill="#4c9a52"/><g transform="rotate(-25 78 58)"><rect x="64" y="30" width="28" height="58" rx="12" fill="#f1c98a"/><rect x="64" y="58" width="28" height="30" rx="9" fill="#c9cdd2"/><ellipse cx="78" cy="35" rx="10" ry="5" fill="#d92d20"/></g><g transform="rotate(-35 116 62)"><rect x="88" y="60" width="56" height="4" rx="2" fill="#a9763f"/><rect x="100" y="48" width="32" height="28" rx="14" fill="#a45a2a"/><circle cx="110" cy="58" r="2.5" fill="#f6e7c8"/><circle cx="122" cy="56" r="2.5" fill="#f6e7c8"/><circle cx="118" cy="68" r="2.5" fill="#f6e7c8"/></g></svg>`,
  default:`<svg viewBox="0 0 120 120" role="img" aria-label="Makanan"><circle cx="60" cy="60" r="45" fill="#d92d20"/><circle cx="60" cy="60" r="36" fill="#ffc83d"/><circle cx="60" cy="60" r="24" fill="#ffffff"/></svg>`
};

const DEFAULT_PRODUCTS = [
  {id:"kimbab", name:"Kimbab", tag:"Gaya Korea", price:15000, tile:"var(--tile-k)", art:"kimbab", outOfStock:false,
   desc:"Nasi gulung berbalut nori dengan isian sayur dan lauk. Dipotong rapi, enak buat camilan atau pengganti makan siang."},
  {id:"kebab", name:"Kebab", tag:"Gaya Timur Tengah", price:13000, tile:"var(--tile-b)", art:"kebab", outOfStock:false,
   desc:"Tortilla gulung berisi daging, sayur segar, dan saus. Mengenyangkan dan gampang dibawa ke mana saja."},
  {id:"sate", name:"Sate Pusut", tag:"Khas Lombok", price:10000, tile:"var(--tile-s)", art:"sate", outOfStock:false,
   desc:"Adonan daging berbumbu dan kelapa parut yang dililit di tusuk lalu dipanggang. Gurih, harum bumbu."}
];

const DEFAULT_PAKETS = [
  {id:"duo", name:"Paket Hemat Duo", tag:"Kimbab + Kebab", price:28000, tile:"var(--tile-p)", art:"duo", outOfStock:false,
   desc:"Satu kimbab dan satu kebab, plus bonus saus atau sambal tambahan.", bonus:"Bonus saus"},
  {id:"komplit", name:"Paket Hemat Komplit", tag:"Kimbab + Kebab + Sate Pusut", price:38000, tile:"var(--tile-p)", art:"komplit", outOfStock:false,
   desc:"Ketiga menu NomNom dalam satu paket, plus bonus saus atau sambal tambahan.", bonus:"Bonus saus"}
];

let PRODUCTS = [...DEFAULT_PRODUCTS];
let PAKETS = [...DEFAULT_PAKETS];

try {
  const savedProds = localStorage.getItem("nomnom_products");
  if(savedProds) PRODUCTS = JSON.parse(savedProds);
  const savedPakets = localStorage.getItem("nomnom_pakets");
  if(savedPakets) PAKETS = JSON.parse(savedPakets);
} catch(e){}

const getAllCatalog = () => [...PRODUCTS, ...PAKETS];

const saveCatalogLocal = () => {
  try {
    localStorage.setItem("nomnom_products", JSON.stringify(PRODUCTS));
    localStorage.setItem("nomnom_pakets", JSON.stringify(PAKETS));
  } catch(e){}
};

// Ambil Katalog dari API Database PHP (MySQL)
async function syncCatalogFromDB(){
  try {
    const res = await fetch(API_URL.katalog);
    if(res.ok){
      const json = await res.json();
      if(json.success && json.data){
        if(json.data.products && json.data.products.length) PRODUCTS = json.data.products;
        if(json.data.pakets && json.data.pakets.length) PAKETS = json.data.pakets;
        saveCatalogLocal();
        renderMenu();
        update();
        if(isAdminLoggedIn) renderAdminCatalogList();
      }
    }
  } catch(err){
    // Tetap berjalan memakai cache lokal jika server php belum aktif
  }
}

// Ambil Pengaturan Toko dari Database PHP
async function syncSettingsFromDB(){
  try {
    const res = await fetch(API_URL.pengaturan);
    if(res.ok){
      const json = await res.json();
      if(json.success && json.data){
        CONFIG = { ...CONFIG, ...json.data };
        saveConfig();
        applyConfigToUI();
      }
    }
  } catch(err){}
}

function applyConfigToUI(){
  $("poStatus").textContent = CONFIG.poOpen ? "PO sedang dibuka" : "PO sedang ditutup";
  $("poClose").textContent = CONFIG.poClose || "-";
  $("poPick").textContent = CONFIG.pickup || "-";
  $("waShow").textContent = CONFIG.contactPhone || "-";
  $("igShow").textContent = "@" + (CONFIG.instagram || "-");
}

// ====== 3. KERANJANG BELANJA (CART) ======
const cart = {};
try {
  const s = JSON.parse(localStorage.getItem("nomnom-cart") || "{}");
  const all = getAllCatalog();
  for(const k in s){
    if(all.some(p => p.id === k) && s[k] > 0) cart[k] = Math.min(99, s[k] | 0);
  }
} catch(e){}

const saveCart = () => {
  try { localStorage.setItem("nomnom-cart", JSON.stringify(cart)); } catch(e){}
};

const $ = id => document.getElementById(id);

// Render Kartu Menu
function card(p, isPaket){
  const q = cart[p.id] || 0;
  const artSvg = ART[p.art] || ART.default;
  const isHabis = !!p.outOfStock;

  return `<article class="card${isPaket ? " paket" : ""}">
    ${isHabis ? `<span class="badge" style="background:#71717a">Stok Habis</span>` : (isPaket && p.bonus ? `<span class="badge">${p.bonus}</span>` : "")}
    <div class="tilewrap">
      <div class="tile" style="background:${p.tile || 'var(--tile-k)'}">${artSvg}</div>
    </div>
    <div class="body">
      <span class="tag">${p.tag}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="buy">
        <span class="price rp">${rp(p.price)}</span>
        <div data-ctl="${p.id}">
          ${isHabis
            ? `<button class="add" disabled style="opacity:0.45;cursor:not-allowed">Habis</button>`
            : (q ? stepper(p.id, q) : `<button class="add" data-add="${p.id}">Tambah</button>`)}
        </div>
      </div>
    </div>
  </article>`;
}

function stepper(id, q){
  return `<div class="step">
    <button type="button" data-dec="${id}" aria-label="Kurangi">&minus;</button>
    <output aria-live="polite">${q}</output>
    <button type="button" data-inc="${id}" aria-label="Tambah">+</button>
  </div>`;
}

function renderMenu(){
  $("menuGrid").innerHTML = PRODUCTS.map(p => card(p, false)).join("");
  $("paketGrid").innerHTML = PAKETS.map(p => card(p, true)).join("");
}

function changeQty(id, d){
  const prod = getAllCatalog().find(p => p.id === id);
  if(prod && prod.outOfStock) return;
  const n = Math.max(0, Math.min(99, (cart[id] || 0) + d));
  if(n) cart[id] = n; else delete cart[id];
  saveCart();
  update();
}

let inOrder = false;
function update(){
  const all = getAllCatalog();
  document.querySelectorAll("[data-ctl]").forEach(el => {
    const id = el.dataset.ctl;
    const prod = all.find(p => p.id === id);
    if(prod && prod.outOfStock){
      el.innerHTML = `<button class="add" disabled style="opacity:0.45;cursor:not-allowed">Habis</button>`;
      return;
    }
    const q = cart[id] || 0;
    el.innerHTML = q ? stepper(id, q) : `<button class="add" data-add="${id}">Tambah</button>`;
  });

  const items = all.filter(p => cart[p.id]);
  const total = items.reduce((s, p) => s + p.price * cart[p.id], 0);
  const count = items.reduce((s, p) => s + cart[p.id], 0);

  $("cnt").textContent = count;
  $("total").textContent = rp(total);
  $("ftotal").textContent = rp(total);
  $("float").hidden = !count || inOrder;

  $("lines").innerHTML = items.length
    ? items.map(p => `<div class="line">
        <div><b>${p.name}</b><br><small class="rp">${rp(p.price)} &times; ${cart[p.id]}</small></div>
        <span class="sub rp">${rp(p.price * cart[p.id])}</span>
        ${stepper(p.id, cart[p.id])}
      </div>`).join("")
    : `<p class="empty">Belum ada pesanan. Silakan pilih menu di atas terlebih dahulu.</p>`;

  const btnOrder = $("btnOrder");
  if(!CONFIG.poOpen){
    btnOrder.disabled = true;
    btnOrder.textContent = "PO Sedang Ditutup";
  } else if(!count){
    btnOrder.disabled = true;
    btnOrder.textContent = "Pilih Menu Terlebih Dahulu";
  } else {
    btnOrder.disabled = false;
    btnOrder.textContent = `Pesan & Bayar Sekarang • ${rp(total)}`;
  }

  const antarEl = document.querySelector('input[name="cara"]:checked');
  const isAntar = antarEl && antarEl.value === "Antar";
  const alamatBox = $("alamatBox");
  const alamatInput = $("alamat");
  alamatBox.hidden = !isAntar;
  if(isAntar) alamatInput.setAttribute("required", "");
  else alamatInput.removeAttribute("required");

  const bayarEl = document.querySelector('input[name="bayar"]:checked');
  const proofBox = $("paymentProofBox");
  if(proofBox) proofBox.hidden = (bayarEl && bayarEl.value === "tunai");

  checkLastOrder();
}

function checkLastOrder(){
  try {
    const last = localStorage.getItem("nomnom-last-order");
    const btn = $("btnViewLastOrder");
    if(btn) btn.hidden = !last;
  } catch(e){}
}

function fmtDate(v){
  if(!v) return "-";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

document.addEventListener("click", e => {
  const t = e.target.closest("button");
  if(!t) return;
  if(t.dataset.add) changeQty(t.dataset.add, 1);
  else if(t.dataset.inc) changeQty(t.dataset.inc, 1);
  else if(t.dataset.dec) changeQty(t.dataset.dec, -1);
});

$("form").addEventListener("input", () => update());

// ====== 4. DATABASE PESANAN (MYSQL & LOCAL SYNC) ======
let ALL_ORDERS = [];
try {
  const savedOrders = localStorage.getItem("nomnom_orders");
  ALL_ORDERS = savedOrders ? JSON.parse(savedOrders) : [];
} catch(e){}

const saveAllOrdersLocal = () => {
  try { localStorage.setItem("nomnom_orders", JSON.stringify(ALL_ORDERS)); } catch(e){}
};

// Customer Submit Checkout
$("form").addEventListener("submit", async e => {
  e.preventDefault();
  if(!CONFIG.poOpen){
    alert("Mohon maaf, pemesanan PO saat ini sedang ditutup.");
    return;
  }

  const all = getAllCatalog();
  const items = all.filter(p => cart[p.id]);
  const total = items.reduce((s, p) => s + p.price * cart[p.id], 0);
  if(!items.length || total <= 0){
    alert("Keranjang kamu masih kosong. Silakan pilih menu terlebih dahulu!");
    return;
  }

  const nama = $("nama").value.trim();
  const telp = $("telp").value.trim();
  const cara = document.querySelector('input[name="cara"]:checked').value;
  const alamat = cara === "Antar" ? $("alamat").value.trim() : "";
  const tgl = $("tgl").value;
  const jam = $("jam").value;
  const bayar = document.querySelector('input[name="bayar"]:checked').value;
  const pengirimNama = $("pengirimNama") ? $("pengirimNama").value.trim() : "";
  const cat = $("cat").value.trim();

  const todayStr = new Date().toISOString().slice(2,10).replace(/-/g,"");
  const randNum = Math.floor(100 + Math.random() * 900);
  const orderId = `NOM-${todayStr}-${randNum}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const initialStatus = (bayar === "tunai") ? "dimasak" : "menunggu_bayar";

  const orderData = {
    id: orderId,
    dateTime: `${dateStr}, ${timeStr}`,
    nama: nama,
    telp: telp,
    cara: cara,
    alamat: alamat,
    jadwal: [fmtDate(tgl), jam].filter(s => s && s !== "-").join(" - ") || "Segera diproses",
    bayar: bayar,
    pengirimNama: pengirimNama || "-",
    cat: cat || "-",
    status: initialStatus,
    items: items.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: cart[p.id],
      subtotal: p.price * cart[p.id]
    })),
    total: total
  };

  // 1. Simpan ke Database MySQL via PHP API
  try {
    const res = await fetch(API_URL.pesanan, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const json = await res.json();
    if(json.success){
      showToast("Pesanan berhasil disimpan ke database!");
    }
  } catch(err){
    // Fallback: Tersimpan lokal jika server PHP belum aktif
  }

  // 2. Simpan lokal di browser
  ALL_ORDERS.unshift(orderData);
  saveAllOrdersLocal();

  try {
    localStorage.setItem("nomnom-last-order", JSON.stringify(orderData));
    const history = JSON.parse(localStorage.getItem("nomnom-orders-history") || "[]");
    history.unshift(orderData);
    localStorage.setItem("nomnom-orders-history", JSON.stringify(history.slice(0, 30)));
  } catch(err){}

  renderReceipt(orderData);

  // Kosongkan cart
  for(const k in cart) delete cart[k];
  saveCart();
  update();

  openOrderModal();

  if(isAdminLoggedIn) renderAdminOrders();
});

// ====== 5. RENDER STRUK DIGITAL & TRACKING PELANGGAN ======
let currentReceiptOrderId = null;

async function renderReceipt(o){
  currentReceiptOrderId = o.id;

  // Coba ambil data status terbaru dari MySQL database via PHP
  let status = o.status || "menunggu_bayar";
  try {
    const res = await fetch(`${API_URL.pesanan}?id=${encodeURIComponent(o.id)}`);
    if(res.ok){
      const json = await res.json();
      if(json.success && json.data){
        status = json.data.status;
        o.status = status;
      }
    }
  } catch(e){
    const live = ALL_ORDERS.find(item => item.id === o.id);
    if(live) status = live.status;
  }

  updateTrackingBar(status);

  let bayarBadge = "";
  let payDetailHtml = "";

  if(status === "selesai"){
    bayarBadge = `<span class="receipt-badge done">Pesanan Selesai ✓</span>`;
  } else if(status === "siap"){
    bayarBadge = `<span class="receipt-badge ready">Siap Diambil/Diantar</span>`;
  } else if(status === "dimasak"){
    bayarBadge = `<span class="receipt-badge cooking">Sedang Disiapkan Dapur</span>`;
  } else if(status === "terverifikasi"){
    bayarBadge = `<span class="receipt-badge success">Lunas / Terverifikasi</span>`;
  } else if(status === "batal"){
    bayarBadge = `<span class="receipt-badge cancel">Dibatalkan</span>`;
  } else {
    bayarBadge = `<span class="receipt-badge pending">Menunggu Pembayaran</span>`;
  }

  if(o.bayar === "qris"){
    payDetailHtml = `
      <div class="receipt-paybox">
        <span class="receipt-section-title">Instruksi Pembayaran QRIS</span>
        <div class="qris-box">
          <svg class="qris-svg" viewBox="0 0 100 100" role="img" aria-label="QRIS Mockup">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <rect x="8" y="8" width="24" height="24" fill="#173b2c" rx="3"/><rect x="12" y="12" width="16" height="16" fill="#fff" rx="2"/><rect x="15" y="15" width="10" height="10" fill="#173b2c" rx="1"/>
            <rect x="68" y="8" width="24" height="24" fill="#173b2c" rx="3"/><rect x="72" y="12" width="16" height="16" fill="#fff" rx="2"/><rect x="75" y="15" width="10" height="10" fill="#173b2c" rx="1"/>
            <rect x="8" y="68" width="24" height="24" fill="#173b2c" rx="3"/><rect x="12" y="72" width="16" height="16" fill="#fff" rx="2"/><rect x="15" y="75" width="10" height="10" fill="#173b2c" rx="1"/>
            <rect x="36" y="10" width="6" height="6" fill="#173b2c"/><rect x="46" y="10" width="6" height="6" fill="#173b2c"/><rect x="56" y="10" width="6" height="6" fill="#173b2c"/>
            <rect x="36" y="20" width="6" height="6" fill="#173b2c"/><rect x="50" y="20" width="12" height="6" fill="#173b2c"/>
            <rect x="10" y="36" width="6" height="6" fill="#173b2c"/><rect x="22" y="36" width="6" height="6" fill="#173b2c"/>
            <rect x="35" y="35" width="30" height="30" fill="#d92d20" rx="4"/>
            <text x="50" y="53" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="sans-serif">QRIS</text>
            <rect x="70" y="36" width="6" height="6" fill="#173b2c"/><rect x="82" y="36" width="6" height="6" fill="#173b2c"/>
            <rect x="10" y="48" width="12" height="6" fill="#173b2c"/><rect x="78" y="48" width="12" height="6" fill="#173b2c"/>
            <rect x="36" y="70" width="12" height="6" fill="#173b2c"/><rect x="52" y="70" width="6" height="6" fill="#173b2c"/>
            <rect x="66" y="70" width="8" height="6" fill="#173b2c"/><rect x="40" y="82" width="6" height="6" fill="#173b2c"/>
            <rect x="52" y="82" width="18" height="6" fill="#173b2c"/><rect x="78" y="80" width="12" height="8" fill="#173b2c"/>
          </svg>
          <p>Scan kode QRIS di atas via GoPay, OVO, Dana, ShopeePay, atau BCA QRIS dengan nominal pas <b>${rp(o.total)}</b>.</p>
          ${status === "menunggu_bayar" ? `<button type="button" class="btn" style="font-size:.85rem;padding:.4rem 1rem" onclick="customerConfirmPay('${o.id}', this)">Saya Sudah Bayar via QRIS</button>` : ""}
        </div>
      </div>`;
  } else if(o.bayar === "transfer"){
    const accounts = CONFIG.bankAccounts.map(b => `
      <div class="pay-detail-row">
        <span><b>${b.bank}</b>: <code>${b.number}</code> (${b.holder})</span>
        <button type="button" class="btn-copy-sm" onclick="copyText('${b.number}', this)">Salin</button>
      </div>
    `).join("");
    payDetailHtml = `
      <div class="receipt-paybox">
        <span class="receipt-section-title">Transfer Rekening Toko</span>
        ${accounts}
        ${o.pengirimNama && o.pengirimNama !== "-" ? `<small style="color:var(--muted)">Pengirim: <b>${o.pengirimNama}</b></small>` : ""}
        <small style="color:var(--muted)">Silakan transfer tepat sebesar <b>${rp(o.total)}</b>.</small>
        ${status === "menunggu_bayar" ? `<button type="button" class="btn" style="font-size:.85rem;padding:.4rem 1rem;margin-top:.4rem" onclick="customerConfirmPay('${o.id}', this)">Saya Sudah Transfer</button>` : ""}
      </div>`;
  } else {
    payDetailHtml = `
      <div class="receipt-paybox">
        <span class="receipt-section-title">Metode Bayar Tunai (COD)</span>
        <p style="margin:0;font-size:.88rem">Silakan siapkan uang tunai sebesar <b>${rp(o.total)}</b> saat pengambilan di outlet atau saat kurir tiba.</p>
      </div>`;
  }

  const itemsHtml = o.items.map(it => `
    <div class="receipt-item">
      <div>
        <div class="receipt-item-title">${it.name || it.nama_produk}</div>
        <div class="receipt-item-qty">${rp(it.price || it.harga_satuan)} &times; ${it.qty || it.jumlah}</div>
      </div>
      <div class="val rp">${rp(it.subtotal)}</div>
    </div>
  `).join("");

  $("receiptContent").innerHTML = `
    <div class="receipt-top">
      <div>
        <div class="receipt-id">#${o.id}</div>
        <small style="color:var(--muted)">${o.dateTime || o.created_at}</small>
      </div>
      <div>${bayarBadge}</div>
    </div>

    <div class="receipt-section">
      <span class="receipt-section-title">Data Pemesan</span>
      <div class="receipt-row"><span class="label">Nama:</span><span class="val">${o.nama || o.nama_pemesan}</span></div>
      <div class="receipt-row"><span class="label">No. Telp / HP:</span><span class="val">${o.telp || o.telepon}</span></div>
      <div class="receipt-row"><span class="label">Pengiriman:</span><span class="val">${o.cara || o.metode_pengiriman}</span></div>
      ${(o.alamat || o.alamat_antar) ? `<div class="receipt-row"><span class="label">Alamat Antar:</span><span class="val">${o.alamat || o.alamat_antar}</span></div>` : ""}
      <div class="receipt-row"><span class="label">Jadwal:</span><span class="val">${o.jadwal}</span></div>
      ${o.cat && o.cat !== "-" ? `<div class="receipt-row"><span class="label">Catatan:</span><span class="val">${o.cat || o.catatan}</span></div>` : ""}
    </div>

    <div class="receipt-items">
      <span class="receipt-section-title">Rincian Menu</span>
      ${itemsHtml}
    </div>

    <div class="receipt-total">
      <span>Total Pembayaran</span>
      <span class="rp" style="color:var(--accent)">${rp(o.total || o.total_tagihan)}</span>
    </div>

    <div>${payDetailHtml}</div>
  `;
}

function updateTrackingBar(status){
  const s1 = $("trackStep1");
  const s2 = $("trackStep2");
  const s3 = $("trackStep3");
  const s4 = $("trackStep4");

  if(status === "selesai"){
    s1.className = "track-step done";
    s2.className = "track-step done";
    s3.className = "track-step done";
    s4.className = "track-step done";
  } else if(status === "siap"){
    s1.className = "track-step done";
    s2.className = "track-step done";
    s3.className = "track-step done";
    s4.className = "track-step active";
  } else if(status === "dimasak"){
    s1.className = "track-step done";
    s2.className = "track-step done";
    s3.className = "track-step active";
    s4.className = "track-step";
  } else if(status === "terverifikasi"){
    s1.className = "track-step done";
    s2.className = "track-step done";
    s3.className = "track-step active";
    s4.className = "track-step";
  } else {
    // menunggu_bayar
    s1.className = "track-step done";
    s2.className = "track-step active";
    s3.className = "track-step";
    s4.className = "track-step";
  }
}

// Tombol perbarui status di struk pelanggan
$("btnRefreshTracking").addEventListener("click", () => {
  if(!currentReceiptOrderId) return;
  const o = ALL_ORDERS.find(item => item.id === currentReceiptOrderId) || { id: currentReceiptOrderId };
  renderReceipt(o);
  showToast("Status pesanan diperbarui dari database!");
});

// Konfirmasi bayar langsung dari pelanggan
window.customerConfirmPay = async (orderId, btn) => {
  btn.textContent = "Menyimpan ke database...";
  btn.disabled = true;

  try {
    await fetch(`${API_URL.pesanan}?action=update_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status: 'terverifikasi' })
    });
  } catch(e){}

  const o = ALL_ORDERS.find(it => it.id === orderId);
  if(o){
    o.status = "terverifikasi";
    saveAllOrdersLocal();
    renderReceipt(o);
    if(isAdminLoggedIn) renderAdminOrders();
    showToast("Terima kasih, konfirmasi pembayaran Anda telah tersimpan!");
  }
};

window.copyText = (text, btn) => {
  navigator.clipboard.writeText(text).then(()=>{
    const old = btn.textContent;
    btn.textContent = "Tersalin!";
    setTimeout(()=>btn.textContent = old, 1800);
  }).catch(()=>{
    alert("Nomor rekening: " + text);
  });
};

function openOrderModal(){
  $("orderModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeOrderModal(){
  $("orderModal").hidden = true;
  document.body.style.overflow = "";
}

$("btnCloseModal").addEventListener("click", () => {
  closeOrderModal();
  $("form").reset();
  update();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("btnCloseOrderModalX").addEventListener("click", closeOrderModal);

$("btnPrintReceipt").addEventListener("click", () => window.print());

$("btnViewLastOrder").addEventListener("click", () => {
  try {
    const last = JSON.parse(localStorage.getItem("nomnom-last-order") || "null");
    if(last){
      renderReceipt(last);
      openOrderModal();
    }
  } catch(e){}
});

// ====== 6. RIWAYAT PESANAN SAYA ======
function openHistoryModal(){
  const m = $("historyModal");
  const container = $("historyListContent");
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("nomnom-orders-history") || "[]");
  } catch(e){}

  if(!history.length){
    container.innerHTML = `<p class="empty" style="text-align:center">Belum ada riwayat transaksi di browser ini.</p>`;
  } else {
    container.innerHTML = history.map((o, idx) => {
      const live = ALL_ORDERS.find(it => it.id === o.id);
      const st = live ? live.status : (o.status || "menunggu_bayar");
      return `
        <div class="history-card" onclick="viewHistoryItem(${idx})">
          <div class="history-card-top">
            <span class="history-card-id">#${o.id}</span>
            <span class="history-card-total rp">${rp(o.total || o.total_tagihan)}</span>
          </div>
          <div style="font-size:.85rem;color:var(--muted);display:flex;justify-content:space-between;align-items:center">
            <span>${o.dateTime || o.created_at} &bull; ${o.cara || o.metode_pengiriman}</span>
            <span class="pill" style="font-size:.7rem;padding:.15rem .5rem">${st}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  m.hidden = false;
  document.body.style.overflow = "hidden";
}

window.viewHistoryItem = (idx) => {
  try {
    const history = JSON.parse(localStorage.getItem("nomnom-orders-history") || "[]");
    if(history[idx]){
      $("historyModal").hidden = true;
      renderReceipt(history[idx]);
      openOrderModal();
    }
  } catch(e){}
};

$("btnOpenHistory").addEventListener("click", openHistoryModal);
$("btnCloseHistory").addEventListener("click", () => {
  $("historyModal").hidden = true;
  document.body.style.overflow = "";
});
$("btnCloseHistoryX").addEventListener("click", () => {
  $("historyModal").hidden = true;
  document.body.style.overflow = "";
});

// ====== 7. SISTEM ADMIN (LOGIN & MYSQL AUTH) ======
let isAdminLoggedIn = sessionStorage.getItem("nomnom_admin_logged") === "true";

function updateAdminUI(){
  const banner = $("adminBanner");
  const toggleLabel = $("adminToggleLabel");

  if(isAdminLoggedIn){
    banner.hidden = false;
    toggleLabel.textContent = "Admin (Aktif)";
  } else {
    banner.hidden = true;
    toggleLabel.textContent = "Admin";
  }
}

// Cek sesi admin dari database PHP
async function checkAdminSessionFromDB(){
  try {
    const res = await fetch(`${API_URL.auth}?action=check`);
    if(res.ok){
      const json = await res.json();
      if(json.success && json.data && json.data.isLoggedIn){
        isAdminLoggedIn = true;
        sessionStorage.setItem("nomnom_admin_logged", "true");
        updateAdminUI();
      }
    }
  } catch(e){}
}

function openAdminLoginModal(){
  $("adminUser").value = "";
  $("adminPass").value = "";
  $("loginError").hidden = true;
  $("adminLoginModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeAdminLoginModal(){
  $("adminLoginModal").hidden = true;
  document.body.style.overflow = "";
}

$("btnAdminToggle").addEventListener("click", () => {
  if(isAdminLoggedIn){
    openAdminDashboard();
  } else {
    openAdminLoginModal();
  }
});

$("linkFooterAdmin").addEventListener("click", (e) => {
  e.preventDefault();
  if(isAdminLoggedIn) openAdminDashboard();
  else openAdminLoginModal();
});

$("btnCloseLoginModal").addEventListener("click", closeAdminLoginModal);
$("btnCancelLogin").addEventListener("click", closeAdminLoginModal);

// Submit Login Admin ke Database PHP (MySQL)
$("adminLoginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const u = $("adminUser").value.trim();
  const p = $("adminPass").value.trim();

  let loginSuccess = false;

  // Coba login via backend PHP MySQL
  try {
    const res = await fetch(`${API_URL.auth}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const json = await res.json();
    if(json.success){
      loginSuccess = true;
    }
  } catch(err){
    // Fallback offline
    if(u === CONFIG.admin.username && p === CONFIG.admin.password){
      loginSuccess = true;
    }
  }

  if(loginSuccess){
    isAdminLoggedIn = true;
    sessionStorage.setItem("nomnom_admin_logged", "true");
    closeAdminLoginModal();
    updateAdminUI();
    openAdminDashboard();
    showToast("Login Admin Berhasil!");
  } else {
    $("loginError").hidden = false;
  }
});

// Logout Admin
$("btnAdminLogout").addEventListener("click", async () => {
  try { await fetch(`${API_URL.auth}?action=logout`); } catch(e){}
  isAdminLoggedIn = false;
  sessionStorage.removeItem("nomnom_admin_logged");
  updateAdminUI();
  closeAdminDashboard();
  showToast("Anda telah keluar dari mode admin.");
});

// ====== 8. DASHBOARD ADMIN (KELOLA PESANAN & KATALOG) ======
let currentOrderFilter = "all";

async function openAdminDashboard(){
  $("adminDashboardModal").hidden = false;
  document.body.style.overflow = "hidden";
  await fetchAdminOrdersFromDB();
  renderAdminOrders();
  renderAdminCatalogList();
  loadStoreSettingsIntoForm();
}

function closeAdminDashboard(){
  $("adminDashboardModal").hidden = true;
  document.body.style.overflow = "";
}

$("btnCloseDashboard").addEventListener("click", closeAdminDashboard);
$("btnOpenDashboard").addEventListener("click", openAdminDashboard);

// Tab switching
const tabBtns = [
  { btn: $("tabBtnOrders"), pane: $("paneOrders") },
  { btn: $("tabBtnCatalog"), pane: $("paneCatalog") },
  { btn: $("tabBtnSettings"), pane: $("paneSettings") }
];

tabBtns.forEach(({ btn, pane }) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(t => {
      t.btn.classList.remove("active");
      t.pane.hidden = true;
    });
    btn.classList.add("active");
    pane.hidden = false;
  });
});

// Ambil semua pesanan dari Database MySQL via PHP API
async function fetchAdminOrdersFromDB(){
  try {
    const res = await fetch(`${API_URL.pesanan}?action=admin_all`);
    if(res.ok){
      const json = await res.json();
      if(json.success && Array.isArray(json.data)){
        ALL_ORDERS = json.data.map(o => ({
          id: o.id,
          dateTime: o.created_at,
          nama: o.nama_pemesan,
          telp: o.telepon,
          cara: o.metode_pengiriman,
          alamat: o.alamat_antar || "",
          jadwal: o.jadwal || "",
          bayar: o.metode_pembayaran,
          pengirimNama: o.nama_pengirim || "-",
          cat: o.catatan || "-",
          status: o.status,
          total: parseInt(o.total_tagihan) || 0,
          items: (o.items || []).map(it => ({
            name: it.nama_produk,
            price: parseInt(it.harga_satuan) || 0,
            qty: parseInt(it.jumlah) || 1,
            subtotal: parseInt(it.subtotal) || 0
          }))
        }));
        saveAllOrdersLocal();
      }
    }
  } catch(e){}
}

// Filter status pesanan
document.querySelectorAll(".admin-filter-btn").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".admin-filter-btn").forEach(btn => btn.classList.remove("active"));
    b.classList.add("active");
    currentOrderFilter = b.dataset.filter;
    renderAdminOrders();
  });
});

function renderAdminOrders(){
  const container = $("adminOrdersContainer");
  const countAll = ALL_ORDERS.length;
  const countWait = ALL_ORDERS.filter(o => o.status === "menunggu_bayar").length;
  const countVerif = ALL_ORDERS.filter(o => o.status === "terverifikasi").length;
  const countCook = ALL_ORDERS.filter(o => o.status === "dimasak").length;
  const countReady = ALL_ORDERS.filter(o => o.status === "siap").length;
  const countDone = ALL_ORDERS.filter(o => o.status === "selesai").length;

  $("countAll").textContent = countAll;
  $("countWait").textContent = countWait;
  $("countVerif").textContent = countVerif;
  $("countCook").textContent = countCook;
  $("countReady").textContent = countReady;
  $("countDone").textContent = countDone;
  $("orderCountPill").textContent = countAll;

  let filtered = ALL_ORDERS;
  if(currentOrderFilter !== "all"){
    filtered = ALL_ORDERS.filter(o => o.status === currentOrderFilter);
  }

  if(!filtered.length){
    container.innerHTML = `<p class="empty" style="text-align:center;padding:2rem">Tidak ada pesanan pada kategori ini.</p>`;
    return;
  }

  container.innerHTML = filtered.map(o => {
    const itemsText = o.items.map(it => `${it.name} (${it.qty}x)`).join(", ");
    let statusBadge = "";
    if(o.status === "selesai") statusBadge = `<span class="receipt-badge done">Selesai</span>`;
    else if(o.status === "siap") statusBadge = `<span class="receipt-badge ready">Siap Diantar/Ambil</span>`;
    else if(o.status === "dimasak") statusBadge = `<span class="receipt-badge cooking">Sedang Dimasak</span>`;
    else if(o.status === "terverifikasi") statusBadge = `<span class="receipt-badge success">Terverifikasi</span>`;
    else if(o.status === "batal") statusBadge = `<span class="receipt-badge cancel">Dibatalkan</span>`;
    else statusBadge = `<span class="receipt-badge pending">Menunggu Bayar</span>`;

    return `
      <div class="admin-order-card">
        <div class="admin-order-header">
          <div>
            <b style="font-family:monospace;font-size:1.05rem;color:var(--accent)">#${o.id}</b>
            <span style="color:var(--muted);font-size:.82rem;margin-left:.4rem">${o.dateTime}</span>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="admin-order-details">
          <div>
            <div><b>Pemesan:</b> ${o.nama} (<a href="tel:${o.telp}" style="text-decoration:underline;color:var(--ink)">${o.telp}</a>)</div>
            <div><b>Metode:</b> ${o.cara} ${o.alamat ? `&bull; <i>${o.alamat}</i>` : ""}</div>
            <div><b>Jadwal:</b> ${o.jadwal}</div>
          </div>
          <div>
            <div><b>Menu:</b> ${itemsText}</div>
            <div><b>Total Tagihan:</b> <b class="rp" style="color:var(--accent)">${rp(o.total)}</b> (${o.bayar.toUpperCase()})</div>
            ${o.cat && o.cat !== "-" ? `<div><b>Catatan:</b> ${o.cat}</div>` : ""}
          </div>
        </div>

        <div class="admin-order-actions">
          <div class="admin-action-btn-group">
            ${o.status === "menunggu_bayar" ? `<button type="button" class="btn-action-status success" onclick="adminSetStatus('${o.id}', 'terverifikasi')">✓ Verifikasi Pembayaran</button>` : ""}
            ${o.status === "terverifikasi" ? `<button type="button" class="btn-action-status" onclick="adminSetStatus('${o.id}', 'dimasak')">🍳 Mulai Masak / Dapur</button>` : ""}
            ${o.status === "dimasak" ? `<button type="button" class="btn-action-status ready" onclick="adminSetStatus('${o.id}', 'siap')">🛵 Siap Diambil/Antar</button>` : ""}
            ${o.status === "siap" ? `<button type="button" class="btn-action-status success" onclick="adminSetStatus('${o.id}', 'selesai')">🎉 Selesaikan Pesanan</button>` : ""}
            ${o.status !== "selesai" && o.status !== "batal" ? `<button type="button" class="btn-action-status danger" onclick="adminSetStatus('${o.id}', 'batal')">Batalkan</button>` : ""}
          </div>
          <button type="button" class="btn-action-status" onclick="adminViewReceipt('${o.id}')">Lihat Struk</button>
        </div>
      </div>
    `;
  }).join("");
}

// Update status pesanan ke Database MySQL & Local
window.adminSetStatus = async (orderId, newStatus) => {
  try {
    await fetch(`${API_URL.pesanan}?action=update_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status: newStatus })
    });
  } catch(e){}

  const o = ALL_ORDERS.find(it => it.id === orderId);
  if(o){
    o.status = newStatus;
    saveAllOrdersLocal();
    renderAdminOrders();
    showToast(`Status pesanan #${orderId} diubah menjadi: ${newStatus}`);
    if(currentReceiptOrderId === orderId) renderReceipt(o);
  }
};

window.adminViewReceipt = (orderId) => {
  const o = ALL_ORDERS.find(it => it.id === orderId);
  if(o){
    renderReceipt(o);
    openOrderModal();
  }
};

// --- Tab 2: Kelola Katalog Menu ---
function renderAdminCatalogList(){
  const container = $("adminCatalogList");
  const all = getAllCatalog();

  container.innerHTML = all.map(p => {
    return `
      <div class="admin-catalog-card">
        <div class="admin-cat-top">
          <div>
            <b>${p.name}</b> <small>(${p.isPaket || PAKETS.some(x=>x.id===p.id) ? "Paket" : "Satuan"})</small>
            <div style="font-size:.82rem;color:var(--muted)">Tag: ${p.tag} &bull; <b class="rp">${rp(p.price)}</b></div>
          </div>
          <span class="pill" style="font-size:.72rem;background:${p.outOfStock ? '#71717a' : 'var(--sun)'};color:${p.outOfStock ? '#fff' : '#2b1715'}">
            ${p.outOfStock ? "Habis" : "Tersedia"}
          </span>
        </div>
        <p style="font-size:.82rem;color:var(--muted);line-height:1.4">${p.desc}</p>
        <div class="admin-catalog-actions">
          <button type="button" class="btn-action-status" onclick="toggleStockStatus('${p.id}')">
            ${p.outOfStock ? "Tandai Tersedia" : "Tandai Habis"}
          </button>
          <button type="button" class="btn-action-status" onclick="editCatalogItem('${p.id}')">Edit</button>
          <button type="button" class="btn-action-status danger" onclick="deleteCatalogItem('${p.id}')">Hapus</button>
        </div>
      </div>
    `;
  }).join("");
}

// Toggle status stok ke Database MySQL
window.toggleStockStatus = async (id) => {
  const prod = PRODUCTS.find(p => p.id === id);
  const paket = PAKETS.find(p => p.id === id);
  const target = prod || paket;
  if(target){
    try {
      await fetch(`${API_URL.katalog}?action=toggle_stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
    } catch(e){}

    target.outOfStock = !target.outOfStock;
    saveCatalogLocal();
    renderMenu();
    update();
    renderAdminCatalogList();
    showToast(`Status stok "${target.name}" diubah ke: ${target.outOfStock ? 'Habis' : 'Tersedia'}`);
  }
};

window.editCatalogItem = (id) => {
  const prod = PRODUCTS.find(p => p.id === id);
  const paket = PAKETS.find(p => p.id === id);
  const target = prod || paket;
  if(!target) return;

  $("editProdId").value = target.id;
  $("prodName").value = target.name;
  $("prodTag").value = target.tag;
  $("prodPrice").value = target.price;
  $("prodType").value = (paket || target.isPaket) ? "paket" : "satuan";
  $("prodDesc").value = target.desc;
  $("prodColor").value = target.tile || "var(--tile-k)";
  $("prodBonus").value = target.bonus || "";

  $("catEditorTitle").textContent = `Edit Menu: ${target.name}`;
  $("btnCancelEditProd").style.display = "inline-flex";
  $("catalogForm").scrollIntoView({ behavior: "smooth" });
};

$("btnCancelEditProd").addEventListener("click", () => {
  resetCatalogForm();
});

function resetCatalogForm(){
  $("catalogForm").reset();
  $("editProdId").value = "";
  $("catEditorTitle").textContent = "Tambah Menu Baru";
  $("btnCancelEditProd").style.display = "none";
}

// Simpan produk ke Database MySQL via PHP API
$("catalogForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("editProdId").value.trim();
  const name = $("prodName").value.trim();
  const tag = $("prodTag").value.trim();
  const price = parseInt($("prodPrice").value) || 0;
  const type = $("prodType").value;
  const desc = $("prodDesc").value.trim();
  const tile = $("prodColor").value;
  const bonus = $("prodBonus").value.trim();

  const payload = {
    id: id,
    name: name,
    tag: tag,
    price: price,
    type: type,
    desc: desc,
    tile: tile,
    bonus: bonus
  };

  try {
    await fetch(`${API_URL.katalog}?action=save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(e){}

  if(id){
    let target = PRODUCTS.find(p => p.id === id) || PAKETS.find(p => p.id === id);
    if(target){
      target.name = name;
      target.tag = tag;
      target.price = price;
      target.desc = desc;
      target.tile = tile;
      if(bonus) target.bonus = bonus;
      showToast(`Menu "${name}" berhasil diperbarui!`);
    }
  } else {
    const newId = "m_" + Date.now().toString(36);
    const newProd = {
      id: newId,
      name: name,
      tag: tag,
      price: price,
      tile: tile,
      art: "default",
      desc: desc,
      outOfStock: false
    };

    if(type === "paket"){
      newProd.isPaket = true;
      if(bonus) newProd.bonus = bonus;
      PAKETS.push(newProd);
    } else {
      PRODUCTS.push(newProd);
    }
    showToast(`Menu baru "${name}" berhasil ditambahkan!`);
  }

  saveCatalogLocal();
  renderMenu();
  update();
  renderAdminCatalogList();
  resetCatalogForm();
});

// Hapus menu dari Database MySQL
window.deleteCatalogItem = async (id) => {
  if(!confirm("Yakin ingin menghapus menu ini dari database?")) return;

  try {
    await fetch(`${API_URL.katalog}?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });
  } catch(e){}

  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  PAKETS = PAKETS.filter(p => p.id !== id);
  delete cart[id];
  saveCart();
  saveCatalogLocal();
  renderMenu();
  update();
  renderAdminCatalogList();
  showToast("Menu berhasil dihapus dari database.");
};

// --- Tab 3: Pengaturan PO & Toko ---
function loadStoreSettingsIntoForm(){
  $("cfgPoOpen").checked = !!CONFIG.poOpen;
  $("cfgPoOpenLabel").textContent = CONFIG.poOpen ? "Buka (Pelanggan bisa memesan)" : "Tutup (Pemesanan dinonaktifkan)";
  $("cfgPoClose").value = CONFIG.poClose || "";
  $("cfgPickup").value = CONFIG.pickup || "";
  $("cfgPhone").value = CONFIG.contactPhone || "";
  $("cfgInstagram").value = CONFIG.instagram || "";
  $("cfgNewPass").value = "";
}

$("cfgPoOpen").addEventListener("change", e => {
  $("cfgPoOpenLabel").textContent = e.target.checked ? "Buka (Pelanggan bisa memesan)" : "Tutup (Pemesanan dinonaktifkan)";
});

// Simpan Pengaturan Toko ke Database MySQL
$("storeSettingsForm").addEventListener("submit", async e => {
  e.preventDefault();
  CONFIG.poOpen = $("cfgPoOpen").checked;
  CONFIG.poClose = $("cfgPoClose").value.trim();
  CONFIG.pickup = $("cfgPickup").value.trim();
  CONFIG.contactPhone = $("cfgPhone").value.trim();
  CONFIG.instagram = $("cfgInstagram").value.trim();

  try {
    await fetch(API_URL.pengaturan, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG)
    });
  } catch(e){}

  const newPass = $("cfgNewPass").value.trim();
  if(newPass){
    try {
      await fetch(`${API_URL.auth}?action=change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPass })
      });
      CONFIG.admin.password = newPass;
      showToast("Password admin berhasil diubah di database!");
    } catch(e){}
  }

  saveConfig();
  applyConfigToUI();
  update();
  showToast("Pengaturan toko berhasil disimpan ke database!");
});

// ====== 9. TOAST NOTIFICATION ======
function showToast(msg){
  const old = document.querySelector(".toast-notice");
  if(old) old.remove();

  const t = document.createElement("div");
  t.className = "toast-notice";
  t.textContent = msg;
  document.body.appendChild(t);

  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity .3s ease";
    setTimeout(() => t.remove(), 300);
  }, 2600);
}

// Inisialisasi awal
new IntersectionObserver(es => {
  inOrder = es[0].isIntersecting;
  $("float").hidden = inOrder || !Object.keys(cart).length;
},{ threshold: .12 }).observe($("pesan"));

applyConfigToUI();
$("tgl").min = new Date().toISOString().slice(0,10);

renderMenu();
update();
updateAdminUI();

// Sinkronisasi data awal dari database MySQL (jika dijalankan di XAMPP / web server)
syncCatalogFromDB();
syncSettingsFromDB();
checkAdminSessionFromDB();
