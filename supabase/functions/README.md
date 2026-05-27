# Edge Functions – Déploiement

## Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installée
- Projet Supabase créé sur [app.supabase.com](https://app.supabase.com)

## Secrets à configurer

Dans le Dashboard Supabase : **Project Settings → Edge Functions → Secrets**, ou en CLI :

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
# Optionnel : envoi d’emails
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM="CodeQuest Kids <noreply@votredomaine.com>"
```

## Déploiement

1. Lier le projet (une fois) :
   ```bash
   supabase login
   supabase link --project-ref VOTRE_PROJECT_REF
   ```

2. Déployer toutes les functions :
   ```bash
   supabase functions deploy
   ```

3. Ou une par une :
   ```bash
   supabase functions deploy subscription-manager
   supabase functions deploy stripe-webhook
   supabase functions deploy process-email-queue
   supabase functions deploy dunning-manager
   ```

## Webhook Stripe

Dans `config.toml`, `stripe-webhook` a `verify_jwt = false` car Stripe appelle l’URL sans JWT.

Après déploiement, configurez dans le Dashboard Stripe → Webhooks :

- URL : `https://VOTRE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
- Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

## Fonctions fournies

| Fonction               | Rôle |
|------------------------|------|
| subscription-manager   | Checkout Stripe, portail client, annulation / réactivation, usage |
| stripe-webhook         | Réception des événements Stripe, mise à jour abonnements et paiements |
| process-email-queue    | Traitement de la file d’emails (optionnel : Resend) |
| dunning-manager        | Relances paiements en échec, métriques |
