//THIS FILE CONTAINS ALL FUNCTIONS, VARIABLES NECESSARY FOR DRAWING SOMETHING (example: square, circle, pen, etc...)

class DrawObject{
    //takes the top left corrdinates as initial parameters
    constructor(x1, y1){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x1; // bottom right corner's x coordinate
        this.y2 = y1; // bottom right corner's y coordinate
    }

    //initialize the x2 and y2 coordinates (usually called after letting go of left click)
    initialize(x2, y2){
        this.x2 = x2;
        this.y2 = y2;
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

    //sets a coordinate point depending on an index [0: x1, 1: y1, 2: x2, 3: y2]
    setCoordinateByIndex(index, value){
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

    //given a coordinate point, check if its in the current shape (abstract function)
    isInShape(x, y){
        return;
    }

    //draw this object on screen (abstract function)
    draw(ctx){
        return;
    }
}


export class Rectangle extends DrawObject {
    constructor(x1,y1){
        super(x1,y1)
    }


    //given a coordinate point, check if its in the current shape
    isInShape(x, y){
        return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2
    }

    draw(ctx){
        ctx.strokeRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1)
    }
}