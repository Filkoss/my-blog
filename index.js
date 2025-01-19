require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Nastavení EJS pro šablony
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Umožní číst data z formulářů (POST)
app.use(express.urlencoded({ extended: true }));

// Servírovat statické soubory (např. /public/index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Vytvoříme pool pro připojení k DB
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// GET /posts – výpis příspěvků
app.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.render('posts', { posts: rows });
  } catch (err) {
    console.error(err);
    res.send('Chyba při načítání příspěvků');
  }
});

// POST /posts – vložení nového příspěvku
app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  try {
    await pool.query(
      'INSERT INTO posts (title, content, created_at) VALUES (?, ?, NOW())',
      [title, content]
    );
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.send('Chyba při ukládání příspěvku');
  }
});

app.listen(3000, () => {
  console.log('Server běží na portu 3000');
});
