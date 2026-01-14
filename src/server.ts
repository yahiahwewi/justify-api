import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
});
