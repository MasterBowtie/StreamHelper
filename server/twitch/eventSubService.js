import { twitchConfig } from "./twitchConfig.js";

function buildEventSubService({
    twitchApiClient
}) {
    let socket = null;
    let sessionId = null;
    let readyPromise = null;
    let resolveReady = null;

    async function start() {
        if (socket) {
            return;
        }
        readyPromise = new Promise((resolve)=> {
            resolveReady = resolve;
        })

        socket = new WebSocket(
            twitchConfig.eventSub.wsUrl
        );

        socket.addEventListener(
            'message',
            handleMessage
        );
    }

    function stop() {
        if (socket) {
            socket.close();
            socket = null;
        }
        sessionId = null;
        
        if (resolveReady) {
            resolveReady();
        }
        readyPromise = null;
        resolveReady = null;
        
        console.log("EventSub stopped")
    }

    async function handleMessage(event) {
        const message = JSON.parse(event.data);
        const type = message.metadata?.message_type;
         
        switch (type) {
            case 'session_welcome':
                await handleWelcome( message );
                break;
            
            case 'notification': 
                handleNotification(message);
                break;
            
            case 'session_keepalive':
                console.log("EventSub keepalive received...")
                break;
            
            case 'session_reconnect':
                handleReconnect(message);
                break;
            
            default:
                console.log('Unhandled EventSub message', type);
        }
    }

    async function handleWelcome(message) {
        sessionId = message.payload.session.id;
        console.log('EventSub connected', sessionId);
        
        resolveReady();
    }

    async function registerSubscriptions(broadcaster) {
        await readyPromise;
        await twitchApiClient.createEventSubSubscription({
            type: 'stream.online',
            version: '1',
            condition: {
                broadcaster_user_id: broadcaster.twitch_user_id
            },
            sessionId
        });
    }

    function handleNotification(message) {
        console.log('EventSub Notification', message.payload.event);
    }

    function handleReconnect(message) {
        const reconnectUrl = message.payload.session.reconnect_url;

        console.log('Reconnecting EventSub to:', reconnectUrl);

        // Close old socket
        if (socket) {
            socket.close();
        }

        // Open new socket
        socket = new WebSocket(reconnectUrl);

        socket.addEventListener('message', handleMessage);

        // Reset session (will be re-established)
        sessionId = null;

        // Recreate ready gate
        readyPromise = new Promise((resolve)=>{
            resolveReady = resolve;
        });
    }
    

    return {
        start,
        stop
    };
}

export {
    buildEventSubService
}