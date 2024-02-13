import logo from './logo.svg';
import './App.css';
import Canvas from "./t.js";

//<canvas id = "canvas" width="600" height="600"></canvas>

function App() {

  return (
    <>
      <Canvas></Canvas>
      <h4 id="box_size_info"> 100 </h4>
      <input type="range" min="1" max="200" value="100" id="box_size_slider"></input>
    </>
  );
}

export default App;
