import {useEffect, useState, useLayoutEffect } from "react";
import BoundingBox from './boundingBox.js';
import { boundingBoxOffset } from "./boundingBox.js";
import * as DrawObject from "./DrawObject.js";
import {socket} from "./App.js";

var objects = []; //list of drawn objects
var selectedObjects = []; //list of objects currently selected with the select tool
var lastMousePos = []; //the position of the mouse before moving the cursor (used for updating movement)

/* LIST OF TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    rectangle: used for drawing rectangles
    eraser: used for deleting
    drag: used for dragging objects
    select: used for choosing objects to then be able to resize
*/
let tool = "rectangle"; //current tool
let toolActivated = false; //if tool is activated (holding down left click)
const drawingTools = ["rectangle"]; //a list of tools that draw something on screen


let boundingBox = [-1,-1,0,0] // topLeft x, topLeft y, bottomRight x, bottomRight y
var dragingCoordsIndex = []; //stores 2 indices (x,y) for which coordinates of an object to move while dragging and resizing ex. (0,3) will move the left-bottom coordinates of a box
var minx = 9999999999999; //top left x of bounding box
var miny = 9999999999999; //top left y of bounding box
var maxx = -1; //bottom right x of bounding box
var maxy = -1; //bottom right y of bounding box


export function setTool(newTool){
    tool = newTool;
}

//update the state of the tool
function updateState(event, activate = false){
    if(event.button === 0){
        toolActivated = activate
        if(!toolActivated){
            if(tool === "rectangle"){
                objects[objects.length - 1].updateCoords();
            }
            else if(tool === "drag"){
                selectedObjects = [];
                //boundingBox = [-1,-1, 0, 0]
            }
            else if(tool === "select"){

            }
            else if(tool === "resize"){ //activated upon dragging a corner of a bounding box
                selectedObjects.forEach(obj =>{
                    obj.updateCoords();
                })
                tool = "select";
                boundingBox = updateCoords(boundingBox);
            }
        }
    }
}

function resetBoundingBoxCoords(){
    minx = 9999999999999; //top left x of bounding box
    miny = 9999999999999; //top left y of bounding box
    maxx = -1; //bottom right x of bounding box
    maxy = -1; //bottom right y of bounding box
    boundingBox = [-1,-1, 0, 0]
}

//update coordinates of an object so that: x1,y1 = top left corner of bounding box,     x2,y2 = bottom right corner of bounding box
function updateCoords(objectPosition){
    let x1 = Math.min(objectPosition[0], objectPosition[2]); //up left x coordinate
    let y1 = Math.min(objectPosition[1], objectPosition[3]); //up left y coordinate (y value increases as it goes down)
    let x2 = Math.max(objectPosition[0], objectPosition[2]); //down right x coordinate
    let y2 = Math.max(objectPosition[1], objectPosition[3]); //down right y coordinate
    return [x1,y1,x2,y2];
}

//when dragging or resizing an object (using the select tool), this function is called with a given state (called from bounding box draggable boxes)
//STATES:    0: top left,     1: top right,     2: bottom left,     3:bottom right
export function resize(state){
    if(state === 0){ //top left
        dragingCoordsIndex = [0,1];
    }
    else if(state === 1){ // top right
        dragingCoordsIndex = [2,1];
    }
    else if(state === 2){ // bottom left
        dragingCoordsIndex = [0,3];
    }
    else if(state === 3){ // bottom right
        dragingCoordsIndex = [2,3];
    }
    else return
    tool = "resize"
}


// returns a drawing object depending on the current tool (having the "rectangle" tool will return a new rectangle object)
function returnObjectByTool(x, y, currentTool = tool){
    switch(currentTool){
        case "rectangle":
            return new DrawObject.Rectangle(x, y);
    }
}

