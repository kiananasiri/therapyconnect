import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Chat, Message, Patient, Therapist
from django.utils import timezone
import uuid


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'
        
        # Join chat group
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to chat {self.chat_id}'
        }))

    async def disconnect(self, close_code):
        # Leave chat group
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'message_read':
                await self.handle_message_read(data)
            elif message_type == 'message_edited':
                await self.handle_message_edited(data)
            elif message_type == 'message_deleted':
                await self.handle_message_deleted(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing message: {str(e)}'
            }))

    async def handle_chat_message(self, data):
        """Handle incoming chat messages"""
        text = data.get('text', '').strip()
        sender_id = data.get('sender_id')
        message_type = data.get('message_type', 'text')
        emergency = data.get('emergency', False)
        reply_to = data.get('reply_to')
        
        if not text or not sender_id:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Text and sender_id are required'
            }))
            return
        
        # Validate chat exists and user is participant
        chat = await self.get_chat(self.chat_id)
        if not chat:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Chat not found'
            }))
            return
        
        if sender_id not in [chat['therapist_id'], chat['patient_id']]:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'You are not a participant in this chat'
            }))
            return
        
        # Create message
        message = await self.create_message(
            chat_id=self.chat_id,
            sender_id=sender_id,
            text=text,
            message_type=message_type,
            emergency=emergency,
            reply_to=reply_to
        )
        
        if message:
            # Update chat with last message info
            await self.update_chat_last_message(self.chat_id, message)
            
            # Send message to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to create message'
            }))

    async def handle_typing(self, data):
        """Handle typing indicators"""
        user_id = data.get('user_id')
        is_typing = data.get('is_typing', False)
        
        if user_id:
            # Send typing indicator to other participants
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': user_id,
                    'is_typing': is_typing
                }
            )

    async def handle_message_read(self, data):
        """Handle message read receipts"""
        message_id = data.get('message_id')
        user_id = data.get('user_id')
        
        if message_id and user_id:
            success = await self.mark_message_read(message_id, user_id)
            
            if success:
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'message_read_receipt',
                        'message_id': message_id,
                        'user_id': user_id,
                        'read_at': timezone.now().isoformat()
                    }
                )

    async def handle_message_edited(self, data):
        """Handle message editing"""
        message_id = data.get('message_id')
        new_text = data.get('text')
        user_id = data.get('user_id')
        
        if message_id and new_text and user_id:
            success = await self.edit_message(message_id, new_text, user_id)
            
            if success:
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'message_edited',
                        'message_id': message_id,
                        'new_text': new_text,
                        'edited_at': timezone.now().isoformat()
                    }
                )

    async def handle_message_deleted(self, data):
        """Handle message deletion"""
        message_id = data.get('message_id')
        user_id = data.get('user_id')
        
        if message_id and user_id:
            success = await self.delete_message(message_id, user_id)
            
            if success:
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'message_deleted',
                        'message_id': message_id,
                        'deleted_at': timezone.now().isoformat()
                    }
                )

    # WebSocket event handlers
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

    async def message_read_receipt(self, event):
        """Send read receipt to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_read_receipt',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'read_at': event['read_at']
        }))

    async def message_edited(self, event):
        """Send message edited notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'new_text': event['new_text'],
            'edited_at': event['edited_at']
        }))

    async def message_deleted(self, event):
        """Send message deleted notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'deleted_at': event['deleted_at']
        }))

    # Database operations
    @database_sync_to_async
    def get_chat(self, chat_id):
        """Get chat by ID"""
        try:
            chat = Chat.objects.get(id=chat_id)
            return {
                'id': chat.id,
                'therapist_id': chat.therapist_id,
                'patient_id': chat.patient_id,
                'status': chat.status
            }
        except Chat.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, chat_id, sender_id, text, message_type='text', emergency=False, reply_to=None):
        """Create a new message"""
        try:
            # Generate message ID
            message_id = f"MSG_{int(timezone.now().timestamp())}_{uuid.uuid4().hex[:8]}"
            
            message = Message.objects.create(
                id=message_id,
                chat_id=chat_id,
                sender_id=sender_id,
                text=text,
                message_type=message_type,
                emergency=emergency,
                reply_to_id=reply_to
            )
            
            return {
                'id': message.id,
                'chat_id': message.chat_id,
                'sender_id': message.sender_id,
                'text': message.text,
                'message_type': message.message_type,
                'emergency': message.emergency,
                'timestamp': message.timestamp.isoformat(),
                'read_status': message.read_status
            }
        except Exception as e:
            print(f"Error creating message: {e}")
            return None

    @database_sync_to_async
    def update_chat_last_message(self, chat_id, message):
        """Update chat with last message info"""
        try:
            chat = Chat.objects.get(id=chat_id)
            chat.last_message_text = message['text']
            chat.last_message_timestamp = timezone.now()
            chat.last_message_sender_id = message['sender_id']
            chat.updated_at = timezone.now()
            
            # Increment unread count for the other participant
            other_participant_id = chat.patient_id if message['sender_id'] == chat.therapist_id else chat.therapist_id
            chat.increment_unread_count(other_participant_id)
            
            chat.save()
            return True
        except Exception as e:
            print(f"Error updating chat: {e}")
            return False

    @database_sync_to_async
    def mark_message_read(self, message_id, user_id):
        """Mark message as read"""
        try:
            message = Message.objects.get(id=message_id)
            message.mark_as_read(user_id)
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def edit_message(self, message_id, new_text, user_id):
        """Edit message"""
        try:
            message = Message.objects.get(id=message_id)
            if message.sender_id == user_id:
                message.edit_message(new_text)
                return True
            return False
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id, user_id):
        """Delete message"""
        try:
            message = Message.objects.get(id=message_id)
            message.soft_delete(user_id)
            return True
        except Message.DoesNotExist:
            return False


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer for handling notifications across the application"""
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.notification_group_name = f'notifications_{self.user_id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to notifications for user {self.user_id}'
        }))

    async def disconnect(self, close_code):
        # Leave notification group
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Handle any incoming messages if needed
        pass

    async def send_notification(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    async def new_message_notification(self, event):
        """Send new message notification"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'chat_id': event['chat_id'],
            'sender_name': event['sender_name']
        }))

    async def emergency_message_notification(self, event):
        """Send emergency message notification"""
        await self.send(text_data=json.dumps({
            'type': 'emergency_message',
            'message': event['message'],
            'chat_id': event['chat_id'],
            'sender_name': event['sender_name']
        }))
