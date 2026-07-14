# Software Development Plan #

## Structure
    - builders
    - database
    - events
    - routers
    - server (misc)
    - services
    - tests
    - twitch
    - websocket 

## Builders

## Database

### User
    - id: int pk
    - twitch_id: varchar
    - login: varchar
    - user_name: varchar
    - access_token: text
    - expires_at: datetime
    - created_at: datetime
    - updated_at: datetime

### Stream
    - stream_id: int pk
    - start_at: datetime
    - end_at: datetime
    - created_at: datetime
    - updated_at: datetime

### Event
    - event_id: int pk
    - event_type: varchar
    - stream_id: int fk nullable
    - twitch_id: varchar fk nullable
    - occurred_at: datetime
    - created_at: datetime
    - metadata: json

### Followers
    - follow_id: int pk
    - twitch_id: varchar fk
    - event_id: int fk
    - last_verified_at: datetime
    - is_following: bool

### Subscriptions
    - sub_id: int pk
    - twitch_id: varchar fk
    - event_id: int fk
    - tier: varchar
    - months: int
    - is_gift: bool
    - gifted_by_if: varchar fk -> twitch_id nullable
    - is_subscribed: bool
    - last_verified_at: datetime

### Raids
    - event_id: int pk -> fk
    - raider_id: varchar fk -> twitch_id
    - viewer_count: int 

### Settings
    - setting_id: int pk
    - key: varchar unique
    - value: text
    - setting_type: enum(string, number, boolean, password, json)
    - description: text
    - updated_at: datetime
    - created_at: datetime


