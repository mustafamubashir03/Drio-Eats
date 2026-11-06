import { fetch } from 'node:node:fetch';

async function testEndpoint(url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 800) };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  // Test with Origin header
  const signIn = await testEndpoint('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ email: 'testuser@example.com', password: 'Password123!' })
  });
  console.log('Sign in (with Origin):', JSON.stringify(signIn));
  
  // Test with Origin header (sign up)
  const signUp = await testEndpoint('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ email: 'testnew2@example.com', password: 'Password123!', firstName: 'Test', lastName: 'User', name: 'Test User' })
  });
  console.log('Sign up (with Origin):', JSON.stringify(signUp));
}

main().catch(e => console.error('FATAL:', e.message));
