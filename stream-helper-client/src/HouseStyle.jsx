import { useState, useEffect } from "react"
import { useApi } from "./utils/use_api";

export function StyleHouse() {
    const [results, setResults] = useState();
    const api = useApi();

    function getRandom() {
        const results = api.get("/random").then(res => {console.log(res)})
    }

    return (
        <div>
            <div>
                <h1>Get Random</h1>
                <button onClick={(event) => {
                    getRandom()
                }}>Request</button>
                {/* {(results)? <p>{results}</p>: <></>
                } */}
            </div>
        </div>
    )
}