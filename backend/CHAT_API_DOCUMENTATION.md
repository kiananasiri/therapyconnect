# TherapyConnect Chat API Documentation

## Overview

The TherapyConnect chat system provides comprehensive one-to-one messaging functionality between therapists and patients. This document outlines the enhanced chat backend features and API endpoints.

## Models

### Enhanced Chat Model

The `Chat` model has been enhanced with the following new fields:

- **status**: Chat status (active, archived, blocked, deleted)
- **last_message_text**: Quick access to the last message content
- **last_message_timestamp**: Timestamp of the last message
- **last_message_sender_id**: ID of the last message sender
- **therapist_unread_count**: Unread message count for therapist
- **patient_unread_count**: Unread message count for patient
- **therapist_notifications**: Notification settings for therapist
- **patient_notifications**: Notification settings for patient

### Enhanced Message Model

The `Message` model has been enhanced with:

- **message_type**: Type of message (text, image, file, system, appointment, prescription)
- **attachment_url**: URL for file attachments
- **attachment_name**: Name of attached file
- **attachment_size**: Size of attached file in bytes
- **read_status**: Message read status (sent, delivered, read)
- **read_at**: Timestamp when message was read
- **read_by**: ID of user who read the message
- **reply_to**: Foreign key to replied message
- **edited**: Boolean indicating if message was edited
- **edited_at**: Timestamp when message was edited
- **deleted**: Boolean indicating if message was soft deleted
- **deleted_at**: Timestamp when message was deleted
- **deleted_by**: ID of user who deleted the message

### New ChatRoom Model

The `ChatRoom` model manages chat room permissions and settings:

- **room_type**: Type of room (therapy, consultation, emergency, general)
- **therapist_can_send**: Permission for therapist to send messages
- **patient_can_send**: Permission for patient to send messages
- **therapist_can_see_history**: Permission for therapist to see message history
- **patient_can_see_history**: Permission for patient to see message history
- **description**: Room description
- **tags**: JSON array of room tags
- **is_active**: Room active status
- **is_archived**: Room archived status

## API Endpoints

### Chat Endpoints

#### Base URL: `/api/chats/`

**GET** `/api/chats/` - List all chats
- Query parameters:
  - `therapist_id`: Filter by therapist ID
  - `patient_id`: Filter by patient ID
  - `status`: Filter by chat status
  - `user_id`: Filter by user participation

**POST** `/api/chats/` - Create a new chat

**GET** `/api/chats/{id}/` - Retrieve a specific chat

**PUT** `/api/chats/{id}/` - Update a chat (full update)

**PATCH** `/api/chats/{id}/` - Update a chat (partial update)

**DELETE** `/api/chats/{id}/` - Delete a chat

#### Custom Chat Actions

**POST** `/api/chats/create_or_get_chat/` - Create or get existing chat
```json
{
  "therapist_id": "t_abc123",
  "patient_id": "p_xyz789"
}
```

**GET** `/api/chats/get_user_chats/?user_id={user_id}` - Get all chats for a user

**POST** `/api/chats/{id}/update_status/` - Update chat status
```json
{
  "status": "active|archived|blocked|deleted"
}
```

**POST** `/api/chats/{id}/toggle_notifications/` - Toggle notifications
```json
{
  "user_id": "t_abc123",
  "notifications_enabled": true
}
```

**POST** `/api/chats/{id}/mark_all_read/` - Mark all messages as read
```json
{
  "user_id": "t_abc123"
}
```

### Message Endpoints

#### Base URL: `/api/messages/`

**GET** `/api/messages/` - List all messages
- Query parameters:
  - `chat_id`: Filter by chat ID
  - `sender_id`: Filter by sender ID
  - `emergency`: Filter by emergency status
  - `message_type`: Filter by message type
  - `read_status`: Filter by read status
  - `exclude_deleted`: Exclude deleted messages (default: true)

**POST** `/api/messages/` - Create a new message

**GET** `/api/messages/{id}/` - Retrieve a specific message

**PUT** `/api/messages/{id}/` - Update a message (full update)

**PATCH** `/api/messages/{id}/` - Update a message (partial update)

