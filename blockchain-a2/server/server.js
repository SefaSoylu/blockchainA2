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

app.listen(PORT, () => {
    console.log(`Key server running at http://localhost:3001`);
});
