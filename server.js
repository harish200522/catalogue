import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "50mb" })); // large limit for base64 images

// ── SQLite setup ──────────────────────────────────────────────────────────
const db = new Database(join(__dirname, "inout_catalogue.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    category TEXT    NOT NULL,
    price    REAL    NOT NULL,
    quantity TEXT    NOT NULL,
    images   TEXT    NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// ── Seed products (runs only when table is empty) ─────────────────────────
const productCount = db.prepare("SELECT COUNT(*) as n FROM products").get().n;
if (productCount === 0) {
  const ins = db.prepare(
    "INSERT INTO products (name,category,price,quantity,images) VALUES (?,?,?,?,?)"
  );
  const seedAll = db.transaction(() => {
    // T-Shirts
    ins.run("Essential Crew Neck",    "tshirts", 320, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80"]');
    ins.run("Oversized Relaxed Fit",  "tshirts", 380, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop&q=80"]');
    ins.run("Heavyweight Cotton Tee", "tshirts", 420, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80"]');
    ins.run("Acid Wash Vintage",      "tshirts", 460, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop&q=80"]');
    ins.run("Minimal Logo Tee",       "tshirts", 350, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop&q=80"]');
    // Shirts
    ins.run("Oxford Button Down",   "shirts", 580, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop&q=80"]');
    ins.run("Linen Camp Collar",    "shirts", 640, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop&q=80"]');
    ins.run("Flannel Check Shirt",  "shirts", 520, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=750&fit=crop&q=80"]');
    ins.run("Mandarin Collar Slim", "shirts", 560, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&h=750&fit=crop&q=80"]');
    ins.run("Chambray Work Shirt",  "shirts", 620, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=750&fit=crop&q=80"]');
    // Pants
    ins.run("Relaxed Chino",      "pants", 680, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop&q=80"]');
    ins.run("Wide Leg Trouser",   "pants", 740, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80"]');
    ins.run("Slim Fit Cargo",     "pants", 720, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop&q=80"]');
    ins.run("Straight Leg Denim", "pants", 780, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80"]');
    ins.run("Pleated Wool Pant",  "pants", 860, "MOQ: 20 pcs", '["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=750&fit=crop&q=80"]');
    // Shorts
    ins.run("Classic Bermuda",  "shorts", 420, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop&q=80"]');
    ins.run("Terry Cloth Short","shorts", 380, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop&q=80"]');
    ins.run("Cargo Walk Short", "shorts", 460, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600&h=750&fit=crop&q=80"]');
    ins.run("Linen Beach Short","shorts", 420, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=750&fit=crop&q=80"]');
    ins.run("Athletic Short",   "shorts", 340, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&h=750&fit=crop&q=80"]');
    // Tracks
    ins.run("Slim Jogger",          "tracks", 520, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1580906853149-f4cf09f10b5e?w=600&h=750&fit=crop&q=80"]');
    ins.run("Wide Track Pant",      "tracks", 560, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=750&fit=crop&q=80"]');
    ins.run("French Terry Jogger",  "tracks", 580, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1619603364937-8d2a3dfb3e1d?w=600&h=750&fit=crop&q=80"]');
    ins.run("Tech Fleece Track",    "tracks", 640, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&q=80"]');
    ins.run("Nylon Wind Pant",      "tracks", 540, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&q=80"]');
    // Inners
    ins.run("Classic Crew Brief",    "inners", 120, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=750&fit=crop&q=80"]');
    ins.run("Stretch Cotton Trunk",  "inners", 150, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=750&fit=crop&q=80"]');
    ins.run("Ribbed Vest Undershirt","inners", 140, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=750&fit=crop&q=80"]');
    ins.run("Thermal Base Layer",    "inners", 280, "MOQ: 60 pcs",  '["https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop&q=80"]');
    ins.run("Boxer Long Leg",        "inners", 180, "MOQ: 80 pcs",  '["https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&h=750&fit=crop&q=80"]');
  });
  seedAll();
  console.log("Seeded 30 initial products.");
}

// Seed default settings
const settingsCount = db.prepare("SELECT COUNT(*) as n FROM settings").get().n;
if (settingsCount === 0) {
  db.prepare("INSERT INTO settings (key,value) VALUES (?,?)").run("whatsappNumber", "919791639162");
  db.prepare("INSERT INTO settings (key,value) VALUES (?,?)").run(
    "instagramLink",
    "https://www.instagram.com/inout_fashions_showroom?igsh=MTMyaDlxcGt3MjA4cQ=="
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function parseProduct(row) {
  return { ...row, images: JSON.parse(row.images) };
}

// ── Products API ──────────────────────────────────────────────────────────
app.get("/api/products", (_req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  res.json(rows.map(parseProduct));
});

app.post("/api/products", (req, res) => {
  const { name, category, price, quantity, images = [] } = req.body;
  const r = db
    .prepare("INSERT INTO products (name,category,price,quantity,images) VALUES (?,?,?,?,?)")
    .run(name, category, price, quantity, JSON.stringify(images));
  res.status(201).json(parseProduct(db.prepare("SELECT * FROM products WHERE id=?").get(r.lastInsertRowid)));
});

app.put("/api/products/:id", (req, res) => {
  const { name, category, price, quantity, images = [] } = req.body;
  const { id } = req.params;
  db.prepare("UPDATE products SET name=?,category=?,price=?,quantity=?,images=? WHERE id=?").run(
    name, category, price, quantity, JSON.stringify(images), id
  );
  const row = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(parseProduct(row));
});

app.delete("/api/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Settings API ──────────────────────────────────────────────────────────
app.get("/api/settings", (_req, res) => {
  const rows = db.prepare("SELECT * FROM settings").all();
  const obj = {};
  rows.forEach((r) => { obj[r.key] = r.value; });
  res.json(obj);
});

app.put("/api/settings", (req, res) => {
  const upsert = db.prepare(
    "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
  );
  const upsertAll = db.transaction((entries) => entries.forEach(([k, v]) => upsert.run(k, v)));
  upsertAll(Object.entries(req.body));
  const rows = db.prepare("SELECT * FROM settings").all();
  const obj = {};
  rows.forEach((r) => { obj[r.key] = r.value; });
  res.json(obj);
});

// ── Start ─────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`INOUT Fashion API  →  http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. The API server is likely already running.`);
    process.exit(0); // exit cleanly so concurrently doesn't kill vite
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
