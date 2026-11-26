/* ====== ISI BAGIAN INI ====== */
const CONFIG = {
  waNumber: "",            // nomor WhatsApp Business format 62, contoh: "6281234567890"
  instagram: "",           // username Instagram tanpa @, contoh: "nomnom.mtr"
  poClose: "",             // contoh: "Jumat, 20.00 WITA"
  pickup: "",              // contoh: "Sabtu, 10.00 - 15.00"
  poOpen: true             // ubah ke false saat PO ditutup
};
/* ========================== */

const rp = n => "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const PRODUCTS = [
  {id:"kimbab", name:"Kimbab", tag:"Gaya Korea", price:15000, tile:"var(--tile-k)", art:"kimbab",
   desc:"Nasi gulung berbalut nori dengan isian sayur dan lauk. Dipotong rapi, enak buat camilan atau pengganti makan siang."},
  {id:"kebab", name:"Kebab", tag:"Gaya Timur Tengah", price:13000, tile:"var(--tile-b)", art:"kebab",
   desc:"Tortilla gulung berisi daging, sayur segar, dan saus. Mengenyangkan dan gampang dibawa ke mana saja."},
  {id:"sate", name:"Sate Pusut", tag:"Khas Lombok", price:10000, tile:"var(--tile-s)", art:"sate",
   desc:"Adonan daging berbumbu dan kelapa parut yang dililit di tusuk lalu dipanggang. Gurih, harum bumbu."}
];
const PAKETS = [
  {id:"duo", name:"Paket Hemat Duo", tag:"Kimbab + Kebab", price:28000, tile:"var(--tile-p)", art:"duo",
   desc:"Satu kimbab dan satu kebab, plus bonus saus atau sambal tambahan.", bonus:"Bonus saus"},
  {id:"komplit", name:"Paket Hemat Komplit", tag:"Kimbab + Kebab + Sate Pusut", price:38000, tile:"var(--tile-p)", art:"komplit",
   desc:"Ketiga menu NomNom dalam satu paket, plus bonus saus atau sambal tambahan.", bonus:"Bonus saus"}
];
const ALL = [...PRODUCTS, ...PAKETS];
const ART = {
  kimbab:`<svg viewBox="0 0 120 120" role="img" aria-label="Irisan kimbab"><circle cx="60" cy="60" r="52" fill="#173b2c"/><circle cx="60" cy="60" r="43" fill="#fbfaf5"/><circle cx="46" cy="50" r="9" fill="#f08a24"/><circle cx="72" cy="48" r="8" fill="#ffc83d"/><circle cx="60" cy="72" r="9" fill="#4c9a52"/><circle cx="76" cy="70" r="6" fill="#d92d20"/><circle cx="42" cy="72" r="5" fill="#8a5a3c"/></svg>`,
  kebab:`<svg viewBox="0 0 120 120" role="img" aria-label="Kebab"><g transform="rotate(-28 60 60)"><rect x="34" y="14" width="52" height="92" rx="22" fill="#f1c98a"/><rect x="34" y="62" width="52" height="44" rx="14" fill="#c9cdd2"/><ellipse cx="60" cy="22" rx="20" ry="9" fill="#d92d20"/><ellipse cx="52" cy="20" rx="9" ry="5" fill="#4c9a52"/><ellipse cx="70" cy="21" rx="8" ry="4" fill="#ffc83d"/></g></svg>`,
  sate:`<svg viewBox="0 0 120 120" role="img" aria-label="Sate pusut"><g transform="rotate(-35 60 60)"><rect x="8" y="57" width="104" height="5" rx="2.5" fill="#a9763f"/><rect x="30" y="42" width="60" height="36" rx="18" fill="#a45a2a"/><circle cx="44" cy="52" r="3" fill="#f6e7c8"/><circle cx="62" cy="48" r="3" fill="#f6e7c8"/><circle cx="76" cy="58" r="3" fill="#f6e7c8"/><circle cx="52" cy="68" r="3" fill="#f6e7c8"/><circle cx="70" cy="70" r="3" fill="#f6e7c8"/></g></svg>`,
  duo:`<svg viewBox="0 0 120 120" role="img" aria-label="Kimbab dan kebab"><circle cx="40" cy="62" r="28" fill="#173b2c"/><circle cx="40" cy="62" r="23" fill="#fbfaf5"/><circle cx="33" cy="56" r="5" fill="#f08a24"/><circle cx="47" cy="58" r="4" fill="#ffc83d"/><circle cx="40" cy="70" r="5" fill="#4c9a52"/><g transform="rotate(-25 84 58)"><rect x="68" y="26" width="32" height="64" rx="14" fill="#f1c98a"/><rect x="68" y="58" width="32" height="32" rx="10" fill="#c9cdd2"/><ellipse cx="84" cy="32" rx="12" ry="6" fill="#d92d20"/></g></svg>`,
  komplit:`<svg viewBox="0 0 150 120" role="img" aria-label="Kimbab, kebab, dan sate pusut"><circle cx="38" cy="66" r="24" fill="#173b2c"/><circle cx="38" cy="66" r="19" fill="#fbfaf5"/><circle cx="32" cy="61" r="4" fill="#f08a24"/><circle cx="44" cy="63" r="4" fill="#ffc83d"/><circle cx="38" cy="73" r="4" fill="#4c9a52"/><g transform="rotate(-25 78 58)"><rect x="64" y="30" width="28" height="58" rx="12" fill="#f1c98a"/><rect x="64" y="58" width="28" height="30" rx="9" fill="#c9cdd2"/><ellipse cx="78" cy="35" rx="10" ry="5" fill="#d92d20"/></g><g transform="rotate(-35 116 62)"><rect x="88" y="60" width="56" height="4" rx="2" fill="#a9763f"/><rect x="100" y="48" width="32" height="28" rx="14" fill="#a45a2a"/><circle cx="110" cy="58" r="2.5" fill="#f6e7c8"/><circle cx="122" cy="56" r="2.5" fill="#f6e7c8"/><circle cx="118" cy="68" r="2.5" fill="#f6e7c8"/></g></svg>`
};
const cart = {};
try{const s=JSON.parse(localStorage.getItem("nomnom-cart")||"{}");for(const k in s){if(ALL.some(p=>p.id===k)&&s[k]>0)cart[k]=Math.min(99,s[k]|0)}}catch(e){}
const save=()=>{try{localStorage.setItem("nomnom-cart",JSON.stringify(cart))}catch(e){}};
const $=id=>document.getElementById(id);

