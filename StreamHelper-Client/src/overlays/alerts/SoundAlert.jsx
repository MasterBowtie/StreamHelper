import { useEffect } from "react";


export function SoundAlert({alert}) {

    useEffect(()=> {
        console.log(alert);
        alert?.sound?.play()
    }, [alert])

    return (<></>);
}