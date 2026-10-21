const path = require('path');
const express = require('express');
const eventosRouter = require('./routes/eventos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'pub')));

app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'index.html'));
});

app.use('/api/eventos', eventosRouter);

app.listen(PORT, () => {
    console.log(`Escuchando en: http://localhost:${PORT}`);
});
