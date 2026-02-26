import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5001',
      'http://localhost:80',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connected: ${client.id}`);
      const { username } = client.handshake.query;
      const room = (client.handshake.query.room as string) || 'Каб 104';

      client.data = { username, room };

      client.join(room);

      setImmediate(() => {
        this.emitOnlineUsers(room);
      });
    } catch (error) {
      console.error('❌ Error in handleConnection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      console.log(`Client disconnected: ${client.id}`);
      const room = client.data?.room || 'Каб 104';
      this.emitOnlineUsers(room);
    } catch (error) {
      console.error('❌ Error in handleDisconnect:', error);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; username: string; room: string },
  ) {
    try {
      const message = await this.prisma.message.create({
        data: {
          content: data.content,
          username: data.username,
          room: data.room || 'Каб 104',
        },
      });

      this.server.to(data.room || 'Каб 104').emit('message', {
        id: message.id,
        content: message.content,
        username: message.username,
        room: message.room,
        createdAt: message.createdAt,
      });

      return { success: true, message };
    } catch (error) {
      console.error('Error saving message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; username: string },
  ) {
    try {
      const room = client.data?.room || data.room;

      if (!room || !data.username) {
        console.warn('❌ Invalid typing event - room or username missing', {
          clientRoom: client.data?.room,
          dataRoom: data.room,
          username: data.username,
        });
        return;
      }

      this.server.to(room).emit('typing', {
        username: data.username,
        room,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error in handleTyping:', error);
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; username: string },
  ) {
    try {
      const room = client.data?.room || data.room;

      if (!room || !data.username) {
        console.warn('❌ Invalid stopTyping event - room or username missing');
        return;
      }

      this.server.to(room).emit('stopTyping', {
        username: data.username,
        room,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error in handleStopTyping:', error);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room: string; user?: { username: string; avatar?: string } },
  ) {
    try {
      if (!data.room) throw new Error('Room name is required');

      client.join(data.room);

      if (!client.data) client.data = {};
      client.data.room = data.room;

      if (data.user) {
        client.data.username = data.user.username;
      }

      console.log(`Client ${client.id} joined room: ${data.room}`);
      this.emitOnlineUsers(data.room);
      return { success: true, room: data.room };
    } catch (error) {
      console.error('❌ Error in joinRoom:', error.message);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    if (client.data) {
      client.data.room = null;
    }
    console.log(`Client ${client.id} left room: ${data.room}`);
    this.emitOnlineUsers(data.room);
    return { success: true, room: data.room };
  }

  @SubscribeMessage('getHistory')
  async handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; limit: number },
  ) {
    console.log('📨 Received getHistory request for room:', data.room);

    try {
      const messages = await this.prisma.message.findMany({
        where: { room: data.room || 'Каб 104' },
        orderBy: { createdAt: 'asc' },
        take: data.limit || 50,
      });

      console.log(`📊 Found ${messages.length} messages`);

      client.emit('getHistory', {
        success: true,
        messages,
        room: data.room || 'Каб 104',
      });
    } catch (error) {
      console.error('❌ Error fetching history:', error);

      client.emit('getHistory', {
        success: false,
        messages: [],
        error: 'Failed to load messages',
      });
    }
  }

  private emitOnlineUsers(room: string) {
    try {
      const clients = this.server.sockets.adapter.rooms.get(room);
      if (!clients) {
        this.server.to(room).emit('onlineUsers', []);
        return;
      }

      const users = Array.from(clients)
        .map((id) => {
          const socket = this.server.sockets.sockets.get(id);
          if (!socket) return null;
          return {
            id,
            username: socket.data?.username || 'Unknown',
            room: socket.data?.room || room,
          };
        })
        .filter(Boolean);

      this.server.to(room).emit('onlineUsers', users);
    } catch (error) {
      console.error('❌ Error in emitOnlineUsers:', error);
    }
  }
}
