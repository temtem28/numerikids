# Guide de finalisation – CodeQuest Kids (SaaS éducatif)

Ce document décrit l’état actuel du projet et les étapes pour finaliser le SaaS avant mise en production.

---

## 1. Vue d’ensemble du projet

**Stack :** React 18, TypeScript, Vite, Supabase (auth + DB), Stripe (facturation), Tailwind, shadcn/ui.

**Fonctionnalités principales :**
- **Auth** : parents (email/mot de passe), élèves (connexion enfant)
- **Profils** : parent, foyer (household), enfants (création auto au signup)
- **Contenu** : sagas, leçons (Scratch, Python, Pixel Kingdom, etc.), objectifs, récompenses
- **Monétisation** : abonnements (Free, Premium, Family), Stripe Checkout, portail client, prorata
- **Parental** : rapports, analytics, comparaison, objectifs, paramètres foyer
- **Admin** : panneau admin, file d’emails, dunning (paiements en échec)
- **PWA** : service worker, page offline

---

## 2. Points critiques à corriger

### 2.1 Sécurité – Variables d’environnement (priorité haute)

**Problème :** L’URL et la clé Supabase sont en dur dans `src/lib/supabase.ts`. En production, il faut utiliser des variables d’environnement.

**À faire :**

1. **Créer un fichier `.env` à la racine** (ne pas le committer) :

```env
VITE_SUPABASE_URL=https://nmxoizmqrdjovgvlxynq.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

2. **Créer `.env.example`** (à committer) pour documenter les variables :

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

3. **Modifier `src/lib/supabase.ts`** pour utiliser ces variables :

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
const supabase = createClient(supabaseUrl, supabaseKey);
```

4. **Vérifier que `.env` est dans `.gitignore`** (généralement déjà le cas).

---

### 2.2 Edge Functions Supabase (priorité haute)

**État :** Les Edge Functions sont maintenant dans le dépôt sous `supabase/functions/` :
- `subscription-manager` : Checkout Stripe, portail client, annulation/réactivation, usage
- `stripe-webhook` : Événements Stripe → mise à jour `user_subscriptions`, `parent_profiles`, `payment_history`, `failed_payments`
- `process-email-queue` : Traitement de la file `email_queue` (optionnel : Resend via `RESEND_API_KEY`)
- `dunning-manager` : Relances paiements en échec, métriques

**À faire :**

1. **Déployer les functions** (voir `supabase/functions/README.md`) :
   ```bash
   supabase link --project-ref VOTRE_PROJECT_REF
   supabase secrets set STRIPE_SECRET_KEY=sk_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase functions deploy
   ```

2. **Stripe** : créer les produits/prix (Premium / Family, mensuel / annuel), configurer le webhook vers  
   `https://<project>.supabase.co/functions/v1/stripe-webhook`  
   et renseigner les `stripe_price_id_*` dans la table `subscription_plans` (voir STRIPE_SETUP.md).

3. Dans le Dashboard Stripe → Webhooks, définir `verify_jwt = false` pour `stripe-webhook` (déjà prévu dans `supabase/config.toml`).

---

### 2.3 Base de données et migrations

**À faire :**

1. **Vérifier que toutes les migrations sont appliquées** sur le projet Supabase cible :
   - Sous `supabase/migrations/` : exécuter les migrations dans l’ordre (dates dans les noms de fichiers).

2. **Vérifier les tables attendues par le code** (ex. dans `src/types/database.types.ts` et les requêtes) :
   - `parent_profiles`, `children` (ou `child_profiles` selon le schéma), `households`, `subscription_plans`, `subscriptions`, `sagas`, `learning_sessions`, `goals`, etc.
   - Si des colonnes ou tables manquent (ex. `stripe_customer_id`, `subscription_tier`), ajouter une migration.

3. **RLS** : les docs (RLS_*.md) décrivent les politiques. S’assurer qu’elles sont bien appliquées et testées (RLS_TESTING_GUIDE.md).

