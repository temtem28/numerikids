# Tarifs Numerikids

À configurer dans Supabase (table `subscription_plans`) et Stripe :

| Plan     | Prix/mois | Essai gratuit |
|----------|-----------|----------------|
| Gratuit  | 9,99 €    | 15 jours       |
| Premium  | 14,99 €   | 15 jours       |
| Famille  | 20 €      | 15 jours       |

- **Essai gratuit** : 15 jours (sans carte bancaire).
- Mettre à jour les prix dans Stripe et les `stripe_price_id_monthly` / `stripe_price_id_yearly` dans `subscription_plans`.
- Champ `trial_days` : 15 pour chaque plan payant.
