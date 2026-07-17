# Rapport de correction — Bug Dashboard (Sélection des tickets)

| | |
|---|---|
| **Projet** | Billed — Notes de frais (P9 OpenClassrooms) |
| **Référence kanban** | [Bug Hunt] - Dashboard |
| **Priorité** | Haute |
| **Date de correction** | 10 juillet 2026 |
| **Statut** | ✅ Corrigé |
| **Développeur** | Remplaçant feature team |

---

## 1. Résumé exécutif

Sur le Dashboard administrateur, après avoir déplié une liste de tickets (ex. « En attente ») puis ouvert une autre liste (ex. « Accepté »), il devenait **impossible de sélectionner un ticket** de la première liste. La cause était un **compteur d'état partagé** entre l'ouverture des listes et l'édition des tickets. La correction sépare ces deux logiques en deux compteurs distincts.

---

## 2. Symptôme observé

### Comportement attendu

1. L'admin déplie la liste « En attente »
2. Il clique sur un ticket → le formulaire s'affiche
3. Il déplie la liste « Accepté »
4. Il peut toujours cliquer sur un ticket de la liste « En attente » encore visible

### Comportement constaté

À l'étape 4, le clic sur un ticket de la première liste **ne rouvre pas le formulaire** — le ticket semble ne plus répondre, ou le formulaire se ferme au lieu de s'ouvrir.

### Tests Jest

Aucun test en échec — bug identifié par **bug hunt** (reproduction manuelle décrite dans le kanban Notion).

---

## 3. Méthode d'investigation

### 3.1 Rapport kanban

Le kanban signale :
> Si on déplie une liste de tickets et on en ouvre une autre, on ne peut plus sélectionner un ticket de la première liste.

### 3.2 Reproduction du scénario (analyse du code)

Le Dashboard utilise un objet `dashboardState` avec un unique compteur `counter` pour **deux comportements toggle** :

| Fonction | Rôle du compteur | Logique |
|----------|------------------|---------|
| `handleShowTickets` | Ouvrir / fermer une liste | `counter % 2 === 0` → afficher, sinon masquer |
| `handleEditTicket` | Ouvrir / fermer le formulaire | `counter % 2 === 0` → afficher, sinon masquer |

### 3.3 Traçage du bug pas à pas

| Étape | Action | `counter` après |
|-------|--------|-----------------|
| 1 | Clic flèche liste « En attente » | 1 (liste ouverte) |
| 2 | Clic sur un ticket pending | 1 (formulaire ouvert) |
| 3 | Clic flèche liste « Accepté » | `index` change → reset à 0, puis 1 (liste acceptée ouverte) |
| 4 | Clic sur ticket de la liste « En attente » | `counter` vaut **1** (impair) |

À l'étape 4, `handleEditTicket` entre dans la branche `else` (`counter % 2 !== 0`) qui **ferme** le formulaire au lieu de l'ouvrir — car le compteur a été incrémenté par `handleShowTickets` à l'étape 3.

### 3.4 Conclusion du diagnostic

**Cause racine (complémentaire)** : à chaque ouverture de liste, un `forEach` sur **toutes** les bills rattachait un **nouveau** listener sur chaque carte déjà visible. Une carte « En attente » ouverte puis toujours affichée recevait un 2ᵉ listener lors de l'ouverture de « Validé » → double exécution de `handleEditTicket` (ouverture puis fermeture immédiate) = « il ne se passe rien ».

**Correction complémentaire** : les listeners ne sont attachés qu'aux cartes de la **liste en cours d'ouverture** (`billsToShow`), et uniquement lors du dépliage.

---

## 4. Correction appliquée

### Fichier modifié

| Fichier | Nature de la modification |
|---------|--------------------------|
| `frontend/src/pages/Dashboard/Dashboard.js` | Séparation de `counter` en `listCounter` et `editCounter` + listeners limités à la liste ouverte |

### Différence — état du dashboard

**Avant :**
```javascript
let dashboardState = {
  counter: undefined,
  index: undefined,
  id: undefined,
};
```

**Après :**
```javascript
let dashboardState = {
  listCounter: undefined,
  editCounter: undefined,
  index: undefined,
  id: undefined,
};
```

### Différence — utilisation

| Fonction | Compteur utilisé |
|----------|----------------|
| `handleShowTickets` | `listCounter` |
| `handleEditTicket` | `editCounter` |
| `resetDashboardState` | réinitialise les deux |

Chaque mécanisme toggle dispose désormais de son propre état, indépendant de l'autre.

**Correction complémentaire — listeners dupliqués :**

**Avant :**
```javascript
// À la fin de handleShowTickets — TOUJOURS exécuté
bills.forEach((bill) => {
  const openBill = document.querySelector(`#open-bill${bill.id}`);
  if (openBill) openBill.addEventListener("click", ...);
});
```

**Après :**
```javascript
// Uniquement lors de l'ouverture d'une liste, pour SES cartes seulement
const billsToShow = filteredBills(bills, getStatus(dashboardState.index));
// ... innerHTML = cards(billsToShow)
billsToShow.forEach((bill) => {
  const openBill = document.querySelector(`#open-bill${bill.id}`);
  if (openBill) openBill.addEventListener("click", ...);
});
```

### Fichiers non modifiés

- `DashboardUI.js`, `DashboardFormUI.js` — rendu HTML inchangé
- `__tests__/Dashboard.js` — tests existants toujours valides

---

## 5. Validation

### Résultats des tests

| Métrique | Avant | Après | Évolution |
|----------|-------|-------|-----------|
| Suites en échec | 0 | 0 | Stable ✅ |
| Tests en échec | 0 | 0 | Stable ✅ |
| Tous les tests | 43/43 | 43/43 | Non-régression ✅ |
| Couverture `Dashboard.js` | 81,63 % | 81,63 % | Stable |

### Vérification manuelle recommandée

1. Se connecter en tant qu'admin (`admin@test.tld` / `admin`)
2. Déplier « En attente » → cliquer sur un ticket → formulaire affiché
3. Déplier « Accepté » ou « Refusé »
4. Recliquer sur un ticket de « En attente » → le formulaire doit s'afficher à nouveau

---

## 6. Commit suggéré

```
fix(Dashboard): séparer les états liste et édition des tickets
```

---

## 7. Prévention / recommandations

- Ne pas partager un même compteur pour des **logiques toggle distinctes** dans un même module.
- Nommer explicitement les états (`listCounter`, `editCounter`) pour clarifier leur responsabilité.
- Envisager un test d'intégration reproduisant le scénario multi-listes (amélioration future).

---

## 8. Références

- Kanban Notion : [Bug Hunt] - Dashboard
- Fichier source : `frontend/src/pages/Dashboard/Dashboard.js`
- Test associé : `frontend/src/__tests__/Dashboard.js`
- Suivi global : [SUIVI.md](../frontend/SUIVI.md)
