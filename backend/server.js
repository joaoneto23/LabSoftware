const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;

const items = [
    { id: 1, name: 'Item1'},
    { id: 2, name: 'Item2'}
];

app.get('/api/items', (req, res) => {
    res.json(items);
});

app.get(`/api/items/:id`, (req, res) => {
    const id = Number(req.params.id);
    const item = items.find(item => item.id === id);

    if(!item) {
        return res.status(404).json({ error: 'Item não encontrado'});
    }

    res.json(item);
});

app.post('/api/items', (req, res) => {
    const { name } = req.body;

    if(!name) {
        return res.status(400).json({ error: 'O campo Name é obrigatório'});
    }

    const newItem = {
        id: items.length ? Math.max(...items.map(item => item.id)) + 1 : 1,
        name
    }

    items.push(newItem);

    res.status(201).json(newItem);
});

app.listen(PORT, () => {
    console.log(`API a executar em http://localhost:${PORT}`);
});