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
    
    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
}

export { generateKeys };
