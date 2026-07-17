# Rapport de correction — Bug Bills (Tri des notes de frais)

| | |
|---|---|
| **Projet** | Billed — Notes de frais (P9 OpenClassrooms) |
| **Référence kanban** | [Bug report] - Bills |
| **Priorité** | Haute |
| **Date de correction** | 10 juillet 2026 |
| **Statut** | ✅ Corrigé |
| **Développeur** | Remplaçant feature team |

---

## 1. Résumé exécutif

Les notes de frais affichées sur la page **Bills** (parcours employé) n'étaient pas triées par date. Elles apparaissaient dans l'ordre brut renvoyé par l'API, ce qui nuisait à la lisibilité pour l'employé. La correction ajoute un tri **antichronologique** (de la plus récente à la plus ancienne) à deux niveaux : l'affichage (`BillsUI.js`) et le chargement des données (`getBills` dans `Bills.js`).

---

## 2. Symptôme observé

### Comportement attendu

Sur la page « Mes notes de frais », les notes doivent être affichées par ordre de date **décroissant** : la note la plus récente en premier, la plus ancienne en dernier.

### Comportement constaté

Les notes s'affichent dans l'ordre arbitraire renvoyé par le back-end, sans tri.

### Message d'erreur (test Jest)

```
expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Array [
    "2004-04-04",
+   "2001-01-01",
    "2003-03-03",
    "2002-02-02",
-   "2001-01-01",
  ]
```

### Test impacté

**Fichier** : `frontend/src/__tests__/Bills.js`

**Scénario** :
> *Given* I am connected as an employee  
> *When* I am on Bills Page  
> *Then* bills should be ordered from earliest to latest

> **Note** : le libellé du test utilise « earliest to latest » mais la logique de tri (`antiChrono`) vérifie en réalité un ordre **décroissant** (2004 → 2001), soit de la plus récente à la plus ancienne.

---

## 3. Méthode d'investigation

### 3.1 Exécution des tests automatisés

```bash
cd frontend && npm test
```

Le test de tri échoue en comparant l'ordre des dates affichées dans le tableau HTML.

### 3.2 Analyse des données de test (`fixtures/bills.js`)

Ordre brut des fixtures (non trié) :

| Position | Nom | Date |
|----------|-----|------|
| 1 | encore | 2004-04-04 |
| 2 | test1 | 2001-01-01 |
| 3 | test3 | 2003-03-03 |
| 4 | test2 | 2002-02-02 |

Ordre attendu (décroissant) :

| Position | Nom | Date |
|----------|-----|------|
| 1 | encore | 2004-04-04 |
| 2 | test3 | 2003-03-03 |
| 3 | test2 | 2002-02-02 |
| 4 | test1 | 2001-01-01 |

### 3.3 Analyse du code

| Fichier | Fonction | Tri présent ? |
|---------|----------|---------------|
| `BillsUI.js` | `rows()` | ❌ Non — `data.map()` sans tri |
| `Bills.js` | `getBills()` | ❌ Non — retour direct après `map()` |

La fonction `rows()` dans `BillsUI.js` itère simplement sur le tableau reçu. Aucune étape de tri n'est appliquée, ni à l'affichage ni lors du chargement API.

### 3.4 Conclusion du diagnostic

**Cause racine** : fonctionnalité de tri **jamais implémentée**. Les données sont affichées telles quelles, dans l'ordre de la source (fixtures ou API).

**Point d'attention** : le tri doit être effectué **avant** le formatage des dates dans `getBills()`, car `formatDate()` transforme `"2004-04-04"` en `"4 avr. 04"` — un tri post-formatage ne fonctionnerait plus correctement.

---

## 4. Correction appliquée

### Fichiers modifiés

| Fichier | Nature de la modification |
|---------|--------------------------|
| `frontend/src/pages/Bills/BillsUI.js` | Tri antichronologique dans `rows()` avant le rendu HTML |
| `frontend/src/pages/Bills/Bills.js` | Tri antichronologique dans `getBills()` avant le `map()` / `formatDate()` |

### Différence — `BillsUI.js`

**Avant :**
```javascript
const rows = (data) => {
  return data && data.length ? data.map((bill) => row(bill)).join("") : "";
};
```

**Après :**
```javascript
const rows = (data) => {
  if (!data || !data.length) return "";
  const sortedBills = [...data].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  return sortedBills.map((bill) => row(bill)).join("");
};
```

### Différence — `Bills.js`

**Avant :**
```javascript
const snapshot = await store.bills().list();
const bills = snapshot.map((doc) => { ... });
```

**Après :**
```javascript
const snapshot = await store.bills().list();
const sortedSnapshot = [...snapshot].sort(
  (a, b) => new Date(b.date) - new Date(a.date),
);
const bills = sortedSnapshot.map((doc) => { ... });
```

### Fichiers non modifiés

- `fixtures/bills.js` — données de test volontairement non triées
- `__tests__/Bills.js` — le test était correct et sert de garde-fou

---

## 5. Validation

### Résultats des tests

| Métrique | Avant (post-étape 1) | Après | Évolution |
|----------|----------------------|-------|-----------|
| Suites en échec | 1 | 0 | −1 ✅ |
| Tests en échec | 1 | 0 | −1 ✅ |
| Suite `Bills.js` | ❌ | ✅ | Corrigée |
| **Toutes les suites** | 10/11 | **11/11** | 100 % ✅ |
| **Tous les tests** | 42/43 | **43/43** | 100 % ✅ |
| Couverture `BillsUI.js` | 100 % | 100 % | — |
| Couverture globale | 69,64 % | 69,58 % | Stable |

### Test de non-régression

L'ensemble des 43 tests passent, y compris Login (étape 1) et Dashboard.

### Vérification manuelle recommandée

1. Se connecter en tant qu'employé (`employee@test.tld` / `employee`)
2. Consulter la page « Mes notes de frais »
3. Vérifier que les dates sont ordonnées de la plus récente à la plus ancienne

---

## 6. Commit suggéré

```
fix(Bills): trier les notes de frais par date décroissante
```

---

## 7. Prévention / recommandations

- Appliquer le tri à **deux niveaux** : couche données (`getBills`) et couche affichage (`BillsUI`) pour couvrir à la fois le chargement API et les tests unitaires directs sur le composant UI.
- Toujours trier sur la **date brute** (format ISO `YYYY-MM-DD`) avant tout formatage d'affichage.
- Conserver le test de tri existant pour éviter toute régression future.

---

## 8. Références

- Kanban Notion : [Bug report] - Bills
- Fichiers source : `frontend/src/pages/Bills/Bills.js`, `frontend/src/pages/Bills/BillsUI.js`
- Test associé : `frontend/src/__tests__/Bills.js`
- Suivi global : [SUIVI.md](../frontend/SUIVI.md)
