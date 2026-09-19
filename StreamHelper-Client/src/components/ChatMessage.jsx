export function ChatMessage({message}) {
    // TODO: Ignore !commands
    if (message.fragments[0].text.startsWith("!")) return;

    return (
        <div className="flex gap-2 px-3 py-1 break-words">
            <div className="flex items-start gap-1">
                {message.badges?.map(badge => (
                    <img key={`${badge.set_id}-${badge.id}`} src={badge.url} alt="" className="h-5 w-5"/>
                ))}
                <span className="font-bold" style={{color: message.color}}>
                    {message.chatter_user_name}:
                </span>
            </div>
            <span className="ml-2 text-white font-semibold"
                style={{
                    textShadow: `
                        -1px -1px 0 #000,
                         1px -1px 0 #000,
                        -1px  1px 0 #000,
                         1px  1px 0 #000
                    `
                }}>
                {message.fragments?.map((fragment, index) => {
                    if (fragment.type === "emote") {
                        return (
                            <img key={index} src={fragment.url} alt={fragment.text} className="inline-block h-6 align-middle"/>
                        );
                    }
                    return fragment.text;
                })}
            </span>
        </div>
    )
}