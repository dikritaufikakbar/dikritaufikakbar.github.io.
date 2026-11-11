/* ============ EDIT BAGIAN INI ============ */
const CONFIG = {
  name: "Namamu",                       // nama tampilan
  katakana: "ナマエ",                    // nama versi katakana (opsional)
  github: "dikritaufikakbar",           // username GitHub
  tagline: "Halo! Aku mahasiswa yang suka ngoding dan nonton anime.",
  bio: "Ceritakan dirimu di sini: kuliah di mana, jurusan apa, apa yang sedang kamu pelajari, dan anime favoritmu.",
  avatar: "",                           // kosongkan untuk pakai foto GitHub
  skills: [
    { name: "JavaScript", level: 75 },
    { name: "HTML", level: 85 },
    { name: "CSS", level: 80 },
    { name: "Git & GitHub", level: 65 }
  ],
  contacts: [
    { label: "GitHub", url: "https://github.com/dikritaufikakbar" },
    { label: "Email", url: "mailto:emailkamu@example.com" }
    // { label: "Instagram", url: "https://instagram.com/..." }
  ],
  hideForks: true,                      // sembunyikan repo hasil fork
  maxRepos: 24,
  /* Link demo per repo. Kunci = nama repo persis seperti di GitHub.
     Tambahkan baris baru tiap kali ada tugas baru yang punya halaman web. */
  demos: {
    "Tugas-latihan-javascript": [
      { label: "Demo Kalkulator", url: "https://dikritaufikakbar.github.io/Tugas-latihan-javascript/Tugas-kalkulator/Kalkulator.html" }
    ],
    "Projek-html-pertama": [
      { label: "Lihat Projek", url: "https://dikritaufikakbar.github.io/Projek-html-pertama/" }
    ],
    "dikritaufikakbar.github.io": [
      { label: "Buka Situs", url: "https://dikritaufikakbar.github.io/" }
    ],
    "dikritaufikakbar.github.io.": [
      { label: "Buka Situs", url: "https://dikritaufikakbar.github.io/" }
    ]
  }
};
/* Repo contoh, tampil kalau GitHub tidak bisa dihubungi atau username belum diisi */
const SAMPLE = [
  { name: "tugas-web-1", description: "Tugas pemrograman web: halaman profil dengan HTML dan CSS.", language: "HTML", stargazers_count: 2, html_url: "#", homepage: "" },
  { name: "kalkulator-js", description: "Kalkulator sederhana dengan JavaScript DOM.", language: "JavaScript", stargazers_count: 5, html_url: "#", homepage: "" },
  { name: "todo-app", description: "Aplikasi daftar tugas dengan penyimpanan di browser.", language: "JavaScript", stargazers_count: 3, html_url: "#", homepage: "" },
  { name: "landing-page-anime", description: "Landing page bertema anime memakai CSS Grid dan animasi.", language: "CSS", stargazers_count: 7, html_url: "#", homepage: "" }
];
/* ========================================= */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function fillStatic(){
  document.title = CONFIG.name + " | ポートフォリオ";
  $("heroName").textContent = CONFIG.name;
  $("kata").textContent = CONFIG.katakana ? CONFIG.katakana : "ようこそ";
  $("heroTag").textContent = CONFIG.tagline;
  $("aboutName").textContent = CONFIG.name;
  $("aboutBio").textContent = CONFIG.bio;
  $("footName").textContent = CONFIG.name;
  $("year").textContent = new Date().getFullYear();
  if (CONFIG.avatar) $("avatar").innerHTML = '<img src="' + esc(CONFIG.avatar) + '" alt="Foto ' + esc(CONFIG.name) + '">';
  $("skills").innerHTML = CONFIG.skills.map(s =>
    '<div class="skill"><h3>' + esc(s.name) + '</h3><div class="bar"><i data-w="' + s.level + '"></i></div><small>' + s.level + '%</small></div>'
  ).join("");
  $("contactLinks").innerHTML = CONFIG.contacts.map(c =>
    '<a class="btn" target="_blank" rel="noopener" href="' + esc(c.url) + '">' + esc(c.label) + '</a>'
  ).join("");
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting){ e.target.querySelectorAll("i[data-w]").forEach(b => b.style.width = b.dataset.w + "%"); o.unobserve(e.target); }
  }), {threshold:.3}).observe($("skills"));
}

