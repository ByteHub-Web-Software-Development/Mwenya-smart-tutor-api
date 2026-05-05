import { Body, Controller, Delete, Get, Param, Post, Put, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subjects', description: 'Returns all subjects with their associated topics.' })
  @ApiResponse({ status: 200, description: 'List of subjects.' })
  async getAllSubjects() {
    return this.subjectsService.getAllSubjects();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject by ID', description: 'Returns a single subject with its topics, exams, and lessons.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Subject found.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  async getSubjectById(@Param('id') id: string) {
    return this.subjectsService.getSubjectById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subject', description: 'Adds a new subject to the catalogue.' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 201, description: 'Subject created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Full update of a subject', description: 'Replaces all fields of an existing subject.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 200, description: 'Subject updated.' })
  async updateSubject(@Param('id') id: string, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.updateSubject(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update of a subject', description: 'Updates one or more fields of an existing subject.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({ status: 200, description: 'Subject partially updated.' })
  async patchSubject(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject', description: 'Deletes a subject. Will fail if active exams or lessons are attached.' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Subject deleted.' })
  @ApiResponse({ status: 409, description: 'Cannot delete subject with active content.' })
  async deleteSubject(@Param('id') id: string) {
    return this.subjectsService.deleteSubject(id);
  }
}
