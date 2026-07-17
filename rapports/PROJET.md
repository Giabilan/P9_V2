# Billed — Notes de frais (P9 OpenClassrooms)

## Contexte

**Billed** est une solution SaaS RH permettant aux employés de soumettre des notes de frais et aux administrateurs RH de les valider ou refuser.

Garance, développeuse front-end de la feature team, a quitté l'entreprise avant la fin du projet. L'objectif est de fiabiliser le **parcours employé** (tests + debug) et de corriger les bugs restants avant un lancement client dans **2 semaines**.

### Parcours utilisateurs

| Parcours | Back-end | Front-end |
|----------|----------|-----------|
| **Employé** | Prêt (alpha) | À tester et débugger |
| **Administrateur RH** | Prêt (alpha) | Testé par Garance, à débugger |

---

## Structure du dépôt

```
P9_V2/
├── backend/          # API Express (port 5678)
├── frontend/         # Application front-end (live-server, port 8080)
└── PROJET.md         # Ce fichier
```

### Front-end — fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/pages/Login/Login.js` | Connexion employé / admin |
| `src/pages/Bills/Bills.js` | Liste des notes de frais (employé) |
| `src/pages/Bills/BillsUI.js` | Rendu HTML de la liste |
| `src/pages/NewBill/NewBill.js` | Création d'une note de frais |
| `src/pages/NewBill/NewBillUI.js` | Rendu HTML du formulaire |
| `src/pages/Dashboard/Dashboard.js` | Validation RH (admin) |
| `src/app/Router.js` | Navigation entre les pages |
| `src/__tests__/` | Tests Jest |

---

## Lancer l'application en local

### Prérequis

- Node.js **v16 ou v18** (recommandé via nvm)
- `live-server` installé globalement

### 1. Backend

```bash
cd backend
npm install
npm run run:dev
```

API disponible sur : `http://localhost:5678`

### 2. Frontend

```bash
cd frontend
npm install
live-server
```

Application disponible sur : `http://127.0.0.1:8080/`

### Comptes de test

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Employé | `employee@test.tld` | `employee` |
| Admin RH | `admin@test.tld` | `admin` |

---

## Tests

```bash
cd frontend
npm test
```

Rapport de couverture (avec live-server actif) :
`http://127.0.0.1:8080/coverage/lcov-report/`

### État actuel des tests (baseline)

| Suite | Statut |
|-------|--------|
| `Login.js` | 1 test en échec (connexion admin) |
| `Bills.js` | 1 test en échec (tri des dates) |
| Autres suites | OK |

**Couverture globale** : ~68 % — objectif **≥ 80 %** sur `Bills.js` et `NewBill.js`.

---

## Missions (kanban Notion)

Source : [Billed bugs and tests TO DO](https://openclassrooms.notion.site/a7a612fc166747e78d95aa38106a55ec)

| # | Tâche | Priorité | Fichier(s) concerné(s) |
|---|-------|----------|------------------------|
| 1 | **Bug report — Login** : connexion admin impossible | Haute | `Login.js` |
| 2 | **Bug report — Bills** : notes non triées par date | Haute | `Bills.js`, `BillsUI.js` |
| 3 | **Bug hunt — Bills** : justificatif non affiché (formats invalides) | Haute | `NewBill.js`, `NewBillUI.js` |
| 4 | **Bug hunt — Dashboard** : impossible de sélectionner un ticket après ouverture d'une 2e liste | Haute | `Dashboard.js` |
| 5 | **Tests unitaires et d'intégration** : Bills + NewBill (≥ 80 % coverage) | Moyenne | `__tests__/Bills.js`, `__tests__/NewBill.js` |
| 6 | **Plan E2E** : parcours employé (tests manuels) | Moyenne | Document à rédiger |

---

## Détail des bugs identifiés

### Bug 1 — Login (Bug report)

**Symptôme** : un administrateur ne peut pas se connecter malgré des identifiants corrects.

**Test Jest en échec** :
> *When I do fill fields in correct format and I click on admin button Login In → Then I should be identified as an HR admin and redirected to Dashboard*

**Cause probable** : `handleSubmitAdmin` cible les `data-testid` du formulaire employé (`employee-email-input`, `employee-password-input`) au lieu de ceux du formulaire admin (`admin-email-input`, `admin-password-input`).

**Fichier** : `frontend/src/pages/Login/Login.js`

---

### Bug 2 — Bills (Bug report)

**Symptôme** : les notes de frais ne sont pas affichées par ordre décroissant de date.

**Test Jest en échec** :
> *Then bills should be ordered from earliest to latest*

**Cause probable** : absence de tri avant l'affichage dans `BillsUI.js` et/ou dans `getBills()`.

**Fichiers** : `frontend/src/pages/Bills/BillsUI.js`, `frontend/src/pages/Bills/Bills.js`

---

### Bug 3 — NewBill (Bug hunt)

**Symptôme** : on peut envoyer des fichiers non image (PDF, etc.) ; le justificatif n'apparaît pas dans la modale.

**Cause probable** : pas de validation du format fichier (jpg, jpeg, png uniquement) dans `handleChangeFile`.

**Fichiers** : `frontend/src/pages/NewBill/NewBill.js`, `frontend/src/pages/NewBill/NewBillUI.js`

---

### Bug 4 — Dashboard (Bug hunt)

**Symptôme** : après avoir déplié une liste de tickets (ex. « En attente ») et ouvert une autre liste, on ne peut plus sélectionner un ticket de la première liste.

**Cause probable** : compteur d'état partagé entre l'ouverture des listes et l'édition des tickets dans `handleShowTickets` / `handleEditTicket`.

**Fichier** : `frontend/src/pages/Dashboard/Dashboard.js`

---

## Stratégie de travail (étape par étape)

Chaque correction = **1 commit** dédié.

| Étape | Action | Commit suggéré |
|-------|--------|----------------|
| 1 | Corriger bug Login | `fix(Login): corriger les sélecteurs du formulaire admin` |
| 2 | Corriger bug Bills (tri) | `fix(Bills): trier les notes de frais par date décroissante` |
| 3 | Corriger bug NewBill (fichier) | `fix(NewBill): valider les formats jpg, jpeg et png` |
| 4 | Corriger bug Dashboard | `fix(Dashboard): séparer les états liste et édition des tickets` |
| 5 | Ajouter tests Bills | `test(Bills): ajouter tests d'intégration et atteindre 80% coverage` |
| 6 | Ajouter tests NewBill | `test(NewBill): ajouter tests d'intégration et atteindre 80% coverage` |
| 7 | Rédiger plan E2E employé | `docs: ajouter le plan de tests E2E parcours employé` |

---

## Ressources

| Document | Lien |
|----------|------|
| Description des fonctionnalités | [PDF OpenClassrooms](https://s3.eu-west-1.amazonaws.com/course.oc-static.com/projects/DA+JSR_P9/Billed+-+Description+des+fonctionnalite%CC%81s.pdf) |
| Description pratique des besoins | [PDF OpenClassrooms](https://course.oc-static.com/projects/DA+JSR_P9/Billed+-+Description+pratique+des+besoins.pdf) |
| Kanban bugs et tests | [Notion](https://openclassrooms.notion.site/a7a612fc166747e78d95aa38106a55ec) |
| Exemple plan E2E admin | `Billed+-+E2E+parcours+administrateur.docx` |
| Repo backend officiel | [GitHub OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back) |
| Repo frontend officiel | [GitHub OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front) |

---

## Outils

- **Chrome Debugger** : pour débugger l'application en local
- **Jest + Testing Library** : tests unitaires et d'intégration
- **live-server** : serveur de développement front-end
