import { useAlerts } from "./AlertContext";

export default function AlertContainer() {
    const { currentAlert } = useAlerts();

    if (!currentAlert) {
        return null;
    }

    // TODO: Implement Alerts!
    switch (currentAlert.type) {
        case "twitch.channel.follow":
            return <div>Someone followed!</div>
        case "twitch.channel.subscribed":
            return <div>Someone subscribed!</div>
        case "twitch.channel.raid":
            return <div>Someone raided!</div>
    }

}