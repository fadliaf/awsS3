const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2'); 


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

// Konfigurasi AWS S3
AWS.config.update({
  accessKeyId: 'AKIAT5VEV3ZXYWNVGWUH',
  secretAccessKey: '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',
  region: 'ap-southeast-2'
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

// 🔌 Koneksi ke MySQL (RDS)
const db = mysql.createConnection({
  host: 'cobadulu.c7keeqqe6c9j.ap-southeast-2.rds.amazonaws.com', // ganti sesuai endpoint RDS kamu
  user: 'admin',
  password: 'itenas2024',
  database: 'nadella'
});

app.get('/files', (req, res) => {
  db.query('SELECT filename, url FROM uploads ORDER BY uploaded_at DESC', (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Gagal mengambil data file' });
    }
    res.json(results);
  });
});

// 🔁 Upload file dan simpan ke database
app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);

  const params = {
    Bucket: 'bucket152023047',
    Key: req.file.originalname,
    Body: fileContent,
    ContentType: req.file.mimetype
  };

  s3.upload(params, function(err, data) {
    fs.unlinkSync(req.file.path); // hapus file lokal

    if (err) return res.status(500).send("Gagal upload ke S3");

    // Simpan ke RDS
    const sql = `INSERT INTO uploads (filename, url) VALUES (?, ?)`;
    const values = [req.file.originalname, data.Location];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).send("Upload ke S3 berhasil, tapi gagal simpan ke DB: " + err.message);
      }
      res.send('File berhasil diunggah');
    });
  });
});

app.listen(3000, () => {
  console.log('🚀 Server berjalan di http://localhost:3000');
});
