const {PKG, InventoryA, InventoryB, InventoryC, InventoryD} = require('../PKG.json');
const {InvA} = require('../InventoryAKeyPair.json');
const {InvB} = require('../InventoryBKeyPair.json');
const {InvC} = require('../InventoryCKeyPair.json');
const {InvD} = require('../InventoryDKeyPair.json');
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

function mod(a, b, mod) {
    return BigInt(a) * BigInt(b) % BigInt(mod);
}

function generateMD5Hash(data) {
    return MD5(data).toString(); 
  }

function generatePKG(){
    //const {p, q, e} = PKG;
    //console.log(p, q, e);

    const p = BigInt(PKG.p);
    const q = BigInt(PKG.q);
    const e = BigInt(PKG.e);
    
    const n = p * q;
    console.log("n: ", n);
    const phi = (p - 1n) * (q - 1n);
    const d = modinv(e, phi);
    return {
        publicKey: {e, n},
        privateKey: {d, n}
    };
}

function generateKeys(p, q, e) {
    p = BigInt(p); 
    q = BigInt(q);
    e = BigInt(e); 

    console.log(e);
    
    const n = p * q; 
    const phi = (p - 1n) * (q - 1n); 
    const d = modinv(e, phi); 
    console.log('N: ', n);
    return {
        publicKey: { e, n },
        privateKey: { d, n },
    };
}

function createSecretKeys(privatePKG){
    console.log(PKG);
    const secretKeyA = modPow(BigInt(InvA.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyB = modPow(BigInt(InvB.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyC = modPow(BigInt(InvC.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyD = modPow(BigInt(InvD.id), BigInt(privatePKG.d), BigInt(privatePKG.n));

    return{
        secretKeyA: secretKeyA,
        secretKeyB: secretKeyB,
        secretKeyC: secretKeyC,
        secretKeyD: secretKeyD
    }
}

function createT(publicPKG, loc){
    let currInv = '';
    if (loc === 'A'){
        currInv = InvA;
    }else if (loc === 'B'){
        currInv = InvB;
    }else if (loc === 'C'){
        currInv = InvC;
    }else if(loc === 'D'){
        currInv = InvD;
    }
    const t_A = currInv.t_A;
    const t_B = currInv.t_B;
    const t_C = currInv.t_C;
    const t_D = currInv.t_D;

    console.log("t_A", t_A);
    console.log("t_B", t_B);
    console.log("t_C", t_C);
    console.log("t_D", t_D);
    let t1 = mod(t_A, t_B, publicPKG.n);
    let t2 = mod(t1, t_C, publicPKG.n);
    let t = mod(t2, t_D, publicPKG.n);
    return t;
}

function createS(s_A, s_B, s_C, s_D, n) {
    const s1 = mod(s_A, s_B, n);
    const s2 = mod(s1, s_C, n);
    const s = mod(s2, s_D, n);
    return s;
}
module.exports = {
    generatePKG, createSecretKeys, createT, generateMD5Hash, modPow, mod, generateKeys, createS
}