# SYSTÈME DE CLASSES - CAS DE TEST ET RECOMMANDATIONS PRODUCTION

---

## 1. CAS DE TEST

### 1.1 Joueur standard (cas normal)

**Scenario:** Joueur nouveau qui suit le chemin principal

**Actions:**
1. Crée un personnage avec origine "Ancien novice"
2. Choisit classe "Mirmillon"
3. Fait des quêtes dans les Carrieres
4. Level up jusqu'a 15
5. Spécialise en "Paladin"

**Vérifications:**
- [ ] Origine correctement appliquée (XP bonus)
- [ ] Classe de base affiche les bons bonus
- [ ] Progression XP fonctionne
- [ ] Spécialisation disponible au lvl 15
- [ ] Changement de classe fonctionne
- [ ] Ancien Bonus de Paladin appliques

**Attendu:** Le joueur peut suivre une progression linéaire sans problèmes.

---

### 1.2 Joueur explorateur

**Scenario:** Joueur qui cherche les secrets

**Actions:**
1. Level up regularly
2. Explore toutes les zones (y compris zones cachees)
3. Trouve la Faille de l'Ombre (meurt 3 fois)
4. Débloque "Danse-lame du Néant"

**Vérifications:**
- [ ] Zones cachees appearing after conditions
- [ ] Tracker de morts dans zone fonctionne
- [ ] Classe secrete debloquee apres 3 morts
- [ ] Hint apparait a 50% (1-2 morts)
- [ ] Notification de deblocage recue
- [ ] Nouvelles competences actives

**Attendu:** Le joueur peut découvir des classes secretes via l'exploration.

---

### 1.3 Joueur criminel

**Scenario:** Joueur qui fait des actions "mauvaises"

**Actions:**
1. Reussi 50+ vols
2. Accumule 10000 gold
3. Tue un joueur innocent en PvP
4. Commet 3 trahisons

**Vérifications:**
- [ ] Compteur de vols increment correctly
- [ ] Gold tracker fonctionne
- [ ] Débloque "Voleur Tempête" après 50 vols + 10k gold
- [ ] Corruption augmente avec les mauvais actes
- [ ] Débloque "Faucheur Maudit" après tuer innocent

**Attendu:** Le joueur peut débloquer des classes basé sur ses actions criminelles.

---

### 1.4 Joueur solo sans guilde

**Scenario:** Joueur qui ne rejoint jamais de guilde

**Actions:**
1. Reste sans guilde pendant 365 jours
2. N'a jamais de bonus de guilde

**Vérifications:**
- [ ] Pas de pénalité de guilde
- [ ] Acces aux classes solo-only
- [ ] Classes "guilde-only" remain locked

**Attendu:** Le joueur ne subit pas de pénalités pour rester solo.

---

### 1.5 Joueur de faction sacrée

**Scenario:** Joueur avec haute pureté

**Actions:**
1. A +80 de pureté
2. A fait 100 fois le bien
3. A refuse les offres mauvaises

**Vérifications:**
- [ ] Pureté tracking correctly
- [ ] Classes sacrées available at +80
- [ ] Paladin accessible sans restriction

**Attendu:** Joueur avec alignement bon peut débloquer des classes sacrées.

---

### 1.6 Joueur corrompu

**Scenario:** Joueur avec haute corruption

**Actions:**
1. A +50 de corruption
2. Tué 10 joueurs innocents
3. A volé 100 fois

**Vérifications:**
- [ ] Corruption tracking correctly
- [ ] Classes obscures available at +50
- [ ] Some classes become unavailable

**Attendu:** Joueur corrompu peut débloquer des classes obscures mais perd l'accès aux classes sacrées.

---

### 1.7 Joueur avec conditions contradictoires

**Scenario:** Joueur remplit deux conditions contradictoires

**Actions:**
1. Tue 50 monstres (bien)
2. Tue 10 joueurs innocents (mal)
3. A haute pureté ET haute corruption

**Vérifications:**
- [ ] Les deux axes de alignement tracked independently
- [ ] Classes bonnes et mauvaises toutes accessibles
- [ ] Conflicting classes show warning

**Attendu:** Joueur peut avoir plusieurs axes d'alignment.

---

### 1.8 Joueur abandonne une voie rare

**Scenario:** Joueur veut changer après avoir debloqué une classe rare

**Actions:**
1. A "Danse-lame du Néant"
2. Veut passer a "Paladin"

**Vérifications:**
- [ ] Système affiche que le changement est irréversible
- [ ] Respec possible avec gros coût
- [ ] Ancienne classe perdue (si respec)

**Attendu:** Changement possible mais avec penalties lourdes.

---

### 1.9 Joueur obtient une classe unique

**Scenario:** Premier joueur à débloquant une classe unique

**Actions:**
1. Trouve l'oeuf noir dans le volcan
2. Complete la quete secrete
3. Devient "Héritier du Dragon"

**Vérifications:**
- [ ] Classe unique unlocked correctly
- [ ] Pas d'autres classes uniques dispo
- [ ] Announcement serveur recu (les autres joueurs)
- [ ] Limite de 1 par serveur respectee

**Attendu:** Première classe unique sur le serveur fonctionne.

---

