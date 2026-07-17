# Rapport de correction — Bug Login (Connexion administrateur)

| | |
|---|---|
| **Projet** | Billed — Notes de frais (P9 OpenClassrooms) |
| **Référence kanban** | [Bug report] - Login |
| **Priorité** | Haute |
| **Date de correction** | 10 juillet 2026 |
| **Statut** | ✅ Corrigé |
| **Développeur** | Remplaçant feature team |

---

## 1. Résumé exécutif

La connexion en tant qu'**administrateur RH** était impossible : le formulaire admin ne récupérait pas les identifiants saisis, provoquant une erreur JavaScript à la soumission. La correction consiste à cibler les bons attributs `data-testid` du formulaire administrateur.

---

## 2. Symptôme observé

### Comportement attendu

Un administrateur remplit correctement les champs e-mail et mot de passe du formulaire **Administration**, clique sur « Se connecter », et est redirigé vers la page **Dashboard** (Validations).

### Comportement constaté

- La connexion échoue silencieusement ou provoque une erreur.
- L'utilisateur reste bloqué sur la page Login.
- Le parcours employé, lui, fonctionne correctement.

### Message d'erreur (test Jest)

```
TypeError: Cannot read properties of null (reading 'value')
```

### Test impacté

**Fichier** : `frontend/src/__tests__/Login.js`

**Scénario** :
> *Given* I am a user on login page  
> *When* I do fill fields in correct format and I click on admin button Login In  
> *Then* I should be identified as an HR admin in app and redirected to Dashboard

---

## 3. Méthode d'investigation

### 3.1 Exécution des tests automatisés

```bash
cd frontend && npm test
```

Le test d'intégration admin échoue avec une `TypeError` sur `.value`, ce qui indique qu'un `querySelector` retourne `null`.

### 3.2 Analyse du HTML (`LoginUI.js`)

La page Login contient **deux formulaires distincts** :

| Formulaire | `data-testid` du form | Champs e-mail | Champs mot de passe |
|------------|----------------------|---------------|---------------------|
| Employé | `form-employee` | `employee-email-input` | `employee-password-input` |
| Admin | `form-admin` | `admin-email-input` | `admin-password-input` |

### 3.3 Analyse du code (`Login.js`)

Comparaison des deux handlers de soumission :

| Handler | Sélecteurs utilisés | Cohérent avec le HTML ? |
|---------|---------------------|-------------------------|
| `handleSubmitEmployee` | `employee-email-input`, `employee-password-input` | ✅ Oui |
| `handleSubmitAdmin` | `employee-email-input`, `employee-password-input` | ❌ Non |

### 3.4 Conclusion du diagnostic

`handleSubmitAdmin` recherche des inputs **à l'intérieur du formulaire admin** (`e.target` = `form-admin`), mais avec les `data-testid` du formulaire **employé**. Ces éléments n'existent pas dans ce contexte DOM → `querySelector` retourne `null` → crash sur `.value`.

**Cause racine** : erreur de copier-coller lors du développement — les sélecteurs du handler employé ont été réutilisés sans adaptation pour le handler admin.

---

## 4. Correction appliquée

### Fichier modifié

| Fichier | Nature de la modification |
|---------|--------------------------|
| `frontend/src/pages/Login/Login.js` | Correction des sélecteurs dans `handleSubmitAdmin` |

### Différence (extrait)

**Avant :**
```javascript
email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
```

**Après :**
```javascript
email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
```

### Fichiers non modifiés

- `LoginUI.js` — le HTML était correct
- `Login.js` (tests) — le test était correct et a servi de référence

---

## 5. Validation

### Résultats des tests

| Métrique | Avant | Après | Évolution |
|----------|-------|-------|-----------|
| Suites en échec | 2 | 1 | −1 ✅ |
| Tests en échec | 2 | 1 | −1 ✅ |
| Suite `Login.js` | ❌ | ✅ | Corrigée |
| Couverture `Login.js` | 64,86 % | 78,38 % | +13,52 pts |
| Couverture globale | 67,99 % | 69,64 % | +1,65 pts |

### Test de non-régression

La suite `Login.js` complète passe (connexion employé + admin, champs vides, format incorrect).

### Vérification manuelle recommandée

1. Lancer backend + frontend
2. Se connecter avec `admin@test.tld` / `admin`
3. Vérifier la redirection vers le Dashboard

---

## 6. Commit suggéré

```
fix(Login): corriger les sélecteurs du formulaire admin
```

---

## 7. Prévention / recommandations

- S'appuyer sur les `data-testid` **spécifiques à chaque formulaire** lors de l'écriture des handlers.
- Conserver les tests d'intégration Login (employé + admin) pour détecter ce type de régression.
- En cas de formulaires similaires, factoriser avec prudence : chaque parcours doit garder ses propres sélecteurs.

---

## 8. Références

- Kanban Notion : [Bug report] - Login
- Fichier source : `frontend/src/pages/Login/Login.js`
- Test associé : `frontend/src/__tests__/Login.js`
- Suivi global : [SUIVI.md](../frontend/SUIVI.md)
