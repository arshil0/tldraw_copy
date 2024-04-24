import "./ToolBar.css";
import PropTypes from 'prop-types'
import {setTool} from "./Canvas.js";


//THE LIST OF TOOLS ARE DEFINED IN "App.js" !!!!!!!!!!!!!!!!!!!!!!!!!!!!

function ToolBar(props){
    let toolNames = [];// list of tools (dictionary), used for rendering
    {Object.keys(props.tools).forEach(function(key) {
        {toolNames.push(props.tools[key]["name"])}
    })}
    return(
        <ul id = "ToolBar">
            {toolNames.map(name => (
                <li className="tool">
                    <a className= "toolButton" href="#" onClick={event => setTool(name)}> 
                       {name} 
                    </a>
                </li>
            ))}
        </ul>
    )
}

ToolBar.propTypes = {
    tools: PropTypes.object
}

export default ToolBar;