let allRepos = [];
function renderRepos(filter){
  const list = filter === "Semua" ? allRepos : allRepos.filter(r => r.language === filter);
  $("repos").innerHTML = list.map(r => {
    const configuredDemos = CONFIG.demos[r.name] || [];
    const extra = configuredDemos.map(d => '<a class="demo" target="_blank" rel="noopener" href="' + esc(d.url) + '">' + esc(d.label) + '</a>').join("");
    const demo = (r.homepage && !configuredDemos.some(d => d.url === r.homepage) ? '<a class="demo" target="_blank" rel="noopener" href="' + esc(r.homepage) + '">Demo</a>' : "") + extra;
    return '<article class="repo"><h3>' + esc(r.name) + '</h3><p>' + esc(r.description || "Belum ada deskripsi.") + '</p>' +
      '<div class="meta">' + (r.language ? '<span class="lang">' + esc(r.language) + '</span>' : "") +
      '<span>★ ' + (r.stargazers_count || 0) + '</span></div>' +
      '<div class="links"><a target="_blank" rel="noopener" href="' + esc(r.html_url) + '">Kode</a>' + demo + '</article>'.replace('</article>','</div></article>');
  }).join("") || '<p>Belum ada repo untuk bahasa ini.</p>';
}
function renderChips(){
  const langs = ["Semua", ...new Set(allRepos.map(r => r.language).filter(Boolean))];
  $("chips").innerHTML = langs.map((l, i) => '<button class="chip" aria-pressed="' + (i === 0) + '" data-l="' + esc(l) + '">' + esc(l) + '</button>').join("");
  $("chips").onclick = e => {
    const b = e.target.closest(".chip"); if (!b) return;
    $("chips").querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === b));
    renderRepos(b.dataset.l);
  };
}

async function loadGitHub(){
  const user = CONFIG.github;
  const placeholder = !user || user.startsWith("username-");
  if (placeholder){ useSample("Username GitHub belum diisi. Ganti nilai github di CONFIG untuk menampilkan repo aslimu."); return; }
  try {
    const [uRes, rRes] = await Promise.all([
      fetch("https://api.github.com/users/" + encodeURIComponent(user)),
      fetch("https://api.github.com/users/" + encodeURIComponent(user) + "/repos?per_page=100&sort=updated")
    ]);
    if (!uRes.ok || !rRes.ok) throw new Error("status " + uRes.status + "/" + rRes.status);
    const u = await uRes.json(), repos = await rRes.json();
    allRepos = repos.filter(r => !(CONFIG.hideForks && r.fork)).slice(0, CONFIG.maxRepos);
    $("sRepos").textContent = u.public_repos;
    $("sStars").textContent = repos.reduce((n, r) => n + r.stargazers_count, 0);
    $("sFollow").textContent = u.followers;
    if (!CONFIG.avatar && u.avatar_url) $("avatar").innerHTML = '<img src="' + esc(u.avatar_url) + '" alt="Foto ' + esc(CONFIG.name) + '">';
    if (!CONFIG.bio || CONFIG.bio.startsWith("Ceritakan") ) if (u.bio) $("aboutBio").textContent = u.bio;
    $("repoNote").textContent = allRepos.length ? "" : "Belum ada repo publik di akun ini.";
    renderChips(); renderRepos("Semua");
  } catch (err){
    useSample("GitHub tidak bisa dihubungi sekarang (batas request atau koneksi). Menampilkan contoh repo.");
  }
}
function useSample(msg){
  allRepos = SAMPLE;
  ["sRepos","sStars","sFollow"].forEach((id, i) => $(id).textContent = [SAMPLE.length, 17, 0][i]);
  $("repoNote").textContent = msg;
  renderChips(); renderRepos("Semua");
}

/* kelopak sakura */
(function(){
  const cv = $("petals"), ctx = cv.getContext("2d");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let W, H, ps = [];
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  size(); addEventListener("resize", size);
  const n = Math.min(40, Math.floor(innerWidth / 30));
  for (let i = 0; i < n; i++) ps.push({x:Math.random()*W, y:Math.random()*H, r:5+Math.random()*7, s:.4+Math.random()*1, d:Math.random()*Math.PI*2, a:.4+Math.random()*.5});
  (function tick(){
    ctx.clearRect(0, 0, W, H);
    for (const p of ps){
      p.y += p.s; p.d += .02; p.x += Math.sin(p.d) * .8;
      if (p.y > H + 10){ p.y = -10; p.x = Math.random() * W; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.d); ctx.globalAlpha = p.a;
      ctx.fillStyle = "#ffc2d4"; ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(tick);
  })();
})();

fillStatic();
loadGitHub();
