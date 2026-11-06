import { execSync } from 'child_process';

async function testEndpoint(url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 500) };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  const tests = [
    { name: 'Health', url: 'http://localhost:3000/api/health', method: 'GET', body: null },
    { name: 'Sign in', url: 'http://localhost:3000/api/auth/sign-in/email', method: 'POST', body: JSON.stringify({ email: 'testuser@example.com', password: 'Password123!' }) },
    { name: 'Sign up', url: 'http://localhost:3000/api/auth/sign-up/email', method: 'POST', body: JSON.stringify({ email: 'testnew@example.com', password: 'Password123!', firstName: 'Test', lastName: 'User', name: 'Test User' }) },
  ];
  
  for (const t of tests) {
    console.log('\n=== ' + t.name + ' ===');
    try {
      const res = await fetch(t.url, {
        method: t.method,
        headers: { 'Content-Type': 'application/json' },
        body: t.body,
      });
      const text = await res.text();
      console.log('Status:', res.status);
      console.log('Body:', text.slice(0, 800));
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

main().catch(e => console.error('FATAL:', e.message));
