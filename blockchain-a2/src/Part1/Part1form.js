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

      function generateKeys(event){
        event.preventDefault();
        const locations = ['A', 'B', 'C', 'D'];
        function generateKeysHandler(location) {
        fetch('/api/generateKeys', {
          method: 'POST',
          body: JSON.stringify({ location }),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to generate keys for Inv${location}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(({ publicKey, privateKey }) => {
            setGeneratedKeys(prev => ({
                ...prev,
                [location]: { publicKey, privateKey }
              }));
          })
          .catch(err => {
            console.error(err);
            alert(`Error generating keys for Inv${location}: ${err.message}`);
          });
      }
    
        locations.forEach(loc => generateKeysHandler(loc));
      }

    function sign(){
        setLocation(locationInput); // Set it officially on submit

        const record = `${id}${qty}${price}${locationInput}`;
        const hash = generateMD5Hash(record);
        const recordHashBigInt = BigInt("0x" + hash)
        console.log('Hash on Part1', recordHashBigInt);
        setRecordHash(recordHashBigInt);

        let privateKey;
        if (locationInput === "A") privateKey = InvA.keyPair.privateKey;
        else if (locationInput === "B") privateKey = InvB.keyPair.privateKey;
        else if (locationInput === "C") privateKey = InvC.keyPair.privateKey;
        else if (locationInput === "D") privateKey = InvD.keyPair.privateKey;
        else return alert("Invalid location input");

        const signature = signRecord(privateKey, record);
        setSignature(signature);
        console.log('signature part 1', signature)
        const ver = verify(recordHashBigInt, signature, locationInput);
        setVerifiedBy(ver);

        // Instead of waiting on useEffect, act here:
        if (ver.length > 1) {
          addToDatabase({ id, qty, price, locationInput });
        }
        console.log(verifiedBy);
    }
    function addToDatabase(item) {
        fetch('/api/addToDatabase', {
          method: 'POST',
          body: JSON.stringify({ item }),
          headers: { 'Content-Type': 'application/json' }
        })
          .catch(err => console.error(`Key generation error for Inv${location}:`, err));
      }

    return(
        <>
        <form>
          <h1>Add a new record</h1>
          <label htmlFor='id'>Item ID:</label>
          <input type='number' required id='id' name='id' onChange={(e) => setId(e.target.value)} />
          
          <label htmlFor='qty'>Item QTY:</label>
          <input type='number' required id='qty' name='qty' onChange={(e) => setQty(e.target.value)} />
          
          <label htmlFor='price'>Item Price:</label>
          <input type='number' required id='price' name='price' onChange={(e) => setPrice(e.target.value)} />
          
          <label htmlFor='location'>Location:</label>
          <select id="location" required name="location" onChange={(e) => setLocationInput(e.target.value)}>
            <option value="">Select location</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          {/* Button 1: Just generates keys */}
          <button type="button" onClick={generateKeys}>Generate Keys</button>

          {/* Button 2: Signs and submits record */}
          <button type="button" onClick={sign}>Add new Record</button>
        </form>


        <h2>Generated Keys</h2>
        {Object.keys(generatedKeys).length > 0 && (
        <div className='column'>
          {Object.entries(generatedKeys).map(([loc, keys]) => {
            const inv = inventories[loc];
            if (!inv || !keys) return null;

            const phi = (BigInt(inv.p) - 1n) * (BigInt(inv.q) - 1n);
            const d = modinv(inv.e, phi);

            return (
              <div key={loc}>
                <div className='card'>
                  <h4>Inventory {loc}</h4>
                  <p>
                    <strong>p:</strong> {inv.p} <br />
                    <strong>q:</strong> {inv.q} <br />
                    <strong>e:</strong> {keys.publicKey.e}
                  </p>
                  <p>
                    <strong>Calculation of n:</strong> <br />
                    &emsp;= p * q <br /> &emsp;= {inv.p} * {inv.q} <br /> &emsp;= {keys.publicKey.n}
                  </p>
                  <p>
                    <strong>Calculation of phi(n):</strong> <br />
                    &emsp;= (p-1) * (q-1) <br /> &emsp;= {BigInt(inv.p) - 1n} * {BigInt(inv.q) - 1n} <br /> &emsp;= {phi}
                  </p>
                  <p>
                    <strong>Calculation of d:</strong> <br />
                    &emsp;= e^-1 mod phi(n) <br /> &emsp;= {BigInt(inv.e)}^-1 mod {phi} <br /> = {d}
                  </p>
                  <p>
                    <strong>Public Key:</strong> <br />
                    e = {keys.publicKey.e}, <br />
                    n = {keys.publicKey.n}
                  </p>
                  <p>
                    <strong>Private Key:</strong> <br />
                    d = {keys.privateKey.d}, <br />
                    n = {keys.privateKey.n}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      )}

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
                Verification: m = s^e mod n <br />
                = {recordHash} = {signature}^{senderKeys.e} mod {senderKeys.n} <br />
                = {recordHash} = {veriPow}
                </li>
            );
            
            })}
        </ul>
          
        ) : (
        <p>No verifications yet or failed ❌</p>
        )}
        {verifiedBy.length < 2 && signature && (
          <p style={{ color: 'red' }}>Verification failed by consensus ❌</p>
        )}
        {verifiedBy.length > 1 && (
          <p style={{ color: 'green' }}>Record accepted ✅</p>
        )}
        </>
    )
}
export default Part1form;