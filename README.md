# Stream Helper

Stream Helper is a self-hosted companion application for Twitch streamers that works alongside OBS. It allows you to manage overlays, alerts, and Twitch integrations while keeping your data on your own computer.

Many streaming tools require creating an account and storing your overlays and configuration on someone else's servers. Stream Helper takes a different approach. It runs locally, connects directly to Twitch, and provides browser-source overlays that can be added directly to OBS.

Whether you're looking for simple follow alerts or a foundation for more advanced stream automation, Stream Helper is designed to give you ownership of your streaming setup.

Stream Helper currently supports one Twitch broadcaster per installation.

## Getting Started

1. Install Stream Helper.
2. Launch the application.
3. Connect your Twitch account.
4. Stream Helper will begin listening for Twitch events.
5. Follow, subscription, and raid events are automatically tracked and stored locally.

## Current Status

Stream Helper is currently under active development.

### Available

- Twitch authentication
- Twitch EventSub integration
    - [x] Follow tracking
    - [x] Subscription tracking
    - [x] Raid tracking
- Local event storage


## Philosophy

Stream Helper was created around a simple idea: streamers should have the choice to own their streaming tools and data.

Rather than replacing OBS, Stream Helper is designed to complement it by handling Twitch integration, event processing, overlays, alerts, and stream-related data while allowing OBS to remain the streaming and scene management software.

As an open-source, self-hosted application, Stream Helper aims to provide an experience that is straightforward to use while remaining flexible enough for developers to extend and build upon. Whether you're simply looking for local Twitch event tracking or want to build custom streaming tools, Stream Helper is intended to provide a solid foundation without requiring a cloud account or subscription.


## Project Vision

The long-term goal of Stream Helper is to become a complete self-hosted streaming companion that works alongside OBS while giving streamers ownership of their tools and data.

### OBS Integration

* Browser-source overlays
* Event-driven alerts
* Overlay customization
* Widget library
* Easy OBS integration

### Twitch Integration

* Expand EventSub support
* Additional Twitch API features
* Rich stream information
* Music integration

### Stream Management

* Dashboard
* Alert management
* Overlay management
* Stream statistics
* Historical event browser
* Settings management

### Extensibility

* Stable REST API
* Stable WebSocket API
* Server-only distribution
* Custom frontend support
* Plugin architecture

### Ownership

* Self-hosted by default
* Local data storage
* Open source
* No Stream Helper account required
* Streamer-owned configuration

## Development

Stream Helper is an open-source project developed as a personal hobby project.

The project is structured to allow developers to build upon Stream Helper-Server and create their own frontends, integrations, and tools.

Development documentation will be expanded as the project matures.