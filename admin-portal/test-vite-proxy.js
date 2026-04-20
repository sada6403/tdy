async function test() {
  try {
    const res = await fetch('http://localhost:5174/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'NF_ADMIN_01', password: 'Ops@Admin123' })
    });
    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
