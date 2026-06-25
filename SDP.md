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

## Twitch

### TwitchConfig
    - clientId
    - clientSecret
    - redirectUri
    - oauth
        - authUrl
        - tokenUrl
        - validateUrl
    - helix
        - baseUrl
    - eventSub
        - wsUrl
    - scopes : array

### TwitchAuthService
    - getLoginUrl
    - exchangeCodeForToken
    - refreshAccesToken
    - fetchTwitchUser
    - authenticateBroadcaster