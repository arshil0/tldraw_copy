import { useState, useLayoutEffect } from "react";
import BoundingBox from './boundingBox.js';

var objects = []; //list of drawn objects
var indexOfTemporaryObjects = []; //list of indexes of objects currently being adjusted (draggin, resizing, etc..)
var last_mouse_pos = []; //the position of the mouse before moving the cursor (used for updating movement)

/* LIST OF TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    rectangle: used for drawing rectangles
    eraser: used for deleting
    drag: used for dragging objects
*/
let tool = "rectangle"; //current tool
let toolActivated = false; //if tool is activated (holding down left click)


let boundingBox = [-1,-1,0,0] // topLeft x, topLeft y, width, height

export function setTool(newTool){
    tool = newTool;
}

//update the state of the tool
function updateState(event, activate = false){
    if(event.button === 0){
        toolActivated = activate
        if(!toolActivated){
            if(tool === "rectangle"){
                objects[objects.length - 1] = updateObjectCoords(objects[objects.length-1])
            }
            else if(tool === "drag"){
                indexOfTemporaryObjects = [];
                //boundingBox = [-1,-1, 0, 0]
            }
        }
    }
}

//update coordinates of an object so that: x1,y1 = top left corner of bounding box,     x2,y2 = bottom right corner of bounding box
function updateObjectCoords(objectPosition){
    let x1 = Math.min(objectPosition[0], objectPosition[2]); //up left x coordinate
    let y1 = Math.min(objectPosition[1], objectPosition[3]); //up left y coordinate (y value increases as it goes down)
    let x2 = Math.max(objectPosition[0], objectPosition[2]); //down right x coordinate
    let y2 = Math.max(objectPosition[1], objectPosition[3]); //down right y coordinate
    return [x1,y1,x2,y2];
}

//given a position and shape information, checks if the given position is inside the shape
function isInShape(x, y, shapePosition){
    return x >= shapePosition[0] && x <= shapePosition[2] && y >= shapePosition[1] && y <= shapePosition[3]
}

//when dragging or resizing an object (using the select tool), this function is called with a given state
//STATES:    0: top left,     1: top right,     2: bottom left,     3:bottom right
export function drag(state){
    if(state == 0){
        console.log("top left");
    }
    else if(state == 1){
        console.log("top right");
    }
    else if(state == 2){
        console.log("bottom left");
    }
    else if(state == 3){
        console.log("bottom right");
    }
}

window.addEventListener("mousedown", event =>{
    if(tool == "rectangle")
        objects.push([event.clientX, event.clientY,event.clientX, event.clientY]);
    else if(tool == "drag"){
        objects.forEach((objectPos,index) =>{
            let x = event.clientX;
            let y = event.clientY;
            last_mouse_pos = [event.clientX, event.clientY];
            if(isInShape(x,y,objectPos)) indexOfTemporaryObjects.push(index)
        })
    }
    updateState(event, true);
})

window.addEventListener("mouseup", event => {
    updateState(event, false)
})

window.addEventListener("contextmenu", e => e.preventDefault());

function Canvas(){

    const [updateC, updateCanvas] = useState(0);

    window.addEventListener("mousemove", event => {
        if(!toolActivated) return
        let x = event.clientX; //current x position of the cursor
        let y = event.clientY; //current y position of the cursor
        if(tool === "rectangle"){
            let line = objects[objects.length - 1];
            line[2] = event.clientX;
            line[3] = event.clientY;
        }
        else if(tool === "eraser"){
            let i = 0
            while(i < objects.length){
                let pos = objects[i];
                if(isInShape(x,y,pos)){
                    objects.splice(i, 1);
                    break;
                }
                
                i++;
            }
        }
        else if(tool === "drag"){
            let minx = 9999999999999;
            let miny = 9999999999999;
            let maxx = -1;
            let maxy = -1;
            indexOfTemporaryObjects.forEach(ind =>{
                //garbage code, but gets the job done!

                //responsible for moving the objects
                objects[ind][0] += x - last_mouse_pos[0];
                objects[ind][2] += x - last_mouse_pos[0];
                objects[ind][1] += y - last_mouse_pos[1];
                objects[ind][3] += y - last_mouse_pos[1];

                //responsible for the bounding box
                if (objects[ind][0] < minx) minx = objects[ind][0]
                if (objects[ind][1] < miny) miny = objects[ind][1]
                if (objects[ind][2] > maxx) maxx = objects[ind][2]
                if (objects[ind][3] > maxy) maxy = objects[ind][3]
            })
            boundingBox = [minx - 2, miny - 2, maxx - minx, maxy - miny] //the -2 is because the offset is off for some reason, -2 fixes it
        }

        last_mouse_pos = [event.clientX, event.clientY];
        updateCanvas(1 - updateC); //to keep the number between 0 and 1, not to go up to a huge number
    })

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
        objects.forEach((coords) =>{
            //ctx.beginPath();
            //ctx.moveTo(coords[0],coords[1]);
            //ctx.lineTo(coords[2], coords[3]);
            ctx.strokeRect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1])
        })
        
    });

    return(
        <>
            <canvas id="canvas" width={window.innerWidth} height={window.innerHeight}></canvas>
            <BoundingBox x ={boundingBox[0]} y={boundingBox[1]} width={boundingBox[2]} height={boundingBox[3]}></BoundingBox>
        </>
        
    )
}

export default Canvas