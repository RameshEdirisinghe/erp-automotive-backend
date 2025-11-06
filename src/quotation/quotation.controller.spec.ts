import { Test, TestingModule } from '@nestjs/testing';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';

describe('QuotationController', () => {
  let controller: QuotationController;

  const mockQuotationService = {
    create: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    findByQuotationId: jest.fn().mockResolvedValue(null),
    updateByQuotationId: jest.fn().mockResolvedValue(null),
    updateStatusByQuotationId: jest.fn().mockResolvedValue(null),
    deleteByQuotationId: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationController],
      providers: [
        {
          provide: QuotationService,
          useValue: mockQuotationService,
        },
      ],
    }).compile();

    controller = module.get<QuotationController>(QuotationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});