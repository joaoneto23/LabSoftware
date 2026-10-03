const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;

const items = [
    { id: 1, name: 'Item1'},
    { id: 2, name: 'Item2'}
];

// GET ////////////////////////////

// GET /api/items
// GET /api/items?name

app.get('/api/items', (req, res) => {
    const {name, sort, order, page, limit } = req.query;

    let result = [...items];

    if (name !== undefined) {
        if(typeof name !== 'string') {
            return res.status(400).type('application/problem+json').json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'Parametro name inválido'
            });
        }
        const term = name.trim().toLowerCase();
        result = result.filter(item => 
            item.name.toLowerCase().includes(term)
        );
    }

    if (sort) {
        if (sort !== 'id' && sort !== 'name') {
            return res.status(400).type('application/problem+json').json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'Parametro sort inválido'
            });
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
            return res.status(400).type('application/problem+json').json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'Parametros de paginação inválidos. Use integer'
            });
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

// GET /api/items/:id

app.get(`/api/items/:id`, (req, res) => {

    // regra para validar o input do id
    // ser obrigatoriamente inteiro; não permitir letras ou caracteres especiais

    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: 'Pedido inválido',
            detail: 'id inválido'
        });
    }

    const id = Number(req.params.id);

    const item = items.find(item => item.id === id);

    // validação de erro de id não existente
    if (!item) {
        return res.status(404).type('application/problem+json').json({
            status: 404,
            title: 'Não Encontrado',
            detail: 'id inexistente'
        })
    }

    res.status(200).json(item);
});


// POST /////////////////////////////////////////

// POST /api/itmes


app.post('/api/items', (req, res) => {

    // {} para dar erro 400 caso o body esteja vazio 
    const { name } = req.body || {};

   if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: 'Operação Inválida',
            detail: 'Campo name é obrigatório e deve ser texto não vazio.'
        });
   }

    const newItem = {
        id: items.length 
        ? Math.max(...items.map(item => item.id)) + 1 
        : 1,
        name: name.trim()
    }

    items.push(newItem);

    res.location('/api/items/' + newItem.id);

    res.status(201).json(newItem);
});

//PUT /////////////////////////////////////

// PUT /api/items/:id

app.put('/api/items/:id', (req, res) => {
    
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: 'Pedido inválido',
            detail: 'id inválido'
        });
    }

    const id = Number(req.params.id);

    const {name} = req.body || {};

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: 'Operação Inválida',
            detail: 'Campo name é obrigatório e deve ser texto não vazio.'
        });
   }


    const item = items.find(item => item.id === id);

    if(!item) {
        return res.status(404).type('application/problem+json').json({
            status: 404,
            title: 'Não encontrado',
            detail: 'Item não encontrado'
        });
    }

    item.name = name.trim();
    res.status(200).json(item);
});

// DELETE

// DELETE /api/items/:id

app.delete('/api/items/:id', (req, res) => {

    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: 'Pedido inválido',
            detail: 'id inválido'
        });
    }

    const id = Number(req.params.id);

    const index = items.findIndex(item => item.id === id);

    if(index === -1) {
        return res.status(404).type('application/problem+json').json({
            status: 404,
            title: 'Não encontrado',
            detail: 'Item não encontrado'
        })
    }

    items.splice(index, 1);

    res.status(204).send();
});


// rota inexistente
app.use((req, res) => {
    return res.status(404).type('application/problem+json').json({
        status: 404,
        title: "Não Encontrado",
        detail: "Rota não existe"
    });
});

// malformatação json ou inesperado
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).type('application/problem+json').json({
            status: 400,
            title: "Pedido Inválido",
            detail: "JSON malformatado"
        });
    }

    console.error(err);
    return res.status(500).type('application/problem+json').json({
        status: 500,
        title: "Erro inesperado",
        detail: "Erro interno"
    })
});

app.listen(PORT, () => {
    console.log(`API a executar em http://localhost:${PORT}`);
});