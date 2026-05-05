export interface Exam {
    id: string;
    title: string;
    duration: string;
    media_type: string;
    media_value: string;
    year: string;
    subject_id: string;
}

export interface ExamContent {
    id: string;
    exam_id: string;
    exam_type: string;
    exam_link: string;
    created_at: Date;
    updated_at: Date;
}

export interface AddExamDto {
    title: string;
    duration: string;
    media_type: string;
    media_value: string;
    year: string;
    subject: string;
}

export interface AddExamContentDto {
    exam: string;
    exam_type: string;
    exam_link: string;
}

export interface UpdateExamDto {
    column: string;
    updateValue: string;
    condition: string;
    conditionValue: string;
}

export interface UpdateFullExamDto {
    title: string;
    duration: string;
    media_type: string;
    media_value: string;
    subject_id: string;
    condition: string;
    conditionValue: string;
}

export interface ExamResponse {
    statusCode: number;
    message: {
        description?: string;
        success?: boolean;
        [key: string]: any;
    };
}