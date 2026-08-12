export default function DrawInput({element}) {

    return (
        <>
            <button id="collapse_button"></button>
            <div className="content">
                {/* Map Inputs */}
                <span>
                    <label></label>
                    <input></input>
                </span>

                <button>Move Forward</button>
                <button>Move Backward</button>
                <button>Delete</button>
            </div>
        </>
    )
}