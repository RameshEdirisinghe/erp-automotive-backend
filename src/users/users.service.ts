import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedInitialUsers();
  }

  async seedInitialUsers() {
    try {
      const adminEmail = '500labs.admin@gmail.com';
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash('500labs', salt);

      const existingAdmin = await this.userModel.findOne({ email: adminEmail }).exec();
      if (!existingAdmin) {
        await this.userModel.create({
          fullName: '500 Labs Admin',
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: 'admin',
        });
        console.log('✅ Seeded default admin: 500labs.admin@gmail.com / 500labs');
      } else {
        existingAdmin.passwordHash = adminPasswordHash;
        existingAdmin.role = 'admin';
        existingAdmin.fullName = existingAdmin.fullName || '500 Labs Admin';
        await existingAdmin.save();
        console.log('✅ Verified admin credentials for 500labs.admin@gmail.com');
      }

      // Ensure default sales officer exists for testing
      const salesmanEmail = 'kasun.perera@500labs.com';
      const existingSalesman = await this.userModel.findOne({ email: salesmanEmail }).exec();
      if (!existingSalesman) {
        const salesmanPasswordHash = await bcrypt.hash('123456', salt);
        await this.userModel.create({
          fullName: 'Kasun Perera',
          email: salesmanEmail,
          passwordHash: salesmanPasswordHash,
          role: 'salesman',
        });
        console.log('✅ Seeded default salesman: kasun.perera@500labs.com');
      }
    } catch (err) {
      console.error('⚠️ User seeding error:', err);
    }
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUserId(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async setRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash }).exec();
  }

  async delete(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
