import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { AddLessonDto, UpdateLessonFieldDto, UpdateFullLessonDto } from './dto/lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lessons', description: 'Returns a paginated list of all lessons with their content.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'List of lessons.' })
  async getAllLessons(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.lessonsService.getAllLessons(Number(page), Number(limit));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lesson', description: 'Adds a new lesson linked to a subject.' })
  @ApiBody({ type: AddLessonDto })
  @ApiResponse({ status: 201, description: 'Lesson created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  async addLesson(@Body() lesson: AddLessonDto) {
    return this.lessonsService.addLesson(lesson);
  }

  @Get('subject/:id')
  @ApiOperation({ summary: 'Get lessons by subject', description: 'Returns all lessons for a given subject.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Lessons for the subject.' })
  async getLessonBySubject(@Param('id') id: string) {
    return this.lessonsService.getLessonBySubject(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID', description: 'Returns a single lesson with its content.' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson found.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  async getLesson(@Param('id') id: string) {
    return this.lessonsService.getLesson(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson', description: 'Permanently deletes a lesson and all its content.' })
  @ApiParam({ name: 'id', description: 'Lesson ID to delete' })
  @ApiResponse({ status: 200, description: 'Lesson deleted.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  async deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Full update of a lesson', description: 'Replaces all fields of an existing lesson.' })
  @ApiParam({ name: 'id', description: 'Lesson ID to update' })
  @ApiBody({ type: UpdateFullLessonDto })
  @ApiResponse({ status: 200, description: 'Lesson updated.' })
  async updateFullLesson(@Param('id') id: string, @Body() updateData: UpdateFullLessonDto) {
    return this.lessonsService.updateFullLesson({ ...updateData, conditionValue: id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update of a lesson field', description: 'Updates a single field on a lesson.' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiBody({ type: UpdateLessonFieldDto })
  @ApiResponse({ status: 200, description: 'Lesson field updated.' })
  async updateLesson(@Param('id') id: string, @Body() updateData: UpdateLessonFieldDto) {
    return this.lessonsService.updateLesson({ ...updateData, conditionValue: id });
  }
}
