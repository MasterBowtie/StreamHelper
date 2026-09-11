import { useEffect } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useAlerts } from "../../contexts/AlertContext";
import { BasicAlert } from "./BasicAlert";

export default function AlertContainer() {
    const { currentAlert, addAlert } = useAlerts();
    const { websocket, connected } = useWebSocket();


    useEffect(() => {
        if (!connected) return;

        const callback = (data) => {
            let sound;
            let duration

            switch (data.type) {
                case "twitch.channel.follow":
                    sound = new Audio("I Like Your Style.mp3");
                    duration = 5000;
                    break;
                case "twitch.channel.subscribed":
                    sound = new Audio("Thank You For Your Participation.mp3");
                    duration = 7000;
                    break;
                case "twitch.channel.raid":
                    sound = new Audio("I Like Your Style.mp3");
                    duration = 5000;
                    break;
            } 
            sound.preload = "auto";
            addAlert({
                type: data.type,
                data,
                duration,
                sound
            });
        }

        const testCallback = (data) => {
            const {message, chatter_user_id} = data.payload;
            const {text} = message;

            if (text.startsWith("!alert")) {
                const [alert, ...name] = text.split(" ");
                const audio = new Audio("You're Doing Fine.mp3")
                audio.preload = "auto";
                addAlert({type: "twitch.chat.message", data: {...data, payload: {user_name: name.join(" ")}}, duration: 3000, sound: audio});
            };
        };

        websocket.on("twitch.channel.follow", callback);
        websocket.on("twitch.channel.subscribed", callback);
        websocket.on("twitch.channel.raid", callback);
        websocket.on("twitch.chat.message", testCallback);
        
        return () => {
            websocket.off("twitch.channel.follow", callback);
            websocket.off("twitch.channel.subscribed", callback);
            websocket.off("twitch.channel.raid", callback);
            websocket.off("twitch.chat.message", testCallback);
        }
    }, [connected])

    // TODO: Make Better Alerts
    switch (currentAlert?.type) {
        case "twitch.channel.follow":
            return <BasicAlert alert={currentAlert} type={"followed"}/>
        case "twitch.channel.subscribed":
            return <BasicAlert alert={currentAlert} type={"subscribed"}/>
        case "twitch.channel.raid":
            return <BasicAlert alert={currentAlert} type={"raided"}/>
        case "twitch.chat.message":
            return <BasicAlert alert={currentAlert} type={""}/>
    }

}