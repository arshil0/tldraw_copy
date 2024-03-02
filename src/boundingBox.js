import "./boundingBox.css";
import {resize} from "./Canvas.js"

var boundingBoxOffset = 2; //offsets the bounding box to stand at the right point
var dragBoxSize = 8

function BoundingBox(props){
    return(
        <div draggable="false" className="boundingBox" style={{top : props.y - boundingBoxOffset + "px", left : props.x - boundingBoxOffset + "px", width : props.width - boundingBoxOffset + "px", height : props.height - boundingBoxOffset + "px"}}>
            <div onMouseDown={event => resize(0)} className="dragBox" style={{top : -dragBoxSize/2 - boundingBoxOffset + "px", left: - dragBoxSize/2 - boundingBoxOffset + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : "visible"}}></div>
            <div onMouseDown={event => resize(1)} className="dragBox" style={{top : -dragBoxSize/2 - boundingBoxOffset + "px", left: props.width - dragBoxSize + boundingBoxOffset + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : Math.min(props.width, props.height) <25 ? "hidden" : "visible"}}></div>
            <div onMouseDown={event => resize(2)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: - dragBoxSize/2 - boundingBoxOffset + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : Math.min(props.width, props.height) <25 ? "hidden" : "visible"}}></div>
            <div onMouseDown={event => resize(3)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: props.width - dragBoxSize + boundingBoxOffset + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : "visible"}}></div>
        </div>
    )
}

export {boundingBoxOffset};
export default BoundingBox