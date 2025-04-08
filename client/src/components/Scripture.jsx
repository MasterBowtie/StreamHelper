function Scripture({className, style}) {
    console.log(style);
    return (
    <div className={`scripture ${className}`} style={style}>
        <p>
        11 Go your way whithersoever I will, and it shall be given you by the Comforter what you shall do and whither you shall go.
        </p><br/>
        <p>
            D&C 31:11
        </p>
    </div>
    )
}

export default Scripture
