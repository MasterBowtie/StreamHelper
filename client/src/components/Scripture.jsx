import { useEffect } from "react";
import { useRef } from "react"
import { useApi } from "../utils/use_api";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "../css/scripture.css";



function ScriptureCrud() {
      const api = useApi();
      const [id, setId] = useState(null);
      const [collection, setCollection] = useState([]);
      const [book, setBook] = useState();
      const [body, setBody] = useState([""]);
      const [ref, setRef] = useState("");
      const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
      const [daily, setDaily] = useState([]);

      useEffect(()=> {
            api.get("scripture/collections").then((res) =>{
                  setCollection(res);
            })
      },[])

      useEffect(() => {
            api.post("scripture/daily", {date}).then((res) => {
                  console.log("Daily: ", res);
                  if (res[0] && res[0].id !== 0) {
                        setDaily(res)
                  } else {
                        setDaily([]);
                  }
            })
      }, [date])

      function autoResize(event, index) {
            let value = event.target.value;
            setBody(prev =>
                  prev.map((n, idx) => (idx === index ? value : n))
            );

            event.target.style.height = 'auto';
            event.target.style.height = event.target.scrollHeight + 'px';
      }

      function submitVerses(event) {
            let form = new FormData(event.currentTarget);
            let obj = Object.fromEntries(form.entries());
            obj["body"] = [...body];
            if (event.nativeEvent.submitter.name === "submit") {
                  api.post("scripture/update", obj).then(res => {
                        if (res.id !== 0) {
                              console.log("Response", res);
                              setId(res.id);
                        }
                  })
            } else if (event.nativeEvent.submitter.name === "delete") {
                  console.log("DELETE")
                  api.del("scripture/delete", obj).then(res => {
                        if (res.id !== 0) {
                              reset();
                        }
                  })
            }
            api.post("scripture/daily", {date}).then((res) => {
                  console.log("Daily Update: ", res);
                  if (res[0] && res[0].id !== 0) {
                        setDaily(res)
                  } else {
                        setDaily([]);
                  }
            })
            event.preventDefault();
      }

      function addBelow (i, text = "") {
            setBody(prev => {
                  let next = [...prev];
                  next.splice(i + 1, 0, text);
                  return next;
            });
      }

      function removeAt(i) {
            setBody(prev => {
                  if (prev.length === 1) {
                        return [""];
                  }
                  return prev.filter((_, idx) => idx !== i)
            });
      }

      function reset() {
            setId(null);
            setBody([""]);
            setRef("");
      }

      function select(scripture) {
            console.log(scripture.reference);
            setRef(scripture.reference);
            setId(scripture.id);
            setDate(new Date(scripture.date).toISOString().split("T")[0]);
            setBody(scripture.body);
            setBook(scripture.book);
      }

      return (
            <div className="main">
                  <div className="crud-section">
                        <h1>CRUD</h1>
                        <form onSubmit={submitVerses}>
                              <label>Id:</label><input name="id" value={id? id: "New"} readOnly></input>
                              <br/>
                              <label>Book:</label>
                              <select name="book" value={book}>
                                    {collection.map((c, index) => <option key={`c_${index}`} value={c.id} >{c.name}</option>)}
                              </select>
                              <br/>
                              <label>Reference: </label><input name="reference" id="reference" value={ref} onChange={(e) => setRef(e.target.value)} required></input>
                              <h2 style={{marginTop: "0", marginBottom: "0"}}>Verses:</h2>
                              {body.map((item, index)=> 
                                    <div key={`v_${index}`} className="verse-section">
                                          <textarea onChange={(event) => autoResize(event, index)} value={item} required></textarea>
                                          <button id={`add_${index}`} onClick={(e) => {e.preventDefault(); addBelow(index, "")}}>+</button>
                                          <button id={`sub_${index}`} onClick={(e) => {e. preventDefault(); removeAt(index)}}>-</button>
                                    </div>)
                              }
                              <label>Date: </label><input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required></input>
                              <br/>
                              <button type="submit" name="submit">Submit</button>
                              {id && <button type="submit" name="delete">Delete</button>}
                              {id && <button onClick={reset}>Reset</button>}
                        </form>

                  </div>
                  <div className="view-section">
                        <h2>{date}</h2>
                        <div className="verse-section">
                        {daily.map((day, index) => <ScriptureView key={`d_${index}`} scripture={day} callback={() => select(day)} className="preview"/>) }
                        </div>
                  </div>
            </div>
      )
}

function ScriptureView({scripture, callback, className}) {
      const api = useApi();
      const [body, setBody] = useState(scripture && scripture.body);
      const [ref, setRef] = useState(scripture && scripture.reference);
      const [book, setBook] = useState(scripture && scripture.collection.name);

      useEffect(() => {
            if (!scripture) {
                  api.post("scripture/daily", {date: new Date()}).then(res => {
                        if (res.length && res.length > 1) {
                              let index = Math.floor(Math.random() * (res.length))
                              setBody(res[index].body);
                              setRef(res[index].reference);
                              setBook(res[index].collection.name);
                        } else if (res.length === 1) {
                              setBody(res[0].body);
                              setRef(res[0].reference);
                              setBook(res[0].collection.name);
                        }
                   })
            }
      }, [])

      return (
            <div className={`scripture ${className}`}>
                  {body && body.map((verse, index) => <p key={`v_${index}`}>{verse}</p>)}
                  <p>{ref} - {book}</p>
                  {callback && <button onClick={callback}>Select</button>}
            </div>
      )
}

function Scripture() {
    return (
      <>
            <Outlet/>
      </>
    )
}

export { Scripture, ScriptureCrud, ScriptureView }

