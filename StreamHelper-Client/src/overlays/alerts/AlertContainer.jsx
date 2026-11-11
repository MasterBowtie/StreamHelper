import { useEffect } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useAlerts } from "../../contexts/AlertContext";
import { BasicAlert } from "./BasicAlert";
import { SoundAlert } from "./SoundAlert";

export default function AlertContainer() {
    const { currentAlert, addAlert } = useAlerts();
    const { websocket, connected } = useWebSocket();


    useEffect(() => {
        if (!connected) return;

        const callback = (data) => {
            let sound;
            let duration

            switch (data.type) {
                case "twitch.follow":
                    sound = new Audio("I Like Your Style.mp3");
                    duration = 5000;
                    break;
                case "twitch.subscribe":
                    sound = new Audio("Thank You For Your Participation.mp3");
                    duration = 7000;
                    break;
                case "twitch.raid":
                    sound = new Audio("I Like Your Style.mp3");
                    duration = 5000;
                    break;
                case "twitch.point.redeem":
                    console.log("POINT REDEEM!", data);
                    switch (data.payload) {
                        case "Unmute!":
                            sound = new Audio("WakeUp.mp3");
                            break;
                        case "Hydrate!":
                            console.log("HYDRATE REDEEM!")
                            break;
                    }
                    break;
                case 'twitch.bit.use':
                    console.log("BIT REDEEM!", data);
                    switch (data.payload.type) {
                        case "cheer":
                            break;
                        case "custom_power_up":
                            switch (data.payload.custom_power_up.title) {
                                case "Creeper Scare":
                                    sound = new Audio("Creeper_fuse.ogg");
                                    duration = 2000;
                                    break;
                            }
                            break;
                    }
                    break;
            }
            if (sound) {
                sound.preload = "auto";
            }
            addAlert({
                type: data.type,
                data,
                duration,
                sound
            });
        }

        const testCallback = (data) => {
            const {message, fragments} = data.payload;
            console.log(fragments[0]?.text);


            if (fragments[0]?.text === "!alert") {
                const audio = new Audio("You're Doing Fine.mp3")
                audio.preload = "auto";
                addAlert({type: "twitch.chat.message", duration: 3000, sound: audio});
            };
        };

        websocket.on("twitch.follow", callback);
        websocket.on("twitch.subscribe", callback);
        websocket.on("twitch.raid", callback);
        websocket.on("twitch.chat.message", testCallback);
        websocket.on("twitch.point.redeem", callback);
        websocket.on("twitch.bits.use", callback);
        
        return () => {
            websocket.off("twitch.follow", callback);
            websocket.off("twitch.subscribe", callback);
            websocket.off("twitch.raid", callback);
            websocket.off("twitch.chat.message", testCallback);
            websocket.off("twitch.point.redeem", callback);
            websocket.off("twitch.bits.use", callback);
        }
    }, [connected])

    // TODO: Make Better Alerts
    switch (currentAlert?.type) {
        case "twitch.follow":
            return <BasicAlert alert={currentAlert} type={"followed"}/>
        case "twitch.subscribe":
            return <BasicAlert alert={currentAlert} type={"subscribed"}/>
        case "twitch.raid":
            return <BasicAlert alert={currentAlert} type={"raided"}/>
        case "twitch.chat.message":
            return <SoundAlert alert={currentAlert}/>
        case "twitch.point.redeem":
            return <SoundAlert alert={currentAlert}/>
        case 'twitch.bits.use':
            return <BasicAlert alert={currentAlert} type={"is mean"}/>

    }

}