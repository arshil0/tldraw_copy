import "./ShareButton.css"
import {convertToMultiplayer} from "./Canvas.js"

function ShareButton(){
    return <a id="shareButton" href="#" onClick={() => convertToMultiplayer()}>
        share
    </a>
}

export default ShareButton;