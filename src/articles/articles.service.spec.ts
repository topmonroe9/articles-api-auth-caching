import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Исправлен импорт
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: Repository<Article>;
  let cacheManager: any;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockCacheManager = {
    reset: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        description: 'Test Description',
      };

      const authorId = 'test-author-id';

      const article = {
        id: 'test-id',
        ...createArticleDto,
        authorId,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(article);
      mockRepository.save.mockResolvedValue(article);

      const result = await service.create(createArticleDto, authorId);

      expect(result).toEqual(article);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createArticleDto,
        authorId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(article);
      expect(mockCacheManager.reset).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an article if it exists', async () => {
      const article = {
        id: 'test-id',
        title: 'Test Article',
        description: 'Test Description',
        authorId: 'test-author-id',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(article);

      const result = await service.findOne('test-id');

      expect(result).toEqual(article);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the article if user is the author', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      const authorId = 'test-author-id';

      const existingArticle = {
        id: 'test-id',
        title: 'Test Article',
        description: 'Test Description',
        authorId,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedArticle = {
        ...existingArticle,
        ...updateArticleDto,
      };

      mockRepository.findOne.mockResolvedValue(existingArticle);
      mockRepository.save.mockResolvedValue(updatedArticle);

      const result = await service.update(
        'test-id',
        updateArticleDto,
        authorId,
      );

      expect(result).toEqual(updatedArticle);
      expect(mockCacheManager.reset).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not the author', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      const existingArticle = {
        id: 'test-id',
        title: 'Test Article',
        description: 'Test Description',
        authorId: 'original-author-id',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingArticle);

      await expect(
        service.update('test-id', updateArticleDto, 'different-author-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
