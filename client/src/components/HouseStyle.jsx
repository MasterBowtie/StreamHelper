import { useState, useEffect } from "react"
import { useApi } from "../utils/use_api";

export function StyleHouse() {
    const [wall, setWall] = useState("");
    const [roof, setRoof] = useState("");
    const [style, setStyle] = useState("");
    const [random, setRandom] = useState(false);
    
    const [woods, setWoods] = useState([]);
    const [styles, setStyles] = useState([]);
    const api = useApi();


    useEffect(()=> {
        api.get('/house/styles').then(res => {
            setWoods(res.woods);
            setStyles(res.styles);
        })
    }, [])

    useEffect(()=> {
        let btn = document.getElementById("submit_btn");
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.innerText = "Submit";

        btn = document.getElementById("random_btn");
        btn.style.backgroundColor = "";
        btn.style.color = "";
        if (random) {
            btn.style.backgroundColor = "green";
            btn.style.color = "white";
        }
        setRandom(false);
    }, [wall, roof, style])

    function submitRequest(event) {
        event.preventDefault()
        
        let formData = new FormData(event.target, event.nativeEvent.submitter);
        let data = {}
        formData.forEach((value, key) => {
            if (value) {
                data[key] = value;
            } else {
                data[key] = undefined;
            }
        })
        if (formData.get("random")) {
            let btn = document.getElementById("random_btn");
            api.post("/house/random", data).then(res => {
                setWall(res.wall? res.wall: "")
                setRoof(res.roof? res.roof: "")
                setStyle(res.style? res.style: "")
                setRandom(true)
            })

        } else if (formData.get("submit")) {
            let btn = document.getElementById("submit_btn");
            api.post("/house/set", data).then(res => {
                if (res.status === "ok") {
                    btn.style.backgroundColor = "green";
                    btn.style.color = "white";
                    btn.innerText = "Success!"
                } else {
                    console.log("Error!", res.results)
                    btn.style.backgroundColor = "red";
                    btn.style.color = "white";
                    btn.innerText = "Error!"
                }
            })
        } else {
            console.error("You Broke IT!")
        }
    }

    return (
        <div className="widget">
            <h1 style={{margin: "0"}}>House Style Tool</h1>
            <form onSubmit={submitRequest}>
            <br/>
            <label>Wall: </label>
            <select name="wall" value={wall} onChange={event => setWall(event.target.value)}>
                <option key="null" value="">pick one</option>
                {woods.map((wood) => {
                    return (
                        <option key={wood.wall} value={wood.wall}>{wood.wall}</option>
                    )
                })}
            </select>
            <br/>
            <br/>
            <label>Roof: </label>
            <select name="roof" value={roof} onChange={event => setRoof(event.target.value)}>
                <option key="null" value="">pick one</option>
                {woods.map((wood) => {
                    return (
                        <option key={wood.wall} value={wood.wall}>{wood.wall}</option>
                    )
                })}
            </select>
            <br/>
            <br/>
            <label>Style: </label>
            <select name="style" value={style} onChange={event => setStyle(event.target.value)}>
                <option key="null" value="">pick one</option>
                {styles.map((style) => {
                    return (
                        <option key={style.style} value={style.style}>{style.style}</option>
                    )
                })}
            </select>
            <br/>
            <br/>
            <button id="random_btn" name="random" type="submit" value="random">Get Random</button> &nbsp;
            <button id="submit_btn" name="submit" type="submit" value="submit">Submit</button> &nbsp;
            <button onClick={(event) => {
                event.preventDefault();
                setRoof("")
                setWall("")
                setStyle("")
            }}>Reset</button>
            </form>
        </div>
    )
}