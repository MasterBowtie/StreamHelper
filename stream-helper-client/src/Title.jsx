function Title({title, className}) {
    return (
        <div>
            <p className={`title_bg`}>{title}</p>
            <p className={`title`}>{title}</p>
        </div>
    )
}

export default Title