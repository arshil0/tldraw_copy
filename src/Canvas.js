import { useState, useLayoutEffect } from "react";
import {} from"./DrawObject.js"

var objects = [] //list of drawn objects
var mouse_pos = [];
let initial_pos = [];

/* LIST OF TOOLS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pen: used for drawing
    eraser: used for deleting
*/
let tool = "pen"; //current tool
let toolActivated = false; //if tool is activated (holding down left click)

export function setTool(newTool){
    tool = newTool;
}

//update the state of the tool
function updateState(event){
    if(event.button === 0){
        toolActivated = !toolActivated
        if(tool === "pen"){
            if(!toolActivated){
                objects[objects.length - 1] = updateObjectCoords(objects[objects.length-1])
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

window.addEventListener("mousedown", event =>{
    if(tool == "pen")
        objects.push([event.clientX, event.clientY,event.clientX, event.clientY]);
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
        if(tool == "pen"){
            updateCanvas(updateC + 1);
            let line = objects[objects.length - 1];
            line[2] = event.clientX;
            line[3] = event.clientY;
        };
        if(tool == "eraser"){
            let x = event.clientX;
            let y = event.clientY;
            let i = 0
            while(i < objects.length){
                let pos = objects[i];
                if(x >= pos[0] && x <= pos[2] && y >= pos[1] && y <= pos[3]){
                    objects.splice(i, 1);
                    break;
                }
                updateCanvas(updateC + 1);
                i++;
            }
        }
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