import { generateKeys, signRecord } from './rsa';
import  { InvA, InvB, InvC, InvD } from './InventoryKeys';
import { useState } from 'react';

function Part1form(){
    const [id, setId] = useState('');
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');

    function generateKey(){
        if (location === 'A'){
            const {publicKey, privateKey} = generateKeys(BigInt(InvA.p), BigInt(InvA.q), BigInt(InvA.e));
            console.log('Public Key:', {publicKey});
            localStorage.setItem('publicKeyA', JSON.stringify({
                e: publicKey.e.toString(),
                n: publicKey.n.toString()
            }))
            localStorage.setItem('privateKeyA', JSON.stringify({
                d: privateKey.d.toString(),
                n: privateKey.n.toString()
            }))
        }
        if (location === 'B'){
            const {publicKey, privateKey} = generateKeys(BigInt(InvB.p), BigInt(InvB.q), BigInt(InvB.e));
            console.log('Public Key:', {publicKey});
            localStorage.setItem('publicKeyB', JSON.stringify({
                e: publicKey.e.toString(),
                n: publicKey.n.toString()
            }))
            localStorage.setItem('privateKeyB', JSON.stringify({
                d: privateKey.d.toString(),
                n: privateKey.n.toString()
            }))
        }
        if (location === 'C'){
            const {publicKey, privateKey} = generateKeys(BigInt(InvC.p), BigInt(InvC.q), BigInt(InvC.e));
            console.log('Public Key:', {publicKey});
            localStorage.setItem('publicKeyC', JSON.stringify({
                e: publicKey.e.toString(),
                n: publicKey.n.toString()
            }))
            localStorage.setItem('privateKeyC', JSON.stringify({
                d: privateKey.d.toString(),
                n: privateKey.n.toString()
            }))
        }
        if (location === 'D'){
            const {publicKey, privateKey} = generateKeys(BigInt(InvD.p), BigInt(InvD.q), BigInt(InvD.e));
            console.log('Public Key:', {publicKey});
            localStorage.setItem('publicKeyD', JSON.stringify({
                e: publicKey.e.toString(),
                n: publicKey.n.toString()
            }))
            localStorage.setItem('privateKeyD', JSON.stringify({
                d: privateKey.d.toString(),
                n: privateKey.n.toString()
            }))
        }
    }

    function sign(event){
        event.preventDefault();
        generateKey();
        const record = `${id}-${qty}-${price}-${location}`;
        if (location === "A"){
            const privateKeyA = JSON.parse(localStorage.getItem('privateKeyA'));

            const signature = signRecord(privateKeyA, record)
            console.log({signature});
        }
        
    }
    return(
        <form onSubmit={sign}> 
            <h1>Add a new record</h1>
            <label for='id'>Item ID:</label>
            <input type='number' id='id' name='id' onChange={(e) => setId(e.target.value)}></input>
            <label for='qty'>Item QTY:</label>
            <input type='number' id='qty' name='qty'onChange={(e) => setQty(e.target.value)}></input>
            <label for='price'>Item Price:</label>
            <input type='number' id='price' name='price'onChange={(e) => setPrice(e.target.value)}></input>
            <label for='location'>Location:</label>
            <input type='text' id='location' name='location'onChange={(e) => setLocation(e.target.value)}></input>
            <input type="submit" value="Add new Record"></input>

        </form>
    )
}
export default Part1form;