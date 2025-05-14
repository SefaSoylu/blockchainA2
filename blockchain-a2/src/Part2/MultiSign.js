const {PKG, InventoryA, InventoryB, InventoryC, InventoryD} = require('../PKG.json');
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
    return a * b % mod;
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

function createSecretKeys(privatePKG){
    console.log(PKG);
    const secretKeyA = modPow(BigInt(InventoryA.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyB = modPow(BigInt(InventoryB.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyC = modPow(BigInt(InventoryC.id), BigInt(privatePKG.d), BigInt(privatePKG.n));
    const secretKeyD = modPow(BigInt(InventoryD.id), BigInt(privatePKG.d), BigInt(privatePKG.n));

    return{
        secretKeyA: secretKeyA,
        secretKeyB: secretKeyB,
        secretKeyC: secretKeyC,
        secretKeyD: secretKeyD
    }
}

function createT(publicPKG){
    const t_A = modPow(BigInt(InventoryA.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
    const t_B = modPow(BigInt(InventoryB.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
    const t_C = modPow(BigInt(InventoryC.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
    const t_D = modPow(BigInt(InventoryD.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));

    console.log("t_A", t_A);
    console.log("t_B", t_B);
    console.log("t_C", t_C);
    console.log("t_D", t_D);
    let t1 = mod(t_A, t_B, publicPKG.n);
    let t2 = mod(t1, t_C, publicPKG.n);
    let t = mod(t2, t_D, publicPKG.n);
    return t;
}
module.exports = {
    generatePKG, createSecretKeys, createT, generateMD5Hash, modPow, mod
}