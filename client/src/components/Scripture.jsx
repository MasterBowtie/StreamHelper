import { useEffect } from "react";
import { useRef } from "react"
import { useApi } from "../utils/use_api";

function Scripture({className, style}) {
      const bodyDiv = useRef(null);
      const refDiv = useRef(null);
      const api = useApi();

      useEffect(()=> {
            api.get('/scripture/daily').then(res => {
                  console.log(res);
            })
      }, [])


    return (
    <div className={`scripture ${className}`} style={style}>
      <div ref={bodyDiv}></div>
      <div ref={refDiv}></div>
    </div>
    )
}

export default Scripture

