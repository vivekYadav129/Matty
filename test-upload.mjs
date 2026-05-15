async function run() {
  const regRes = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser123', email: 'test@test.com', password: 'password123' })
  });
  
  let token;
  if (!regRes.ok) {
     const loginRes = await fetch('http://localhost:8080/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
     });
     const loginData = await loginRes.json();
     token = loginData.token;
  } else {
     const regData = await regRes.json();
     token = regData.token;
  }

  console.log('Token:', token);

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
