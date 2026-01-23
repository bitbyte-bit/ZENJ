import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

export interface IContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing...';
  lastMessageSnippet: string;
  lastMessageTime: number;
  systemInstruction: string;
  isGroup?: boolean;
  members?: string[];
  ownerId?: string;
  adminIds?: string[];
  isBlocked?: boolean;
  isMuted?: boolean;
  hideDetails?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInstance extends Model<IContact>, IContact {}

const Contact = sequelize.define<ContactInstance>('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'typing...'),
    defaultValue: 'offline',
  },
  lastMessageSnippet: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  lastMessageTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  systemInstruction: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  isGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  members: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  adminIds: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hideDetails: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
  ],
});

export default Contact;
