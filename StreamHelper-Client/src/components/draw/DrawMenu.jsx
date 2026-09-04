import { useState, useEffect } from "react";
import DrawInput from "./DrawInput";

export default function DrawMenu({MyDraw}) {
    const [ids, setIds] = useState([])

    useEffect(() => {
        MyDraw.inputs?.attachDeleteCallback((id) => {
            setIds(current => current.filter(currentId => currentId !== id));
        });
    }, [MyDraw]);

    return (
        <div className="overflow-y-scroll">
            <button onClick={() => {
                    const id = MyDraw.state.addElement("text");
                    MyDraw.state.setCurrentElement(id);
                    setIds(current => [...current, id])
                }}>
                Add Text
            </button>

            <button onClick={() => {
                    const id = MyDraw.state.addElement("box");
                    MyDraw.state.setCurrentElement(id);
                    setIds(current => [...current, id])
                }}>
                Add Box
            </button>

            {ids.map((id)=> (
                    <DrawInput key={id} MyDraw={MyDraw} id={id}/>
            ))}
        </div>
    )
}

// setMessages(current => {
//                 const updated = [
//                     {
//                         time: date,
//                         message: message.type
//                     },
//                     ...current
//                 ];

//                 return updated.slice(0, 100);
//             });