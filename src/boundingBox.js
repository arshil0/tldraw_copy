import "./boundingBox.css";

function BoundingBox(props){
    return(
        <div className="boundingBox" style={{top : props.y + "px", left : props.x + "px", width : props.width + "px", height : props.height + "px"}}></div>
    )
}

export default BoundingBox