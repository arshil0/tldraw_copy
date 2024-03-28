import {useEffect, useState, useLayoutEffect } from "react";
import BoundingBox from './boundingBox.js';
import { boundingBoxOffset } from "./boundingBox.js";
import * as DrawObject from "./DrawObject.js";
import {firebaseApp, setCanvas, getCanvas, addToDB, removeFromDB} from "./firebase.js";
import {ref, getDatabase } from "firebase/database";
import {useListVals} from "react-firebase-hooks/database"

const database = getDatabase();

/*
getD().then(data => {
    let additionalInfo = [data.lines, data.scalex, data.scaley, data.initialWidth, data.initialHeight];
    objects.push(returnObjectByTool(data.x1, data.y1, data.type, data.x2, data.y2, additionalInfo));
});*/


var objects = []; //list of drawn objects
var selectedObjects = []; //list of objects currently selected with the select or drag tool
var selectedObjectsIndices = []; //list of indices for currently selected objects
var lastMousePos = []; //the position of the mouse before moving the cursor (used for updating movement)

var offset = [0,0]; //offset of the canvas
var addedOffset = [0,0]; //by how much did the offset change, to update corresponding objects

var multiplayer = false; //decides whether to interact with firebase's database or not 
var sessionID = ""; //the session id of the multiplayer server
var pushIntoDB = false; //decides whether to push a new object into the server database, if multiplayer is active
var currentDrawingIndex = 0; //the index of the currently drawing object from the database (if multiplayer is active)
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

export function convertToMultiplayer(){
    if(multiplayer == false){
        multiplayer = true;
        for(let i = 0; i < 5; i++){
            sessionID += Math.floor(Math.random() * 10);
        }
        setCanvas(sessionID, objects)
        window.location.replace("http://tldrawcopy.web.app/" + sessionID);
    }   
}

//updates the set of selected objects
function updateSelectedObjects(object, index){
    selectedObjects.push(object);
    selectedObjectsIndices.push(index);
}

//update the offset by the given [x,y] amount
function updateOffset(x, y){
    offset[0] += x;
    offset[1] += y;
    addedOffset[0] += x;
    addedOffset[1] += y;
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

function returnObjectByDB(object){
    switch(object.type){
        case "pen":
            let additionalInfo = [object.lines, object.scalex, object.scaley, object.initialWidth, object.initialHeight];
            return new DrawObject.Pen(object.type, object.x1, object.y1, object.x2, object.y2, additionalInfo)
        case "rectangle":
            return new DrawObject.Rectangle(object.type, object.x1, object.y1, object.x2, object.y2);
        case "ellipse":
            return new DrawObject.Ellipse(object.type, object.x1, object.y1, object.x2, object.y2);
        case "text":
            return new DrawObject.Text(object.type, object.x1, object.y1, object.x2, object.y2);
    }
}

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

//takes a string "URL" and checks if multiplayer should be on (the website is followed by a / (numbers) )
const isMultiplayer = (URL) =>{
    let c = URL.charAt(URL.length - 1);
    if (c in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] || c == '#') return true;
    return false
}

//returns the sessionID using the url
const getSessionID = (URL) =>{
    let i = URL.length - 1;
    let result = ""
    if(URL.charAt(i) == '#') i -= 1;
    for(let j = 4; j >= 0; j--){
        result += URL.charAt(i - j)
    }
    return result;
}

//extracts content from the realtime database from firebase, and puts the data in "objects"
const extractFromDB = async() =>{
    await getCanvas(sessionID).then(data =>{
        if(data == null || objects.length != 0) return;
        data.forEach(d =>{
            let additionalInfo = undefined;
            if(d.type == "pen")
                additionalInfo = [d.lines, d.scalex, d.scaley, d.initialWidth, d.initialHeight];
            objects.push(returnObjectByTool(d.x1, d.y1, d.type, d.x2, d.y2, additionalInfo));
        })
    })
}

