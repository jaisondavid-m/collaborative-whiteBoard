# SketchBoard

SketchBoard is a real-time collaborative whiteboard and messaging platform. People can spin up a drawing room and sketch together live, chat privately with friends and admins get a dedicated panel to manage users, review activity and broadcast notifications.

---

## Overview

SketchBoard combines two real-time systems build on top of the same account/auth layer:

1. A **shared whiteboard** where multiple people draw on one canvas at once, with draing events streamed live over WebSockets.
2. A **private messaging system** with friends, blocking, typing indicators and presence - independent of the whiteboard rooms.

On top of that sits a lightweight **admin/superadmin system** for moderating users and sending notifications, plus an audit log of activity across the app.

## Features

### Whiteboard Rooms
- Create a room with a name and an optional password; rooms are identified by a unique room ID.
- Join a room via WebSocket with password verification if the room is protected.
- Drawing tool: **Pen, Eraser, Rectangle, Circle, Line** - each with adjustable color (10-color platte) and stroke size (5 preset sizes).
- Drawing actions (`begin`,`draw`,`shape`,`clear`) are broadcast live to everyone in the room.
- Full drawing history is kept in memory per room and anyone can continue in that if they joins in late
- A live **presence list** shows who's currently in the room.
- An in-room **chat panel** runs alongside the canvas, with its own history sent to new joiners.
- Room with zero connected clients are automatically cleaned up after a 30-second grace period (so a brief refresh doesn't wipe the room)
- A user's own rooms list (`/room/list`) shows whether each room is currently live and how many people are in it.

### Private Messaging
- One-to-one conversations, listed and sorted by most recent activity.
- Message support **text and images** (image uploads capped at 5MB; jpg, jpeg, png, gif, webp allowed).
- **Edit** and **soft-delete** your own messages (deleted messages show a placeholder instead of being removed from the thread).
-- **Read recipts** - messages are marked read when the recipient opens the conversation, with a live unread counter.
- **Typing indicators** and **online presence**, delivered over a dedicated private-chat WebSocket hub.
- Infinite scroll - older messages are paginated and loaded as you scroll up.
- Blocked users cannot send messages to each other in either direction.

### Friends
- Send, accept or reject friend requests.
- View your friends list and remove a friendship.
- Block and unblock users - blocking automatically removes any existing friendship and cancels pending friend request between the two users.
- Check Whether a specific user has blocked you.

### Notifications
- Users have an in-app notification center with unread counts, "mark as read," and "mark all as read."
- Admins can broadcast a notification to everyone or target specific selected users, each with a type (`info`,`warning`,`alert`). 

### Accounts & Auth
- Username/password registration and login with password strength rules (8-64 charcters, requires upper/lowercase, a number and a special character) and username rules (4-30 alphanumeric characters).
- **Guest login** - creates a temporary account with a randomly generated ID and password; inactive guest accounts are cleaned up by a recurring background job.
- **Google Sign-In** - verifies a Google ID token and creates or logs into matching account.
- JWT-based sessions (3-hour expiry) with the active token stored against the user record so it can be invalidated on logout.
- Soft account deletion (self-service) and blocking (moderation) - deleted/blocked users are excluded from login and from most user-facing queries.

### Admin Panel
- List all users with role, block/delete status and join date.
- Block, Unblock, soft-delete and recover user accounts (superadmin accounts are protected from all of these).
- Promote/demote users between `user` and `admin`.
- Send broadcast or targeted notifications from a dedicated composer with recipient search.
- View **audit logs** and stats: online user count, today's visits and a monthly visit graph.

### Extras
- Optional **custom cursor themes** (a spring-lagged dot and ring and a rotating crosshair reticle), toggleable per-user and stored locally with a live interactive preview sandbox in Settings.
- Toast-based notification system across the UI for success/error feedback.
- Rate limiting on auth and general API routes to guard against abuse.

## Tech Stack

**Backend**
- **Go** with [Gin](https://gin-gonic.com/) web framework
- **GORM** as ORM, running on **TiDB** (MySQL-compatible, connected over TLS with a custom CA certificates)
- **Websocket** (`gorilla/websocket`) - one hub for whiteboard rooms, a seperate hub for private caht
- **JWT** (`golang-jwt/jwt`) for session tokens, **bcrypt** for pasword hashing
- **Google `idtoken`** package for verifying Google Sign-In tokens
**go-cache** for in-memory caching of user lookups, friends lists and unread counts
- Custom middleware for auth, admin/superadmin gating, rate limiting and audit logging
- A background goroutine that runs a guest-account cleanup job on start and then every 24 hours

**Frontend**
- **React** with **React Router** for client-side routing and route protection (proctected/guest-only routes)
- **Zustand** (with the `persist` middleware) for auth/session state, replacing an earlier Context-Based implementation
- **Axios** for API calls, with interceptors that attach the bearer token and auto-logout on `401` response
- **Tailwind CSS** for styling
- **react-icons** and **lucide-react** for icongraphy
- Native browser **Websocket API** for the whiteboard and private-chat real-time connections


- Whiteboard state (drawing history, connected clients, chat history) lives **in memory per room** on the server; it is not persisted to the database, so it resets when a room's last client disconnects and the cleanup timer fires.
- Private messages, conversations, friendships, blocks, notifications and users are all persisted in TiDB via GORM.
- Two independent WebSocket hubs run inside the same process: one keyed by room ID (whiteboard), one keyed by User ID (private chat/presence).

## API Overview

All protected routes require `Authorization: Bearer <token>` (or a `token` query parameter for WebSocket upgrades).

| Group | Base path | Examples |
|---|---|---|
| Public auth | `/auth` | `POST /register`, `POST /login`, `POST /google`, `POST /guest` (rate-limited) |
| Protected (user) | `/api` | `GET /profile`, `DELETE /user`, `/POST /logout` |
| Messages | `/api/messages` | `POST /send` , `POST /send-image`, `GET /conversations`, `GET /unread-count` |
| Friends | `/api/friends` | `POST /request` , `PUT /request/:requestId`, `GET /requests` , `GET /list`, `DELETE /:friendshipId`, `POST /block/:userId`, `DELETE /block/:userId`, `GET /blocked` , `GET /blocked-by/:userId` |
| Notifications | `/api` | `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Rooms | `/api/room` | `POST /create` , `GET /join/:roomId` (WebSocket), `GET /list`, `POST /check/:roomId` | 
| WebSocket | `/ws` | `GET /private` - private chat socket |
| Admin | `/admin` | `GET /users`, `DELETE /users/:userId`, `PUT /users/:userId`, `PUT /users/:userId/block`, `PUT /users/:userId/unblock`, `GET /audit-logs`, `GET /audit-logs/stats`, `POST /notifications/send`, `Get /stats/online`, `GET /stats/today`, `GET /stats/month` |
| superadmin | `/superadmin` | `POST /promote` |

## Data Models

- **User** - `userid`, hashed password, `role` (`user`/`admin`/`superadmin`/`guest`),`is_deleted`,`is_blocked`, `is_guest`, current session token, last active timestamp.
- **Room** - `roomId`, name, owner, active flag, optional hashed password
- **Message** - sender/receiver, content, message type (`text`/`image`), erad/edited/deleted flags.
- **Conversation** - a denormalized pointer per user-pair with the last message and last sender, used to drive the conversations list
- **FriendRequest** - sender, receiver, status (`pending`/`accepted`/`rejected`).
- **Friendship** - a normalized user-pair record created on acceptance.
- **Block** - blocker/blocked user-pair
- **Notification** - title, message, sender, recipient (empty = broadcast), type, read flag,
- **UserVisit** - per-user, per-day visit record used for the admin stats graphs.

## Environment Variables

Set these in a `.env` file at the project root (loaded via `godotenv`)

```
TIDB_USERNAME=
TIDB_PASSWORD=
TIDB_HOST=
TIDB_PORT=
TIDB_DATABASE=
TIDB_CA_PATH=        # path to the TiDB CA certificate for TLS
GOOGLE_CLIENT_ID=    # for Google Sign-In token verification
```

## Roles & Permissions

| Role | Can do |
|---|---|
| **guest** | Use core features with a temporary, auto-generated account; cleaned up a automatically after inactivity |
| **user** | Register/Login, create & join rooms, chat, manage friends and notifications |
| **admin** | Everything a user can do, plus: manage users (block/unblock/delete/recover), send notifications, view audit logs and usage stats |
| **superadmin** | Everything an admin can do, plus promte/demote users between `user` and `admin`; superadmin accounts themselves cannot be blocked, deleted or demoted |

## Security Notes

- Passwords are hashed with bcrypt (cost factor 14) before storage.
- Sessions use short-lived (3-hour) JWTs; logging out clears the stored cuurent token server-side.
- Room passwords, when set, are hashed the same way as account passwords.
- Auth and general API routes are rate-limited seperately to reduce brute-force and abuse risl.
- All privileged admin/superadmin routes are gated by dedicated middleware in addition to standart auth.
- Blocked/deleted users are excluded from active-user lookup (login, messaging, friend actions) at the query level.