import "../../css/alert.css"
import { useEffect } from "react";

export function BasicAlert({alert, type}) {

    useEffect(() => {
        console.log(alert);
        alert?.sound?.play();
    }, [alert])


    return (
        <div className="alert">
            <div className="image-container">
                <img src="bowtie.png" className="bounce"/>
            </div>
            <span className="title">
                {alert?.data?.payload?.user_name} {type}
            </span>
        </div>
    )
}