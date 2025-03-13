const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Konfigurasi AWS
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',     // Ganti dengan Access Key ID Anda
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY', // Ganti dengan Secret Access Key Anda
  region: 'YOUR_REGION' // Ganti dengan Wilayah AWS Anda, misal 'us-east-1'
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('views'));

app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: 'your-bucket-name', // Ganti dengan nama bucket Anda
    Key: req.file.originalname, // Nama file di S3
    Body: fileContent
  };

  s3.upload(params, function(err, data) {
    fs.unlinkSync(req.file.path); // Hapus file lokal setelah diunggah
    if (err) {
      return res.status(500).send("Error saat mengunggah file");
    }
    res.send(`File berhasil diunggah. Lokasi: ${data.Location}`);
  });
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});