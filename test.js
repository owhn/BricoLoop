const supabase = require('./supabase');

async function test() {
  const { data: user, error: e1 } = await supabase
    .from('user')
    .insert({ nom: 'Dupont', prenom: 'Jean', mail: 'jean@mail.com' })
    .select()
    .single();
  if (e1) return console.error('Erreur user :', e1.message);

  const { data: outil, error: e2 } = await supabase
    .from('outil')
    .insert({ nom: 'Perceuse', description: 'Sans fil 18V', type: 'bricolage', proprietaire: user.id })
    .select()
    .single();
  if (e2) return console.error('Erreur outil :', e2.message);

  const { error: e3 } = await supabase
    .from('emprunt')
    .insert({ user_id: user.id, outil_id: outil.id, date_fin: '2026-11-01' });
  if (e3) return console.error('Erreur emprunt :', e3.message);

  const { data } = await supabase.from('emprunt').select('*, outil(nom), user(nom, prenom)');
  console.log(JSON.stringify(data, null, 2));
}

test();
