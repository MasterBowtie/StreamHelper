import { WebSocket } from 'ws';
import dotenv from "dotenv";
import { callbackify } from 'node:util';

dotenv.config();


// Made by Barry Carlyon
// https://github.com/BarryCarlyon/twitch_misc/blob/main/eventsub/websockets/web/eventsub.js
export class initSocket {
    counter = 0
    closeCodes = {
        4000: 'Internal Server Error',
        4001: 'Client sent inbound traffic',
        4002: 'Client failed ping-pong',
        4003: 'Connection unused',
        4004: 'Reconnect grace time expired',
        4005: 'Network Timeout',
        4006: 'Network error',
        4007: 'Invalid Reconnect'
    }

    constructor(connect) {
        this._events = {};

        if (connect) {
            this.connect();
        }
    }

    connect(url, is_reconnect) {
        this.eventsub = {};
        this.counter++;

        url = url ? url : 'wss://eventsub.wss.twitch.tv/ws';
        is_reconnect = is_reconnect ? is_reconnect : false;

        // log(`Connecting to ${url}|${is_reconnect}`);
        console.log(`Connecting to ${url}|${is_reconnect}`)
        this.eventsub = new WebSocket(url);
        this.eventsub.is_reconnecting = is_reconnect;
        this.eventsub.counter = this.counter;

        this.eventsub.addEventListener('open', () => {
            // log(`Opened Connection to Twitch`);
            // console.log("Opened Connection to Twitch")
        });
        // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event
        // https://github.com/Luka967/websocket-close-codes
        this.eventsub.addEventListener('close', (close) => {
            // console.log('EventSub close', close, this.eventsub);
            console.log(`Connection Close: ${close.code} Reason - ${this.closeCodes[close.code]}`);
            // log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Connection Closed: ${close.code} Reason - ${this.closeCodes[close.code]}`);

            if (!this.eventsub.is_reconnecting) {
                // log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Is not reconnecting, auto reconnect`);
                // new initSocket();
                this.connect();
            }

            if (close.code == 1006) {
                // do a single retry
                this.eventsub.is_reconnecting = true;
            }
        });
        // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event
        this.eventsub.addEventListener('error', (err) => {
            console.log(`Error: ${err}`);
            // log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Connection Error`);
        });
        // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event
        this.eventsub.addEventListener('message', (message) => {
            //log('Message');
            let { data } = message;
            data = JSON.parse(data);
            
            let { metadata, payload } = data;
            let { message_id, message_type, message_timestamp } = metadata;
            //log(`Recv ${message_id} - ${message_type}`);
            // console.log(this.eventsub.counter, message_type, data);

            switch (message_type) {
                case 'session_welcome':
                    let { session } = payload;
                    let { id, keepalive_timeout_seconds } = session;
                    // console.log(payload);

                    // log(`${this.eventsub.counter} This is Socket ID ${id}`);
                    this.eventsub.twitch_websocket_id = id;
                    this.emit("connect", session.id);
                    // log(`${this.eventsub.counter} This socket declared silence as ${keepalive_timeout_seconds} seconds`);

                    if (!this.eventsub.is_reconnecting) {
                        // log('Dirty disconnect or first spawn');
                        this.emit('connected', id);
                        // now you would spawn your topics
                    } else {
                        this.emit('reconnected', id);
                        // no need to spawn topics as carried over
                    }

                    this.silence(keepalive_timeout_seconds);

                    break;
                case 'session_keepalive':
                    //log(`Recv KeepAlive - ${message_type}`);
                    this.emit('session_keepalive');
                    this.silence();
                    break;

                case 'notification':
                    // console.log('notification', metadata, payload);
                    //log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Recv notification`);// ${JSON.stringify(payload)}`);

                    let { subscription, event } = payload;
                    let { type } = subscription;

                    this.emit('notification', { metadata, payload });
                    this.emit(type, { metadata, payload });
                    this.silence();

                    break;

                case 'session_reconnect':
                    this.eventsub.is_reconnecting = true;

                    let reconnect_url = payload.session.reconnect_url;

                    console.log('Connect to new url', reconnect_url);
                    // log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Reconnect request ${reconnect_url}`)

                    //this.eventsub.close();
                    //new initSocket(reconnect_url, true);
                    this.connect(reconnect_url, true);

                    break;
                case 'websocket_disconnect':
                    // log(`${this.eventsub.counter} Recv Disconnect`);
                    console.log('websocket_disconnect', payload);

                    break;

                case 'revocation':
                    // log(`${this.eventsub.counter} Recv Topic Revocation`);
                    // console.log('revocation', payload);
                    this.emit('revocation', { metadata, payload });
                    break;

                default:
                    // console.log(`${this.eventsub.counter} unexpected`, metadata, payload);
                    break;
            }
        });
    }

    trigger() {
        // this function lets you test the disconnect on send method
        this.eventsub.send('cat');
    }
    close() {
        this.eventsub.close();
    }

    silenceHandler = false;
    silenceTime = 10;// default per docs is 10 so set that as a good default
    silence(keepalive_timeout_seconds) {
        if (keepalive_timeout_seconds) {
            this.silenceTime = keepalive_timeout_seconds;
            this.silenceTime++;// add a little window as it's too anal
        }
        clearTimeout(this.silenceHandler);
        this.silenceHandler = setTimeout(() => {
            this.emit('session_silenced');// -> self reconnecting
            this.close();// close it and let it self loop
        }, (this.silenceTime * 1000));
    }

