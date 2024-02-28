//THIS FILE CONTAINS ALL FUNCTIONS, VARIABLES NECESSARY FOR DRAWING SOMETHING (example: square, circle, pen, etc...)

class DrawObject{
    //takes the top left corrdinates as initial parameters
    constructor(type, x1, y1, x2=x1, y2=y1){
        this.type = type;
        this.x1 = x1;
        this.y1 = y1;
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

    

    //given a coordinate point, check if its in the current shape (abstract function)
    isInShape(x, y){
        return;
    }

    //draw this object on screen (abstract function)
    draw(ctx){
        return;
    }

    //handles resizing depending on object type (abstract function), mouseInfo: [lastMousePos.x, lastMousePos.y, currentMousePos.x, currentMousePos.y]
    resize(dragingCoordsIndex, mouseInfo, boundingBox){
        return;
    }
}


export class Rectangle extends DrawObject {
    constructor(type, x1,y1, x2 = x1, y2=y1){
        super(type, x1,y1, x2, y2)
    }


    //given a coordinate point, check if its in the current shape
    isInShape(x, y){
        return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2
    }

    draw(ctx){
        ctx.strokeRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1)
    }

    //handles the
    resize(dragingCoordsIndex,mouseInfo, boundingBox){
        let dx = dragingCoordsIndex[0] // dragging coord index of x
        let dy = dragingCoordsIndex[1] // dragging coord index of y

        let bx = boundingBox[dx]; //bounding box x coordinate
        let bw = Math.abs(bx - boundingBox[2 - dragingCoordsIndex[0]]) //bounding box x width
        let by = boundingBox[dy]; //bounding box y coordinate
        let bh = Math.abs(by - boundingBox[4 - dragingCoordsIndex[1]]) //bounding box y height

        // there is a problem here when bw or by is close to 0

        this.adjustCoordinateByIndex(dx, (1 - Math.abs(bx - this.getCoordinateByIndex(dx))/ bw) * (mouseInfo[2] - mouseInfo[0]))
        this.adjustCoordinateByIndex(2 - dx, (1 - Math.abs(bx - this.getCoordinateByIndex(2 - dx))/ bw) * (mouseInfo[2] - mouseInfo[0]))
            
        
        this.adjustCoordinateByIndex(dy, (1 - Math.abs(by - this.getCoordinateByIndex(dy))/ bh) * (mouseInfo[3] - mouseInfo[1]))
        this.adjustCoordinateByIndex(4 - dy, (1 - Math.abs(by - this.getCoordinateByIndex(4 - dy))/ bh) * (mouseInfo[3] - mouseInfo[1]))
            
    }
}