import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { Cache } from 'cache-manager';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindAllArticlesDto } from './dto/find-all-articles.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<Article> {
    const article = this.articlesRepository.create({
      ...createArticleDto,
      authorId,
    });
    const savedArticle = await this.articlesRepository.save(article);

    // Invalidate cache
    await this.cacheManager.reset();

    return savedArticle;
  }

  async findAll(
    findAllArticlesDto: FindAllArticlesDto,
  ): Promise<{ items: Article[]; total: number }> {
    const {
      title,
      authorId,
      publishedFrom,
      publishedTo,
      page = 1,
      limit = 10,
    } = findAllArticlesDto;

    const queryOptions: FindManyOptions<Article> = {
      relations: ['author'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        publishedAt: 'DESC',
      },
      where: {},
    };

    if (title) {
      queryOptions.where['title'] = Like(`%${title}%`);
    }

    if (authorId) {
      queryOptions.where['authorId'] = authorId;
    }

    if (publishedFrom && publishedTo) {
      queryOptions.where['publishedAt'] = Between(publishedFrom, publishedTo);
    } else if (publishedFrom) {
      queryOptions.where['publishedAt'] = Between(publishedFrom, new Date());
    }

    const [items, total] =
      await this.articlesRepository.findAndCount(queryOptions);

    // Возвращаем данные в структурированном формате, а не как массив
    return {
      items,
      total,
    };
  }
  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    authorId: string,
  ): Promise<Article> {
    const article = await this.findOne(id);

    if (article.authorId !== authorId) {
      throw new NotFoundException(
        `You are not authorized to update this article`,
      );
    }

    Object.assign(article, updateArticleDto);
    const updatedArticle = await this.articlesRepository.save(article);

    // Invalidate cache
    await this.cacheManager.reset();

    return updatedArticle;
  }

  async remove(id: string, authorId: string): Promise<void> {
    const article = await this.findOne(id);

    if (article.authorId !== authorId) {
      throw new NotFoundException(
        `You are not authorized to delete this article`,
      );
    }

    await this.articlesRepository.remove(article);

    // Invalidate cache
    await this.cacheManager.reset();
  }
}
