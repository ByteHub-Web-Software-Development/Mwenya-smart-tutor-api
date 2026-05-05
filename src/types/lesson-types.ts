export interface Lesson {
  id: string;
  title: string;
  duration: string;
  media_type: string;
  media_value: string;
  subject_id: string;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  lesson_type: string;
  lesson_link: string;
  created_at: Date;
  updated_at: Date;
}

export interface AddLessonDto {
  title: string;
  duration: string;
  media_type: string;
  media_value: string;
  subject_id: string;
}

export interface UpdateLessonDto {
  column: string;
  updateValue: string;
  condition: string;
  conditionValue: string;
}

export interface UpdateFullLessonDto {
  title: string;
  duration: string;
  media_type: string;
  media_value: string;
  subject_id: string;
  condition: string;
  conditionValue: string;
}

export interface LessonResponse {
  statusCode: number;
  message: {
    description?: string;
    success?: boolean;
    [key: string]: any;
  };
}
