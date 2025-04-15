function Scripture({className, style}) {
    console.log(style);
    return (
    <div className={`scripture ${className}`} style={style}>
        <p>
        17 And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God.
        </p><br/>
        <p>
            Mosiah 2:17
        </p>
    </div>
    )
}

export default Scripture
