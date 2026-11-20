// ============================================
//   RECHERCHE DE LIVRE – Leaf & Loop
// ============================================

// ── Liste complète des livres disponibles dans le market ──
var MARKET_TITRES = [
    "great big beautiful life",
    "midnight black",
    "everything is tuberculosis",
    "the impossible fortune",
    "onyx storm",
    "project hail mary",
    "the astral library",
    "le crime du paradis",
    "the wings that bind",
    "quelqu'un d'autre",
    "البخلاء – الجاحظ",
    "ألف ليلة وليلة",
    "عزازيل",
    "مخمل (velvet)",
    "المقدمة",
    "de l'angoisse à l'espoir",
    "l'oracle de la sagesse du yoga",
    "tarot de marseille vintage",
    "la conference des oiseaux",
    "le voyage nocturne du prophète muhammad",
    "le carnet pour s'endormir",
    "apéro rébus et charades en famille",
    "astérix aux jeux olympiques",
    "coloriage mystère : week-end à la campagne",
    "mes chats beautés",
    "urbanisme",
    "zaha hadid (1950-2016)",
    "le corbusier 1887-1965",
    "odilon redon (1840-1916)",
    "1000 chairs"
];

// ── Au chargement de la page ──
document.addEventListener("DOMContentLoaded", function () {

    // ── Logique spécifique à market.html ──
    var champRecherche = document.getElementById("champRecherche");
    if (champRecherche) {

        // Lire le paramètre "q" dans l'URL
        var urlParams = new URLSearchParams(window.location.search);
        var motURL = urlParams.get("q");

        if (motURL) {
            champRecherche.value = motURL;
            rechercherLivre();
        }

        champRecherche.addEventListener("keypress", function (e) {
            if (e.key === "Enter") rechercherLivre();
        });
    }

    // ── Logique spécifique à acceuil2.html ──
    var champAccueil = document.getElementById("champRechercheAccueil");
    if (champAccueil) {
        champAccueil.addEventListener("keypress", function (e) {
            if (e.key === "Enter") rechercherDisponibilite();
        });

        // Fermer la modale en cliquant sur le fond
        var overlay = document.getElementById("modalDisponibilite");
        if (overlay) {
            overlay.addEventListener("click", function (e) {
                if (e.target === overlay) fermerModalDisponibilite();
            });
        }

        // Fermer avec Échap
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") fermerModalDisponibilite();
        });
    }
});

// ============================================
//   RECHERCHE DISPONIBILITÉ – Accueil
// ============================================
function rechercherDisponibilite() {
    var champ = document.getElementById("champRechercheAccueil");
    var mot = champ.value.trim();

    if (mot === "") {
        afficherToastAccueil("⚠️ Veuillez entrer un titre de livre !");
        return;
    }

    var motLower = mot.toLowerCase();

    // Chercher une correspondance partielle dans la liste du market
    var trouve = MARKET_TITRES.find(function (titre) {
        return titre.includes(motLower) || motLower.includes(titre.substring(0, 6));
    });

    afficherModalDisponibilite(mot, !!trouve, trouve || null);
}

function afficherModalDisponibilite(recherche, disponible, titreTrouve) {
    var modal = document.getElementById("modalDisponibilite");
    var contenu = document.getElementById("modalContenu");

    if (!modal || !contenu) return;

    if (disponible) {
        // Capitaliser le titre trouvé pour l'affichage
        var titreAffiche = titreTrouve.charAt(0).toUpperCase() + titreTrouve.slice(1);
        contenu.innerHTML =
            '<div class="modal-icon modal-icon--oui">✅</div>' +
            '<h3 class="modal-titre">Disponible dans le market !</h3>' +
            '<p class="modal-message">Le livre correspondant à <strong>"' + recherche + '"</strong> est disponible.</p>' +
            '<p class="modal-livre-nom">📖 ' + titreAffiche + '</p>' +
            '<div class="modal-actions">' +
            '<a href="market.html?q=' + encodeURIComponent(recherche) + '"class="btn-modal-primary">Voir dans le market</a>' +
            '<button onclick="fermerModalDisponibilite()" class="btn-modal-secondary">Fermer</button>' +
            '</div>';
    } else {
        contenu.innerHTML =
            '<div class="modal-icon modal-icon--non">❌</div>' +
            '<h3 class="modal-titre">Non disponible</h3>' +
            '<p class="modal-message">Le livre <strong>"' + recherche + '"</strong> n\'est pas disponible dans notre market pour le moment.</p>' +
            '<p class="modal-suggestion">💡 Vous pouvez déposer ce livre ou explorer nos autres titres.</p>' +
            '<div class="modal-actions">' +
            '<a href="market.html" class="btn-modal-primary">Explorer le market</a>' +
            '<a href="deposé_livre.html" class="btn-modal-secondary">Déposer un livre</a>' +
            '</div>';
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function fermerModalDisponibilite() {
    var modal = document.getElementById("modalDisponibilite");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function afficherToastAccueil(message) {
    var toast = document.getElementById("toastAccueil");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 3000);
}

// ============================================
//   RECHERCHE DANS MARKET.HTML
// ============================================
function rechercherLivre() {
    var motRecherche = document.getElementById("champRecherche").value.toLowerCase().trim();

    if (motRecherche === "") {
        afficherToast("⚠️ Veuillez entrer un titre de livre !");
        return;
    }

    var toutesLesCartes = document.querySelectorAll(".card");
    var livresTrouves = [];

    for (var i = 0; i < toutesLesCartes.length; i++) {
        var titreCarte = toutesLesCartes[i].querySelector("h4").textContent.toLowerCase();
        if (titreCarte.includes(motRecherche)) {
            livresTrouves.push(toutesLesCartes[i]);
        }
    }

    if (livresTrouves.length === 0) {
        afficherToast("❌ Aucun livre trouvé pour : \"" + document.getElementById("champRecherche").value + "\"");
        afficherToutesLesCartes(toutesLesCartes);
    } else {
        afficherToast("✅ " + livresTrouves.length + " livre(s) trouvé(s) !");
        filtrerCartes(toutesLesCartes, livresTrouves);
        faireDefillerVers(livresTrouves[0]);
    }
}

function filtrerCartes(toutesLesCartes, livresTrouves) {
    for (var i = 0; i < toutesLesCartes.length; i++) {
        toutesLesCartes[i].style.display = livresTrouves.includes(toutesLesCartes[i]) ? "flex" : "none";
    }
}

function afficherToutesLesCartes(toutesLesCartes) {
    for (var i = 0; i < toutesLesCartes.length; i++) {
        toutesLesCartes[i].style.display = "flex";
    }
}

function reinitialiserRecherche() {
    document.getElementById("champRecherche").value = "";
    var toutesLesCartes = document.querySelectorAll(".card");
    afficherToutesLesCartes(toutesLesCartes);
}

function faireDefillerVers(carte) {
    carte.scrollIntoView({ behavior: "smooth", block: "center" });
}

function afficherToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 3000);
}
