// server.js (outside src/)
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

const { generateKeys, invLocation } = require('../src/Part1/rsa'); // Make a backend copy

app.use(express.json());

function serializeKey(key) {
    return Object.fromEntries(
        Object.entries(key).map(([k, v]) => [k, v.toString()])
    );
}

app.post('/api/generateKeys', (req, res) => {
    const { location } = req.body;
    const { p, q, e } = invLocation(location);
    const { publicKey, privateKey } = generateKeys(BigInt(p), BigInt(q), BigInt(e));
    const serializedPublicKey = serializeKey(publicKey);
    const serializedPrivateKey = serializeKey(privateKey);

    const keyDir = path.join(__dirname, '../src');
    const keyPath = path.join(keyDir, `Inventory${location}KeyPair.json`);

    let data = {};
    if (fs.existsSync(keyPath)) {
        const raw = fs.readFileSync(keyPath, 'utf-8');
        data = JSON.parse(raw);
    }

    // Ensure the location exists in the file already
    if (!data[`Inv${location}`]) {
        data[`Inv${location}`] = { p, q, e }; // fallback if missing
    }

    // Add keyPair to the existing InvX object
    data[`Inv${location}`].keyPair = {
        publicKey: serializedPublicKey,
        privateKey: serializedPrivateKey
    };

    // Write updated content back to file
    fs.writeFileSync(keyPath, JSON.stringify(data, null, 2));

    res.json({ publicKey: serializedPublicKey, privateKey: serializedPrivateKey });
});

app.post('/api/addToDatabase', (req, res) => {
    console.log(req.body);
    const {id, qty, price, location } = req.body.item;
    console.log(id);
    const keyDir = path.join(__dirname, '../src');
    const inventories = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < inventories.length; i++){
        console.log(i);
        const keyPath = path.join(keyDir, `Inventory${inventories[i]}.json`);
        console.log(keyPath);

        let data = {};
        if (fs.existsSync(keyPath)) {
            const raw = fs.readFileSync(keyPath, 'utf-8');
            data = JSON.parse(raw);
        }

        if (!Array.isArray(data)) {
            data = [];
        }

        // Check if item exists
        const existingIndex = data.findIndex(item => item.id === id);
        if (existingIndex !== -1) {
            // Update existing item
            data[existingIndex] = { id, qty, price, location };
        } else {
            // Add new item
            data.push({ id, qty, price, location });
        }

        fs.writeFileSync(keyPath, JSON.stringify(data, null, 2));
    }
    res.json({message: 'Succesffuly added to all Inventories'});
});

app.listen(PORT, () => {
    console.log(`Key server running at http://localhost:3001`);
});
