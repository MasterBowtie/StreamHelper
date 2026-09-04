import { useState, useEffect } from "react"
import PropertyInput from "./PropertyInput";

const propertyConfig = {
    box: [
        { property: "color", type: "color", label: "Color" },
        { property: "radii", type: "number", label: "Radius" },
    ],

    circle: [
        { property: "color", type: "color", label: "Color" },
    ],

    image: [
        { property: "filepath", type: "file", label: "File" },
    ],

    text: [
        { property: "color", type: "color", label: "Color" },
        { property: "content", type: "textarea", label: "Content" },
        {
            property: "font",
            type: "select",
            label: "Font",
            options: ["Arial", "Helvetica", "Times New Roman"],
        },
        { property: "text_size", type: "number", label: "Text Size" },
        { property: "spacing", type: "number", label: "Spacing" },
    ],

    textbox: [
        { property: "color", type: "color", label: "Color" },
        { property: "content", type: "textarea", label: "Content" },
        {
            property: "font",
            type: "select",
            label: "Font",
            options: ["Arial", "Helvetica", "Times New Roman"],
        },
        { property: "text_size", type: "number", label: "Text Size" },
        { property: "spacing", type: "number", label: "Spacing" },
    ],

    video: [
        { property: "filepath", type: "file", label: "File" },
        { property: "autoplay", type: "checkbox", label: "Autoplay" },
        { property: "loop", type: "checkbox", label: "Loop" },
        { property: "muted", type: "checkbox", label: "Muted" },
    ],
};

export default function DrawInput({MyDraw, id}) {
    const [element, setElement] = useState(() => MyDraw.state.getElement(id));


    useEffect(()=> {
        MyDraw.inputs?.registerCallback(id, element => {
            setElement(element);
        });

        return () => {MyDraw.inputs.unregisterCallback(id)}
    }, [MyDraw, id])

    if (!element) {
        return <p>Loading element...</p>
    }

    const properties = propertyConfig[element.type] ?? [];

    return (
        <div>
            <label> Name <input type="text" value={element.name ?? ""} onChange={event => MyDraw.inputs.updateState(id, "name", event.target.value)}/></label>

            <label> X <input type="number" value={element.x ?? "0"} onChange={event => MyDraw.inputs.updateState(id, "x", Number(event.target.value))}/></label>

            <label> Y <input type="number" value={element.y ?? "0"} onChange={event => MyDraw.inputs.updateState(id, "y", Number(event.target.value))}/></label>
            
            <label> W <input type="number" value={element.w ?? "0"} onChange={event => MyDraw.inputs.updateState(id, "w", Number(event.target.value))}/></label>
            
            <label> H <input type="number" value={element.h ?? "0"} onChange={event => MyDraw.inputs.updateState(id, "h", Number(event.target.value))}/></label>
            
            <label> Rotation <input type="number" value={element.rotation ?? "0"} onChange={event => MyDraw.inputs.updateState(id, "rotation", Number(event.target.value))}/></label>

            {properties.map(({property, type, label, options}) => (
                <PropertyInput
                key={property}
                MyDraw={MyDraw}
                id={id}
                element={element}
                property={property}
                type={type}
                label={label}
                options={options}
                />
            ))}

            <button onClick={()=> MyDraw.state.shiftForward(id)}>Move Forward</button>
            <button onClick={()=> MyDraw.state.shiftBackward(id)}>Move Backward</button>
            <button onClick={()=> MyDraw.state.deleteElement(id)}>Delete</button>
        </div>
        
    )
}