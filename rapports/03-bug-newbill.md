# Rapport de correction — Bug NewBill (Validation du justificatif)

| | |
|---|---|
| **Projet** | Billed — Notes de frais (P9 OpenClassrooms) |
| **Référence kanban** | [Bug Hunt] - Bills |
| **Priorité** | Haute |
| **Date de correction** | 10 juillet 2026 |
| **Statut** | ✅ Corrigé |
| **Développeur** | Remplaçant feature team |

---

## 1. Résumé exécutif

Lors de la création d'une note de frais, l'employé pouvait envoyer un justificatif dans **n'importe quel format** (PDF, GIF, etc.). Ces fichiers étaient uploadés vers l'API mais **ne s'affichaient pas** dans la modale (l'application ne gère que les images). La correction restreint les formats acceptés à **jpg, jpeg et png**, avec validation côté JavaScript et indication visuelle dans le formulaire.

---

## 2. Symptôme observé

### Comportement attendu

L'employé ne peut joindre un justificatif qu'aux formats **jpg, jpeg ou png**. Si le format est invalide, le fichier n'est pas envoyé et un message d'erreur s'affiche.

### Comportement constaté

- Un fichier PDF (ou autre format) peut être sélectionné et uploadé.
- Après soumission, le justificatif n'apparaît pas dans la modale « œil » sur la page Bills.
- Côté admin, le nom du fichier peut apparaître comme `null` et l'image ne s'affiche pas.

### Tests Jest

Aucun test en échec — bug identifié par **bug hunt** (tests manuels / kanban Notion), pas par Jest.

---

## 3. Méthode d'investigation

### 3.1 Rapport kanban et description fonctionnelle

Le kanban Notion signale un **Bug Hunt — Bills** lié au justificatif :
- La modale s'ouvre mais **aucune image** n'apparaît.
- Le problème survient quand le format du fichier n'est pas une image supportée.

La description des fonctionnalités précise que seuls les formats image doivent être acceptés comme preuve.

### 3.2 Analyse du parcours utilisateur

```
NewBill → upload fichier → API → Bills → clic icône œil → modale (image)
```

Si un PDF est uploadé, l'URL est stockée mais la balise `<img>` de la modale ne peut pas l'afficher → modale vide.

### 3.3 Analyse du code

**`NewBill.js` — `handleChangeFile()` (avant correction) :**

| Étape | Comportement | Problème |
|-------|--------------|----------|
| Récupération du fichier | `files[0]` via `querySelector` | Aucune vérification du format |
| Upload | `store.bills().create(formData)` | Tout fichier est envoyé à l'API |
| Stockage | `billFileState.fileName = fileName` | Nom extrait de `e.target.value` (peu fiable) |

**`NewBillUI.js` (avant correction) :**

```html
<input required type="file" data-testid="file" />
```

- Pas d'attribut `accept` → le sélecteur de fichiers propose tous les types.
- Pas d'indication pour l'utilisateur sur les formats autorisés.

### 3.4 Conclusion du diagnostic

**Cause racine** : absence de **validation du format fichier** avant l'upload. L'application faisait confiance à l'input sans filtrer les extensions, ce qui provoquait des justificatifs non affichables dans l'interface.

---

## 4. Correction appliquée

### Fichiers modifiés

| Fichier | Nature de la modification |
|---------|--------------------------|
| `frontend/src/pages/NewBill/NewBill.js` | Fonction `isValidFileFormat()` + validation dans `handleChangeFile()` |
| `frontend/src/pages/NewBill/NewBillUI.js` | Attribut `accept` + label explicite |

### Différence — `NewBill.js`

**Ajout de la validation :**
```javascript
const isValidFileFormat = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png"].includes(extension);
};
```

**Dans `handleChangeFile()` :**
- Utilisation de `file.name` (plus fiable que `e.target.value`)
- Si format invalide → message via `setCustomValidity()` + `reportValidity()`
- Réinitialisation de `billFileState` et **arrêt** de l'upload (pas d'appel API)
- Si format valide → upload normal

### Différence — `NewBillUI.js`

**Avant :**
```html
<label for="file" class="bold-label">Justificatif</label>
<input required type="file" class="form-control blue-border" data-testid="file" />
```

**Après :**
```html
<label for="file" class="bold-label">Justificatif (PNG, JPG ou JPEG uniquement)</label>
<input required type="file" accept="image/png, image/jpg, image/jpeg" class="form-control blue-border" data-testid="file" />
```

### Fichiers non modifiés

- `__tests__/NewBill.js` — tests existants inchangés (couverture renforcée prévue à l'étape 6)

---

## 5. Validation

### Résultats des tests

| Métrique | Avant | Après | Évolution |
|----------|-------|-------|-----------|
| Suites en échec | 0 | 0 | Stable ✅ |
| Tests en échec | 0 | 0 | Stable ✅ |
| Tous les tests | 43/43 | 43/43 | Non-régression ✅ |
| Couverture globale | 69,58 % | 67,08 % | Légère baisse* |

*\*La couverture `NewBill.js` baissera temporairement car du code a été ajouté sans nouveaux tests — l'étape 6 ajoutera les tests d'intégration.*

### Vérification manuelle recommandée

1. Se connecter en tant qu'employé
2. Aller sur « Nouvelle note de frais »
3. Tenter d'uploader un fichier `.pdf` → message d'erreur, pas d'upload
4. Uploader un fichier `.jpg` → upload OK
5. Soumettre la note et vérifier l'affichage du justificatif via l'icône œil

---

## 6. Commit suggéré

```
fix(NewBill): valider les formats jpg, jpeg et png pour le justificatif
```

---

## 7. Prévention / recommandations

- Valider les fichiers **avant** l'appel API pour éviter des données incohérentes en base.
- Combiner validation JavaScript (`isValidFileFormat`) et attribut HTML `accept` pour une double protection (UX + sécurité basique).
- Ajouter des tests d'intégration couvrant les cas valides/invalides (étape 6 du projet).

---

## 8. Références

- Kanban Notion : [Bug Hunt] - Bills
- Fichiers source : `frontend/src/pages/NewBill/NewBill.js`, `frontend/src/pages/NewBill/NewBillUI.js`
- Suivi global : [SUIVI.md](../frontend/SUIVI.md)
- Étape suivante : tests d'intégration NewBill (étape 6)
