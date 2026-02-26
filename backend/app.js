const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

//middleware
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

//логирование запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

//база данных товаров
let products = [
    { id: nanoid(6), name: 'Ноутбук', category: 'Электроника', description: 'Мощный ноутбук для работы', price: 50000, quantity: 10, rating: 4.5 },
    { id: nanoid(6), name: 'Мышь', category: 'Электроника', description: 'Беспроводная мышь', price: 1500, quantity: 50, rating: 4.2 },
    { id: nanoid(6), name: 'Клавиатура', category: 'Электроника', description: 'Механическая клавиатура', price: 3000, quantity: 30, rating: 4.7 },
    { id: nanoid(6), name: 'Монитор', category: 'Электроника', description: '27 дюймов, 4K', price: 25000, quantity: 15, rating: 4.6 },
    { id: nanoid(6), name: 'Наушники', category: 'Аудио', description: 'Беспроводные наушники', price: 5000, quantity: 40, rating: 4.3 },
    { id: nanoid(6), name: 'Веб-камера', category: 'Электроника', description: 'Full HD 1080p', price: 3500, quantity: 25, rating: 4.1 },
    { id: nanoid(6), name: 'USB-хаб', category: 'Аксессуары', description: '4 порта USB 3.0', price: 1000, quantity: 60, rating: 4.0 },
    { id: nanoid(6), name: 'Коврик для мыши', category: 'Аксессуары', description: 'Большой игровой коврик', price: 800, quantity: 100, rating: 4.4 },
    { id: nanoid(6), name: 'Зарядное устройство', category: 'Аксессуары', description: 'Быстрая зарядка 65W', price: 2000, quantity: 45, rating: 4.5 },
    { id: nanoid(6), name: 'Кабель HDMI', category: 'Аксессуары', description: '2 метра, 4K поддержка', price: 500, quantity: 80, rating: 4.2 }
];

//функция-помощник для поиска товара
function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}

//CRUD операции

//создать товара
app.post('/api/products', (req, res) => {
    const { name, category, description, price, quantity, rating } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: "Название и цена обязательны" });
    }
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category || 'Разное',
        description: description || '',
        price: Number(price),
        quantity: Number(quantity) || 0,
        rating: Number(rating) || 0
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

//получить все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

//получить товар по ID
app.get('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

//обновить товар
app.patch('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    
    const { name, category, description, price, quantity, rating } = req.body;
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (rating !== undefined) product.rating = Number(rating);
    
    res.json(product);
});

//удалить товар
app.delete('/api/products/:id', (req, res) => {
    const exists = products.some(p => p.id === req.params.id);
    if (!exists) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

//404 для остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

//глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`🚀 Бэкенд запущен на http://localhost:${port}`);
});