//THIS FILE CONTAINS ALL FUNCTIONS, VARIABLES NECESSARY FOR DRAWING SOMETHING (example: square, circle, pen, etc...)
import { off } from "firebase/database";
import "./specialObjects/text.css"

class DrawObject{
    //takes the top left corrdinates as initial parameters
    constructor(type, x1, y1, x2=x1, y2=y1){
        this.type = type; // name of the drawing
        this.x1 = x1; // top left corner's x coordinate
        this.y1 = y1; // top left corner's y coordinate
        this.x2 = x2; // bottom right corner's x coordinate
        this.y2 = y2; // bottom right corner's y coordinate
    }

    //initialize the x2 and y2 coordinates (usually called after letting go of left click)
    initialize(x2, y2){
        this.x2 = x2;
        this.y2 = y2;
        this.updateCoords()
    }

    //update coordinates the object so that: x1,y1 = top left corner of bounding box,     x2,y2 = bottom right corner of bounding box
    updateCoords(){
        let x1 = Math.min(this.x1, this.x2); //up left x coordinate
        let y1 = Math.min(this.y1, this.y2); //up left y coordinate (y value increases as it goes down)
        this.x2 = Math.max(this.x1, this.x2); //down right x coordinate
        this.y2 = Math.max(this.y1, this.y2); //down right y coordinate
        this.x1 = x1;
        this.y1 = y1;
    }

    //gets a coordinate point depending on an index [0: x1, 1: y1, 2: x2, 3: y2]
    getCoordinateByIndex(index){
        switch(index){
            case 0:
                return this.x1;
            case 1:
                return this.y1;
            case 2:
                return this.x2;
            case 3:
                return this.y2;
            default: return;
        }
    }

    //updates a coordinate point depending on an index [0: x1, 1: y1, 2: x2, 3: y2]
    adjustCoordinateByIndex(index, value){
        switch(index){
            case 0:
                this.x1 += value;
                break;
            case 1:
                this.y1 += value;
                break;
            case 2:
                this.x2 += value;
                break;
            case 3:
                this.y2 += value;
                break;
            default: return;
        }
    }

    //returns the distance between 2 points
    distance(point1, point2){
        return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
    }

    //handles resizing depending on object type, mouseInfo: [lastMousePos.x, lastMousePos.y, currentMousePos.x, currentMousePos.y]
    resize(dragingCoordsIndex, mouseInfo, boundingBox){
        let dx = dragingCoordsIndex[0] // dragging coord index of x
        let dy = dragingCoordsIndex[1] // dragging coord index of y

        let bx = boundingBox[dx]; //bounding box x coordinate
        let bw = Math.abs(bx - boundingBox[2 - dragingCoordsIndex[0]]) //bounding box x width
        let by = boundingBox[dy]; //bounding box y coordinate
        let bh = Math.abs(by - boundingBox[4 - dragingCoordsIndex[1]]) //bounding box y height

        // there is a problem here when bw or by is close to 0

        if(bw != 0){
            this.adjustCoordinateByIndex(dx, (1 - Math.abs(bx - this.getCoordinateByIndex(dx))/ bw) * (mouseInfo[2] - mouseInfo[0]))
            this.adjustCoordinateByIndex(2 - dx, (1 - Math.abs(bx - this.getCoordinateByIndex(2 - dx))/ bw) * (mouseInfo[2] - mouseInfo[0]))
        }
        else{
            this.adjustCoordinateByIndex(dx, (1 - Math.abs(bx - this.getCoordinateByIndex(dx))) * (mouseInfo[2] - mouseInfo[0]))
        }
        
            
        
        if(bh != 0){
            this.adjustCoordinateByIndex(dy, (1 - Math.abs(by - this.getCoordinateByIndex(dy))/ bh) * (mouseInfo[3] - mouseInfo[1]))
            this.adjustCoordinateByIndex(4 - dy, (1 - Math.abs(by - this.getCoordinateByIndex(4 - dy))/ bh) * (mouseInfo[3] - mouseInfo[1]))
        }
        else{
            this.adjustCoordinateByIndex(dy, (1 - Math.abs(by - this.getCoordinateByIndex(dy))) * (mouseInfo[3] - mouseInfo[1]))
        }
        
        
    }
    

    //given a coordinate point, check if its in the current shape (abstract function)
    isInShape(x, y, offset){
        let x1 = this.x1 + offset[0];
        let x2 = this.x2 + offset[0];
        let y1 = this.y1 + offset[1];
        let y2 = this.y2 + offset[1];
        if(this.x1 > this.x2 || this.y1 > this.y2) this.updateCoords();
        return x >= x1 && x <= x2 && y >= y1 && y <= y2
    }

    //draw this object on screen (abstract function)
    draw(ctx, offset){
        return;
    }
}

