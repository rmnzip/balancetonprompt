/* =========================================================
   Balance ton prompt – script.js
   - Charge prompts.json (fichier à la racine)
   - Recherche texte, filtres catégories (icônes), favoris
   ========================================================= */

/* ---------- 1. Charger prompts.json ---------- */
let prompts = [];

async function loadPrompts() {
  try {
    const res = await fetch("prompts.json");
    prompts = await res.json();
    prompts.forEach(p => (p.id = Number(p.id)));   // cast id numérique
    render();
  } catch (err) {
    console.error("Erreur de chargement JSON :", err);
    document.getElementById("cardGrid").innerHTML =
      "<p style='padding:2rem'>Impossible de charger les prompts.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadPrompts);

/* ---------- 2. Favoris (LocalStorage) ---------- */
const LS_KEY = "btpFavorites";
const getFavs   = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const saveFavs  = arr => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const isFav     = id  => getFavs().includes(id);
const toggleFav = id  => {
  const favs = getFavs();
  const i = favs.indexOf(id);
  i >= 0 ? favs.splice(i, 1) : favs.push(id);
  saveFavs(favs);
};

/* ---------- Icône cœur (outline & filled, même chemin) ---------- */
const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5' +
  ' 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09' +
  'C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5' +
  'c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/* contour (stroke) */
const iconOutline = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="${HEART_PATH}"/>
</svg>`;

/* rempli */
const iconFilled = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
     viewBox="0 0 24 24" fill="currentColor">
  <path d="${HEART_PATH}"/>
</svg>`;



/* ---------- 4. Sélecteurs DOM ---------- */
const grid        = document.getElementById("cardGrid");
const searchInput = document.querySelector(".search-input");
const favLink     = document.getElementById("showFavoritesLink");
const catItems    = document.querySelectorAll(".cat-item");

/* ---------- 5. State ---------- */
let showOnlyFavs = false;
const selectedCats = new Set();

/* ---------- 6. Gestion catégories (clic) ---------- */
catItems.forEach(li => {
  li.addEventListener("click", () => {
    const c = li.dataset.cat.toLowerCase();
    if (selectedCats.has(c)) {
      selectedCats.delete(c);
      li.classList.remove("selected");
    } else {
      selectedCats.add(c);
      li.classList.add("selected");
    }
    render();
  });
});

/* ---------- 7. Création d'une carte ---------- */
function createCard({ id, title, category }) {
  const card = document.createElement("div");
  card.className = "prompt-card";
  card.dataset.category = category.toLowerCase();

  const h3 = document.createElement("h3");
  h3.textContent = title;

  /* Bouton ouvrir */
  const openBtn = document.createElement("a");
  openBtn.href = `prompt.html?id=${id}`;
  openBtn.className = "btn-open";
  openBtn.textContent = "Ouvrir";

  /* Bouton favoris */
  const favBtn = document.createElement("button");
  favBtn.className = "btn-bookmark";
  favBtn.innerHTML = isFav(id) ? iconFilled : iconOutline;
  if (isFav(id)) favBtn.classList.add("bookmarked");

  favBtn.addEventListener("click", () => {
    toggleFav(id);
    favBtn.classList.toggle("bookmarked");
    const f = favBtn.classList.contains("bookmarked");
    favBtn.innerHTML = f ? iconFilled : iconOutline;
    if (showOnlyFavs) render();
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(openBtn, favBtn);

  card.append(h3, actions);
  return card;
}

/* ---------- 8. Rendu global ---------- */
function render() {
  grid.innerHTML = "";

  const query = searchInput.value.toLowerCase();
  const favArr = getFavs();

  prompts.forEach(p => {
    const matchTxt = p.title.toLowerCase().includes(query);
    const matchCat =
      selectedCats.size === 0 || selectedCats.has(p.category.toLowerCase());
    const matchFav = !showOnlyFavs || favArr.includes(p.id);

    if (matchTxt && matchCat && matchFav) grid.appendChild(createCard(p));
  });
}

/* ---------- 9. Événements recherche / favoris ---------- */
searchInput.addEventListener("input", render);

favLink.addEventListener("click", e => {
  e.preventDefault();
  showOnlyFavs = !showOnlyFavs;
  favLink.textContent = showOnlyFavs ? "Afficher tous les prompts" : "Afficher les favoris";
  render();
});
