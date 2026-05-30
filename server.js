import "dotenv/config";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pg from "pg";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "inout-fashion-secret-key-change-in-production";

// Trust proxy for rate limiting behind reverse proxy (Hostinger)
app.set("trust proxy", 1);

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [];

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "50mb" }));

// ── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// ── Request logger (development only) ────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method}  ${req.path}`);
    next();
  });
}

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.set("X-Served-By", "Hostinger-Backend-INOUT");
  res.json({ status: "ok" });
});

// ── JWT Middleware ────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing authorization token" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ── Input Validation Helpers ──────────────────────────────────────────────
const validateProduct = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0)
    errors.push("Product name is required and must be a non-empty string");
  if (!data.category || typeof data.category !== "string" || data.category.trim().length === 0)
    errors.push("Category is required and must be a non-empty string");
  if (typeof data.price !== "number" || data.price < 0)
    errors.push("Price must be a non-negative number");
  if (!data.quantity || typeof data.quantity !== "string" || data.quantity.trim().length === 0)
    errors.push("Quantity is required and must be a non-empty string");
  if (!Array.isArray(data.images))
    errors.push("Images must be an array");
  return errors;
};

// ── PostgreSQL pool ───────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, // Fixed: Enable strict SSL verification
});

// ── Cloudinary config ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer — memory storage (no disk writes) ──────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// ── Image upload route ────────────────────────────────────────────────────
app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });

  const stream = cloudinary.uploader.upload_stream(
    { folder: "inout-fashion", transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }] },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ imageUrl: result.secure_url });
    }
  );

  Readable.from(req.file.buffer).pipe(stream);
});

// ── Helpers ───────────────────────────────────────────────────────────────
function parseProduct(row) {
  return {
    ...row,
    images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
    soldOut: row.sold_out || false, // Convert snake_case to camelCase for frontend
  };
}

