import { useEffect, useState } from 'react';
import './App.css';
import Canvas from "./Canvas.js";
import ToolBar from "./ToolBar.js";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001")

export function test(){
  socket.emit("test")
}

export function sendObject(object){
  socket.emit("insertDrawing", object)
}

const toolList = {
  pen:{
    name: "pen"
  },

  rectangle: {
    name: "rectangle"
  },

  elipse: {
    name: "ellipse"
  },

  /*text: {
    name: "text"
  },*/

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

  useEffect(() =>{
    return () => socket.off("idk").off() //this is called once after initializing, this is necessary so that signals are not sent twice, as for some reason react runs App.js twice
  }, [])

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
export {socket};
export default App;
