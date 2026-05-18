import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { AddExamDto } from './dto/add-exam.dto';
import { AddExamContentDto } from './dto/add-exam-content.dto';
import { UpdateFullExamDto } from './dto/update-full-exam.dto';
import { PatchExamDto } from './dto/patch-exam.dto';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exam paper', description: 'Adds a new exam paper linked to a subject.' })
  @ApiBody({ type: AddExamDto })
  @ApiResponse({ status: 201, description: 'Exam created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  async addExamPaper(@Body() exam: AddExamDto) {
    return this.examsService.addExam(exam);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exam papers', description: 'Returns a paginated list of all exam papers.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'List of exams.' })
  async getAllExams(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.examsService.getAllExams(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID', description: 'Returns a single exam with its associated content.' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiResponse({ status: 200, description: 'Exam found.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  async getExam(@Param('id') id: string) {
    return this.examsService.getExam(id);
  }

  @Get('subject/:id')
  @ApiOperation({ summary: 'Get exams by subject', description: 'Returns all exam papers for a given subject ID.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Exams for the subject.' })
  async getExamBySubject(@Param('id') id: string) {
    return this.examsService.getExamBySubject(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exam', description: 'Permanently deletes an exam and all its associated content.' })
  @ApiParam({ name: 'id', description: 'Exam ID to delete' })
  @ApiResponse({ status: 200, description: 'Exam deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  async deleteExam(@Param('id') id: string) {
    return this.examsService.deleteExam(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update of an exam', description: 'Updates only the fields provided in the request body.' })
  @ApiParam({ name: 'id', description: 'Exam ID to update' })
  @ApiBody({ type: PatchExamDto })
  @ApiResponse({ status: 200, description: 'Exam updated.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  async patchExam(@Param('id') id: string, @Body() updateData: PatchExamDto) {
    return this.examsService.patchExam(id, updateData);
  }

  // Exam Content endpoints
  @Post('content')
  @ApiOperation({ summary: 'Add exam content', description: 'Adds a content item (e.g. marking scheme, paper) to an existing exam.' })
  @ApiBody({ type: AddExamContentDto })
  @ApiResponse({ status: 201, description: 'Exam content added.' })
  @ApiResponse({ status: 404, description: 'Parent exam not found.' })
  async addExamContent(@Body() examContent: AddExamContentDto) {
    return this.examsService.addExamContent(examContent);
  }

  @Get('content/all')
  @ApiOperation({ summary: 'Get all exam content', description: 'Returns all exam content records, paginated.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'All exam content.' })
  async getAllExamContent(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.examsService.getAllExamContent(Number(page), Number(limit));
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'Get content for an exam', description: 'Returns all content items for the specified exam ID.' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiResponse({ status: 200, description: 'Exam content items.' })
  @ApiResponse({ status: 404, description: 'No content found for exam.' })
  async getExamContent(@Param('id') id: string) {
    return this.examsService.getExamContent(id);
  }
}
