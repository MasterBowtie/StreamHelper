import Scripture from "../components/Scripture"
import Chat from "../components/Chat"
import Title from "../components/Title"

function Intermission() {

    // Need to find out how to detect video end in React
    // let video = document.getElementById("introVideo");
    // video.addEventListener("ended", (event) => {
    //     //Have the Starting Soon Title appear
    // })

    return (
        <>
            {/* <img className="container" src="src/assets/background_photo.png"></img> */}
            <video id="introVideo" className="container" autoPlay src="src/assets/Baptistry.mp4" loop type="video/mp4"></video>
            {/* <h3>Starting Soon!</h3> */}
            <Title title={["Please Hold","Madness Happening"]}/>
            <Scripture style={{top: "45%"}}className={"glass"}/>
            {/* <img id="bowtie" src="src/assets/Events.gif" type="image/gif"/> */}
        </>
    )
}
export default Intermission