export class Pen extends DrawObject{
    constructor(type, x1, y1, x2 = x1, y2 = y1, additionalInfo = undefined){
        super(type, x1, y1, x2, y2)
        this.lines = []; //a list of coordinates  to draw lines
        this.scalex = 1;
        this.scaley = 1;
        this.initialWidth = x2 - x1; //used to understand the "x" scaling of the drawing
        this.initialHeight = y2 - y1; //used to understand the "y" scaling of the drawing
        if(additionalInfo != undefined){
            this.lines = additionalInfo[0]; 
            this.scalex = additionalInfo[1];
            this.scaley = additionalInfo[2];
            this.initialWidth = additionalInfo[3]; 
            this.initialHeight = additionalInfo[4];
        }
    }

    initialize(offset){
        //update these values after finishing drawing
        this.initialWidth = this.x2 - this.x1; 
        this.initialHeight = this.y2 - this.y1;

        //update all the coordinates to work with the bounding box
        this.lines.forEach(coordinate =>{
            coordinate[0] -= this.x1;
            coordinate[1] -= this.y1;
        })
    }

    //given a coordinate point, check if its in the current shape
    isInShape(x, y, offset){
        let x1 = this.x1 + offset[0];
        let x2 = this.x2 + offset[0];
        let y1 = this.y1 + offset[1];
        let y2 = this.y2 + offset[1];
        if(x >= x1 && x <= x2 && y >= y1 && y <= y2){
            /*this.lines.forEach(coordinate => {
                console.log(this.distance([x,y], coordinate));
                if(this.distance([x,y], coordinate) < 10) return true;
            })*/
            return true;
        }
        return false;
        //return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2
    }

    draw(ctx, offset){
        this.updateCoords();
        ctx.beginPath();
        let x1 = this.x1 + offset[0];
        let x2 = this.x2 + offset[0];
        let y1 = this.y1 + offset[1];
        let y2 = this.y2 + offset[1];

        let startX = this.initialWidth == 0 ? offset[0] : (this.scalex >= 0 ? x1 : x2);
        let startY = this.initialHeight == 0 ? offset[1] : (this.scaley >= 0 ? y1 : y2);
        ctx.moveTo(startX + this.lines[0][0] * this.scalex, startY + this.lines[0][1] * this.scaley);
        this.lines.forEach(coordinate => {
            ctx.lineTo(startX + coordinate[0] * this.scalex, startY + coordinate[1] * this.scaley);
        })
        ctx.stroke();
    }

    resize(dragingCoordsIndex,mouseInfo, boundingBox){
        super.resize(dragingCoordsIndex, mouseInfo, boundingBox);
        let scaleXSign = Math.sign(this.scalex)
        let scaleYSign = Math.sign(this.scaley)
        this.scalex = (this.x2 - this.x1) / this.initialWidth * (scaleXSign == 0 ? 1 : scaleXSign);
        this.scaley = (this.y2 - this.y1) / this.initialHeight * (scaleYSign == 0 ? 1 : scaleYSign);

        if(this.x2 - this.x1 < 0 || this.y2 - this.y1 < 0) this.updateCoords()
    }

}


export class Text extends DrawObject{
    constructor(type, x1, y1, x2 = x1, y2 = y1, text = ""){
        super(type, x1, y1, x2, y2);
        this.text = text;
        this.size = 18.0;
        this.textMeasure = 0;
    }

    draw(ctx, offset = false){
        this.textMeasure = ctx.measureText(this.text).width;
        ctx.fillStyle = "black";
        ctx.font = "bold " + this.size + "px Arial";
        ctx.fillText(this.text, this.x1, this.y1 + this.size / 1.2)
        this.x2 = this.x1 + this.textMeasure;
        this.y2 = this.y1 + this.size;
        //return <input class="text" type="text" value={this.text}></input>
    }

    updateText(eventKey){
        this.text += eventKey;
    }

    resize(dragingCoordsIndex,mouseInfo, boundingBox){
        //super.resize(dragingCoordsIndex, mouseInfo, boundingBox)
        this.size *= this.textMeasure/(this.textMeasure - (mouseInfo[2] - mouseInfo[0])); //ALMOST there!
        //this.size += (mouseInfo[2] - mouseInfo[0]) / this.text.length; 
    }

}


export class Rectangle extends DrawObject {
    constructor(type, x1,y1, x2 = x1, y2=y1){
        super(type, x1,y1, x2, y2)
    }

    draw(ctx, offset){
        let x1 = this.x1 + offset[0];
        let x2 = this.x2 + offset[0];
        let y1 = this.y1 + offset[1];
        let y2 = this.y2 + offset[1];

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }

}

export class Ellipse extends DrawObject{
    constructor(type, x1, y1, x2 = x1, y2 = y1){
        super(type, x1, y1, x2, y2);
    }

    draw(ctx, offset){
        let x1 = this.x1 + offset[0];
        let x2 = this.x2 + offset[0];
        let y1 = this.y1 + offset[1];
        let y2 = this.y2 + offset[1];
        
        ctx.beginPath();
        ctx.ellipse((x1 + x2) / 2, (y1 + y2)/2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}