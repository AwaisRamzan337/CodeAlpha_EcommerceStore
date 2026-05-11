const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'codealpha-secret',
    resave: false,
    saveUninitialized: false
}));

// ===== PAGES =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/orders', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

app.get('/checkout', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wishlist.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== AUTH APIs =====
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    try {
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);
        res.json({ success: true, message: 'Registered successfully!' });
    } catch {
        res.json({ success: false, message: 'Username already exists!' });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false, message: 'Wrong username or password!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username, role: req.session.user.role });
    } else {
        res.json({ loggedIn: false });
    }
});

// ===== PRODUCTS APIs =====
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

app.post('/api/products', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.json({ success: false, message: 'Unauthorized!' });
    }
    const { name, price, description, image, category } = req.body;
    db.prepare('INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)')
      .run(name, price, description, image, category);
    res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.json({ success: false, message: 'Unauthorized!' });
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ===== ORDERS APIs =====
app.post('/api/orders', (req, res) => {
    if (!req.session.user) return res.json({ success: false, message: 'Login karo pehle!' });
    const { items } = req.body;
    const date = new Date().toLocaleDateString();
    items.forEach(item => {
        db.prepare('INSERT INTO orders (user_id, product_name, total, date) VALUES (?, ?, ?, ?)')
          .run(req.session.user.id, item.name, item.price, date);
    });
    res.json({ success: true, message: 'Order placed successfully!' });
});

app.get('/api/orders', (req, res) => {
    if (!req.session.user) return res.json({ success: false });
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.session.user.id);
    res.json(orders);
});

// ===== ADMIN APIs =====
app.get('/api/admin/orders', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.json([]);
    }
    const orders = db.prepare('SELECT * FROM orders').all();
    res.json(orders);
});

app.get('/api/admin/users', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.json([]);
    }
    const users = db.prepare('SELECT id, username, role FROM users').all();
    res.json(users);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});