# HAICA — Entity Relationship Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        string name
        string email UK
        string password
        string avatar
        string status "ACTIVE | SUSPENDED | BANNED | DELETED"
        uuid roleId FK "nullable"
        datetime lastLoginAt
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    Role {
        uuid id PK
        string name UK
        string description
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    Permission {
        uuid id PK
        string name UK
        string description
        string category
        boolean used
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    RolePermission {
        uuid roleId PK_FK
        uuid permissionId PK_FK
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        uuid id PK
        string token UK
        uuid userId FK
        string ip
        string userAgent
        datetime expiresAt
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        uuid id PK
        string action
        string details
        uuid userId FK "nullable"
        uuid targetId "nullable"
        string targetType "nullable"
        string ip
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    Notification {
        uuid id PK
        uuid userId FK
        string title
        string message
        string type "info | warning | error | success"
        boolean read
        string link
        uuid createdBy
        uuid updatedBy
        datetime createdAt
        datetime updatedAt
    }

    Role ||--o{ User : "has"
    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "assigned to"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ AuditLog : "performs"
    User ||--o{ Notification : "receives"
```

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| User | Role | Many-to-One | Each user has one role (nullable) |
| Role | Permission | Many-to-Many | Via `RolePermission` junction table |
| User | RefreshToken | One-to-Many | Each user owns multiple refresh tokens |
| User | AuditLog | One-to-Many | Each user performs multiple audit actions |
| User | Notification | One-to-Many | Each user receives multiple notifications |

## Status Values

- **User.status**: `ACTIVE` | `SUSPENDED` | `BANNED` | `DELETED`
- **Notification.type**: `info` | `warning` | `error` | `success`
- **Notification.read**: `true` | `false`
