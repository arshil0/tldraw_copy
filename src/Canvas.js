import { useState, useLayoutEffect } from "react";

var objects = [[0,0,50,50], [50,50, 90,50], [150,30, 60, 85]]

var draw = false;
var erase = false;
var mouse_pos = [];
let initial_pos = [];

function updateState(event){
    if(event.button === 0){
        draw = !draw;
    }
    else if(event.button === 2){
        erase = !erase;
    }
}

window.addEventListener("mousedown", event =>{
    objects.push([event.clientX, event.clientY,event.clientX, event.clientY]);
    updateState(event);
})

window.addEventListener("mouseup", event => {
    updateState(event)
})

function Canvas(){

    const width = 60;
    const [updateC, updateCanvas] = useState(0);


    window.addEventListener("mousemove", event => {
        if(!draw) return;

        updateCanvas(updateC + 1);
        let line = objects[objects.length - 1];
        line[2] = event.clientX;
        line[3] = event.clientY;
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
            ctx.stroke();
        })
        
    });

    return(
        <canvas id="canvas" width={window.innerWidth} height="600"></canvas>
    )
}

export default Canvas