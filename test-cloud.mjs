import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: 'dujjdtial',
  api_key: '218761639438599',
  api_secret: 'EOBrVRhC44NU1ctnFkrmvE6uzX8',
  secure: true
});

// create a dummy 1x1 png
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');
fs.writeFileSync('test.png', buffer);

cloudinary.uploader.upload('test.png', { folder: 'test' })
  .then(res => console.log('SUCCESS:', res.secure_url))
  .catch(err => console.error('ERROR:', err));
