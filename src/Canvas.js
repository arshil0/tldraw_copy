import { useState, useLayoutEffect } from "react";

var objects = [[0,0,50,50], [50,50, 90,50], [150,30, 60, 85]]

var draw = false;
var erase = false;
var mouse_pos = [];
let initial_pos = [];

function updateState(event){
    if(event.button === 0){
        draw = !draw;
        if(!draw){
            objects[objects.length - 1] = updateObjectCoords(objects[objects.length-1])
        }
    }
    else if(event.button === 2){
        erase = !erase;
    }
}

function updateObjectCoords(objectPosition){
    let x1 = Math.min(objectPosition[0], objectPosition[2]); //up left x coordinate
    let y1 = Math.min(objectPosition[1], objectPosition[3]); //up left y coordinate (y value increases as it goes down)
    let x2 = Math.max(objectPosition[0], objectPosition[2]); //down right x coordinate
    let y2 = Math.max(objectPosition[1], objectPosition[3]); //down right y coordinate
    return [x1,y1,x2,y2];
}

window.addEventListener("mousedown", event =>{
    objects.push([event.clientX, event.clientY,event.clientX, event.clientY]);
    updateState(event);
})

window.addEventListener("mouseup", event => {
    updateState(event)
})

window.addEventListener("contextmenu", e => e.preventDefault());

function Canvas(){

    const width = 60;
    const [updateC, updateCanvas] = useState(0);


    window.addEventListener("mousemove", event => {
        if(draw){
            updateCanvas(updateC + 1);
            let line = objects[objects.length - 1];
            line[2] = event.clientX;
            line[3] = event.clientY;
        };
        if(erase){
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