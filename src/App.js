import { useEffect, useState } from 'react';
import './App.css';
import Canvas from "./Canvas.js";
import ToolBar from "./ToolBar.js";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3001")

export function test(){
  socket.emit("test")
}

const toolList = {
  pen: {
    name: "rectangle"
  },

  eraser: {
    name: "eraser"
  },

  drag: {
    name: "drag"
  },

  select: {
    name: "select"
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