**DELETE** `/api/messages/{id}/` - Delete a message

#### Custom Message Actions

**POST** `/api/messages/{id}/mark_emergency/` - Mark message as emergency

**POST** `/api/messages/{id}/mark_read/` - Mark message as read
```json
{
  "user_id": "t_abc123"
}
```

**POST** `/api/messages/{id}/edit_message/` - Edit message
```json
{
  "text": "Updated message text"
}
```

**POST** `/api/messages/{id}/delete_message/` - Soft delete message

**GET** `/api/messages/get_unread_messages/?user_id={user_id}&chat_id={chat_id}` - Get unread messages

**POST** `/api/messages/send_message/` - Send message with enhanced functionality
```json
{
  "chat_id": "CHAT_t_abc123_p_xyz789",
  "text": "Hello, how are you?",
  "message_type": "text",
  "emergency": false,
  "reply_to": "MSG_1234567890_abc"
}
```

### ChatRoom Endpoints

#### Base URL: `/api/chat-rooms/`

**GET** `/api/chat-rooms/` - List all chat rooms
- Query parameters:
  - `room_type`: Filter by room type
  - `is_active`: Filter by active status
  - `is_archived`: Filter by archived status

**POST** `/api/chat-rooms/` - Create a new chat room

**GET** `/api/chat-rooms/{id}/` - Retrieve a specific chat room

**PUT** `/api/chat-rooms/{id}/` - Update a chat room (full update)

**PATCH** `/api/chat-rooms/{id}/` - Update a chat room (partial update)

**DELETE** `/api/chat-rooms/{id}/` - Delete a chat room

#### Custom ChatRoom Actions

**POST** `/api/chat-rooms/{id}/update_permissions/` - Update room permissions
```json
{
  "therapist_can_send": true,
  "patient_can_send": true,
  "therapist_can_see_history": true,
  "patient_can_see_history": true
}
```

**POST** `/api/chat-rooms/{id}/archive_room/` - Archive the chat room

**POST** `/api/chat-rooms/{id}/activate_room/` - Activate the chat room

## Usage Examples

### Creating a Chat Between Therapist and Patient

```bash
curl -X POST http://localhost:8000/api/chats/create_or_get_chat/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "therapist_id": "t_abc123",
    "patient_id": "p_xyz789"
  }'
```

### Sending a Message

```bash
curl -X POST http://localhost:8000/api/messages/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "chat_id": "CHAT_t_abc123_p_xyz789",
    "text": "Hello, how are you feeling today?",
    "message_type": "text",
    "emergency": false
  }'
```

### Getting User's Chats

```bash
curl -X GET "http://localhost:8000/api/chats/get_user_chats/?user_id=t_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Marking Messages as Read

```bash
curl -X POST http://localhost:8000/api/chats/CHAT_t_abc123_p_xyz789/mark_all_read/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": "p_xyz789"
  }'
```

## Features

### Message Types
- **text**: Regular text messages
- **image**: Image attachments
- **file**: File attachments
- **system**: System-generated messages
- **appointment**: Appointment-related messages
- **prescription**: Prescription-related messages

### Read Receipts
- Messages have three states: sent, delivered, read
- Automatic read receipt tracking
- Unread message counts per user

### Message Management
- Edit messages (with edit history)
- Soft delete messages
- Reply to messages
- Emergency message flagging

### Chat Management
- Chat status management (active, archived, blocked, deleted)
- Notification preferences per user
- Unread message counts
- Last message preview

### Permissions
- Granular permissions for sending messages
- History visibility controls
- Room-level access controls

## Security

- All endpoints require authentication
- Users can only access chats they participate in
- Message editing/deletion restricted to sender or chat participants
- Permission checks for all chat operations

## Database Migration

To apply the new chat features, run:

```bash
python manage.py migrate therapy
```

This will create the new fields and indexes for enhanced chat functionality.

## Future Enhancements

- Real-time WebSocket integration for live messaging
- Push notifications for new messages
- Message encryption for sensitive conversations
- File upload handling for attachments
- Message search and filtering
- Chat analytics and reporting
