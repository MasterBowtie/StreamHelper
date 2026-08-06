# StreamHelper-Client

The official frontend application for Stream Helper.

StreamHelper-Client provides the user interface for managing and interacting with StreamHelper-Server. It is designed to provide a complete user experience for streamers while also serving as a reference implementation for developers building their own clients.

The client communicates with StreamHelper-Server through REST APIs and WebSocket connections, allowing the frontend to remain separate from the backend.

---

## Overview

StreamHelper-Client is responsible for:

* User interface and dashboard functionality
* Twitch connection management
* Communication with StreamHelper-Server
* Displaying stream events
* Managing application settings
* Future overlay and alert configuration

The client does not directly communicate with Twitch. All Twitch communication is handled by StreamHelper-Server.

StreamHelper-Client is currently designed to connect to a local StreamHelper-Server instance running for a single Twitch broadcaster.


---

## Architecture

High-level communication flow:

```text
Twitch
   |
   |
   v
StreamHelper-Server
   |
   ├── REST API
   └── WebSocket API
          |
          |
          v
StreamHelper-Client
          |
          |
          v
       User Interface
```

---

## Features

### Twitch Connection

* Connect Stream Helper to a Twitch account
* View authentication status
* Manage Twitch connection state

### Dashboard

* View server status
* Monitor Twitch events
* Access Stream Helper features

### Event Monitoring

Display information received from StreamHelper-Server:

* Followers
* Subscriptions
* Raids
* Stream events

### Future Features

* Overlay management
* Alert customization
* Stream statistics
* Additional dashboard tools

---

## Technology

### Frontend

* React
* Vite
* JavaScript
* WebSocket client communication

---

## Development

### Requirements

* Node.js
* StreamHelper-Server running locally or remotely

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

The client will connect to a running StreamHelper-Server instance.

---

## Configuration

The client requires a connection to a StreamHelper-Server instance.

Development configuration may include:

* Server URL
* WebSocket connection settings
* API endpoints

Configuration details will expand as the client matures.

---

## Relationship to StreamHelper-Server

StreamHelper-Client is the official frontend for StreamHelper-Server.

The current StreamHelper architecture is designed for individual streamers running their own local instance:

```
StreamHelper-Client
        |
        |
        v
StreamHelper-Server
        |
        |
        v
One Twitch Broadcaster
```

StreamHelper-Server is designed with separation between frontend and backend, allowing developers to build alternative clients in the future.


---

## Project Status

StreamHelper-Client is currently under active development.

Current focus:

* Server communication
* Twitch authentication interface
* Event display
* Dashboard foundation

---

## Future Goals

* Complete streamer dashboard
* Overlay configuration
* Alert customization
* Improved user experience
* Additional visualization tools
