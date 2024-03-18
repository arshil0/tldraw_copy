import {useEffect, useState, useLayoutEffect } from "react";
import BoundingBox from './boundingBox.js';
import { boundingBoxOffset } from "./boundingBox.js";
import * as DrawObject from "./DrawObject.js";
import {socket} from "./App.js";

var objects = []; //list of drawn objects
var selectedObjects = []; //list of objects currently selected with the select or drag tool
var selectedObjectsIndices = []; //list of indices for currently selected objects
var lastMousePos = []; //the position of the mouse before moving the cursor (used for updating movement)

var offset = [0,0]; //offset of the canvas
var addedOffset = [0,0]; //by how much did the offset change, to update corresponding objects


/* LIST OF TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pen: draw like a regular pen
    rectangle: draw rectangles
    ellipse: draw ellipses
    text: input text
    eraser: used for deleting
    drag: used for dragging objects
    select: used for choosing objects to then be able to resize
    moveCanvas: used to move the offset of the canvas, ACTIVATED UPONG HOLDING "SPACE"!!!

        tools that can't be chosen by the user
    resize: resize the bounding box of selected objects, updating the size of the objects
    textEdit: edit selected text (1 can be selected)
    
*/
let tool = "pen"; //current tool
let previousTool = undefined;
let toolActivated = false; //if tool is activated (holding down left click)
const drawingTools = ["pen", "rectangle", "ellipse"]; //a list of tools that draw something on screen


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
    let shouldInsertNewDrawing = true;
    if(event.button === 0){
        toolActivated = activate
        if(!toolActivated){
            if(tool === "pen"){
                let object = objects[objects.length - 1];
                if (object.lines.length <= 1){
                    objects.pop();
                    shouldInsertNewDrawing = false;
                }
                    
                object.initialize();
            }
            else if(drawingTools.includes(tool)){
                objects[objects.length - 1].updateCoords();
            }
            else if(tool === "drag"){
                socket.emit("adjustDrawings", selectedObjects, selectedObjectsIndices, offset)
                resetSelectedObjects();
            }
            else if(tool === "select"){

            }
            else if(tool === "resize"){ //activated upon dragging a corner of a bounding box
                selectedObjects.forEach(obj =>{
                    obj.updateCoords();
                })
                tool = "select";
                boundingBox = updateCoords(boundingBox);
                socket.emit("adjustDrawings", selectedObjects, selectedObjectsIndices, offset)

            }
        }
    }
    if(drawingTools.includes(tool) && shouldInsertNewDrawing && !activate)
        socket.emit("insertDrawing", objects[objects.length - 1], offset)
}

//updates the set of selected objects
function updateSelectedObjects(object, index){
    selectedObjects.push(object);
    selectedObjectsIndices.push(index);
}

//deselects all objects
function resetSelectedObjects(){
    selectedObjects = [];
    selectedObjectsIndices = [];
}

