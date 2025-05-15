import { useState, useEffect, useRef } from 'react';
const {ProcurementOfficer} = require("../procurementOfficer.json");
const { PKG, InventoryA, InventoryB, InventoryC, InventoryD} = require("../PKG.json");
const {generatePKG, createSecretKeys, createT, generateMD5Hash, modPow, mod, generateKeys, createS} = require('./MultiSign');
const { InvA } = require('../InventoryAKeyPair.json');
const { InvB }= require('../InventoryBKeyPair.json');
const  { InvC } = require('../InventoryCKeyPair.json');
const  { InvD } = require('../InventoryDKeyPair.json');

function Part2Form(){
    const [id, setId] = useState('');
    const [qtyA, setQtyA] = useState('');
    const [qtyB, setQtyB] = useState('');
    const [qtyC, setQtyC] = useState('');
    const [qtyD, setQtyD] = useState('');
    const [publicPKG, setPublicPKG] = useState('');
    const [privatePKG, setPrivatePKG] = useState('');
    const [secretKeyA, setSecretKeyA] = useState('');
    const [secretKeyB, setSecretKeyB] = useState('');
    const [secretKeyC, setSecretKeyC] = useState('');
    const [secretKeyD, setSecretKeyD] = useState('');
    const [tA, setTA] = useState('');
    const [tB, setTB] = useState('');
    const [tC, setTC] = useState('');
    const [tD, setTD] = useState('');
    const [messageA, setMessageA] = useState('');
    const [messageB, setMessageB] = useState('');
    const [messageC, setMessageC] = useState('');
    const [messageD, setMessageD] = useState('');
    const [sA, setSA] = useState('');
    const [sB, setSB] = useState('');
    const [sC, setSC] = useState('');
    const [sD, setSD] = useState('');
    const [officerPubKey, setOfficerPubKey] = useState('');
    const [officerPrivKet, setOfficerPrivKey] = useState('');
    const [tFromA, setTFromA] = useState('');
    const [tFromB, setTFromB] = useState('');
    const [tFromC, setTFromC] = useState('');
    const [tFromD, setTFromD] = useState('');
    const [sFromA, setSFromA] = useState('');
    const [sFromB, setSFromB] = useState('');
    const [sFromC, setSFromC] = useState('');
    const [sFromD, setSFromD] = useState('');
    const [countValid, setCountValid] = useState('');
    const [tValidA, setTValidA] = useState('');
    const [tValidB, setTValidB] = useState('');
    const [tValidC, setTValidC] = useState('');
    const [tValidD, setTValidD] = useState('');
    const [sValidA, setSValidA] = useState('');
    const [sValidB, setSValidB] = useState('');
    const [sValidC, setSValidC] = useState('');
    const [sValidD, setSValidD] = useState('');
    const [encrM, setEncrM] = useState('');
    const [verS, setVerS] = useState('');
    const [verT, setVerT] = useState('');
    const [decryptM, setDecryptM] = useState('');

    useEffect(() => {
      setMessageA('');
      setMessageB('');
      setMessageC('');
      setMessageD('');
      setSA('');
      setSB('');
      setSC('');
      setSD('');
      setSFromA('');
      setSFromB('');
      setSFromC('');
      setSFromD('');
      setTFromA('');
      setTFromB('');
      setTFromC('');
      setTFromD('');
      setCountValid('');
      setSValidA('');
      setSValidB('');
      setSValidC('');
      setSValidD('');
    }, [id]);

    function createPKG(event){
        event.preventDefault();
        const {publicKey, privateKey} = generatePKG();
        const serialisedPublic = {
          e: publicKey.e.toString(),
          n: publicKey.n.toString()
        };
      
        const serialisedPrivate = {
          d: privateKey.d.toString(),
          n: privateKey.n.toString()
        };
        console.log(serialisedPublic);
        fetch('/api/addPKG', {
          method: 'POST',
          body: JSON.stringify({ keyPair: { publicKey: serialisedPublic, privateKey: serialisedPrivate} }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
          .catch(err => console.error(`failed to add to PKG:`, err));

        console.log(publicKey);
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

            //each inventory creating their t values
            const t_A = modPow(BigInt(InvA.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
            const t_B = modPow(BigInt(InvB.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
            const t_C = modPow(BigInt(InvC.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));
            const t_D = modPow(BigInt(InvD.rand), BigInt(publicPKG.e), BigInt(publicPKG.n));

            ['A', 'B', 'C', 'D'].forEach(loc => {
              let currT = '';
              if (loc === "A"){
                currT = t_A;
              }else if (loc === "B"){
                currT = t_B;
              }else if (loc === "C"){
                currT = t_C;
              }else if (loc === "D"){
                currT = t_D;
              }
              fetch(`/api/shareT/${loc}`, {
                method: 'POST',
                body: JSON.stringify({ t: currT.toString() }),
                headers: { 'Content-Type': 'application/json' }
              })
                .then(res => res.json)
                .catch(err => console.error(`failed to add t to Inv${loc}:`, err));
            });
            setTA(t_A);
            setTB(t_B);
            setTC(t_C);
            setTD(t_D);

            const inventories = ['A', 'B', 'C', 'D'];
            for (let i = 0; i < inventories.length; i++){
              let tVal = createT(publicPKG, inventories[i]);
              if (inventories[i] === 'A'){ 
                setTFromA(tVal);
              }else if(inventories[i] === 'B'){
                setTFromB(tVal);
              }else if (inventories[i] === 'C'){
                setTFromC(tVal);
              }else if (inventories[i] === 'D'){
                setTFromD(tVal);
              }
            }         
        }
    }, [publicPKG, privatePKG]);

    useEffect(() => {
        if (tFromA && tFromB && tFromC && tFromD && id) {
          ['A', 'B', 'C', 'D'].forEach(loc => {
            fetch(`/api/inventory/${loc}/${id}`)
              .then(res => res.json())
              .then(data => {
                if (data.exists) {
                  const record = `${data.qty}`;
                  const hash = generateMD5Hash(record);
                  console.log(hash);
                  const hashDec = BigInt("0x" + hash);
                  if (loc === 'A'){
                    setQtyA(data.qty);
                    setMessageA(hashDec);
                  }else if(loc === 'B'){
                    setQtyB(data.qty);
                    setMessageB(hashDec);
                  }else if (loc === 'C'){
                    setQtyC(data.qty);
                    setMessageC(hashDec);
                  }else if (loc === 'D'){
                    setQtyD(data.qty);
                    setMessageD(hashDec);
                  }
                  console.log(`Inventory ${loc}:`, record, '→', hashDec, " Hash: ", hash);
                  
                }
              })
              .catch(err => console.error(`Error fetching inventory ${loc}:`, err));
          });
        }
        
      }, [tFromA, tFromB, tFromC, tFromD, id]);

      useEffect(() => {
        if (messageA && messageB && messageC && messageD && id) {
          createSPartial(); // Just compute s
        }
      }, [messageA, messageB, messageC, messageD, id]);

      //const ranValidation = useRef(false);

      useEffect(() => {
        if (sFromA && sFromB && sFromC && sFromD ) {
          //ranValidation.current = true;
          validationPKG();
          creatOfficerKeyPair();
        }
      }, [sFromA, sFromB, sFromC, sFromD, id]);
      
      function createSPartial(){
        const s_1 = modPow(BigInt(InvA.rand), BigInt(messageA), BigInt(publicPKG.n));
        const s_A = mod(BigInt(secretKeyA), s_1, BigInt(publicPKG.n));
        setSA(s_A);
        const s_2 = modPow(BigInt(InvB.rand), BigInt(messageB),  BigInt(publicPKG.n));
        const s_B = mod(BigInt(secretKeyB), s_2, publicPKG.n);
        setSB(s_B);
        const s_3 = modPow(BigInt(InvC.rand), BigInt(messageC), publicPKG.n);
        const s_C = mod(BigInt(secretKeyC), s_3, publicPKG.n);
        setSC(s_C);
        const s_4 = modPow(BigInt(InvD.rand), BigInt(messageD), publicPKG.n);
        const s_D = mod(BigInt(secretKeyD), s_4, publicPKG.n);
        setSD(s_D);

        ['A', 'B', 'C', 'D'].forEach(loc => {
          let currS = '';
          if (loc === "A"){
            currS = s_A;
          }else if (loc === "B"){
            currS = s_B;
          }else if (loc === "C"){
            currS = s_C;
          }else if (loc === "D"){
            currS = s_D;
          }
          fetch(`/api/shareS/${loc}`, {
            method: 'POST',
            body: JSON.stringify({ s: currS.toString() }),
            headers: { 'Content-Type': 'application/json' }
          })
            .then(res => res.json)
            .catch(err => console.error(`failed to add s to Inv${loc}:`, err));
        });

        // Final combined s values from all inventories
        const combinedA = createS(s_A, s_B, s_C, s_D, BigInt(publicPKG.n));
        const combinedB = createS(s_B, s_C, s_D, s_A, BigInt(publicPKG.n)); // for variety if needed
        const combinedC = createS(s_C, s_D, s_A, s_B, BigInt(publicPKG.n));
        const combinedD = createS(s_D, s_A, s_B, s_C, BigInt(publicPKG.n));

        // Then store them
        setSFromA(combinedA);
        setSFromB(combinedB);
        setSFromC(combinedC);
        setSFromD(combinedD);
      }

      function validationPKG(){
        const inventories = ['A', 'B', 'C', 'D'];
        let count = 0;
        for (let i = 0; i < inventories.length; i++){
          let message = '';
          let s = '';
          let t = '';
          if (inventories[i] === 'A'){ 
            message = messageA;
            s = sFromA;
            t = tFromA;
            console.log(s);
            console.log(t);
          }else if(inventories[i] === 'B'){
            message = messageB;
            s = sFromB;
            t = tFromB;
            console.log(s);
            console.log(t);
          }else if (inventories[i] === 'C'){
            message = messageC;
            s = sFromC;
            t = tFromC;
            console.log(s);
            console.log(t);
          }else if (inventories[i] === 'D'){
            message = messageD;
            s = sFromD;
            t = tFromD;
            console.log(s);
            console.log(t);
          }
          const validateS = modPow(BigInt(s), BigInt(publicPKG.e), BigInt(publicPKG.n));
          const validateT_1 = modPow(BigInt(t), BigInt(message), BigInt(publicPKG.n));
          const ids = BigInt(InvA.id) * BigInt(InvB.id) * BigInt(InvC.id) * BigInt(InvD.id);
          console.log("id: ", ids );
          const validateT = mod(BigInt(ids), BigInt(validateT_1), BigInt(publicPKG.n));

          console.log("s validation: ", i, " ", validateS);
          console.log("t validation: ", i, " ", validateT);
          if (inventories[i] === 'A'){ 
            setTValidA(validateT);
            setSValidA(validateS);
          }else if(inventories[i] === 'B'){
            setTValidB(validateT);
            setSValidB(validateS);
          }else if (inventories[i] === 'C'){
            setTValidC(validateT);
            setSValidC(validateS);
          }else if (inventories[i] === 'D'){
            setTValidD(validateT);
            setSValidD(validateS);
          }
          if (validateS === validateT){
            count++;
          }
          console.log("count: ", count);
        }
        setCountValid(count);
      }

      function creatOfficerKeyPair(){
        console.log(ProcurementOfficer);
        const {publicKey, privateKey} = generateKeys(ProcurementOfficer.p, ProcurementOfficer.q, ProcurementOfficer.e);
        console.log(publicKey);
        setOfficerPubKey(publicKey);
        setOfficerPrivKey(privateKey);

        const serialisedPublic = {
          e: publicKey.e.toString(),
          n: publicKey.n.toString()
        };
      
        const serialisedPrivate = {
          d: privateKey.d.toString(),
          n: privateKey.n.toString()
        };

        fetch('/api/addPOfficer', {
          method: 'POST',
          body: JSON.stringify({ keyPair: { publicKey: serialisedPublic, privateKey: serialisedPrivate} }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
          .catch(err => console.error(`failed to add to PKG:`, err));
      }

    useEffect(() => {
      if(countValid === 4){
        const bigM = BigInt(qtyA);
        const encrypted = modPow(bigM, officerPubKey.e, officerPubKey.n);
        setEncrM(encrypted);
      }
    }, [countValid, qtyA, officerPubKey]);


    useEffect(() => {
      if(encrM){
        const verifiedS = modPow(BigInt(sFromA), BigInt(publicPKG.e), BigInt(publicPKG.n));
        const verfiedT_1 =  modPow(BigInt(tFromA), BigInt(messageA), BigInt(publicPKG.n));
        const ids = BigInt(InvA.id) * BigInt(InvB.id) * BigInt(InvC.id) * BigInt(InvD.id);
        const verifiedT = mod(BigInt(ids), BigInt(verfiedT_1), BigInt(publicPKG.n));

        console.log("verified S: ", verifiedS);
        console.log("verified T: ", verifiedT);
        
        setVerT(verifiedT);
        setVerS(verifiedS);

        const decrypt = modPow(BigInt(encrM), BigInt(officerPrivKet.d), BigInt(officerPrivKet.n));
        setDecryptM(decrypt);
      }
    }, [encrM]);

    return(
        <>
        <form onSubmit={createPKG}> 
            <h1>Inquire about a Record</h1>
            <label htmlFor='id'>Item ID:</label>
            <input type='number' required id='id' name='id' onChange={(e) => setId(e.target.value) }></input>
            <input type="submit"value="Inquire" ></input>
        </form> 
        <p><strong>PKG Key Generation: </strong> <br/>
        {publicPKG && publicPKG.e && publicPKG.n ? (
            <>
            <p><strong>Calculation of n:</strong> <br></br> &emsp;= p * q <br></br>  &emsp;= {PKG.p} * {PKG.q} <br></br> &emsp;= {publicPKG.n}</p>
            <p><strong>Calculation of phi(n):</strong> <br></br> &emsp;= (p-1) * (q-1) <br></br>  &emsp;= {BigInt(PKG.p) - 1n} * {BigInt(PKG.q) - 1n} <br></br> &emsp;= {(BigInt(PKG.p) - 1n) * (BigInt(PKG.q) - 1n)}</p>
            <p><strong>Calculation of d:</strong> <br></br> &emsp;= e^-1 mod phin(n) <br></br>  &emsp;= {BigInt(publicPKG.e)}^-1 mod {BigInt(PKG.p) - 1n * BigInt(PKG.q) - 1n} <br></br> = {privatePKG.d}</p>
            <p>Public Key:</p>
            e: {publicPKG.e.toString()} <br />
            n: {publicPKG.n.toString()}

            <p>Private Key:</p>
            d: {privatePKG.d.toString()} <br />
            n: {privatePKG.n.toString()}
            </>
        ) : (
            'Not generated yet.'
        )}
        </p>
        <p><strong>Secret Keys: </strong></p>
        <ul>
            <li><strong>Inventory A(g_1): </strong> {secretKeyA} </li>
            <p>Calculation of g_1: <br/> i_A ^ d mod n = {InvA.id} ^ {privatePKG.d} mod {privatePKG.n} = {secretKeyA}</p>
            <li><strong>Inventory B(g_2): </strong> {secretKeyB} </li>
            <p>Calculation of g_2: <br/> i_B ^ d mod n = {InvB.id} ^ {privatePKG.d} mod {privatePKG.n} = {secretKeyB}</p>
            <li><strong>Inventory C(g_3): </strong> {secretKeyC} </li>
            <p>Calculation of g_3: <br/> i_C ^ d mod n = {InvC.id} ^ {privatePKG.d} mod {privatePKG.n} = {secretKeyC}</p>
            <li><strong>Inventory D(g_4): </strong> {secretKeyD} </li>
            <p>Calculation of g_4: <br/> i_D ^ d mod n = {InvD.id} ^ {privatePKG.d} mod {privatePKG.n} = {secretKeyD}</p>
        </ul>

        <p><strong>t_A: </strong>{tA}</p>
        <p>Calculation of t_A: <br/> r_A ^ e mod n = {InvA.rand} ^ {publicPKG.e} mod {privatePKG.n} = {tA}</p>
        <p><strong>t_B: </strong>{tB}</p>
        <p>Calculation of t_B: <br/> r_B ^ e mod n = {InvB.rand} ^ {publicPKG.e} mod {privatePKG.n} = {tB}</p>
        <p><strong>t_C: </strong>{tC}</p>
        <p>Calculation of t_C: <br/> r_C ^ e mod n = {InvC.rand} ^ {publicPKG.e} mod {privatePKG.n} = {tC}</p>
        <p><strong>t_D: </strong>{tD}</p>
        <p>Calculation of t_D: <br/> r_A ^ e mod n = {InvD.rand} ^ {publicPKG.e} mod {privatePKG.n} = {tD}</p>
        <p>All inventories will share each of their respective t value with the other inventories and then calculate the t value respectively.</p>
        <p><strong>T From A: </strong> {tFromA}</p>
        <p>
          Calculation of T from A: <br />
          (t_A * t_B * t_C * t_D) mod n <br />
          = ({tA} * t{tB} * {tC} * {tD}) mod {publicPKG.n} = {tFromA}
        </p>
        <p><strong>T From B: </strong> {tFromB}</p>
        <p>
          Calculation of T from B: <br />
          (t_A * t_B * t_C * t_D) mod n <br />
          = ({tA} * t{tB} * {tC} * {tD}) mod {publicPKG.n} = {tFromB}
        </p>
        <p><strong>T From C: </strong> {tFromC}</p>
        <p>
          (t_A * t_B * t_C * t_D) mod n <br />
          = ({tA} * t{tB} * {tC} * {tD}) mod {publicPKG.n} = {tFromC}
        </p>
        <p><strong>T From D: </strong> {tFromD}</p>
        <p>
          (t_A * t_B * t_C * t_D) mod n <br />
          = ({tA} * t{tB} * {tC} * {tD}) mod {publicPKG.n} = {tFromD}
        </p>

        <p><strong>Message Hash recieved from A: </strong> {messageA}</p>
        <p>Hashing of Message A: <br/> message({qtyA})  <br/> = use MD5 hash to get <br/>= {generateMD5Hash(qtyA)} <br/> use a hexadecimal coverter to get = <br/> {messageA}</p>
        <p><strong>Message Hash recieved from B: </strong> {messageB}</p>
        <p>Hashing of Message B: <br/> message({qtyB})  <br/> = use MD5 hash to get <br/>= {generateMD5Hash(qtyB)} <br/> use a hexadecimal coverter to get = <br/> {messageB}</p>
        <p><strong>Message Hash recieved from C: </strong> {messageC}</p>
        <p>Hashing of Message C: <br/> message({qtyC})  <br/> = use MD5 hash to get <br/>= {generateMD5Hash(qtyC)} <br/> use a hexadecimal coverter to get = <br/> {messageC}</p>
        <p><strong>Message Hash recieved from D: </strong> {messageD}</p>
        <p>Hashing of Message D: <br/> message({qtyD})  <br/> = use MD5 hash to get <br/>= {generateMD5Hash(qtyD)} <br/> use a hexadecimal coverter to get = <br/> {messageD}</p>

        <p>All inventories will create their s partial keys and then share them with the other inventories</p>
        <p><strong>s_A: </strong> {sA}</p>
        <p>Calculation of s_A: <br/> g_1 * r_A ^ hash mod n = {secretKeyA} * {InvA.rand} ^ {messageA} mod {privatePKG.n} =  {sA}</p>
        <p><strong>s_B: </strong> {sB}</p>
        <p>Calculation of s_B: <br/> g_1 * r_B ^ hash mod n = {secretKeyB} * {InvB.rand} ^ {messageB} mod {privatePKG.n} =  {sB}</p>
        <p><strong>s_C: </strong> {sC}</p>
        <p>Calculation of s_C: <br/> g_1 * r_C ^ hash mod n = {secretKeyC} * {InvC.rand} ^ {messageC} mod {privatePKG.n} = {sC}</p>
        <p><strong>s_D: </strong> {sD}</p>
        <p>Calculation of s_D: <br/> g_1 * r_D ^ hash mod n = {secretKeyD} * {InvD.rand} ^ {messageD} mod {privatePKG.n} = {sD}</p>

        <p><strong>S From A: </strong>{sFromA}</p>
        <p>
          Calculation of S from A: <br />
          (s_A * s_B * s_C * s_D) mod n <br />
          = {sA} * {sB} * {sC} * {sD} mod {publicPKG.n}= {sFromA}
        </p>
        <p><strong>S From B: </strong>{sFromB}</p>
        <p>
          Calculation of S from B: <br />
          (s_A * s_B * s_C * s_D) mod n <br />
          = {sA} * {sB} * {sC} * {sD} mod {publicPKG.n}= {sFromB}
        </p>
        <p><strong>S From C: </strong>{sFromC}</p>
        <p>
          Calculation of S from C: <br />
          (s_A * s_B * s_C * s_D) mod n <br />
          = {sA} * {sB} * {sC} * {sD} mod {publicPKG.n}= {sFromC}
        </p>
        <p><strong>S From D: </strong>{sFromD}</p>
        <p>
          Calculation of S from D: <br />
          (s_A * s_B * s_C * s_D) mod n <br />
          = {sA} * {sB} * {sC} * {sD} mod {publicPKG.n}= {sFromD}
        </p>

        <p><strong>Multi-Sig from A: </strong><br/>t = {tFromA}, <br/>s = {sFromA}</p>
        <p><strong>Multi-Sig from B: </strong><br/>t = {tFromB}, <br/>s = {sFromB}</p>
        <p><strong>Multi-Sig from C: </strong><br/>t = {tFromC}, <br/>s = {sFromC}</p>
        <p><strong>Multi-Sig from D: </strong><br/>t = {tFromD}, <br/>s = {sFromD}</p>

        <p><strong>Whole Message from A: </strong><br/> m = {qtyA}, <br/> t = {tFromA}, <br/> s = {sFromA}</p>
        <p><strong>Whole Message from B: </strong><br/> m = {qtyB}, <br/> t = {tFromB}, <br/> s = {sFromB}</p>
        <p><strong>Whole Message from C: </strong><br/> m = {qtyC}, <br/> t = {tFromC}, <br/> s = {sFromC}</p>
        <p><strong>Whole Message from D: </strong><br/> m = {qtyD}, <br/> t = {tFromD}, <br/> s = {sFromD}</p>

        <p><strong>Validation of A from PKG: </strong> <br/> s validation: {sValidA}, t validation: {tValidA}</p>
        <p><strong>Calculation of s Validation:</strong> <br/> = s ^ e mod n <br/> = {sFromA} ^ {publicPKG.e} mod {publicPKG.n} = {sValidA}</p>
        <p><strong>Calculation of t Validation:</strong> <br/> = i_A * i_B * i_C * i_D ^ hash mod n <br/> = {InvA.id} * {InvB.id} * {InvC.id} * {InvD.id} ^ {messageA} mod {publicPKG.n} <br/> = {InvA.id * InvB.id * InvC.id * InvD.id} ^ {messageA} mod {publicPKG.n} <br/> = {tValidA}</p>
        <p><strong>Validation of B from PKG: </strong> <br/> s validation: {sValidB}, t validation: {tValidB}</p>
        <p><strong>Calculation of s Validation:</strong> <br/> = s ^ e mod n <br/> = {sFromB} ^ {publicPKG.e} mod {publicPKG.n} = {sValidB}</p>
        <p><strong>Calculation of t Validation:</strong> <br/> = i_A * i_B * i_C * i_D ^ hash mod n <br/> = {InvA.id} * {InvB.id} * {InvC.id} * {InvD.id} ^ {messageB} mod {publicPKG.n} <br/> = {InvA.id * InvB.id * InvC.id * InvD.id} ^ {messageB} mod {publicPKG.n} <br/> = {tValidB}</p>
        <p><strong>Validation of C from PKG: </strong> <br/> s validation: {sValidC}, t validation: {tValidC}</p>
        <p><strong>Calculation of s Validation:</strong> <br/> = s ^ e mod n <br/> = {sFromC} ^ {publicPKG.e} mod {publicPKG.n} = {sValidC}</p>
        <p><strong>Calculation of t Validation:</strong> <br/> = i_A * i_B * i_C * i_D ^ hash mod n <br/> = {InvA.id} * {InvB.id} * {InvC.id} * {InvD.id} ^ {messageC} mod {publicPKG.n} <br/> = {InvA.id * InvB.id * InvC.id * InvD.id} ^ {messageC} mod {publicPKG.n} <br/> = {tValidC}</p>
        <p><strong>Validation of D from PKG: </strong> <br/> s validation: {sValidD}, t validation: {tValidD}</p>
        <p><strong>Calculation of s Validation:</strong> <br/> = s ^ e mod n <br/> = {sFromD} ^ {publicPKG.e} mod {publicPKG.n} = {sValidD}</p>
        <p><strong>Calculation of t Validation:</strong> <br/> = i_A * i_B * i_C * i_D ^ hash mod n <br/> = {InvA.id} * {InvB.id} * {InvC.id} * {InvD.id} ^ {messageD} mod {publicPKG.n} <br/> = {InvA.id * InvB.id * InvC.id * InvD.id} ^ {messageD} mod {publicPKG.n} <br/> = {tValidD}</p>

        {countValid === 4 ? (
          <>
          <p>✅ Verification Successful as PKG determined that all signatures were valid. The message will now be encrypted using Procurement Officer Keys and sent to him.</p>
          <p><strong>Procurement Officer Key Generation:</strong></p>
          <p><strong>Calculation of n:</strong> <br></br> &emsp;= p * q <br></br>  &emsp;= {ProcurementOfficer.p} * {ProcurementOfficer.q} <br></br> &emsp;= {officerPubKey.n}</p>
            <p><strong>Calculation of phi(n):</strong> <br></br> &emsp;= (p-1) * (q-1) <br></br>  &emsp;= {BigInt(ProcurementOfficer.p) - 1n} * {BigInt(ProcurementOfficer.q) - 1n} <br></br> &emsp;= {(BigInt(ProcurementOfficer.p) - 1n) * (BigInt(ProcurementOfficer.q) - 1n)}</p>
            <p><strong>Calculation of d:</strong> <br></br> &emsp;= e^-1 mod phin(n) <br></br>  &emsp;= {BigInt(ProcurementOfficer.e)}^-1 mod {BigInt(ProcurementOfficer.p) - 1n * BigInt(ProcurementOfficer.q) - 1n} <br></br> = {officerPrivKet.d}</p>
            <p>Public Key:</p>
              <p>e: {officerPubKey.e.toString()} <br /></p>
              <p>n: {officerPubKey.n.toString()}</p>

            <p>Private Key:</p>
              <p>d: {officerPrivKet.d.toString()} <br /></p>
              <p>n: {officerPrivKet.n.toString()}</p>
          <p><strong>Encryption of M(using Procurement Officer's Keys):</strong></p>
          <p>Encryption = m ^ e(officer) mod n(officer) <br/> = {qtyA} ^ {officerPubKey.e} mod {officerPubKey.n} <br/> = {encrM}</p>
          <p><strong>Message to be sent to Officer (with encrypted m)</strong> = encryptedM: {encrM}, t: {tFromA}, s: {sFromA}</p>
          <p>Officer will now verify the signatures and decrypt the message: </p>
          <p>Verification of S: <br/> Verify s = s ^ e mod n = {sFromA} ^ {publicPKG.e} mod {publicPKG.n} = {verS}</p>
          <p>Verification of T: <br/> Verify T = i_A * i_D * i_C * i_D * t ^ hash mod n = {BigInt(InvA.id) * BigInt(InvB.id) * BigInt(InvC.id) * BigInt(InvD.id)} * {tFromA} * {messageA} = {verT} </p>
          <p>Both S and T match so now the Officer will decrypt the message:</p>
          <p>Decrypt M = <br/> encryptedM ^ d mod n <br/> = {encrM} ^ {officerPrivKet.d} mod {officerPrivKet.n} = {decryptM}</p>
          <p> The quantity of item with id = {id} is {decryptM}</p>
          </>
        ):(
          <p>❌ Verification was unsuccesfful as PKG determined that all signatures were not valid. The record will not be sent to Procurement Officer.</p>
        )} 
        </>
    )
}

export default Part2Form;