window.addEventListener("mousedown", event =>{
    if(drawingTools.includes(tool)){
        objects.push(returnObjectByTool(event.clientX, event.clientY));
    }
    
        
    else if(tool === "drag"){
        objects.forEach((object,index) =>{
            let x = event.clientX;
            let y = event.clientY;
            lastMousePos = [event.clientX, event.clientY];
            if(object.isInShape(x,y)) selectedObjects.push(object)
        })
    }
    else if(tool === "select"){
        resetBoundingBoxCoords()
        selectedObjects = [];
    }
    updateState(event, true);
})

window.addEventListener("mouseup", event => {
    if(drawingTools.includes(tool))
        socket.emit("insertDrawing", objects[objects.length - 1])
    updateState(event, false)
})

window.addEventListener("contextmenu", e => e.preventDefault());

function Canvas(){
    const [updateC, updateCanvas] = useState(0);

    useEffect(() =>{
        socket.on("updateDrawings", (newObject) =>{
            let obj = returnObjectByTool(newObject.x1, newObject.y1, "rectangle");
            obj.initialize(newObject.x2, newObject.y2);
            objects.push(obj);
            updateCanvas(1 - updateC);
        })
    }, [socket])

    window.addEventListener("mousemove", event => {
        if(!toolActivated){
            lastMousePos = [event.clientX, event.clientY];
            return
        } 
        let x = event.clientX; //current x position of the cursor
        let y = event.clientY; //current y position of the cursor
        if(tool === "rectangle"){
            let object = objects[objects.length - 1];
            object.x2 = x;
            object.y2 = y;
        }
        else if(tool === "eraser"){
            let i = 0
            while(i < objects.length){
                let object = objects[i];
                if(object.isInShape(x,y)){
                    objects.splice(i, 1);
                    object = null;
                    break;
                }
                
                i++;
            }
        }
        else if(tool === "drag"){
            selectedObjects.forEach(obj =>{
                //garbage code, but gets the job done!

                //responsible for moving the objects
                obj.x1 += x - lastMousePos[0];
                obj.x2 += x - lastMousePos[0];
                obj.y1 += y - lastMousePos[1];
                obj.y2 += y - lastMousePos[1];
            })
        }
        else if(tool === "select"){
            let i = 0
            while(i < objects.length){
                let object = objects[i];
                if(object.isInShape(x,y) && !selectedObjects.includes(object)){
                    selectedObjects.push(object)

                    if (object.x1 < minx) minx = object.x1
                    if (object.y1 < miny) miny = object.y1
                    if (object.x2 > maxx) maxx = object.x2
                    if (object.y2 > maxy) maxy = object.y2
                    break;
                }
                
                i++;
            }
            if(minx != 9999999999999)
                boundingBox = [minx - 2, miny - 2, maxx  - 2, maxy - 2] //the -2 is because the offset is off for some reason, -2 fixes it
        }
        else if(tool === "resize"){
            if(dragingCoordsIndex == []) return


            selectedObjects.forEach(obj =>{
                obj.resize(dragingCoordsIndex, [lastMousePos[0], lastMousePos[1], x ,y], boundingBox)
                //obj.setCoordinateByIndex(dragingCoordsIndex[1], (y - lastMousePos[1]), boundingBox)
            })

            boundingBox[dragingCoordsIndex[0]] += x - lastMousePos[0];
            boundingBox[dragingCoordsIndex[1]] += y - lastMousePos[1];
        }
        
        lastMousePos = [x, y];
        updateCanvas(1 - updateC); //to keep the number between 0 and 1, not to go up to a huge number
    })

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
        objects.forEach((object) =>{
            object.draw(ctx)
        })
        
    });

    return(
        <>
            <canvas id="canvas" width={window.innerWidth} height={window.innerHeight}></canvas>
            {(tool === "select" || tool === "resize") &&
            <BoundingBox x ={Math.min(boundingBox[0], boundingBox[2])} y={Math.min(boundingBox[1], boundingBox[3])} width={Math.abs(boundingBox[2] - boundingBox[0])} height={Math.abs(boundingBox[3] - boundingBox[1])}></BoundingBox>
            }
            
        </>
        
    )
}

export default Canvas