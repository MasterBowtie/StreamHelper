import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

function Vote() {
    const [socket, setSocket] = useState();
    const [votes, setVotes] = useState({});
    const [options, setOptions] = useState([]);
    const [currentTime, setTime] = useState();
    const [endTime, setEnd] = useState();

    useEffect(() => {
        if(!socket) return;
        socket.on("channel.chat.vote", (data)=> {
            let newVote = data.vote.split(" ")
            let newVotes = votes;
            for (let i of newVote) {
                if (i.startsWith("!") && i != "!vote") {
                    let index = parseInt(i.replaceAll("!", "")) - 1;
                    if (Number.isInteger(index) && index < options.length) {
                        // console.log("INDEX:", index);
                        newVotes[data.user] = index; 
                    }
                }
            }
            setVotes(newVotes);
            
            let counts = []
            let total = 0;
            let maxVote = 0;
            let maxIndex = [0];
            for (let o of options) {
                counts.push(0);
            }
            for (let v of Object.keys(newVotes)) {
                counts[newVotes[v]]++;
                total++;
            }
            for (let i = 0; i < counts.length; i++) {
                if (counts[i] > maxVote) {
                    maxVote = counts[i];
                    maxIndex = [i];
                } else if (counts[i] == maxVote) {
                    maxIndex.push(i);
                }
            }

            for (let o in options) {
                let bar = document.getElementById(`p_${o}`)

                let width = `${Math.max(Math.round(counts[o]/total * 100), 10)}%`;
                bar.style.width = width;
                
                if (maxIndex.indexOf(parseInt(o)) >= 0 && maxIndex.length === 1) {
                    bar.style.backgroundColor = "rgb(0, 133, 0)";
                } else if (maxIndex.indexOf(parseInt(o)) >= 0 && maxIndex.length > 1) {
                    bar.style.backgroundColor = "rgb(254, 241, 0)";
                } else {
                    bar.style.backgroundColor = "rgb(254, 0, 0)";
                }
                
            }
            
        })
        
    },[socket])


    useEffect(() => {
        setInterval(()=> {
            setTime(Date.now())
        }, 1000);

        if (endTime) {
            let reset = document.getElementById("reset_button");
            let announce = document.getElementById("announce")
            if (endTime < currentTime && !(endTime + 60000 < currentTime)) {
                announce.removeAttribute("hidden");
            } else if (endTime + 60000 < currentTime) {
                socket.disconnect();
                setSocket(undefined);
                announce.hidden = true;
                reset.removeAttribute("hidden");
                setEnd(undefined);
            }
        }

    }, [currentTime])

    function startPoll(event) {
        setVotes({});
        let s = io()
        setSocket(s);

        setEnd(Date.now() + (60000 * 2));
        let headers = Array.from(document.getElementsByClassName("vote_title"));
        let deletes = Array.from(document.getElementsByClassName("del_button"));
        let add_div = document.getElementById("add_div");
        
        let start = event.target;

        headers.forEach(element => {
          element.disabled = true;  
        });

        deletes.forEach(element => {
            element.hidden = true;
        })

        add_div.style.height = "0px";
        start.hidden = true;
        
    }
    
    function reset(event) {
        setVotes({});

        setEnd(undefined);
        setOptions([]);
        let headers = Array.from(document.getElementsByClassName("vote_title"));
        let deletes = Array.from(document.getElementsByClassName("del_button"));
        let add_div = document.getElementById("add_div");
        let add_input = document.getElementById("add_input")
        let vote_title = document.getElementById("vote_title")
        let reset = event.target;
        let start = document.getElementById("start_button");

        add_div.style.height = "";
        add_input.value = "";
        vote_title.value = "";

        headers.forEach(element => {
          element.removeAttribute("disabled");  
        });

        deletes.forEach(element => {
            element.removeAttribute("hidden");
        })
        reset.hidden = true;
        start.removeAttribute("hidden");
    }

    return (
        <div className="widget vote" >
            <h2 style={{margin: "0"}}>Timer: {
            endTime && endTime > currentTime? Math.floor((endTime - currentTime)/60000): "0"}:
            {endTime && endTime > currentTime? (Math.floor((endTime - currentTime)/1000)%60 < 10? `0${Math.floor((endTime - currentTime)/1000)%60}`: Math.floor((endTime - currentTime)/1000)%60): "00"
            }</h2>
            <h2 id="announce" hidden disabled style={{margin: "0"}}>Getting Results{".".repeat(Math.floor(currentTime / 1000)%4)}</h2>
            <input id='vote_title' placeholder='Question Here'/>
            <div className='vote_options_container'>
              {options.map((option, index)=> {
                return (
                <div key={`o_${index}`} style={{display: "flex", transform: "rotate(0)", backgroundColor:"rgba(255, 255, 255, 0.5)", borderRadius: "10px"}}>
                    <label className='vote'>!{index + 1}: </label><input className='vote_option' value={`${option}`} disabled/>
                      <button className='del_button' onClick={(event) => {
                          let newOptions = options.slice(0, index).concat(options.slice(index + 1))
                          setOptions(newOptions);
                        }} style={{zIndex: "2"}}>X</button>
                        <div id={`p_${index}`} className='percent_bar'></div>
                </div>)
              })}
              <div id='add_div' style={{display: "flex"}}>
                <input id="add_input" className='vote_option'/>
                <button onClick={(event)=> {
                  let input = document.getElementById("add_input");
                  let newOptions = [...options, input.value];
                  setOptions(newOptions);
                  input.value = "";
                }}>+</button> 
              </div>
            </div>
            <button id='start_button' onClick={startPoll}>Start Poll</button>
            <button id='reset_button' onClick={reset} hidden>Reset</button>
        </div>
    )
}

export { Vote }