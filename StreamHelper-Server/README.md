# StreamHelper-Server

A self-hosted backend platform for Twitch integrations, event processing, and stream data management.

StreamHelper-Server provides the core functionality behind Stream Helper, handling Twitch authentication, EventSub communication, event processing, data storage, and real-time communication.

The server is designed to be used independently, allowing developers to build their own dashboards, applications, overlays, or integrations on top of the Stream Helper backend.

---

## Overview

StreamHelper-Server acts as the connection between Twitch and your applications.

It handles:

* Twitch authentication
* Twitch API communication
* Twitch EventSub WebSocket connections
* Event processing
* Data storage
* REST API access
* WebSocket communication

The server does not require the official Stream Helper frontend. Developers can create their own clients using the available APIs.


## Current Limitations

StreamHelper-Server currently supports one Twitch broadcaster per installation.

This design matches the self-hosted approach of Stream Helper, where each streamer runs their own instance and maintains ownership of their own data.

## Architecture

High-level flow:

```
Twitch
   |
   |
   v
StreamHelper-Server
   |
   ├── Twitch Authentication
   ├── Twitch API Client
   ├── EventSub Service
   ├── Event Dispatcher
   ├── Event Handlers
   ├── Database Layer
   └── API/WebSocket Interface
            |
            |
            v
       Custom Frontend
```

---

## Features

### Twitch Integration

* OAuth authentication
* Access token management
* Twitch API requests
* EventSub WebSocket connection

### Event Processing

StreamHelper-Server receives Twitch events and processes them through an event-driven architecture.

Current supported events:

* Followers
* Subscriptions
* Raids
* Stream online/offline events

---

### Data Management

The server stores and manages stream-related data through repository-based database access.

Current repositories include:

* Users
* Events
* Streams
* Followers
* Subscriptions
* Raids

---

### Developer Access

Applications can communicate with StreamHelper-Server through:

* REST API
* WebSocket events

This allows developers to create:

* Custom dashboards
* Alternative frontends
* Custom overlays
* Stream tools
* Third-party integrations

---

## Technology

### Backend

* Node.js
* Express.js
* MySQL
* Twitch API
* Twitch EventSub
* WebSockets

### Database

StreamHelper-Server currently uses MySQL for data storage.

The database layer is built using repositories to keep database interactions separated from the application logic. This allows future database support without requiring major changes throughout the application.

SQLite support is planned to better support the self-hosted nature of Stream Helper and simplify installation for individual users.


## Development

### Requirements

* Node.js
* Database server

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

---

## Relationship to Stream Helper

StreamHelper-Server is the backend foundation for the Stream Helper application.

The official Stream Helper frontend provides a complete user experience, but the server can also be used independently.

```
Stream Helper
|
├── StreamHelper-Server
|
└── React Frontend
```

Developers are free to build their own frontend or integrate StreamHelper-Server into their own projects.

---

## Project Status

StreamHelper-Server is currently under active development.

Current focus:

* Twitch authentication
* EventSub integration
* Event tracking
* Backend API design
* Frontend-independent architecture

---

## Future Goals

* Move from MySQL to SQLite for simplified self-hosted deployments
* Stable public API
* API documentation
* Additional Twitch integrations
* Plugin architecture
* Improved developer tooling