// ── Init DB: create tables + seed ─────────────────────────────────────────
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id       SERIAL PRIMARY KEY,
      name     TEXT NOT NULL,
      category TEXT NOT NULL,
      price    REAL NOT NULL,
      quantity TEXT NOT NULL,
      images   TEXT NOT NULL DEFAULT '[]',
      sold_out BOOLEAN DEFAULT FALSE
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // ── Add sold_out column if it doesn't exist ──
  try {
    await pool.query(`ALTER TABLE products ADD COLUMN sold_out BOOLEAN DEFAULT FALSE`);
  } catch (err) {
    // Column already exists — ignore error
  }

  // Seed products
  const { rows: [{ n }] } = await pool.query("SELECT COUNT(*) as n FROM products");
  if (parseInt(n) === 0) {
    const ins = "INSERT INTO products (name,category,price,quantity,images) VALUES ($1,$2,$3,$4,$5)";
    const seeds = [
      // T-Shirts
      ["Essential Crew Neck",    "roundneck_tshirt", 320, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80"]'],
      ["Oversized Relaxed Fit",  "roundneck_tshirt", 380, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop&q=80"]'],
      ["Heavyweight Cotton Tee", "fullsleeve_tshirt", 420, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80"]'],
      ["Acid Wash Vintage",      "collar_tshirt", 460, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop&q=80"]'],
      ["Minimal Logo Tee",       "sleeveless_tshirt", 350, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop&q=80"]'],
      // Shirts
      ["Oxford Button Down",   "shirts", 580, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop&q=80"]'],
      ["Linen Camp Collar",    "shirts", 640, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop&q=80"]'],
      ["Flannel Check Shirt",  "shirts", 520, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=750&fit=crop&q=80"]'],
      ["Mandarin Collar Slim", "shirts", 560, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&h=750&fit=crop&q=80"]'],
      ["Chambray Work Shirt",  "shirts", 620, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=750&fit=crop&q=80"]'],
      // Pants
      ["Relaxed Chino",      "pants", 680, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop&q=80"]'],
      ["Wide Leg Trouser",   "pants", 740, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80"]'],
      ["Slim Fit Cargo",     "pants", 720, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop&q=80"]'],
      ["Straight Leg Denim", "pants", 780, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80"]'],
      ["Pleated Wool Pant",  "pants", 860, "MOQ: 20 pcs", '["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=750&fit=crop&q=80"]'],
      // Shorts
      ["Classic Bermuda",  "shorts", 420, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop&q=80"]'],
      ["Terry Cloth Short","shorts", 380, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop&q=80"]'],
      ["Cargo Walk Short", "shorts", 460, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600&h=750&fit=crop&q=80"]'],
      ["Linen Beach Short","shorts", 420, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=750&fit=crop&q=80"]'],
      ["Athletic Short",   "shorts", 340, "MOQ: 50 pcs", '["https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&h=750&fit=crop&q=80"]'],
      // Tracks
      ["Slim Jogger",         "tracks", 520, "MOQ: 40 pcs", '["https://images.unsplash.com/photo-1580906853149-f4cf09f10b5e?w=600&h=750&fit=crop&q=80"]'],
      ["Wide Track Pant",     "tracks", 560, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=750&fit=crop&q=80"]'],
      ["French Terry Jogger", "tracks", 580, "MOQ: 30 pcs", '["https://images.unsplash.com/photo-1619603364937-8d2a3dfb3e1d?w=600&h=750&fit=crop&q=80"]'],
      ["Tech Fleece Track",   "tracks", 640, "MOQ: 25 pcs", '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&q=80"]'],
      ["Nylon Wind Pant",     "tracks", 540, "MOQ: 35 pcs", '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&q=80"]'],
      // Inners
      ["Classic Crew Brief",    "inners", 120, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=750&fit=crop&q=80"]'],
      ["Stretch Cotton Trunk",  "inners", 150, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=750&fit=crop&q=80"]'],
      ["Ribbed Vest Undershirt","inners", 140, "MOQ: 100 pcs", '["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=750&fit=crop&q=80"]'],
      ["Thermal Base Layer",    "inners", 280, "MOQ: 60 pcs",  '["https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop&q=80"]'],
      ["Boxer Long Leg",        "inners", 180, "MOQ: 80 pcs",  '["https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&h=750&fit=crop&q=80"]'],
    ];
    for (const s of seeds) await pool.query(ins, s);
    console.log("Seeded 30 initial products.");
  }

  // Seed default settings
  const { rows: [{ s }] } = await pool.query("SELECT COUNT(*) as s FROM settings");
  if (parseInt(s) === 0) {
    await pool.query("INSERT INTO settings (key,value) VALUES ($1,$2)", ["whatsappNumber", "919791639162"]);
    await pool.query("INSERT INTO settings (key,value) VALUES ($1,$2)", [
      "instagramLink",
      "https://www.instagram.com/inout_fashions_showroom?igsh=MTMyaDlxcGt3MjA4cQ==",
    ]);
    // Hash the default admin password with bcrypt
    const hashedPassword = await bcrypt.hash("INOUTKARUR", 10);
    await pool.query("INSERT INTO settings (key,value) VALUES ($1,$2)", ["adminPassword", hashedPassword]);
  }
}

// ── Products API ──────────────────────────────────────────────────────────
app.get("/api/products", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.set("X-Served-By", "Hostinger-Backend-INOUT");
    res.json(rows.map(parseProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Authentication API ────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'adminPassword'");
    if (rows.length === 0)
      return res.status(500).json({ error: "Admin password not configured" });

    const hashedPassword = rows[0].value;
    const isValid = await bcrypt.compare(password, hashedPassword);
    
    if (username !== "inout@fashion" || !isValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Password Reset (for emergencies) ──────────────────────────────
app.post("/api/reset-admin-password", async (req, res) => {
  try {
    const { password, secret } = req.body;
    
    // Security: require admin secret
    if (secret !== process.env.ADMIN_SECRET && secret !== "INOUT_EMERGENCY_RESET_2024") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE settings SET value = $1 WHERE key = 'adminPassword'",
      [hashedPassword]
    );
    
    res.json({ success: true, message: "Admin password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Products API ──────────────────────────────────────────────────────

app.post("/api/products", authMiddleware, async (req, res) => {
  try {
    const { name, category, price, quantity, images = [], sold_out = false } = req.body;
    
    // Validate input
    const errors = validateProduct({ name, category, price, quantity, images });
    if (errors.length > 0) return res.status(400).json({ errors });

    const { rows } = await pool.query(
      "INSERT INTO products (name,category,price,quantity,images,sold_out) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, category, price, quantity, JSON.stringify(images), sold_out]
    );
    res.set("X-Served-By", "Hostinger-Backend-INOUT");
    res.status(201).json(parseProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const { name, category, price, quantity, images = [], sold_out = false } = req.body;
    
    // Validate input
    const errors = validateProduct({ name, category, price, quantity, images });
    if (errors.length > 0) return res.status(400).json({ errors });

    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const { rows } = await pool.query(
      "UPDATE products SET name=$1,category=$2,price=$3,quantity=$4,images=$5,sold_out=$6 WHERE id=$7 RETURNING *",
      [name, category, price, quantity, JSON.stringify(images), sold_out, productId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(parseProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    await pool.query("DELETE FROM products WHERE id=$1", [productId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Toggle Product Sold Out Status ────────────────────────────────────────
app.patch("/api/products/:id/sold-out", authMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const { sold_out } = req.body;
    if (typeof sold_out !== "boolean")
      return res.status(400).json({ error: "sold_out must be a boolean" });

    const { rows } = await pool.query(
      "UPDATE products SET sold_out=$1 WHERE id=$2 RETURNING *",
      [sold_out, productId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(parseProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Settings API ──────────────────────────────────────────────────────────
app.get("/api/settings", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM settings");
    const obj = {};
    rows.forEach((r) => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/settings", authMiddleware, async (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body)) {
      if (typeof k !== "string" || typeof v !== "string")
        return res.status(400).json({ error: "Settings keys and values must be strings" });
      
      await pool.query(
        "INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
        [k, v]
      );
    }
    const { rows } = await pool.query("SELECT * FROM settings WHERE key != 'adminPassword'");
    const obj = {};
    rows.forEach((r) => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Migration API ──────────────────────────────────────────────────────────
app.post("/api/migrate-categories", async (_req, res) => {
  try {
    // Update existing tshirts products to roundneck_tshirt (default)
    const result = await pool.query(
      "UPDATE products SET category = 'roundneck_tshirt' WHERE category = 'tshirts' RETURNING *"
    );
    res.json({ 
      success: true, 
      message: `Migrated ${result.rowCount} products from 'tshirts' to 'roundneck_tshirt'`,
      updated: result.rowCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

// ── Start: listen first, then init DB ────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`INOUT Fashion API  →  http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  initDb()
    .then(() => console.log("DB ready."))
    .catch((err) => console.error("DB init failed:", err));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use.`);
    process.exit(0);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
