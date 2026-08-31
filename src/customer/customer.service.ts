import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { Customer, CustomerDocument } from './customer.schema';
import { User, UserDocument } from '../users/users.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getNextCustomerCode(): Promise<string> {
    const customers = await this.customerModel
      .find({
        customerCode: { $regex: /^cus-\d+$/i },
      })
      .select('customerCode')
      .lean<{ customerCode?: string }[]>()
      .exec();

    let maxNum = 100; // baseline starting at cus-101
    if (customers && customers.length > 0) {
      for (const cust of customers) {
        if (cust.customerCode) {
          const match = cust.customerCode.match(/cus-(\d+)/i);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
    } else {
      const totalCount = await this.customerModel.countDocuments().exec();
      maxNum = 100 + totalCount;
    }

    return `cus-${maxNum + 1}`;
  }

  private async normalizeCustomerData(customerData: any): Promise<any> {
    const data = { ...customerData };

    // Auto-generate short customerCode if missing or placeholder
    if (!data.customerCode || data.customerCode.startsWith('CUS-202') || data.customerCode.trim() === '') {
      data.customerCode = await this.getNextCustomerCode();
    } else {
      data.customerCode = data.customerCode.toLowerCase().trim();
    }

    // Ensure shopName fallback from fullName / name
    if (!data.shopName && data.fullName) {
      data.shopName = data.fullName;
    }
    if (!data.shopName && data.name) {
      data.shopName = data.name;
    }
    if (!data.fullName && data.shopName) {
      data.fullName = data.shopName;
    }

    // Handle salesRep safely
    if (data.salesRep) {
      let repId: string | undefined = undefined;
      let repName: string | undefined = data.salesRepName;

      if (typeof data.salesRep === 'object' && data.salesRep !== null) {
        repId = data.salesRep._id || data.salesRep.id;
        repName = repName || data.salesRep.fullName || data.salesRep.name;
      } else if (typeof data.salesRep === 'string') {
        if (isValidObjectId(data.salesRep)) {
          repId = data.salesRep;
        } else {
          repName = repName || data.salesRep;
          // Try to look up the user by fullName
          const user = await this.userModel.findOne({ fullName: data.salesRep }).exec();
          if (user) {
            repId = user._id.toString();
            repName = user.fullName;
          }
        }
      }

      if (repId && isValidObjectId(repId)) {
        data.salesRep = new Types.ObjectId(repId);
      } else {
        delete data.salesRep;
      }
      data.salesRepName = repName || '';
    }

    return data;
  }

  // Create a new customer
  async create(customerData: Partial<Customer>): Promise<Customer> {
    const normalizedData = await this.normalizeCustomerData(customerData);
    const createdCustomer = new this.customerModel(normalizedData);
    return createdCustomer.save();
  }

  // Get all customers
  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().populate('salesRep').sort({ createdAt: -1 }).exec();
  }

  // Get a customer by ID or customerCode
  async findOne(id: string): Promise<Customer> {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ customerCode: id }, { customerCode: id.toLowerCase() }] };

    const customer = await this.customerModel.findOne(query).populate('salesRep').exec();
    if (!customer) {
      throw new NotFoundException(`Customer with identifier "${id}" not found`);
    }
    return customer;
  }

  async findOneByPhone(phone: string): Promise<Customer> {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    const customer = await this.customerModel
      .findOne({ phone })
      .populate('salesRep')
      .exec();

    if (!customer) {
      throw new NotFoundException(
        `Customer with phone number ${phone} not found`,
      );
    }

    return customer;
  }

  // Update a customer by ID
  async update(id: string, updateData: Partial<Customer>): Promise<Customer> {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ customerCode: id }, { customerCode: id.toLowerCase() }] };

    const normalizedData = await this.normalizeCustomerData(updateData);
    const updatedCustomer = await this.customerModel
      .findOneAndUpdate(query, normalizedData, { new: true })
      .populate('salesRep')
      .exec();

    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return updatedCustomer;
  }

  // Delete a customer by ID
  async remove(id: string): Promise<{ deleted: boolean }> {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ customerCode: id }, { customerCode: id.toLowerCase() }] };

    const result = await this.customerModel.findOneAndDelete(query).exec();
    if (!result) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return { deleted: true };
  }
}
