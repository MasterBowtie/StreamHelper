function Title({title, className}) {
    return (
        <div className="title">
            {title.map(data => {
                return (
                    <p>{data}</p>
                )
            })}
        </div>
    )
}

export default Title