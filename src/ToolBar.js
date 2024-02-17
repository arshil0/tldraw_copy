import "./ToolBar.css";
import PropTypes from 'prop-types'
import {setTool} from "./Canvas.js";


//THE LIST OF TOOLS ARE DEFINED IN "App.js" !!!!!!!!!!!!!!!!!!!!!!!!!!!!

function ToolBar(props){
    let toolNames = [];// list of tools (dictionary), used for rendering
    {Object.keys(props.tools).forEach(function(key) {
        {toolNames.push(props.tools[key]["name"])}
    })}// really inconvenient way of doing things, but it's completely fine, as there won't be more than 30 tools
    return(
        <ul id = "ToolBar">
            {toolNames.map(name => (
                <li className="tool">
                    <a className= "toolButton" href="#" onClick={event => setTool(name) /* I dont even know at this point... */}> 
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