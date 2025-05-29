/* =========================================================
   prompt-detail.js — Page détail
   ========================================================= */

/* ---- URL du JSON (même origine, sans cache-buster) */
const DATA_URL = "prompts.json";

/* ---- Helpers favoris ---- */
const LS_KEY = "btpFavorites";
const loadFavs  = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const saveFavs  = arr => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const isFav     = id  => loadFavs().includes(id);
const toggleFav = id  => {
  const favs = loadFavs();
  const idx  = favs.indexOf(id);
  idx >= 0 ? favs.splice(idx, 1) : favs.push(id);
  saveFavs(favs);
};

/* ---- Icônes ---- */
const iconOutline = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
     viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281
     2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314
     4.385.92 1.815 2.834 3.989 6.286 6.357
     3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385
     C13.486.878 10.4.28 8.717 2.01z"/></svg>`;
const iconFilled = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
     viewBox="0 0 16 16"><path fill-rule="evenodd"
     d="M8 1.314C12.438-3.248 23.534 4.735 8 15
     -7.534 4.736 3.562-3.248 8 1.314"/></svg>`;

/* ========================================================= */
(async () => {
  try {
    /* --- 1. Télécharge les données JSON --- */
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const prompts = await res.json();
    prompts.forEach(p => p.id = Number(p.id));

    /* --- 2. Trouve le prompt ciblé --- */
    const params = new URLSearchParams(location.search);
    const promptId = Number(params.get("id"));
    const current = prompts.find(p => p.id === promptId);

    if (!current) {
      document.body.innerHTML = "<p style='padding:2rem'>Prompt introuvable.</p>";
      return;
    }

    /* --- 3. Carte détaillée --- */
    const card = document.getElementById("promptCard");
    card.innerHTML = `
      <h1>${current.title}</h1>
      <pre class="prompt-text">${current.text}</pre>
      <div class="card-actions">
        <button id="copyBtn" class="btn-open">Copier le prompt</button>
        <button class="btn-bookmark ${isFav(promptId) ? "bookmarked" : ""}" id="favBtn">
          ${isFav(promptId) ? iconFilled : iconOutline}
        </button>
      </div>
    `;

    document.getElementById("copyBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(current.text);
      const b = document.getElementById("copyBtn");
      b.textContent = "✅ Copié";
      setTimeout(() => (b.textContent = "Copier le prompt"), 1200);
    });

    document.getElementById("favBtn").addEventListener("click", () => {
      toggleFav(promptId);
      const btn = document.getElementById("favBtn");
      btn.classList.toggle("bookmarked");
      const favNow = btn.classList.contains("bookmarked");
      btn.innerHTML = favNow ? iconFilled : iconOutline;
    });

    /* --- 4. Affiche 3 prompts similaires ou 1 fallback --- */
    const similarRaw = prompts.filter(
      p => p.category === current.category && p.id !== current.id
    );
    const similar = similarRaw.length > 0
      ? similarRaw.slice(0, 3)
      : prompts.filter(p => p.id !== current.id).slice(0, 1);

    const grid = document.getElementById("similarGrid");
    similar.forEach(p => {
      const div = document.createElement("div");
      div.className = "prompt-card";
      div.innerHTML = `
        <h3>${p.title}</h3>
        <div class="card-actions">
          <a href="prompt.html?id=${p.id}" class="btn-open">Ouvrir</a>
        </div>`;
      grid.appendChild(div);
    });

  } catch (err) {
    console.error("Erreur JSON :", err);
    document.body.innerHTML =
      "<p style='padding:2rem'>Impossible de charger les prompts.</p>";
  }
})();
