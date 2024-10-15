import Scripture from "./Scripture"
import Chat from "./Chat"

function Start() {
    return (
        <>
            <img className="container" src="src/assets/background_photo.png"></img>
            <Scripture className={"glass"}/>
            <Chat/>
        </>
    )
}
export default Start