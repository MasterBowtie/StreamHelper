import Scripture from "./Scripture"
import Chat from "./Chat"

function Start() {
    return (
        <>
            {/* <img className="container" src="src/assets/background_photo.png"></img> */}
            <video className="container" autoPlay src="src/assets/Stream_Start_0.mp4" type="vidoe/mp4" loop></video>
            <Scripture className={"glass"}/>
            {/* <img id="bowtie" src="src/assets/Events.gif" type="image/gif"/> */}
        </>
    )
}
export default Start