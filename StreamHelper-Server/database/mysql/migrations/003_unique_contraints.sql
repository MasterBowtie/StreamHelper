ALTER TABLE follows
ADD CONSTRAINT uq_follows_twitch_id UNIQUE (twitch_id);

ALTER TABLE subscriptions
ADD CONSTRAINT uq_subscriptions_twitch_id UNIQUE (twitch_id);

ALTER TABLE subscriptions
MODIFY COLUMN event_id INT NULL;

DROP INDEX idx_follows_twitch_id ON follows;
DROP INDEX idx_subscribes_twitch_id ON subscriptions;

ALTER TABLE settings
ADD COLUMN section VARCHAR(50) NOT NULL DEFAULT 'general'
AFTER setting_id;

ALTER TABLE settings
DROP INDEX `key`,
ADD CONSTRAINT uq_settings_section_key
UNIQUE (section, setting_key);