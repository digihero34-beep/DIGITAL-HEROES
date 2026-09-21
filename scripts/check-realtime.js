const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const statements = [
  'ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_scores',
  'ALTER PUBLICATION supabase_realtime ADD TABLE public.winners',
  'ALTER PUBLICATION supabase_realtime ADD TABLE public.winner_verifications',
  'ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts',
];

async function run() {
  for (const sql of statements) {
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    const table = sql.split('TABLE public.')[1];
    if (res.ok) {
      console.log(`[OK] Realtime enabled on ${table}`);
    } else {
      const body = await res.text().catch(() => '');
      console.log(`[NOTE] ${table} — HTTP ${res.status}. May already be in publication or needs SQL editor. ${body.slice(0, 120)}`);
    }
  }
  console.log('\nDone. If any tables show NOTE, run 00005_realtime.sql in Supabase SQL Editor.');
}

run();