### 1.10 Joueur tente d'exploiter le système

**Scenario:** Joueur essaie de contourner les conditions

**Actions:**
1. Cherche a mourrir exactement 3 fois rapidement
2. Essaie de farmer les vols en boucle
3. Tente de trigger les conditions via bug

**Vérifications:**
- [ ] Les conditions ne peuvent pas être farmées facilement
- [ ] Combinaison de plusieurs facteurs requis
- [ ] Anti-cheat detecte patterns inhabituels
- [ ] Logs de détection d'exploitation

**Attendu:** Système protégé contre les exploits simples.

---

## 2. TESTING CHECKLIST

### 2.1 Unit Tests

- [ ] Test tracker increments
- [ ] Test unlock condition evaluation
- [ ] Test class switching logic
- [ ] Test alignment calculations

### 2.2 Integration Tests

- [ ] Test complet flow: mort → tracker → unlock → notification
- [ ] Test flow: vol → gold → unlock → notification
- [ ] Test interaction avec other systems (guild, combat)

### 2.3 End-to-End Tests

- [ ] Test full player journey from lvl 1 to rare class
- [ ] Test unique class unlock flow
- [ ] Test class switching and consequences

### 2.4 Performance Tests

- [ ] Test unlock checking avec 1000+ characters
- [ ] Test tracker updates under load
- [ ] Test database queries pour class lookups

---

## 3. RECOMMANDATIONS DE PRODUCTION

### 3.1 Déploiement

**Phase 1 - Lancement initial:**
- Déployer avec classes de base uniquement
- Activer advanced classes apres 1 semaine
- Activer classes rares apres 2 semaines
- Activer classes uniques apres 1 mois

**Phase 2 - Monitoring:**
- Watch unlock rates par classe
- Ajuster seuils si nécessaire
- Collect player feedback

**Phase 3 - Events:**
- Ajouter nouvelles classes secrete chaque saison
- Rotation des classes uniques
- Événements speciaux pour decouvrir des classes

### 3.2 Sécurité

**Protection des données:**
- Ne jamais révéler les conditions exactes aux joueurs
- Ne pas logger les tracker values publiquement
- Anonymiser les données de progression pour les classements

**Anti-exploit:**
- Rate limiting sur les actions critiques
- Verification server-side de toutes les conditions
- Logs detalhés pour forensics

### 3.3 Monitoring

**Métriques importantes:**
- Taux de déblocage par classe (viser 1-5% pour rares)
- Temps moyen pour débloquer chaque classe
- Distribution des classes sur le serveur
- Nombre de joueurs avec chaque type de classe

**Alertes:**
- Si taux de déblocage > 20% → ajuster conditions
- Si temps moyen < 1 jour → conditions trop faciles
- Si distribution tres inégalités → review

### 3.4 Maintenance

**Hotfix criteria:**
- Classe trop forte → nerf (graduel)
- Classe impossible → buff conditions
- Bug de déblocage → fix + rollback si nécessaire

**Communication:**
- Annoncer les changements de classes
- Pas de détails sur les conditions dans les patch notes
- Garder le mystère!

### 3.5 Documentation

**Pour les devs:**
- Schéma de base de données
- Logique de déblocage complète
- Liste des trackers et leurs effets

**Pour les ops:**
- Commandes admin pour debug
- Procédures de rollback
- Dashboard de monitoring

### 3.6 Futurs développements

**Expansion possible:**
- Plus de classes secretes
- Nouvelles zones secretes
- Événements saisonniers
- Classes événementielles temporaires

**Améliorations:**
- UI pour voir progression vers classes secretes
- Améliorer les hints
- Ajouter plus de profondeur narrative

---

## 4. RISQUES ET MITIGATIONS

### 4.1 Risque: Classes trop courantes

**Symptôme:** > 20% des joueurs ont une classe rare

**Mitigation:**
- Augmenter les seuils de déblocage
- Ajouter des conditions supplémentaires
- Réduire les bonus des classes

### 4.2 Risque: Classes impossibles

**Symptôme:** Aucune clase d'un type debloqué après 3 mois

**Mitigation:**
- Réduire les seuils
- Ajouter des voies alternatives
- Ajouter des événements pour faciliter

### 4.3 Risque: Exploitation

**Symptôme:** Joueurs trouvent des shortcuts

**Mitigation:**
- Multiples conditions required
- Anti-cheat detection
- Hotfix rapide

### 4.4 Risque: Mauvaise réception

**Symptôme:** Joueurs se plaignent du système

**Mitigation:**
- Tutoriel clarify le système
- Hints plus claros
- Voie alternative pour les classes principales

---

## 5. SUMMARY

Le système de classes secrete est concu pour:
- Rewards l'exploration et les comportements uniques
- Creer de la profondeur sans complexité UI
- Générer des moments "oh wow" pour les decouvertes
- Créer de la différenciation sociale entre joueurs

Les tests doivent verifier:
- Fonctionnement correct des trackers
- Débloage appropriate selon conditions
- Protection contre les exploits
- Intégration avec tous les systemes

La production doit:
- Monitorer les taux de deblocage
- Ajuster les conditions selon besoin
- Garder le mystere pour les joueurs
- Communiquer soigneusement