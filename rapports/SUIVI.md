# Suivi des tests — Billed P9

> Fichier mis à jour à chaque résolution de bug.  
> Commande pour relancer les tests : `cd frontend && npm test`

---

## Baseline initiale

**Date** : 10 juillet 2026  
**Commit de référence** : état du projet avant toute correction

### Résultat global

| Métrique | Valeur |
|----------|--------|
| Suites de tests | **2 échouées** / 9 réussies / **11 total** |
| Tests | **2 échoués** / 41 réussis / **43 total** |
| Durée | ~1,3 s |
| Couverture globale (Statements) | **67,99 %** |
| Couverture globale (Lines) | **68,06 %** |
| Objectif cible | **≥ 80 %** |

### Suites en échec

| Suite | Test en échec | Erreur |
|-------|---------------|--------|
| `Login.js` | *When I do fill fields in correct format and I click on admin button Login In* | `TypeError: Cannot read properties of null (reading 'value')` |
| `Bills.js` | *Then bills should be ordered from earliest to latest* | Ordre des dates incorrect |

### Détail des échecs

#### Login — connexion admin

```
TypeError: Cannot read properties of null (reading 'value')
```

Le formulaire admin ne trouve pas les bons champs input (`admin-email-input` / `admin-password-input`).

#### Bills — tri des dates

```
Expected : ["2004-04-04", "2003-03-03", "2002-02-02", "2001-01-01"]
Received : ["2004-04-04", "2001-01-01", "2003-03-03", "2002-02-02"]
```

Les notes ne sont pas triées par date décroissante.

### Couverture par fichier (baseline)

| Fichier | % Stmts | % Branch | % Funcs | % Lines | Objectif |
|---------|---------|----------|---------|---------|----------|
| **All files** | 67,99 | 70,00 | 58,67 | 68,06 | ≥ 80 % |
| `Login.js` | 64,86 | 25,00 | 61,54 | 64,86 | — |
| `Bills.js` | 24,24 | 16,67 | 12,50 | 25,00 | ≥ 80 % |
| `BillsUI.js` | 100 | 100 | 100 | 100 | 100 % |
| `NewBill.js` | 15,79 | 0 | 0 | 15,79 | ≥ 80 % |
| `NewBillUI.js` | 100 | 100 | 100 | 100 | 100 % |
| `Dashboard.js` | 81,63 | 68,83 | 69,23 | 83,21 | — |

### Suites passantes (baseline)

- `NewBill.js` ✅
- `Dashboard.js` ✅
- `Logout.js` ✅
- `DashboardFormUI.js` ✅
- `LoadingPage.js` ✅
- `routes.js` ✅
- `Actions.js` ✅
- `VerticalLayout.js` ✅
- `ErrorPage.js` ✅

---

## Étape 1 — Bug Login (Bug report)

**Fichier** : `frontend/src/pages/Login/Login.js`  
**Statut** : ✅ Corrigé — 10/07/2026  
**Rapport détaillé** : [rapports/01-bug-login.md](../rapports/01-bug-login.md)

### Avant

| Métrique | Valeur |
|----------|--------|
| Suites échouées | 2 |
| Tests échoués | 2 |
| `Login.js` test admin | ❌ Échec — `TypeError: Cannot read properties of null (reading 'value')` |
| Couverture `Login.js` | 64,86 % |
| Couverture globale | 67,99 % |

### Après

| Métrique | Valeur |
|----------|--------|
| Suites échouées | 1 |
| Tests échoués | 1 |
| `Login.js` test admin | ✅ Passé |
| Couverture `Login.js` | 78,38 % |
| Couverture globale | 69,64 % |

### Commit

```
fix(Login): corriger les sélecteurs du formulaire admin
```

---

## Étape 2 — Bug Bills (Bug report — tri)

**Fichiers** : `frontend/src/pages/Bills/Bills.js`, `frontend/src/pages/Bills/BillsUI.js`  
**Statut** : ✅ Corrigé — 10/07/2026  
**Rapport détaillé** : [rapports/02-bug-bills.md](../rapports/02-bug-bills.md)

### Avant

| Métrique | Valeur |
|----------|--------|
| Suites échouées | 1 |
| Tests échoués | 1 |
| `Bills.js` test tri | ❌ Échec — ordre des dates incorrect |
| Couverture `Bills.js` | 24,24 % |
| Couverture globale | 69,64 % |

### Après

| Métrique | Valeur |
|----------|--------|
| Suites échouées | 0 |
| Tests échoués | 0 |
| `Bills.js` test tri | ✅ Passé |
| Couverture `Bills.js` | 22,86 % |
| Couverture globale | 69,58 % |

### Commit

```
fix(Bills): trier les notes de frais par date décroissante
```

---

## Étape 3 — Bug NewBill (Bug hunt — validation fichier)

**Fichiers** : `frontend/src/pages/NewBill/NewBill.js`, `frontend/src/pages/NewBill/NewBillUI.js`  
**Statut** : ✅ Corrigé — 10/07/2026  
**Rapport détaillé** : [rapports/03-bug-newbill.md](../rapports/03-bug-newbill.md)

> Pas de test Jest en échec sur ce bug (détecté manuellement / bug hunt).

### Avant

