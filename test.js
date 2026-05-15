const http = require('http');

async function run() {
  try {
    const registerRes = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', email: 'test@test.com', password: 'password' })
    });
    
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const designRes = await fetch('http://localhost:8080/api/designs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title: 'test', type: 'presentation', jsonData: {} })
    });
    
    console.log('Design response:', designRes.status, await designRes.json());
  } catch (e) {
    console.error(e);
  }
}

run();
