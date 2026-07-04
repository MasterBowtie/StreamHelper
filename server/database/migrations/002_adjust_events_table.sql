ALTER TABLE events ADD COLUMN stream_id INT NUll;

CREATE INDEX idx_events_stream_id ON events(stream_id);

ALTER TABLE events
ADD CONSTRAINT fk_events_stream
FOREIGN KEY (stream_id)
REFERENCES streams(stream_id);

CREATE TABLE raids (
    event_id INT NOT NULL PRIMARY KEY,
    raider_id VARCHAR(50) NOT NULL,
    viewer_count INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (raider_id) REFERENCES twitch_users(twitch_id),

    INDEX idx_raids_raider_id (raider_id)
);