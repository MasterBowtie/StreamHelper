ALTER TABLE follows
ADD CONSTRAINT uq_follows_twitch_id UNIQUE (twitch_id);

ALTER TABLE subscriptions
ADD CONSTRAINT uq_subscriptions_twitch_id UNIQUE (twitch_id);

ALTER TABLE subscriptions
MODIFY COLUMN event_id INT NULL;

DROP INDEX idx_follows_twitch_id ON follows;
DROP INDEX idx_subscribes_twitch_id ON subscriptions;