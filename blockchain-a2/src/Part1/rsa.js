import MD5 from 'crypto-js/md5';

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

function modPow(base, exp, mod) {
    base = BigInt(base) % BigInt(mod);  // Ensure base is BigInt and handle modulus
    exp = BigInt(exp); // Ensure exp is BigInt
    mod = BigInt(mod); // Ensure mod is BigInt
    
    let result = 1n; // Initialize result
    while (exp > 0n) {
        // If exp is odd, multiply base with the result
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        // Now exp must be even
        exp = exp / 2n;  // Divide exp by 2
        base = (base * base) % mod;  // Square the base
    }
    return result;
}


function generateMD5Hash(data) {
    return MD5(data).toString(); // Returns the MD5 hash as a string
  }

function signRecord(privateKey, record) {
    const recordStr = JSON.stringify(record);   // Serialize the record
    const recordHash = generateMD5Hash(recordStr); // Hash the record (still a string)
    
    // Convert the MD5 hash string to BigInt
    const recordHashBigInt = BigInt('0x' + recordHash);  // Ensure it's a valid hex string
    
    console.log('Record Hash BigInt:', recordHashBigInt); // Log hash to check value
    console.log('Private Key d:', privateKey.d); // Log private key to check its value
    
    // Use modPow to sign the record
    const signature = modPow(recordHashBigInt, privateKey.d, privateKey.n); 
    
    console.log('Signature:', signature); // Log the signature result
    
    return signature;
}

  

export { generateKeys, signRecord };
