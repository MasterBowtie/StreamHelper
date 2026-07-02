IF NOT EXISTS CREATE TABLE streams (
    stream_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    start_at DATETIME NOT NULL,
    end_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

IF NOT EXISTS CREATE TABLE events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    twitch_id VARCHAR(50),
    occurred_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (twitch_id) REFERENCES twitch_users(twitch_id),
    INDEX idx_events_occurred_at (occurred_at)
);

IF NOT EXISTS CREATE TABLE follows (
    follow_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    twitch_id VARCHAR(50),
    event_id INT,
    last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_following BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (twitch_id) REFERENCES twitch_users(twitch_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    INDEX idx_follows_twitch_id (twitch_id)
);


IF NOT EXISTS CREATE TABLE subscriptions (
    sub_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    twitch_id VARCHAR(50) NOT NULL,
    event_id INT NOT NULL,

    tier VARCHAR(4) NOT NULL,
    months INT,
    
    is_gift BOOLEAN NOT NULL DEFAULT FALSE,
    gifted_by_id VARCHAR(50),
    
    is_subscribed BOOLEAN DEFAULT FALSE,
    last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (twitch_id) REFERENCES twitch_users(twitch_id),
    FOREIGN KEY (gifted_by_id) REFERENCES twitch_users(twitch_id),

    INDEX idx_subscribes_twitch_id (twitch_id),
    INDEX idx_subscriptions_gifted_by (gifted_by_id)
);

IF NOT EXISTS CREATE TABLE raids(
    event_id INT NOT NULL PRIMARY KEY,
    raider_id VARCHAR(50) NOT NULL,
    viewer_count INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (raider_id) REFERENCES twitch_users(twitch_id),

    INDEX idx_raids_raider_id (raider_id)
);