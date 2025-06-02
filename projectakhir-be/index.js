import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Set view engine
app.set('view engine', 'ejs'); // Mengatur EJS sebagai engine template
app.set('views', path.join(__dirname, 'views')); // Mengatur direktori views

app.get("/", (req, res) => {
  res.render("index"); // Pastikan file index.ejs ada di dalam folder views
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});