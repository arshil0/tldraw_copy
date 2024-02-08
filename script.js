const canvas = document.getElementById("canvas");
const box = canvas.getContext("2d");

const box_size_slider = document.getElementById("box_size_slider");
const box_size_info = document.getElementById("box_size_info");

mouse_pos = [];
draw = false;
erase = false;
box_size = box_size_slider.value;

function updateState(event){
    if(event.button == 0){
        draw = !draw;
    }
    else if(event.button == 2){
        erase = !erase;
    }
}

window.setInterval(function(){
    if(draw){
        box.fillStyle = "green"
        box.fillRect(mouse_pos[0] - (box_size/2), mouse_pos[1] - (box_size/2), box_size, box_size)
    }
    else if(erase){
        box.clearRect(mouse_pos[0] - (box_size/2), mouse_pos[1] - (box_size/2), box_size, box_size)
    }
}, 5)

window.addEventListener("mousemove", event => {
    mouse_pos[0] = event.clientX - 8;
    mouse_pos[1] = event.clientY - 8;
})

window.addEventListener("mousedown", event =>{
    updateState(event)
})

window.addEventListener("mouseup", event => {
    updateState(event)
})

window.addEventListener("contextmenu", e => e.preventDefault());

box_size_slider.oninput = function(){
    box_size_info.innerHTML = this.value
    box_size = this.value
}