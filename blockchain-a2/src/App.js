import logo from './logo.svg';
import './App.css';
import { generateKeys } from './Part1/rsa';
import Part1form from './Part1/Part1form';
import Part2Form from './Part2/Part2Form';

function App() {
  return (
    <>
      <Part1form />
      <Part2Form />
    </>
  );
}

export default App;

