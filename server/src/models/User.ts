import { DataTypes, Model } from 'sequelize';
import bcryptjs from 'bcryptjs';
import sequelize from '../database.js';

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  bio: string;
  avatar: string;
  settings: {
    theme: 'dark' | 'light' | 'zen-emerald' | 'zen-ocean';
    wallpaper: string;
    vibrations: boolean;
    notifications: boolean;
  };
  contacts: string[]; // Contact IDs
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInstance extends Model<IUser>, IUser {
  comparePassword(password: string): Promise<boolean>;
}

const User = sequelize.define<UserInstance>('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isLowercase: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      theme: 'dark',
      wallpaper: '',
      vibrations: true,
      notifications: true,
    },
  },
  contacts: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  blockedUsers: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user: UserInstance) => {
      if (user.password) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user: UserInstance) => {
      if ((user as any).changed('password')) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
      }
    },
  },
});

// Instance method
User.prototype.comparePassword = async function (password: string): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

export default User;
