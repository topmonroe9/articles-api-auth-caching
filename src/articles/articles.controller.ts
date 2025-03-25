import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindAllArticlesDto } from './dto/find-all-articles.dto';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@ApiTags('articles')
@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor) // Применяем глобально к контроллеру
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all articles with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all articles.',
  })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'publishedFrom', required: false, type: Date })
  @ApiQuery({ name: 'publishedTo', required: false, type: Date })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(60 * 60) // Cache for 1 hour
  @Get()
  findAll(@Query() findAllArticlesDto: FindAllArticlesDto) {
    return this.articlesService.findAll(findAllArticlesDto);
  }

  @ApiOperation({ summary: 'Get an article by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the article.',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Article ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(60 * 60) // Cache for 1 hour
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found or you are not authorized to update it.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Article ID' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found or you are not authorized to delete it.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Article ID' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.articlesService.remove(id, req.user.id);
  }
}
