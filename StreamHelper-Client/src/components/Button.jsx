export default function Button({className, text, onClick, disabled=false}) {


    return (
        <button className={className} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
}