const { InvA } = require('../InventoryAKeyPair.json');
const { InvB }= require('../InventoryBKeyPair.json');
const  { InvC } = require('../InventoryCKeyPair.json');
const  { InvD } = require('../InventoryDKeyPair.json');
const MD5 = require('crypto-js/md5');

function egcd(a, b) {
    a = BigInt(a); 
    b = BigInt(b); 
    if (a === 0n) return [b, 0n, 1n]; 
    const [g, y, x] = egcd(b % a, a);
    return [g, x - (b / a) * y, y];
}

function modinv(a, m) {
    a = BigInt(a); 
    m = BigInt(m); 
    const [g, x] = egcd(a, m);
    if (g !== 1n) { 
        throw new Error('Modular inverse does not exist');
    } else {
        return (x % m + m) % m;
    }
}

function generateKeys(p, q, e) {
    p = BigInt(p); 
    q = BigInt(q);
    e = BigInt(e); 
    
    const n = p * q; 
    const phi = (p - 1n) * (q - 1n); 
    const d = modinv(e, phi); 
    console.log('N: ', n);
    return {
        publicKey: { e, n },
        privateKey: { d, n },
    };
}

function modPow(base, exp, mod) {
    base = BigInt(base) % BigInt(mod);  
    exp = BigInt(exp); 
    mod = BigInt(mod); 
    
    let result = 1n; 
    while (exp > 0n) {
        
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        
        exp = exp / 2n;  
        base = (base * base) % mod;  
    }
    return result;
}


function generateMD5Hash(data) {
    return MD5(data).toString(); 
  }

function signRecord(privateKey, record) {
    //const recordStr = JSON.stringify(record);   
    const recordHash = generateMD5Hash(record);
    
    // Convert the MD5 hash string to decimal
    const recordDec = BigInt("0x" + recordHash);
    const recordHashBigInt = BigInt(recordDec);  
    
    console.log('Record Hash BigInt:', recordHashBigInt); 
    
    // Use modPow to sign the record
    const signature = modPow(recordHashBigInt, privateKey.d, privateKey.n); 
    
    console.log('Signature:', signature); 
    
    return signature;
}

function verify(message, signature, senderLocation) {
    const inventoryList = ['A', 'B', 'C', 'D'];
    const verifiedBy = [];

    const senderKey = recieveKeyPair(senderLocation);

    for (let i = 0; i < inventoryList.length; i++) {
        const verifier = inventoryList[i];
        if (verifier !== senderLocation) {
            const recordVerify = modPow(signature, senderKey.publicKey.e, senderKey.publicKey.n);
            if (recordVerify === message) {
                verifiedBy.push(verifier);
            }
        }
    }

    return verifiedBy; // return list of successful verifiers
}

function invLocation(location){
    if (location === 'A'){
        const {p, q, e } = InvA;
        console.log('Received values from invLocation in RSA:', { p, q, e });
        return {p, q, e};
    }
    if (location === 'B'){
        const {p, q, e } = InvB;
        return {p, q, e};
    }
    if (location === 'C'){
        const {p, q, e } = InvC;
        return {p, q, e};
    }
    if (location === 'D'){
        const {p, q, e } = InvD;
        return {p, q, e};
    }
}

  function recieveKeyPair(location){
    if (location === 'A'){
        return InvA.keyPair;
    }
    if (location === 'B'){
        return InvB.keyPair;
    }
    if (location === 'C'){
        return InvC.keyPair;
    }
    if (location === 'D'){
        return InvD.keyPair;
    }
  }

module.exports = {
    generateKeys,
    modinv,
    signRecord,
    verify,
    generateMD5Hash,
    invLocation, 
    modPow
  };
