const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
dotenv.config();
//to deploy main server file (app.js or server.js)
const helmet = require('helmet');
const compression = require('compression');
// Use Helmet for security headers
app.use(helmet());
app.use(compression());


// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI  , { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Item Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true }
});
const Item = mongoose.model("Item", itemSchema);

// Default items
const defaultItems = [
  { name: 'I will study database' },
  { name: 'I will recite Holy Quran' },
  { name: 'I always study' }
];

// Insert default items only if the collection is empty
async function insertDefaults() {
  try {
    const count = await Item.countDocuments();
    if (count === 0) {
      await Item.insertMany(defaultItems);
      console.log("Default items inserted!");
    }
  } catch (err) {
    console.error("Error inserting defaults:", err);
  }
}
insertDefaults();

// Handle GET request
app.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    const today = new Date().toLocaleDateString();
    res.render('list', { theDay: today, newitems: items });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle POST request to add new items
app.post('/', async (req, res) => {
  const itemName = req.body.adding;
  const newItem = new Item({ name: itemName });

  try {
    await newItem.save();
    res.redirect('/');
  } catch (err) {
    console.error("Error saving new item:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle DELETE request
app.post('/delete/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    await Item.findByIdAndDelete(itemId);
    res.redirect('/');
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle UPDATE request
app.post('/update/:id', async (req, res) => {
  const itemId = req.params.id;
  const newName = req.body.newName;

  try {
    await Item.findByIdAndUpdate(itemId, { name: newName }, { new: true });
    res.redirect('/');
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});