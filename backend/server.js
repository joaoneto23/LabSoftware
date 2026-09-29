const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;

const items = [
    { id: 1, name: 'Item1'},
    { id: 2, name: 'Item2'}
];

app.get('/api/items', (req, res) => {
    const {name, sort, order, page, limit } = req.query;

    let result = [...items];

    if (name !== undefined) {
        if(typeof name !== 'string') {
            return res.status(400).json({error: 'Parametro name invalido'});
        }
        const term = name.trim().toLowerCase();
        result = result.filter(item => 
            item.name.toLowerCase().includes(term)
        );
    }

    if (sort) {
        if (sort !== 'id' && sort !== 'name') {
            return res.status(400).json({error: "Parametro sort invalido"});
        }
        const orderDir = (order && order.toLowerCase() === 'desc') ? -1 : 1;
        result.sort((a, b) => {
            if (a[sort] < b[sort]) return -1 * orderDir;
            if (a[sort] > b[sort]) return 1 * orderDir;
            return 0;
        });
    }

    if (page !== undefined || limit !== undefined) {
        const pageNum = Number(page || 1);
        const limitNum = Number(limit || 10);

        if (!Number.isInteger(pageNum) || pageNum < 1 || !Number.isInteger(limitNum) || limitNum < 1) {
            return res.status(400).json({error: "Parametros de paginação invalidos. Use integer"});
        }

        const total = result.length;
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedItems = result.slice(startIndex, startIndex + limitNum);

        return res.status(200).json({
            page: pageNum,
            limit: limitNum,
            total,
            items: paginatedItems
        });
    }

    res.json(result);
});

app.get(`/api/items/:id`, (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'id invalido'
        });
    }

    const item = items.find(item => item.id === id);

    res.status(200).json(item);
});

app.post('/api/items', (req, res) => {
    const { name } = req.body;

   if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({error: 'name é obrigatorio e deve ser texto nao vazio'});
   }

    const newItem = {
        id: items.length 
        ? Math.max(...items.map(item => item.id)) + 1 
        : 1,
        name: name.trim()
    }

    items.push(newItem);

    res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const item = items.find(item => item.id === id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'id invalido'
        });
    }

    if(!item) {
        return res.status(404).json({ error: "Item não encontrado"});
    }

    const {name} = req.body;
    if(!name) {
        return res.status(400).json({ error: 'O campo Name é obrigatório'});
    }

    if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({error: 'name é obrigatorio e deve ser texto nao vazio'});
   }

    item.name = name.trim();
    res.status(200).json(items);
});

app.delete('/api/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = items.findIndex(item => item.id === id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'id invalido'
        });
    }

    if(index === -1) {
        return res.status(404).json({ error: "Item não encontrado"});
    }

    items.splice(index, 1);

    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`API a executar em http://localhost:${PORT}`);
});