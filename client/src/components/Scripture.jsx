import { useEffect } from "react";
import { useRef } from "react"
import { useApi } from "../utils/use_api";
import { useState } from "react";

function Scripture({className, style}) {
      const api = useApi();
      const [script, setScript] = useState(null)
      const [body, setBody] = useState({__html: ""});
      const [ref, setRef] = useState({__html: ""});

      useEffect(()=> {
            api.get('/scripture/daily').then(res => {
                  let n = Math.floor(Math.random() * 4);
                  console.log(res[n]);
                  setScript(res[n])
                  setBody({__html: res[n].body})
                  setRef({__html: res[n].reference})
            })
      }, [])

      useEffect(()=> {
      }, [script])


    return (
    <div className={`scripture ${className}`} style={style}>
      <div dangerouslySetInnerHTML={body}></div>
      <div>{ref}</div>
    </div>
    )
}

export default Scripture

