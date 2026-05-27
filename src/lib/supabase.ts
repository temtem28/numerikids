import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] Variables manquantes. Créez un fichier .env avec :\n' +
    '  VITE_SUPABASE_URL=https://votre-projet.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ...  (clé anon publique)\n' +
    'Voir .env.example et FINALISATION.md.'
  );
}

if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  console.error(
    '[Supabase] La clé VITE_SUPABASE_ANON_KEY ne semble pas valide.\n' +
    'Les clés anon Supabase sont des JWT qui commencent par "eyJ...".\n' +
    'Récupérez la bonne clé : Dashboard Supabase → Settings → API → Project API keys → anon (public).'
  );
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export { supabase };