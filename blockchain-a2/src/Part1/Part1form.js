import { useState, useEffect } from 'react';
const { modinv, signRecord, verify, generateMD5Hash, modPow } = require('./rsa');
const { InvA } = require('../InventoryAKeyPair.json');
const { InvB }= require('../InventoryBKeyPair.json');
const  { InvC } = require('../InventoryCKeyPair.json');
const  { InvD } = require('../InventoryDKeyPair.json');

function Part1form(){
    const [id, setId] = useState('');
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [signature, setSignature] = useState('');
    const [recordHash, setRecordHash] = useState('');
    const [verifiedBy, setVerifiedBy] = useState([]);
    const [generatedKeys, setGeneratedKeys] = useState({});
    const [locationInput, setLocationInput] = useState('');
    const inventories = {
        A: InvA,
        B: InvB,
        C: InvC,
        D: InvD,
      };

      

    useEffect(() => {
        const locations = ['A', 'B', 'C', 'D'];
    
        function generateKeysHandler(location) {
          fetch('/api/generateKeys', {
            method: 'POST',
            body: JSON.stringify({ location }),
            headers: { 'Content-Type': 'application/json' }
          })
            .then(res => res.json())
            .then(({ publicKey, privateKey }) => {
              localStorage.setItem(`publicKey${location}`, JSON.stringify(publicKey));
              localStorage.setItem(`privateKey${location}`, JSON.stringify(privateKey));
              console.log(`Keys generated for Inv${location}:`, publicKey);
              setGeneratedKeys(prev => ({
                ...prev,
                [location]: { publicKey, privateKey }
              }));
            })
            .catch(err => console.error(`Key generation error for Inv${location}:`, err));
        }
    
        locations.forEach(loc => generateKeysHandler(loc));
      }, []);
      

    function sign(event){
        event.preventDefault();
        setLocation(locationInput); // Set it officially on submit

        const record = `${id}-${qty}-${price}-${locationInput}`;
        const hash = generateMD5Hash(record);
        const recordHashBigInt = BigInt('0x' + hash);
        setRecordHash(recordHashBigInt);

        let privateKey;
        if (locationInput === "A") privateKey = InvA.keyPair.privateKey;
        else if (locationInput === "B") privateKey = InvB.keyPair.privateKey;
        else if (locationInput === "C") privateKey = InvC.keyPair.privateKey;
        else if (locationInput === "D") privateKey = InvD.keyPair.privateKey;
        else return alert("Invalid location input");

        const signature = signRecord(privateKey, record);
        setSignature(signature);
        const ver = verify(recordHashBigInt, signature, locationInput);
        setVerifiedBy(ver);
    }
    return(
        <>
        <h2>Generated Keys</h2>
            {Object.entries(generatedKeys).map(([loc, keys]) => {
            const inv = inventories[loc];
            const phi = (BigInt(inv.p) - 1n) * (BigInt(inv.q) - 1n);
            const d = modinv(inv.e, phi);
            return (
                <div key={loc}>
                <h3>Inventory {loc}</h3>
                <p><strong>p:</strong> {inv.p}</p>
                <p><strong>q:</strong> {inv.q}</p>
                <p><strong>e:</strong> {inv.keyPair.publicKey.e}</p>
                <p><strong>Calculation of n:</strong> <br></br> = p * q <br></br>  = {inv.p} * {inv.q} <br></br> = {keys.publicKey.n}</p>
                <p><strong>Calculation of phi(n):</strong> <br></br> = (p-1) * (q-1) <br></br>  = {BigInt(inv.p) - 1n} * {BigInt(inv.q) - 1n} <br></br> = {phi}</p>
                <p><strong>Calculation of d:</strong> <br></br> = e^-1 mod phin(n) <br></br>  = {BigInt(inv.e)}^-1 mod {phi} <br></br> = {d}</p>
                <p><strong>Public Key:</strong> e = {keys.publicKey.e}, n = {keys.publicKey.n}</p>
                <p><strong>Private Key:</strong> d = {keys.privateKey.d}, n = {keys.privateKey.n}</p>
                </div>
            );
            })}
        <form onSubmit={sign}> 
            <h1>Add a new record</h1>
            <label htmlFor='id'>Item ID:</label>
            <input type='number' id='id' name='id' onChange={(e) => setId(e.target.value)}></input>
            <label htmlFor='qty'>Item QTY:</label>
            <input type='number' id='qty' name='qty'onChange={(e) => setQty(e.target.value)}></input>
            <label htmlFor='price'>Item Price:</label>
            <input type='number' id='price' name='price'onChange={(e) => setPrice(e.target.value)}></input>
            <label htmlFor='location'>Location:</label>
            <select id="location" name="location" onChange={(e) => setLocationInput(e.target.value)}>
                <option value="">Select location</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                </select>
            <input type="submit"value="Add new Record" ></input>

        </form> 

        <p>Signature from warehouse inputing new record: {signature}</p>
        <p>Record hash: {recordHash}</p>

        <h3>Verification Results</h3>
        <h4>Power of Authority used for consensus. Meaning that if there is more than 50% of votes that have resulted in a failed verification the new stock is not added to the inventory.</h4>
        {verifiedBy.length > 0 ? (
        <ul>
            {verifiedBy.map((v) => {
            const senderKeys = inventories[location]?.keyPair?.publicKey;

            if (!senderKeys || !signature || !recordHash) return null; // <== Avoid rendering until all are ready

            const veriPow = modPow(signature, senderKeys.e, senderKeys.n);
            return (
                <li key={v}>
                Inventory {v} verified the message ✅ <br />
                Verification: m′ = s^e mod n <br />
                = {recordHash} = {signature}^{senderKeys.e} mod {senderKeys.n} <br />
                = {recordHash} = {veriPow}
                </li>
            );
            })}
        </ul>
        ) : (
        <p>No verifications yet or failed ❌</p>
        )}
        </>
    )
}
export default Part1form;