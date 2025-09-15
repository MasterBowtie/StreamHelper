import { useEffect } from "react";
import { useRef } from "react"
import { useApi } from "../utils/use_api";
import { useState } from "react";
import { Outlet } from "react-router-dom";

function Crud() {
      const [id, setId] = useState(null);
      const [body, setBody] = useState([]);
      const [ref, setRef] = useState(null);


      // TODO Style and Build for Crud Submission
      return (
            <div style={{display: "flex", width: "100%"}}>
                  <div style={{flexGrow: "1"}}>
                        <h1>CRUD</h1>
                        <h2>Id: {id? id: "New"}</h2>
                        <h1>Body:</h1>
                        {body.length > 0? body.map((item, index)=> {
                              <div>
                                    <textarea style={{ resize: "none", cols: "50"}}>{item}</textarea>
                              </div>
                        }): <div>
                              <textarea style={{ resize: "none", cols: "50"}}></textarea>
                                    <button style={{height: "100%"}}>+</button>
                              </div>}
                  </div>
                  <div style={{flexGrow: "1"}}>This is the current dailies</div>
            </div>
      )
}

function ScriptView({scripture, callback}) {
      return (
            <div>
                  This is the Single View
            </div>
      )
}

function Scripture({className, style}) {
      const api = useApi();

      useEffect(()=> {
            // api.get('/scripture/daily').then(res => {
            //       let n = Math.floor(Math.random() * 4);
            //       console.log(res[n]);
            //       setScript(res[n])
            //       setBody({__html: res[n].body})
            //       setRef({__html: res[n].reference})
            // })
      }, [])



    return (
      <>
            <div>This is the Main Body</div>
            <Outlet/>
      </>
    )
}

export { Scripture, Crud, ScriptView }

