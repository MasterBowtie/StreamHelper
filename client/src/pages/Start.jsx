import Scripture from "../components/Scripture"
import Chat from "../components/Chat"
import Title from "../components/Title"

function Start() {

    // Need to find out how to detect video end in React
    // let video = document.getElementById("introVideo");
    // video.addEventListener("ended", (event) => {
    //     //Have the Starting Soon Title appear
    // })

    return (
        <>
            {/* <img className="container" src="src/assets/background_photo.png"></img> */}
            <video id="introVideo" className="container" autoPlay src="src/assets/Temple_Timelapse_1.mp4" loop type="video/mp4"></video>
            {/* <h3>Starting Soon!</h3> */}
            <Scripture className={"glass"}/>
            <Title title={"Starting Soon"}/>
            {/* <img id="bowtie" src="src/assets/Events.gif" type="image/gif"/> */}
        </>
    )
}
export default Start