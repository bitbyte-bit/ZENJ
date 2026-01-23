import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

export interface IMoment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  type: 'text' | 'image';
  createdAt: Date;
}

export interface MomentInstance extends Model<IMoment>, IMoment {}

const Moment = sequelize.define<MomentInstance>('Moment', {
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
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userAvatar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('text', 'image'),
    defaultValue: 'text',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
  ],
});

export default Moment;
