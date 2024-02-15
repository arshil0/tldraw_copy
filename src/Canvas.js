import { useState, useLayoutEffect } from "react";
import {} from"./DrawObject.js"

var objects = []; //list of drawn objects
var indexOfTemporaryObjects = []; //list of indexes of objects currently being adjusted (draggin, resizing, etc..)
var last_mouse_pos = []; //the position of the mouse before moving the cursor (used for updating movement)

/* LIST OF TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pen: used for drawing
    eraser: used for deleting
*/
let tool = "rectangle"; //current tool
let toolActivated = false; //if tool is activated (holding down left click)

export function setTool(newTool){
    tool = newTool;
}

//update the state of the tool
function updateState(event){
    if(event.button === 0){
        toolActivated = !toolActivated
        if(!toolActivated){
            if(tool === "rectangle"){
                objects[objects.length - 1] = updateObjectCoords(objects[objects.length-1])
            }
            else if(tool === "drag"){
                indexOfTemporaryObjects = [];
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
    updateState(event);
})

window.addEventListener("mouseup", event => {
    updateState(event)
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
            indexOfTemporaryObjects.forEach(ind =>{
                objects[ind][0] += x - last_mouse_pos[0];
                objects[ind][2] += x - last_mouse_pos[0];
                objects[ind][1] += y - last_mouse_pos[1];
                objects[ind][3] += y - last_mouse_pos[1];
            })
        }

        last_mouse_pos = [event.clientX, event.clientY];
        updateCanvas(updateC + 1);
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
        <canvas id="canvas" width={window.innerWidth} height="600"></canvas>
    )
}

export default Canvas