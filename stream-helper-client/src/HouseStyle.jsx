import { useState, useEffect } from "react"

export function StyleHouse() {
    const [results, setResults] = useState();


    return (
        <div>
            <div>
                <h1>Get Random</h1>
                <button onClick={(event) => {
                    setResults("Get Results")
                }}>Request</button>
                {(results)? <p>{results}</p>: <></>
                }
            </div>
            <div style={{display: "block"}}>
                <h1>Submit Style</h1>
                <p>Style: <input></input></p>
                <p>Wall: <input></input></p>
                <p>Roof: <input></input></p>
            </div>
        </div>
    )
}