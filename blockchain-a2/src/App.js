import logo from './logo.svg';
import './App.css';
import { generateKeys } from './Part1/rsa';
import Part1form from './Part1/Part1form';

function App() {
  const p = BigInt("1210613765735147311106936311866593978079938707");
  const q = BigInt("1247842850282035753615951347964437248190231863");
  const e = BigInt("815459040813953176289801");

  const { publicKey, privateKey } = generateKeys(p, q, e);
  console.log(publicKey);
  console.log(privateKey);
  return (
    <>
    <div className="App">
      <p>p = {p}<br></br> q = {q} <br></br> e = {e}</p>
      <p>Public Key: e = {publicKey.e} , n = {publicKey.n}</p>
      <p>Private Key: d = {privateKey.d} , n = {privateKey.n}</p>
    </div>
   
    <Part1form />
    </>
  );
}

export default App;
