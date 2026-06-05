CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NULL,
    updated_at DATETIME(3) NULL,
    deleted_at DATETIME(3) NULL,
    user_id VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'user',
    is_deleted BOOLEAN DEFAULT FALSE,

    INDEX idx_users_deleted_at (deleted_at)
);

CREATE TABLE rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NULL,
    updated_at DATETIME(3) NULL,
    deleted_at DATETIME(3) NULL,

    room_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    owner_id BIGINT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    password VARCHAR(255) DEFAULT NULL,

    INDEX idx_rooms_deleted_at (deleted_at)
);

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NULL,
    updated_at DATETIME(3) NULL,
    deleted_at DATETIME(3) NULL,

    actor_id VARCHAR(255),
    actor_role VARCHAR(255),
    action VARCHAR(255),
    target_type VARCHAR(255),
    target_id VARCHAR(255),
    meta TEXT,
    ip VARCHAR(255),
    status VARCHAR(255),

    INDEX idx_audit_logs_deleted_at (deleted_at),
    INDEX idx_audit_logs_actor_id (actor_id),
    INDEX idx_audit_logs_action (action)
);