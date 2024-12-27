import { WebSocket } from 'ws';
import dotenv from "dotenv";

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
            console.log("Opened Connection to Twitch")
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

export function requestHooks(user_id, access_token, session_id, topics) {
    console.log("requestHooks")
    console.log(`Spawn Topics for ${user_id}`);

    for (let type in topics) {
        console.log(`Attempt create ${type} - ${user_id}`);
        let { version, condition } = topics[type];


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
                    console.log(`Error with eventsub Call ${type} Call: ${resp.message ? resp.message : ''}`);
                } else {
                    console.log(`Created ${type}`);
                }
            })
            .catch(err => {
                console.log(err);
                // log(`Error with eventsub Call ${type} Call: ${err.message ? err.message : ''}`);
            });
    }
}