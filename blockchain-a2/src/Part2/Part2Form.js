import { useState, useEffect } from 'react';
import { invLocation } from '../Part1/rsa';
const {PKG, InventoryA, InventoryB, InventoryC, InventoryD} = require("../PKG.json");
const {generatePKG, createSecretKeys, createT, generateMD5Hash, modPow, mod} = require('../Part2/MultiSign');

function Part2Form(){
    const [id, setId] = useState('');
    const [publicPKG, setPublicPKG] = useState('');
    const [privatePKG, setPrivatePKG] = useState('');
    const [secretKeyA, setSecretKeyA] = useState('');
    const [secretKeyB, setSecretKeyB] = useState('');
    const [secretKeyC, setSecretKeyC] = useState('');
    const [secretKeyD, setSecretKeyD] = useState('');
    const [t, setT] = useState('');
    const [messageA, setMessageA] = useState('');
    const [messageB, setMessageB] = useState('');
    const [messageC, setMessageC] = useState('');
    const [messageD, setMessageD] = useState('');

    function createPKG(event){
        event.preventDefault();
        const {publicKey, privateKey} = generatePKG();
        setPublicPKG(publicKey);
        setPrivatePKG(privateKey);
        console.log("private key d: ", privateKey.d)
        
    }

    useEffect(() => {
        if (publicPKG && privatePKG) {
            const { secretKeyA, secretKeyB, secretKeyC, secretKeyD } = createSecretKeys(privatePKG);
            setSecretKeyA(secretKeyA.toString());
            setSecretKeyB(secretKeyB.toString());
            setSecretKeyC(secretKeyC.toString());
            setSecretKeyD(secretKeyD.toString());
    
            const tVal = createT(publicPKG);
            setT(tVal.toString());          
        }
    }, [publicPKG, privatePKG]);

    useEffect(() => {
        if (t && id) {
          ['A', 'B', 'C', 'D'].forEach(loc => {
            fetch(`/api/inventory/${loc}/${id}`)
              .then(res => res.json())
              .then(data => {
                if (data.exists) {
                  const record = `${t}${id}${data.qty}`;
                  const hash = generateMD5Hash(record);
                  const hashDec = BigInt("0x" + hash);
                  if (loc === 'A'){
                    setMessageA(hashDec);
                  }else if(loc === 'B'){
                    setMessageB(hashDec);
                  }else if (loc === 'C'){
                    setMessageC(hashDec);
                  }else if (loc === 'D'){
                    setMessageD(hashDec);
                  }
                  console.log(`Inventory ${loc}:`, record, '→', hashDec, " Hash: ", hash);
                  
                }
              })
              .catch(err => console.error(`Error fetching inventory ${loc}:`, err));
          });
          createS();
        }
        
      }, [t, id]);
      
      function createS(){
        const s_1 = modPow(BigInt(InventoryA.rand), BigInt(messageA), BigInt(publicPKG.n));
        const s_A = mod(BigInt(secretKeyA), s_1, BigInt(publicPKG.n));
        const s_2 = modPow(BigInt(InventoryB.rand), BigInt(messageB),  BigInt(publicPKG.n));
        const s_B = mod(BigInt(secretKeyB), s_2, publicPKG.n);
        const s_3 = modPow(BigInt(InventoryC.rand), BigInt(messageC), publicPKG.n);
        const s_C = mod(BigInt(secretKeyC), s_3, publicPKG.n);
        const s_4 = modPow(BigInt(InventoryD.rand), BigInt(messageD), publicPKG.n);
        const s_D = mod(BigInt(secretKeyD), s_4, publicPKG.n);

        const s_5 = mod(s_1, s_2, publicPKG.n);
        const s_6 = mod(s_5, s_3, publicPKG.n);
        const s = mod(s_6, s_4, publicPKG.n);
        console.log(s);
      }

    return(
        <>
        <form onSubmit={createPKG}> 
            <h1>Inquire about a Record</h1>
            <label htmlFor='id'>Item ID:</label>
            <input type='number' required id='id' name='id' onChange={(e) => setId(e.target.value) }></input>
            <input type="submit"value="Inquire" ></input>
        </form> 
        <p><strong>PKG: <br/></strong> p: {PKG.p} <br/> q: {PKG.q} <br/> e: {PKG.e}</p>
        <p><strong>PKG Public Key: </strong> <br/> e: {publicPKG.e} <br/>n: {publicPKG.n}</p>
        <p><strong>Secret Keys: </strong></p>
        <ul>
            <li><strong>Inventory A(g_1): </strong> {secretKeyA} </li>
            <li><strong>Inventory B(g_2): </strong> {secretKeyB} </li>
            <li><strong>Inventory C(g_3): </strong> {secretKeyC} </li>
            <li><strong>Inventory D(g_4): </strong> {secretKeyD} </li>
        </ul>

        <p><strong>T: </strong> {t}</p>

        <p><strong>Message Hash recieved from A: </strong> {messageA}</p>
        <p><strong>Message Hash recieved from B: </strong> {messageB}</p>
        <p><strong>Message Hash recieved from C: </strong> {messageC}</p>
        <p><strong>Message Hash recieved from D: </strong> {messageD}</p>

        <p><strong>S: </strong></p>
        </>
    )
}

export default Part2Form;