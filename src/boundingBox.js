import "./boundingBox.css";
import {drag} from "./Canvas.js"

var dragBoxSize = 8

function BoundingBox(props){
    return(
        <div className="boundingBox" style={{top : props.y + "px", left : props.x + "px", width : props.width + "px", height : props.height + "px"}}>
            <div onClick={event => drag(0)} className="dragBox" style={{top : -dragBoxSize/2 - 2 + "px", left: - dragBoxSize/2 - 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onClick={event => drag(1)} className="dragBox" style={{top : -dragBoxSize/2 - 2 + "px", left: props.width - dragBoxSize + 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onClick={event => drag(2)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: - dragBoxSize/2 - 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nesw-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
            <div onClick={event => drag(3)} className="dragBox" style={{top : props.height - dragBoxSize + "px", left: props.width - dragBoxSize + 2 + "px", width : dragBoxSize + "px", height : dragBoxSize + "px", cursor : "nwse-resize", visibility : props.width <5 ? "hidden" : "visible"}}></div>
        </div>
    )
}

export default BoundingBox