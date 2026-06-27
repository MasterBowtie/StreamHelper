# Software Development Plan #

## TODO:
- Refactor MySQL 
    - Remove Prisma


## Database

### User
    - id: INT primary_key autoincrement
    - twitch_id: VARCHAR(50)
    - login: VARCHAR(50)
    - user_name: VARCHAR(50)
    - access_token: TEXT
    - expires_at: DATETIME
    - created_at: DATETIME
    - updated_at: DATETIME

### [ ] Stream
    - id: INT primary_key autoincrement
    - start_at: DATETIME
    - end_at: DATETIME

### [ ] Event
    - id: BIGINT primay_key autoincrement
    - type: VARCHAR(20)
    - twitch_user_id: VARCHAR(50)
    - stream_id: INT foreign key
    - created_at: DATETIME
    - view_count: INT
    - tier:
    - is_gift:
    - metadata: TEXT

## Twitch

### TwitchConfig
    clientId
    clientSecret
    redirectUri
    oauth
        authUrl
        tokenUrl
        validateUrl
    helix
        baseUrl
    eventSub
        wsUrl
    scopes : array

### TwitchAuthService
    + getLoginUrl
    + exchangeCodeForToken
    + refreshAccesToken
    + fetchTwitchUser
    + authenticateBroadcaster

### TokenManager
    + getValidAccessToken

### TwitchApiClient
    + getCurrentUser
    + createEventSubSubscription
    + getEventSubSubSubscription
    + getStream
    + getChannelInformation

### EventDispatcher
    + dispatch
    + registerHandler

### EventSubService
    + start
    + stop
    + registerSubscriptions
    - handleMessage
    - handleNotification
    - handleReconnect