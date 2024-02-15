import logo from './logo.svg';
import './App.css';
import Canvas from "./Canvas.js";
import ToolBar from "./ToolBar.js";

//<canvas id = "canvas" width="600" height="600"></canvas>

const toolList = {
  pen: {
    name: "rectangle",
  },

  eraser: {
    name: "eraser",
  },

  drag: {
    name: "drag",
  }
}

function App() {

  return (
    <>
      <ToolBar tools ={toolList}></ToolBar>
      <Canvas></Canvas>
    </>
  );
}

/*
<h4 id="box_size_info"> 100 </h4>
<input type="range" min="1" max="200" value="100" id="box_size_slider"></input> 
*/

export default App;
