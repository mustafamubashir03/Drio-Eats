require('dotenv').config({ silent: true });

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module.js');

async function runTests() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.init();
  
  const server = app.getHttpServer();
  const port = 3001;
  
  server.listen(port, async () => {
    console.log(`Test server listening on port ${port}`);
    
    const base = `http://localhost:${port}/api`;
    
    // Build URL by concatenating base + path (Axios behavior)
    function buildUrl(path) {
      return base + path;
    }
    
    async function test(name, method, path, headers = {}, body = null) {
      try {
        const url = buildUrl(path);
        const opts = {
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
        };
        if (body) opts.body = JSON.stringify(body);
        
        const res = await fetch(url, opts);
        const text = await res.text();
        let bodyJson;
        try { bodyJson = JSON.parse(text); } catch {}
        
        console.log(`${res.status} ${method} ${path}`);
        console.log(`  Response: ${JSON.stringify(bodyJson).slice(0, 200)}`);
        
        return { status: res.status, body: bodyJson };
      } catch (e) {
        console.log(`ERROR ${method} ${path}: ${e.message}`);
        return { error: e.message };
      }
    }
    
    console.log('\n=== Authentication Tests ===\n');
    
    // Test 1: Native-style signup without Origin header
    console.log('--- Test 1: Native-style signup (no Origin header) ---');
    const signupRes = await test('signup', 'POST', '/auth/sign-up/email', {}, {
      email: 'test_native_' + Date.now() + '@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    });
    
    // Test 2: Native-style login without Origin header
    console.log('\n--- Test 2: Native-style login (no Origin header) ---');
    const loginRes = await test('login', 'POST', '/auth/sign-in/email', {}, {
      email: 'test_native_' + Date.now() + '@example.com',
      password: 'Password123!',
    });
    
    // Test 3: Invalid credentials
    console.log('\n--- Test 3: Invalid credentials ---');
    const badLoginRes = await test('bad login', 'POST', '/auth/sign-in/email', {}, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });
    
    // Test 4: Duplicate signup
    console.log('\n--- Test 4: Duplicate signup ---');
    const dupEmail = 'dup_' + Date.now() + '@example.com';
    const dupSignup1 = await test('dup signup 1', 'POST', '/auth/sign-up/email', {}, {
      email: dupEmail,
      password: 'Password123!',
      firstName: 'Dup',
      lastName: 'User',
    });
    const dupSignup2 = await test('dup signup 2', 'POST', '/auth/sign-up/email', {}, {
      email: dupEmail,
      password: 'Password123!',
      firstName: 'Dup',
      lastName: 'User',
    });
    
    // Test 5: Unauthenticated request to protected endpoint
    console.log('\n--- Test 5: Unauthenticated access to protected endpoint ---');
    const unauthRes = await test('unauth protected', 'GET', '/users/me');
    
    // Test 6: Browser-style signup with Origin header
    console.log('\n--- Test 6: Browser-style signup (with Origin header) ---');
    const browserSignupRes = await test('browser signup', 'POST', '/auth/sign-up/email', {
      'Origin': 'http://localhost:3000',
    }, {
      email: 'browser_' + Date.now() + '@example.com',
      password: 'Password123!',
      firstName: 'Browser',
      lastName: 'User',
    });
    
    console.log('\n=== All tests completed ===');
    await app.close();
    process.exit(0);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
}

runTests().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
