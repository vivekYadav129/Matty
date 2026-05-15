import fs from 'fs';

async function run() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@matty.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Token:', token ? 'exists' : 'undefined', loginData);

  const FormData = globalThis.FormData;
  const formData = new FormData();
  const blob = new Blob(['hello'], { type: 'text/plain' });
  formData.append('file', blob, 'hello.txt');

  const uploadRes = await fetch('http://localhost:8080/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const text = await uploadRes.text();
  console.log('Upload Result:', uploadRes.status, text);
}
run();
