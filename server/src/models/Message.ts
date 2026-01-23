import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  reactions: Record<string, string[]>;
  createdAt: Date;
}

export interface MessageInstance extends Model<IMessage>, IMessage {}

const Message = sequelize.define<MessageInstance>('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Contacts',
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'audio'),
    defaultValue: 'text',
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read'),
    defaultValue: 'sent',
  },
  reactions: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['conversationId'],
    },
  ],
});

export default Message;