function card(p,isPaket){
  const q=cart[p.id]||0;
  return `<article class="card${isPaket?" paket":""}">
    <div class="tilewrap"><div class="tile" style="background:${p.tile}">${ART[p.art]}</div>${isPaket?`<span class="badge">${p.bonus}</span>`:""}</div>
    <div class="body"><span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="buy"><span class="price rp">${rp(p.price)}</span>
      <div data-ctl="${p.id}">${q?stepper(p.id,q):`<button class="add" data-add="${p.id}">Tambah</button>`}</div>
    </div></div></article>`;
}
function stepper(id,q){
  return `<div class="step"><button type="button" data-dec="${id}" aria-label="Kurangi">&minus;</button><output aria-live="polite">${q}</output><button type="button" data-inc="${id}" aria-label="Tambah">+</button></div>`;
}
function renderMenu(){
  $("menuGrid").innerHTML=PRODUCTS.map(p=>card(p,false)).join("");
  $("paketGrid").innerHTML=PAKETS.map(p=>card(p,true)).join("");
}
function change(id,d){
  const n=Math.max(0,Math.min(99,(cart[id]||0)+d));
  if(n)cart[id]=n;else delete cart[id];
  save();update();
}
function update(){
  // kartu
  document.querySelectorAll("[data-ctl]").forEach(el=>{
    const id=el.dataset.ctl,q=cart[id]||0;
    el.innerHTML=q?stepper(id,q):`<button class="add" data-add="${id}">Tambah</button>`;
  });
  const items=ALL.filter(p=>cart[p.id]);
  const total=items.reduce((s,p)=>s+p.price*cart[p.id],0);
  const count=items.reduce((s,p)=>s+cart[p.id],0);
  $("cnt").textContent=count;
  $("total").textContent=rp(total);
  $("ftotal").textContent=rp(total);
  $("float").hidden=!count||inOrder;
  $("lines").innerHTML=items.length?items.map(p=>`<div class="line"><div><b>${p.name}</b><br><small class="rp">${rp(p.price)} &times; ${cart[p.id]}</small></div><span class="sub rp">${rp(p.price*cart[p.id])}</span>${stepper(p.id,cart[p.id]).replace(/data-dec/,'data-dec').replace(/data-inc/,'data-inc')}</div>`).join(""):`<p class="empty">Belum ada pesanan. Pilih menu di atas dulu.</p>`;
  buildMsg(items,total);
}
let inOrder=false,msgText="";
function fmtDate(v){if(!v)return"";const[y,m,d]=v.split("-");return `${d}/${m}/${y}`}
function buildMsg(items,total){
  const antar=document.querySelector('input[name="cara"]:checked').value==="Antar";
  $("alamatBox").hidden=!antar;
  const L=["Halo NomNom, saya mau pesan:",""];
  items.forEach(p=>L.push(`- ${p.name} x${cart[p.id]} (${rp(p.price*cart[p.id])})`));
  if(!items.length)L.push("- (belum ada pesanan)");
  L.push("",`Total: ${rp(total)}`,"",`Nama: ${$("nama").value.trim()||"-"}`,`Cara terima: ${antar?"Antar":"Ambil di tempat"}`);
  if(antar)L.push(`Alamat: ${$("alamat").value.trim()||"-"}`);
  const t=[fmtDate($("tgl").value),$("jam").value].filter(Boolean).join(" ");
  L.push(`Tanggal pengambilan: ${t||"-"}`,`Catatan: ${$("cat").value.trim()||"-"}`);
  msgText=L.join("\n");
  $("preview").textContent=msgText;
  const num=CONFIG.waNumber.replace(/\D/g,"");
  const ok=num.length>=9&&items.length>0;
  const wa=$("wa");
  if(num.length>=9){wa.href=`https://wa.me/${num}?text=${encodeURIComponent(msgText)}`;wa.removeAttribute("aria-disabled");wa.style.opacity=items.length?1:.45;wa.style.pointerEvents=items.length?"auto":"none";}
  else{wa.href="#pesan";wa.target="_self";wa.style.opacity=.45;wa.style.pointerEvents="none";}
  $("waWarn").hidden=num.length>=9;
  $("copy").disabled=!items.length;
}
document.addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.dataset.add)change(t.dataset.add,1);
  else if(t.dataset.inc)change(t.dataset.inc,1);
  else if(t.dataset.dec)change(t.dataset.dec,-1);
});
$("form").addEventListener("input",()=>update());
$("form").addEventListener("submit",e=>e.preventDefault());
$("copy").addEventListener("click",async()=>{
  const b=$("copy");
  try{await navigator.clipboard.writeText(msgText);b.textContent="Pesan disalin";}
  catch(err){const r=document.createRange();r.selectNodeContents($("preview"));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent="Pesan dipilih, tekan salin";}
  setTimeout(()=>b.textContent="Salin pesan",2200);
});
new IntersectionObserver(es=>{inOrder=es[0].isIntersecting;$("float").hidden=inOrder||!Object.keys(cart).length},{threshold:.12}).observe($("pesan"));

// info PO & kontak
if(!CONFIG.poOpen){$("poStatus").textContent="PO sedang ditutup"}
if(CONFIG.poClose)$("poClose").textContent=CONFIG.poClose;
if(CONFIG.pickup)$("poPick").textContent=CONFIG.pickup;
if(CONFIG.waNumber)$("waShow").textContent="+"+CONFIG.waNumber.replace(/\D/g,"");
if(CONFIG.instagram)$("igShow").textContent="@"+CONFIG.instagram;
$("tgl").min=new Date().toISOString().slice(0,10);

renderMenu();update();
