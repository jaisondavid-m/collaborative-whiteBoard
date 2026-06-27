CREATE TABLE users (
    id              BIGINT              UNSIGNED            AUTO_INCREMENT      PRIMARY KEY,
    created_at      DATETIME(3)         NULL,
    updated_at      DATETIME(3)         NULL,
    deleted_at      DATETIME(3)         NULL,
    user_id         VARCHAR(30)         NOT NULL            UNIQUE,
    password        VARCHAR(255)        NOT NULL,
    role            VARCHAR(255)        DEFAULT 'user',
    is_deleted      BOOLEAN             DEFAULT FALSE,
    is_blocked      BOOLEAN             DEFAULT FALSE,

    INDEX idx_users_deleted_at (deleted_at)
);

CREATE TABLE rooms (
    id              BIGINT          UNSIGNED        AUTO_INCREMENT      PRIMARY KEY,
    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    room_id         VARCHAR(255)    NOT NULL        UNIQUE,
    name            VARCHAR(255),
    owner_id        BIGINT          UNSIGNED,
    is_active       BOOLEAN         DEFAULT TRUE,
    password        VARCHAR(255)    DEFAULT NULL,

    INDEX idx_rooms_deleted_at (deleted_at)
);

CREATE TABLE audit_logs (
    id              BIGINT              UNSIGNED         AUTO_INCREMENT         PRIMARY KEY,
    created_at      DATETIME(3)         NULL,
    updated_at      DATETIME(3)         NULL,
    deleted_at      DATETIME(3)         NULL,

    actor_id        VARCHAR(255),
    actor_role      VARCHAR(255),
    action          VARCHAR(255),
    target_type     VARCHAR(255),
    target_id       VARCHAR(255),
    meta            TEXT,
    ip              VARCHAR(255),
    status          VARCHAR(255),

    INDEX idx_audit_logs_deleted_at (deleted_at),
    INDEX idx_audit_logs_actor_id (actor_id),
    INDEX idx_audit_logs_action (action)
);

CREATE TABLE notifications (

    id              BIGINT          UNSIGNED            AUTO_INCREMENT          PRIMARY KEY,

    created_at      DATETIME        NULL,
    updated_at      DATETIME        NULL,
    deleted_at      DATETIME        NULL,

    title           VARCHAR(255)    NOT NULL,
    message         TEXT            NOT NULL,

    sender_id       VARCHAR(255),
    recipient_id    VARCHAR(255),

    is_read         BOOLEAN         DEFAULT FALSE,
    type            VARCHAR(255)    DEFAULT 'info',

    INDEX idx_notifications_sender_id (sender_id),
    INDEX idx_notifications_recipient_id (recipient_id),
    INDEX idx_notifications_deleted_at (deleted_at)

);

CREATE TABLE messages (

    id              BIGINT          UNSIGNED           AUTO_INCREMENT   PRIMARY KEY,

    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    sender_id       VARCHAR(255)    NOT NULL,
    receiver_id     VARCHAR(255)    NOT NULL,

    context         TEXT            NOT NULL,
    message_type    VARCHAR(255)    DEFAULT 'text',

    is_read         BOOLEAN         DEFAULT FALSE,
    is_deleted      BOOLEAN         DEFAULT FALSE,

    INDEX idx_messages_deleted_at (deleted_at),
    INDEX idx_messages_sender_id (sender_id),
    INDEX idx_messages_receiver_id (receiver_id)

);

CREATE TABLE converstations (

    id              BIGINT          UNSIGNED        AUTO_INCREMENT      PRIMARY KEY,

    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    user1_id        VARCHAR(255),
    user2_id        VARCHAR(255),

    last_message    TEXT,
    last_sender     VARCHAR(255),

    INDEX idx_converstations_deleted_at (deleted_at),
    INDEX idx_converstations_user1_id (user1_id),
    INDEX idx_converstations_user2_id (user2_id)

);

CREATE TABLE friend_requests (

    id              BIGINT          UNSIGNED                AUTO_INCREMENT      PRIMARY KEY,
    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    sender_id       VARCHAR(255)    NOT NULL,
    receiver_id     VARCHAR(255)    NOT NULL,
    status          VARCHAR(255)    DEFAULT 'pending',

    INDEX idx_friend_requests_deleted_at    (deleted_at),
    INDEX idx_friend_requests_sender_id     (sender_id),
    INDEX idx_friend_requests_receiver_id   (receiver_id)

);

CREATE TABLE friendships (

    id              BIGINT          UNSIGNED        AUTO_INCREMENT      PRIMARY KEY,
    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    user1_id        VARCHAR(255)    NOT NULL,
    user2_id        VARCHAR(255)    NOT NULL,

    INDEX idx_friendships_deleted_at    (deleted_at),
    INDEX idx_friendships_user1_id      (user1_id),
    INDEX idx_friendships_user2_id      (user2_id)

);

CREATE TABLE blocks (

    id              BIGINT          UNSIGNED        AUTO_INCREMENT      PRIMARY KEY,
    created_at      DATETIME(3)     NULL,
    updated_at      DATETIME(3)     NULL,
    deleted_at      DATETIME(3)     NULL,

    blocker_id      VARCHAR(255)    NOT NULL,
    blocked_id      VARCHAR(255)    NOT NULL,

    INDEX idx_blocks_deleted_at (deleted_at),
    INDEX idx_blocks_blocker_id (blocker_id),
    INDEX idx_blocks_blocked_id (blocked_id)

);