function resetBoundingBoxCoords(){
    minx = 9999999999999; //top left x of bounding box
    miny = 9999999999999; //top left y of bounding box
    maxx = -1; //bottom right x of bounding box
    maxy = -1; //bottom right y of bounding box
    boundingBox = [-100,-100, 0, 0]
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
function returnObjectByTool(x, y, currentTool = tool, x2 = x, y2=y, additionalInfo = undefined){
    switch(currentTool){
        case "pen":
            return new DrawObject.Pen(currentTool, x, y, x2, y2, additionalInfo)
        case "rectangle":
            return new DrawObject.Rectangle(currentTool, x, y, x2, y2);
        case "ellipse":
            return new DrawObject.Ellipse(currentTool, x, y, x2, y2);
        case "text":
            return new DrawObject.Text(currentTool, x, y, x2, y2);
    }
}

window.addEventListener("mousedown", event =>{
    if(drawingTools.includes(tool)){
        objects.push(returnObjectByTool(event.clientX, event.clientY));
    }

    else if(tool === "text"){
        let obj = returnObjectByTool(event.clientX, event.clientY)
        objects.push(obj);
        resetSelectedObjects();
        updateSelectedObjects(obj);
        tool = "textEdit";
    }
    
        
    else if(tool === "drag"){
        objects.forEach((object,index) =>{
            let x = event.clientX;
            let y = event.clientY;
            lastMousePos = [event.clientX, event.clientY];
            if(object.isInShape(x,y)){
                updateSelectedObjects(object, index)
            } 
        })
    }
    else if(tool === "select"){
        resetBoundingBoxCoords();
        resetSelectedObjects();
    }
    updateState(event, true);
})

window.addEventListener("mouseup", event => {
    updateState(event, false)
})

window.addEventListener("contextmenu", e => e.preventDefault());

//FOR TESTING!
window.addEventListener("keydown", (event) =>{
    if(tool === "textEdit"){
        selectedObjects[0].updateText(event.key)
    }
    if(event.code == "Space"){
        event.preventDefault(); //to not cause the website to scroll down
        if(tool != "moveCanvas"){
            previousTool = tool;
            tool = "moveCanvas";
            document.body.style.cursor = 'grab';
        }
    }
})

window.addEventListener("keyup", (event) =>{
    if(event.code == "Space"){
        tool = previousTool;
        previousTool = undefined;
        document.body.style.cursor = '';
    }
})

function Canvas(){
    const [updateC, updateCanvas] = useState(0);

    useEffect(() =>{
        socket.on("initializeCanvas", (canvas, otherOffset)=>{
            objects = [];
            canvas.forEach(obj =>{
                let additionalInfo = undefined;
                if(obj.type == "pen") additionalInfo = [obj.lines, obj.scalex, obj.scaley, obj.initialWidth, obj.initialHeight]
                objects.push(returnObjectByTool(obj.x1 - otherOffset[0], obj.y1 - otherOffset[1], obj.type, obj.x2 - otherOffset[0], obj.y2 - otherOffset[1], additionalInfo));
                updateCanvas(1 - updateC);
            })
        })

        socket.on("requestCanvas", () =>{
            socket.emit("sendCanvas", objects, offset);
        })

        socket.on("updateDrawings", (newObject, otherOffset) =>{
            let additionalInfo = undefined;
            if(newObject.type == "pen") additionalInfo = [newObject.lines, newObject.scalex, newObject.scaley, newObject.initialWidth, newObject.initialHeight]
            let obj = returnObjectByTool(newObject.x1 + offset[0] - otherOffset[0], newObject.y1 + offset[1] - otherOffset[1], newObject.type, newObject.x2 + offset[0] - otherOffset[0], newObject.y2 + offset[1] - otherOffset[1], additionalInfo); 
            objects.push(obj);
            updateCanvas(1 - updateC);
        })

        socket.on("eraseObject", (index) =>{
            objects[index] = null;
            objects.splice(index, 1)
            updateCanvas(1 - updateC);
        })

        socket.on("adjustObjects", (objs, indices, otherOffset) =>{
            let objsIndex = 0;
            indices.forEach(i =>{
                let additionalInfo = undefined;
                let o = objs[objsIndex];
                if(o.type == "pen") additionalInfo = [o.lines, o.scalex, o.scaley, o.initialWidth, o.initialHeight]
                objects[i] = returnObjectByTool(o.x1 + offset[0] - otherOffset[0], o.y1 + offset[1] - otherOffset[1], o.type, o.x2 + offset[0] - otherOffset[0], o.y2 + offset[1] - otherOffset[1], additionalInfo);
                objsIndex += 1;
            })
        })
    }, [socket])

    /* this function gets called over 100 times for some reason
    window.addEventListener("visibilitychange", () => {
        if(document.visibilityState == "visible"){
            console.log("opened tab")
            updateCanvas(1 - updateC);
        }
    }) */


    

    //an attempt to add text
    const handleKeyInput = (event) =>{
        console.log(event.key);
        if(tool === "textEdit"){
            selectedObjects[0].updateText(event.key)
        }
    }

    const handleMouseDown = (event) =>{
        if(event.button === 0 && tool === "moveCanvas") document.body.style.cursor = 'grabbing';
    }

    const handleMouseUp = (event) =>{
        if(event.button === 0 && tool === "moveCanvas") document.body.style.cursor = 'grab';
    }

    const handleMouseMove = (event) => {
        if(!toolActivated){
            lastMousePos = [event.clientX, event.clientY];
            return
        } 

        let x = event.clientX; //current x position of the cursor
        let y = event.clientY; //current y position of the cursor

        if(tool === "pen"){
            let object = objects[objects.length - 1];
            if(object.lines.length === 0 || object.distance(object.lines[object.lines.length - 1], [x,y]) > 10){
                object.lines.push([x, y])
                object.x1 = Math.min(x, object.x1)
                object.y1 = Math.min(y, object.y1)
                object.x2 = Math.max(x, object.x2)
                object.y2 = Math.max(y, object.y2)
            }
                
        }

        else if(drawingTools.includes(tool)){
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
                    socket.emit("eraseDrawing", i)
                    break;
                }
                
                i++;
            }
        }
        else if(tool === "drag"){
            selectedObjects.forEach(obj =>{
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
                    updateSelectedObjects(object, i);

                    if (object.x1 < minx) minx = object.x1
                    if (object.y1 < miny) miny = object.y1
                    if (object.x2 > maxx) maxx = object.x2
                    if (object.y2 > maxy) maxy = object.y2
                    break;
                }
                
                i++;
            }
            if(minx != 9999999999999)
                boundingBox = [minx, miny, maxx, maxy] //the -2 is because the offset is off for some reason, -2 fixes it
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
        
        else if(tool == "moveCanvas"){
            offset[0] += x - lastMousePos[0];
            offset[1] += y - lastMousePos[1];
            addedOffset[0] += x - lastMousePos[0];
            addedOffset[1] += y - lastMousePos[1];
        }

        lastMousePos = [x, y];
        updateCanvas(1 - updateC); //to keep the number between 0 and 1, not to go up to a huge number
    }

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        
        if(addedOffset[0] == 0 && addedOffset[1] == 0) addedOffset = undefined;
        ctx.fillStyle = "green";
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
        objects.forEach((object) =>{
            object.draw(ctx, addedOffset)
        })
        addedOffset = [0,0];
    });

    return(
        <>
            <canvas id="canvas" width={window.innerWidth} height={window.innerHeight} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}></canvas>
            
            {(tool === "select" || tool === "resize") &&
            <BoundingBox x ={Math.min(boundingBox[0], boundingBox[2])} y={Math.min(boundingBox[1], boundingBox[3])} width={Math.abs(boundingBox[2] - boundingBox[0])} height={Math.abs(boundingBox[3] - boundingBox[1])}></BoundingBox>
            }
            
        </>
        
    )
}

export default Canvas