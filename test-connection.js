const url = 'https://drvqchhjexsnqplnhlci.supabase.co';

console.log(`Testing connection to ${url}...`);

fetch(url)
    .then(res => console.log(`Success! Status: ${res.status}`))
    .catch(err => console.error(`Failed: ${err.message}`));
