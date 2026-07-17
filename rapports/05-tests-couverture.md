# Rapport — Étape 5 : Couverture Bills & NewBill (≥ 80 %)

| | |
|---|---|
| **Projet** | Billed — Notes de frais (P9 OpenClassrooms) |
| **Date** | 17 juillet 2026 |
| **Statut** | ✅ Objectif atteint |
| **Contrainte** | Fichiers de tests OC d'origine **non modifiés** |

---

## 1. Approche

Sans modifier `Bills.js` ni `NewBill.js` dans `__tests__/`, des **nouveaux fichiers** de tests d'intégration ont été ajoutés. Jest les exécute automatiquement.

| Fichier OC (inchangé) | Fichier ajouté |
|-----------------------|----------------|
| `src/__tests__/Bills.js` | `src/__tests__/Bills.integration.js` |
| `src/__tests__/NewBill.js` | `src/__tests__/NewBill.integration.js` |

**Code métier** (`pages/…`) : non modifié.

---

## 2. Avant / Après

| Fichier / métrique | Avant (rouge) | Après | Évolution |
|--------------------|---------------|-------|-----------|
| **All files** | 67,18 % | **87,31 %** | **+20 pts** ✅ ≥ 80 % |
| **pages/Bills** | 47,06 % | **92,16 %** | +45 pts |
| **Bills.js** | 22,86 % | **88,57 %** | +66 pts |
| **pages/NewBill** | 15,38 % | **96,15 %** | +81 pts |
| **NewBill.js** | 13,73 % | **96,08 %** | +82 pts |
| Tests | 43 | **56** | +13 |
| Suites | 11 | **13** | +2 |

Tous les tests passent (56/56).

---

## 3. Contenu des nouveaux fichiers

### `Bills.integration.js`

- Clic « Nouvelle note de frais » → navigation
- Clic icône œil → modale Bootstrap
- `getBills` (tri, store null, erreur API)
- Intégration GET via router
- Erreurs **404** et **500**

### `NewBill.integration.js`

- Upload fichier invalide (PDF) → pas d’appel API
- Upload fichier valide (jpg/png) → `create`
- Submit formulaire → `update` + redirect Bills
- Erreur API sur upload
- Navigation NewBill via router

Modèle : tests d’intégration de `Dashboard.js`.

---

## 4. Commit suggéré

```
test: ajouter Bills.integration.js et NewBill.integration.js (couverture ≥ 80%)
```

---
