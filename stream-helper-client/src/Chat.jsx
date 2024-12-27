
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

// Learn to connect to Twitch using Websockets
const url = "wss://eventsub.wss.twitch.tv/ws";


function Chat () {
    const [knownCheermotes, setCheermotes] = useState();
    const [knownBadges, setBadges] = useState();
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let s = io();
        setSocket(s);
        return () => { s.disconnect()}
      },[])
    
      useEffect(() => {
        if(!socket) return;
        socket.emit("chat");
        socket.on("cheerEmotes", (data) => {
            // console.log("cheers:", data);
            setCheermotes(data);
        })
        socket.on("badges", (data)=> {
            setBadges(data);
            // console.log("Badges:", data);
        })
        socket.on("channel.chat.message", (data)=> {
            // console.log(data);
            setMessages(data);
        })
      },[socket])

    return (
        <table style={{width: "400px", fontWeight: "bold", color: "white", fontFamily: "Arial", backgroundColor: "rgba(0, 0, 0, 0.35)", position: "absolute", bottom: "10px"}}>
            <tbody>
            {messages.map((event, index) => {
                let { badges, color } = event;
                let { broadcaster_user_id, broadcaster_user_login, broadcaster_user_name } = event;
                let { chatter_user_id, chatter_user_login, chatter_user_name } = event;
                let { cheer, channel_points_custom_reward_id, message_type } = event;
                let { message_id, message, reply } = event;
                let { text, fragments } = message;
                if (knownBadges) {
                    // console.log("badge:", knownBadges[badges[0].set_id][badges[0].id]);
                }
                return (
                    <tr key={index}>
                    <td style={{color, textAlign: "end", whiteSpace: "nowrap", verticalAlign: "text-top"}}>
                        {<img src={knownBadges? knownBadges[badges[0].set_id][badges[0].id]: ""} style={{width: "auto", height: "fit-content", position: ""}}/>}
                        <span style={{verticalAlign: "top"}}>{broadcaster_user_name}</span>
                        </td>
                    <td>{
                        fragments.map((frag, subindex) => {
                            let { type, text, cheermote, emote, mention} = frag;
                            switch (type) {
                                case 'emote': return (<img key={`${index}_${subindex}`} src={`https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`} title={text} alt={text}/>)
                                case 'text': return (<span key={`${index}_${subindex}`}>{text}</span>)
                                case 'mention': return (<span key={`${index}_${subindex}`} style={{backgroundColor: "red"}}>{text}</span>)
                                case 'cheermote': 
                                    let { prefix, bits, tier} = cheermote;
                                    return (<span key={`${index}_${subindex}`}><img src={knownCheermotes[prefix][tier]}/>{bits}</span>)
                            }
                        })
                    }</td>
                </tr>
            )})}
            </tbody>
        </table>
    )
}

export default Chat;