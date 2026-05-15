async function run() {
  const regRes = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuserXYZ', email: 'testXYZ@test.com', password: 'password123' })
  });
  
  if (!regRes.ok) {
     const t = await regRes.text();
     console.log('Register failed:', t);
  } else {
     const data = await regRes.json();
     console.log('Register success, token:', data.token);
     const formData = new FormData();
     formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
     const uploadRes = await fetch('http://localhost:8080/api/upload/image', {
       method: 'POST',
       headers: { 'Authorization': 'Bearer ' + data.token },
       body: formData
     });
     console.log('Upload:', uploadRes.status, await uploadRes.text());
  }
}
run();
