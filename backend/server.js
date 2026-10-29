require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const origins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
app.use(cors({ origin: origins.includes("*") ? "*" : origins }));
app.use(express.json());

const foodSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: [true, "foodId là bắt buộc"], unique: true, trim: true },
    name: { type: String, required: [true, "name là bắt buộc"], trim: true },
    category: { type: String, required: [true, "category là bắt buộc"], trim: true },
    cuisine: { type: String, required: [true, "cuisine là bắt buộc"], trim: true },
    ingredients: { type: [String], default: [] },
    price: { type: Number, required: [true, "price là bắt buộc"], min: [0, "price phải >= 0"] },
    quantity: { type: Number, required: [true, "quantity là bắt buộc"], min: [0, "quantity phải >= 0"] },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);
const Food = mongoose.model("Food", foodSchema, "foods");

// bỏ dấu tiếng Việt, chữ thường: "Phở" -> "pho"
const strip = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const normalize = (body) => {
  const data = { ...body };
  if (typeof data.ingredients === "string")
    data.ingredients = data.ingredients.split(",").map((s) => s.trim()).filter(Boolean);
  return data;
};

const handleError = (err, res) => {
  if (err.name === "ValidationError")
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  if (err.code === 11000) return res.status(409).json({ message: "foodId đã tồn tại" });
  console.error(err);
  return res.status(500).json({ message: "Lỗi máy chủ" });
};

app.get("/health", (req, res) =>
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

// các API cần DB, nếu mất kết nối thì trả 503
app.use("/api", (req, res, next) =>
  mongoose.connection.readyState === 1
    ? next()
    : res.status(503).json({ message: "Không kết nối được cơ sở dữ liệu" })
);

app.get("/api/foods", async (req, res) => {
  try {
    let foods = await Food.find().sort({ foodId: 1 });
    if (req.query.search) {
      const q = strip(req.query.search);
      foods = foods.filter((f) => [f.name, f.category, f.cuisine].some((v) => strip(v).includes(q)));
    }
    res.json(foods);
  } catch (err) { handleError(err, res); }
});

app.get("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findOne({ foodId: req.params.id });
    if (!food) return res.status(404).json({ message: "Không tìm thấy món ăn" });
    res.json(food);
  } catch (err) { handleError(err, res); }
});

app.post("/api/foods", async (req, res) => {
  try {
    const data = normalize(req.body);
    if (data.foodId && (await Food.exists({ foodId: String(data.foodId).trim() })))
      return res.status(409).json({ message: "foodId đã tồn tại" });
    res.status(201).json(await Food.create(data));
  } catch (err) { handleError(err, res); }
});

app.put("/api/foods/:id", async (req, res) => {
  try {
    const data = normalize(req.body);
    delete data.foodId; // không cho đổi mã món
    const food = await Food.findOneAndUpdate({ foodId: req.params.id }, data, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Không tìm thấy món ăn" });
    res.json(food);
  } catch (err) { handleError(err, res); }
});

app.delete("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({ foodId: req.params.id });
    if (!food) return res.status(404).json({ message: "Không tìm thấy món ăn" });
    res.json({ message: "Đã xóa món ăn" });
  } catch (err) { handleError(err, res); }
});

app.use((req, res) => res.status(404).json({ message: "Không tìm thấy đường dẫn" }));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err.message));
app.listen(PORT, () => console.log(`Backend chạy tại cổng ${PORT}`));