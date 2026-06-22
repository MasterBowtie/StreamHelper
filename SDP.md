# Software Development Plan #

## TODO:
- Refactor MySQL 
    - Remove Prisma


## Database

### User
    - id: INT primary_key autoincrement
    - twitch_id: VARCHAR(50)
    - user_name: VARCHAR(50)
    - access_token: TEXT
    - expires_at: DATETIME
    - created_at: DATETIME
    - updated_at: DATETIME

