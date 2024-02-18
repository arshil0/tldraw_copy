import "./boundingBox.css";
import {resize} from "./Canvas.js"

var dragBoxSize = 8

function BoundingBox(props){
    return(
        <div className="boundingBox" style={{top : props.y + "px", left : props.x + "px", width : props.width + "px", height : props.height + "px"}}>
            <div onMouseDown={event => resize(0)} className="dragBox" style={{top : -dragBoxSize/2 - 2 + "px", left: - dragBoxSize/2 - 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onMouseDown={event => resize(1)} className="dragBox" style={{top : -dragBoxSize/2 - 2 + "px", left: props.width - dragBoxSize + 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onMouseDown={event => resize(2)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: - dragBoxSize/2 - 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onMouseDown={event => resize(3)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: props.width - dragBoxSize + 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
        </div>
    )
}

export default BoundingBox