---

## 3. Checklist de finalisation par thème

### Auth et profils
- [ ] Variables d’environnement Supabase utilisées (voir 2.1)
- [ ] Vérification email (VerifyEmail) opérationnelle (Supabase Auth → Email templates)
- [ ] Reset password et emails Supabase configurés
- [ ] Création auto du parent profile + household + premier enfant (triggers/migrations AUTO_*)

### Facturation (Stripe)
- [ ] Edge Function `subscription-manager` déployée avec `STRIPE_SECRET_KEY`
- [ ] Edge Function `stripe-webhook` déployée avec `STRIPE_WEBHOOK_SECRET`
- [ ] Produits/prix Stripe créés et IDs en base (`subscription_plans`)
- [ ] Webhook Stripe pointant vers l’URL Supabase et événements sélectionnés (STRIPE_SETUP.md)
- [ ] Portail client Stripe configuré (optionnel mais recommandé)
- [ ] Tester un abonnement test (carte 4242…)

### Emails et cron
- [ ] Edge Function `process-email-queue` déployée (si vous utilisez une file d’emails)
- [ ] Cron (pg_cron, cron-job.org ou GitHub Actions) configuré pour appeler cette fonction (CRON_SETUP.md)
- [ ] Templates d’emails (Supabase Auth + éventuels templates métier) définis

### Dunning (paiements en échec)
- [ ] Tables et logique dunning en place (voir DUNNING_SETUP.md)
- [ ] Edge Function `dunning-manager` déployée si utilisée
- [ ] Cron pour les relances si décrit dans la doc

### Contenu et parcours
- [ ] Données des sagas/leçons présentes en base ou dans `src/data/`
- [ ] Pixel Kingdom / autres parcours accessibles et sans erreur
- [ ] Objectifs (goals) et récompenses cohérents avec le schéma (child_goals, goal_templates)

### Déploiement frontend
- [ ] Build : `npm run build` sans erreur
- [ ] En production, définir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans l’environnement de déploiement (Vercel, Netlify, etc.)
- [ ] Prévoir un domaine et HTTPS

### Sécurité et conformité
- [ ] RLS activé et testé sur toutes les tables sensibles
- [ ] Aucune clé secrète (service_role, Stripe secret) dans le frontend
- [ ] Politique de confidentialité / CGU si nécessaire (pages ou liens)

---

## 4. Ordre recommandé des tâches

1. **Env** : passer Supabase en variables d’environnement (2.1) et ajouter `.env.example`.
2. **Stripe** : créer et déployer `subscription-manager` et `stripe-webhook`, configurer Stripe (produits, webhook, secrets).
3. **DB** : appliquer les migrations, vérifier les tables et les `stripe_price_id_*`.
4. **Tests manuels** : inscription parent → création foyer/enfant → souscription test → accès au contenu.
5. **Emails** : `process-email-queue` + cron si nécessaire.
6. **Dunning** : si vous gardez la gestion des échecs de paiement, déployer et configurer selon DUNNING_SETUP.md.
7. **Déploiement** : build, config env de production, déploiement du frontend.

---

## 5. Commandes utiles

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

---

## 6. Documentation existante à suivre

- **STRIPE_SETUP.md** – Stripe, webhook, portail, prorata
- **CRON_SETUP.md** – File d’emails et cron
- **DUNNING_SETUP.md** – Relances paiements en échec
- **PRORATION_GUIDE.md** – Prorata changement de plan
- **AUTO_HOUSEHOLD_SETUP.md** – Création auto foyer/enfant
- **PARENT_CHILD_SCHEMA.md** – Schéma parent/enfant
- **RLS_*.md** – Politiques RLS et tests

En suivant ce guide et les docs listées, vous pourrez finaliser le SaaS CodeQuest Kids de façon cohérente et sécurisée.