    on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        }

        this._events[name].push(listener);
    }
    emit(name, data) {
        if (!this._events[name]) {
            return;
        }

        const fireCallbacks = (callback) => {
            callback(data);
        };

        this._events[name].forEach(fireCallbacks);
    }
}


var cachedAppToken;
var tokenExpires = 0;
async function getAppAccessToken() {
    if (cachedAppToken && Date.now() < tokenExpires){
        return cachedAppToken;
    }
    let res = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_SECRET,
            grant_type: 'client_credentials'
        })
    }).then((data) => {
        return data.json()
    }).then((json) => {
        cachedAppToken = json.access_token;
        tokenExpires = Date.now() + json.expires_in * 1000 - 60000;
    })
    return cachedAppToken;
}

async function getAppSubs(access_token) {
    // 'https://api.twitch.tv/helix/eventsub/subscriptions' \
// -H 'Authorization: Bearer 2gbdx6oar67tqtcmt49t3wpcgycthx' \
// -H 'Client-Id: wbmytr93xzw8zbg0p1izqyzzc5mbiz'
    var total = fetch('https://api.twitch.tv/helix/eventsub/subscriptions',{
        'method': "GET",
        'headers': {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Authorization": access_token? `Bearer ${access_token}`: ""
        }
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            console.error("Failed to get Subscriptions")
            return {"total": 0, "data": {}};
        }
    }).then((data) => {
        // console.log(data);
        return data;
    })

    return total;
}

// Have to use ngrok for Webhook tunneling
async function getAppHook(access_token, type, topic)
{
    let { version, condition} = topic;
    await fetch(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        {
            "method": "POST",
            "headers": {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                type,
                version,
                condition,
                transport: {
                    method: "webhook",
                    callback: `https://d4ce-2603-6010-4102-9600-318a-e28c-d2cf-d8a9.ngrok-free.app/webhook`,
                    secret: process.env.SECRET
                }   
            })
        }
    )
    .then(resp => resp.json())
    .then(resp => {
        if (resp.error) {
            console.log(`Error with webhook eventsub Call ${type} Call: ${resp.message ? resp.message : ''}`);
            return false;
        } else {
            // console.log(`Subscription Successful`, resp.data);
            console.log(`Created ${type}`);
        }
    })
    .catch(err => {
        console.log(`Error with webhook eventsub Call ${type} Call: ${err.message ? err.message : ''}`);
    });
    return true;
}

export async function requestAppHooks(user_id, topics){
    let access_token = await getAppAccessToken();
    console.log(`access_token: ${access_token}`);
    let subscriptions = await getAppSubs(access_token);
    if (subscriptions.total > Object.keys(topics).length) {
        for (var subs of subscriptions.data) {
            console.log("Delete Id:", subs.id);
            fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subs.id}`,{
                'method': "DELETE",
                'headers': {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${access_token}`
            }});
        }
    }

    subscriptions = await getAppSubs(access_token);
    if (subscriptions.total > 0) {
        let subs = Object.keys(subscriptions.data);
        for (let type in topics) {
            if (!subs.includes(type)){
                getAppHook(access_token, type, topics[type]);
            }
            else {
                console.log("Already subscribed to ", )
            }
        } 
    } else {
        for (let type in topics) {
            getAppHook(access_token, type, topics[type]);
        }
    }
    return true;
}

function getSocketHook(access_token, session_id, type, topic) {
    let { version, condition} = topic;
    fetch(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        {
            "method": "POST",
            "headers": {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                type,
                version,
                condition,
                transport: {
                    method: "websocket",
                    session_id
                }
            })
        }
    )
    .then(resp => resp.json())
    .then(resp => {
        if (resp.error) {
            console.log(`Error with socket eventsub Call ${type} Call: ${resp.message ? resp.message : ''}`);
            return false;
        } else {
            console.log(`Created ${type}`);
        }
    })
    .catch(err => {
        console.log(`Error with socket eventsub Call ${type} Call: ${err.message ? err.message : ''}`);
    });
    return true;
}

export async function requestUserHooks(user_id, access_token, session_id, topics) {
    // console.log("requestHooks")
    console.log(`Spawn Socket Topics for ${user_id}`);
    let subscriptions = await getAppSubs(access_token);
    if (subscriptions.total > 0) {
        for (var subs of subscriptions.data) {
            console.log("Delete Id:", subs.id);
            fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subs.id}`,{
                'method': "DELETE",
                'headers': {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${access_token}`
            }});
        }
    }

    subscriptions = await getAppSubs(access_token);
    console.log("Socket Subs", subscriptions);
    if (subscriptions.total > 0) {
        for (let type in topics) {
            for (var subs of subscriptions.data) {
                if (type !== subs.type) {
                    getSocketHook(access_token, session_id, type, topics[type]);
                }
            }
        } 
    } else {
        for (let type in topics) {
            console.log(type);
            getSocketHook(access_token, session_id, type, topics[type]);
        }
    }
    return true;
}