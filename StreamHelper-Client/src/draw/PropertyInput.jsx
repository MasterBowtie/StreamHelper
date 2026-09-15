export default function PropertyInput({
    MyDraw,
    id,
    element,
    property,
    type,
    label,
    options = [],
}) 
{
    const value = element.properties?.[property];

    function update(value) {
        MyDraw.inputs.updateState(
            id,
            `properties.${property}`,
            value
        );
    }

    switch (type) {
        case "text":
            return (
                <label>
                    {label}
                    <input
                        type="text"
                        value={value ?? ""}
                        onChange={event => update(event.target.value)}
                    />
                </label>
            );

        case "number":
            return (
                <label>
                    {label}
                    <input
                        type="number"
                        value={value ?? ""}
                        onChange={event => update(Number(event.target.value))}
                    />
                </label>
            );

        case "color":
            return (
                <label>
                    {label}
                    <input
                        type="color"
                        value={value ?? "#000000"}
                        onChange={event => update(event.target.value)}
                    />
                </label>
            );

        case "textarea":
            return (
                <div>

                <label>
                    {label}
                </label>
                <textarea
                        value={value ?? ""}
                        onChange={event => update(event.target.value)}
                        />
                </div>
            );

        case "checkbox":
            return (
                <label>
                    {label}
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={event => update(event.target.checked)}
                    />
                </label>
            );

        case "select":
            return (
                <label>
                    {label}
                    <select
                        value={value ?? ""}
                        onChange={event => update(event.target.value)}
                    >
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            );

        case "file":
            return (
                <label>
                    {label}
                    <input
                        type="text"
                        value={value ?? ""}
                        onChange={event => update(event.target.value)}
                    />
                </label>
            );

        default:
            return null;
    }
}

