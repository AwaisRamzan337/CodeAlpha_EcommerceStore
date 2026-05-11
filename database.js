const Database = require('better-sqlite3');
const db = new Database('store.db');

// Tables banao
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    category TEXT DEFAULT 'Electronics'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Processing'
  );
`);

// Sample products
const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (count.c === 0) {
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Laptop', 999, 'Powerful laptop for work and gaming', '💻', 'Electronics');
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Phone', 499, 'Latest smartphone with best camera', '📱', 'Electronics');
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Headphones', 149, 'Noise cancelling wireless headphones', '🎧', 'Accessories');
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Smart Watch', 299, 'Track fitness and notifications', '⌚', 'Wearables');
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Tablet', 599, 'Perfect for work and entertainment', '📟', 'Electronics');
    db.prepare(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`).run('Earbuds', 89, 'True wireless earbuds with deep bass', '🎵', 'Accessories');
}

module.exports = db;