function Canvas(){

    const [values, loading, error] = useListVals(ref(database, sessionID + "/objects"));
    const [c, updateCanvas] = useState(0); //just make sure you call updateCanvas (1-c) to keep the number between 0 and 1, not to go up to a huge number
    
    //update the state of the tool
    function updateState(event, activate = false){
        let shouldInsertNewDrawing = true;
        if(event.button === 0){
            toolActivated = activate
            if(!toolActivated){
                if(tool === "pen"){
                    
                    let current = multiplayer ? values : objects
                    let object
                    if(!multiplayer) object = objects[objects.length - 1];
                    else object = returnObjectByDB(values[values.length - 1])
                    
                    if (object.lines.length <= 1){
                        current.pop();
                        shouldInsertNewDrawing = false;
                    }
                        
                    object.initialize();
                    if(multiplayer){
                        values[values.length-1] = object;
                        setCanvas(sessionID, values);
                    }
                }
                else if(drawingTools.includes(tool)){
                    objects[objects.length - 1].updateCoords();
                }
                else if(tool === "drag"){
                    //socket.emit("adjustDrawings", selectedObjects, selectedObjectsIndices, offset)
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
                    //socket.emit("adjustDrawings", selectedObjects, selectedObjectsIndices, offset)

                }
            }
        }
        if(drawingTools.includes(tool) && shouldInsertNewDrawing && !activate)
            return
            //socket.emit("insertDrawing", objects[objects.length - 1], offset)
    }

    useEffect(() =>{
        const url = window.location.href;
        if(isMultiplayer(url) && objects.length == 0){
            tool = ""
            multiplayer = true
            sessionID = getSessionID(url);
            extractFromDB().then(() => {updateCanvas(1-c); tool = "pen"});
        }
    }, [])

    //an attempt to add text
    const handleKeyInput = (event) =>{
        console.log(event.key);
        if(tool === "textEdit"){
            selectedObjects[0].updateText(event.key)
        }
    }

    const handleMouseDown = (event) =>{
        if(event.button === 0 && tool === "moveCanvas") document.body.style.cursor = 'grabbing';

        if(drawingTools.includes(tool)){
            objects.push(returnObjectByTool(event.clientX, event.clientY));
            if(multiplayer) pushIntoDB = true
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
    }

    const handleMouseUp = (event) =>{
        if(event.button === 0 && tool === "moveCanvas") document.body.style.cursor = 'grab';

        updateState(event, false)
    }

    const handleMouseWheel = (event) =>{
        if(event.deltaY < 0){ //scrolled up
            updateOffset(0, 20)
            updateCanvas(1 - c);
        }
        else{ //scrolled down
            updateOffset(0, -20)
            updateCanvas(1 - c);
        }
    }

    const handleMouseMove = (event) => {
        if(!toolActivated){
            lastMousePos = [event.clientX, event.clientY];
            return
        } 

        if(multiplayer && pushIntoDB){
            currentDrawingIndex = values.length;
            values.push(objects[objects.length - 1])
            pushIntoDB = false
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

            if(multiplayer) values[currentDrawingIndex] = object;
            setCanvas(sessionID, values)
        }

        else if(drawingTools.includes(tool)){
            let object = objects[objects.length - 1];
            object.x2 = x;
            object.y2 = y;

            if(multiplayer) values[currentDrawingIndex] = object;
            setCanvas(sessionID, values)
        }
        else if(tool === "eraser"){
            let i = 0
            let current = multiplayer ? values : objects
            while(i < current.length){
                let object
                if(!multiplayer) object = objects[i];
                else object = returnObjectByDB(values[i])

                if(object.isInShape(x,y)){
                    current.splice(i, 1);
                    object = null;
                    //socket.emit("eraseDrawing", i)
                    break;
                }
                
                i++;
            }
            if(multiplayer) setCanvas(sessionID, values)
        }
        else if(tool === "drag"){
            selectedObjects.forEach((obj, i) =>{
                //responsible for moving the objects
                obj.x1 += x - lastMousePos[0];
                obj.x2 += x - lastMousePos[0];
                obj.y1 += y - lastMousePos[1];
                obj.y2 += y - lastMousePos[1];

                values[selectedObjectsIndices[i]] = obj;
            })
            setCanvas(sessionID, values);
        }
        else if(tool === "select"){
            let i = 0
            let current = multiplayer ? values : objects
            while(i < current.length){
                let object
                if(!multiplayer) object = objects[i];
                else object = returnObjectByDB(values[i])
                if(object.isInShape(x,y) && !selectedObjectsIndices.includes(i)){
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


            selectedObjects.forEach((obj, i) =>{
                obj.resize(dragingCoordsIndex, [lastMousePos[0], lastMousePos[1], x ,y], boundingBox)
                values[selectedObjectsIndices[i]] = obj;
                
            })

            boundingBox[dragingCoordsIndex[0]] += x - lastMousePos[0];
            boundingBox[dragingCoordsIndex[1]] += y - lastMousePos[1];

            if(multiplayer) setCanvas(sessionID, values);
            
        }
        
        else if(tool == "moveCanvas"){
            updateOffset(x - lastMousePos[0], y - lastMousePos[1])
        }

        lastMousePos = [x, y];
        updateCanvas(1 - c);
    }

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        if(addedOffset[0] == 0 && addedOffset[1] == 0) addedOffset = undefined;
        ctx.fillStyle = "green";
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
        if(multiplayer){
            values.forEach((object) =>{
                returnObjectByDB(object).draw(ctx, addedOffset)
            })
        }
        else{
            objects.forEach((object) =>{
                object.draw(ctx, addedOffset);
            })
        }
        
        addedOffset = [0,0];
    });

    return(
        <>
            <canvas id="canvas" width={window.innerWidth} height={window.innerHeight} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleMouseWheel}></canvas>
            
            {(tool === "select" || tool === "resize") &&
            <BoundingBox x ={Math.min(boundingBox[0], boundingBox[2])} y={Math.min(boundingBox[1], boundingBox[3])} width={Math.abs(boundingBox[2] - boundingBox[0])} height={Math.abs(boundingBox[3] - boundingBox[1])}></BoundingBox>
            }
            
        </>
        
    )
}

export default Canvas