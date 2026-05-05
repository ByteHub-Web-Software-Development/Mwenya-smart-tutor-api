import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubjectTopicService } from './subject-topic.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/create-topic.dto';

@ApiTags('Subject Topics')
@ApiBearerAuth()
@Controller('subject-topic')
export class SubjectTopicController {
  constructor(private readonly subjectTopicService: SubjectTopicService) {}

  @Get(':subjectId')
  @ApiOperation({ summary: 'Get topics by subject', description: 'Returns all topics for the specified subject ID.' })
  @ApiParam({ name: 'subjectId', description: 'Subject ID to fetch topics for' })
  @ApiResponse({ status: 200, description: 'Topics for subject.' })
  async getTopicsBySubject(@Param('subjectId') subjectId: string) {
    return this.subjectTopicService.getTopicsBySubject(subjectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a topic', description: 'Adds a new topic under a subject.' })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({ status: 201, description: 'Topic created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async createTopic(@Body() dto: CreateTopicDto) {
    return this.subjectTopicService.createTopic(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic', description: 'Updates the title of an existing topic.' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiBody({ type: UpdateTopicDto })
  @ApiResponse({ status: 200, description: 'Topic updated.' })
  async updateTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.subjectTopicService.updateTopic(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic', description: 'Permanently deletes a topic.' })
  @ApiParam({ name: 'id', description: 'Topic ID to delete' })
  @ApiResponse({ status: 200, description: 'Topic deleted.' })
  async deleteTopic(@Param('id') id: string) {
    return this.subjectTopicService.deleteTopic(id);
  }
}
