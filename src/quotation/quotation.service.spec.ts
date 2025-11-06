import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QuotationService } from './quotation.service';
import { Quotation } from './quotation.schema';

describe('QuotationService', () => {
  let service: QuotationService;

  const mockQuotationModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    findOneAndDelete: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationService,
        {
          provide: getModelToken(Quotation.name),
          useValue: mockQuotationModel,
        },
      ],
    }).compile();

    service = module.get<QuotationService>(QuotationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});