| Métrique | Valeur |
|----------|--------|
| Validation fichier jpg/jpeg/png | ❌ Absente |
| Attribut `accept` sur l'input file | ❌ Absent |
| Couverture `NewBill.js` | 15,79 % |
| Tests Jest | 43/43 ✅ (non impactés) |

### Après

| Métrique | Valeur |
|----------|--------|
| Validation fichier jpg/jpeg/png | ✅ Implémentée |
| Attribut `accept` sur l'input file | ✅ Présent |
| Couverture `NewBill.js` | 13,73 % |
| Tests Jest | 43/43 ✅ |

### Commit

```
fix(NewBill): valider les formats jpg, jpeg et png pour le justificatif
```

---

## Étape 4 — Bug Dashboard (Bug hunt — sélection tickets)

**Fichier** : `frontend/src/pages/Dashboard/Dashboard.js`  
**Statut** : ✅ Corrigé — 10/07/2026  
**Rapport détaillé** : [rapports/04-bug-dashboard.md](../rapports/04-bug-dashboard.md)

> Pas de test Jest en échec sur ce bug (détecté manuellement / bug hunt).

### Avant

| Métrique | Valeur |
|----------|--------|
| Sélection ticket après 2e liste | ❌ Cassé |
| Couverture `Dashboard.js` | 81,63 % |
| `Dashboard.js` tests | ✅ Passent |

### Après

| Métrique | Valeur |
|----------|--------|
| Sélection ticket après 2e liste | ✅ Corrigé |
| Couverture `Dashboard.js` | 81,63 % |
| `Dashboard.js` tests | ✅ 43/43 |

### Commit

```
fix(Dashboard): séparer les états liste et édition des tickets
```

---

## Étape 5 — Tests d'intégration Bills & NewBill

**Statut** : ✅ Terminé — 17/07/2026  
**Rapport** : [05-tests-couverture.md](./05-tests-couverture.md)  
**Contrainte** : fichiers OC `Bills.js` / `NewBill.js` (tests) **non modifiés**

### Avant

| Métrique | Valeur |
|----------|--------|
| All files | 67,18 % |
| Bills.js | 22,86 % |
| NewBill.js | 13,73 % |

### Après

| Métrique | Valeur |
|----------|--------|
| All files | **87,31 %** |
| Bills.js | **88,57 %** |
| NewBill.js | **96,08 %** |
| Fichiers ajoutés | `Bills.integration.js`, `NewBill.integration.js` |

### Commit

```
test: ajouter Bills.integration.js et NewBill.integration.js (couverture ≥ 80%)
```

---

## Étape 6 — Tests d'intégration NewBill

**Fichier** : `frontend/src/__tests__/NewBill.js`  
**Statut** : ⏳ En attente

### Avant

| Métrique | Valeur |
|----------|--------|
| Couverture `NewBill.js` | 15,79 % |
| Tests upload / submit | ❌ Absents |

### Après

| Métrique | Valeur |
|----------|--------|
| Couverture `NewBill.js` | — |
| Tests upload / submit | — |

### Commit

```
—
```

---

## Étape 7 — Plan E2E parcours employé

**Statut** : ⏳ En attente

### Avant

| Métrique | Valeur |
|----------|--------|
| Plan E2E employé | ❌ Absent |

### Après

| Métrique | Valeur |
|----------|--------|
| Plan E2E employé | — |

### Commit

```
—
```

---

## Récapitulatif final

| Étape | Bug / Tâche | Statut | Suites KO | Tests KO | Couverture globale |
|-------|-------------|--------|-----------|----------|-------------------|
| — | Baseline | ✅ Documenté | 2 | 2 | 67,99 % |
| 1 | Login | ✅ | 1 | 1 | 69,64 % |
| 2 | Bills (tri) | ✅ | 0 | 0 | 69,58 % |
| 3 | NewBill (fichier) | ✅ | 0 | 0 | 67,08 % |
| 4 | Dashboard | ✅ | 0 | 0 | 67,08 % |
| 5 | Tests Bills | ✅ | 0 | 0 | 87,31 % |
| 6 | Tests NewBill | ✅ | 0 | 0 | 87,31 % (fait avec étape 5) |
| 7 | Plan E2E | ⏳ | — | — | — |
| **Final** | **Tout** | ⏳ | **—** | **—** | **—** |

---

## Historique des exécutions

| Date | Étape | Suites OK/KO | Tests OK/KO | Couverture | Notes |
|------|-------|--------------|-------------|------------|-------|
| 10/07/2026 | Baseline | 9 / 2 | 41 / 2 | 67,99 % | État initial avant corrections |
| 10/07/2026 | Étape 1 — Login | 10 / 1 | 42 / 1 | 69,64 % | Connexion admin corrigée |
| 10/07/2026 | Étape 2 — Bills | 11 / 0 | 43 / 0 | 69,58 % | Tri des notes de frais corrigé — tous les tests passent |
| 10/07/2026 | Étape 3 — NewBill | 11 / 0 | 43 / 0 | 67,08 % | Validation justificatif jpg/jpeg/png |
| 10/07/2026 | Étape 4 — Dashboard | 11 / 0 | 43 / 0 | 67,08 % | Sélection tickets après ouverture multi-listes |
| 17/07/2026 | Étape 5 — Couverture | 13 / 0 | 56 / 0 | 87,31 % | Nouveaux *.integration.js ; OC tests inchangés |
