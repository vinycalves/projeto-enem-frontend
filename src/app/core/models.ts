export type Id = number | string;

export interface User {
  id: Id;
  email: string;
  display_name: string;
}

export interface AuthResponse {
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Subject {
  id: Id;
  code: string;
  name: string;
  description: string;
  concept_count: number;
  area_name?: string;
}

export interface Area {
  id: Id;
  code: string;
  name: string;
  description: string;
  color?: string | null;
  icon?: string | null;
  subjects: Subject[];
}

export interface AreasResponse {
  areas: Area[];
}

export interface ConceptListItem {
  id: Id;
  code: string;
  name: string;
  summary: string;
  difficulty: string;
  question_count: number;
}

export interface SubjectConceptsResponse {
  subject: {
    id: Id;
    code: string;
    name: string;
    description: string;
    area_name: string;
  };
  concepts: ConceptListItem[];
}

export interface ConceptDetail {
  id: Id;
  code: string;
  name: string;
  summary: string;
  explanation: string;
  difficulty: string;
  subject_name: string;
  area_name: string;
  question_count: number;
  /** Optional in the API contract; shown only when the backend provides it. */
  prerequisites?: Array<{ id?: Id; name: string; summary?: string }> | string[] | null;
}

export interface ConceptResponse {
  concept: ConceptDetail;
}

export interface Exam {
  id: Id;
  title: string;
  year: number;
  area_code: string;
  area_name: string;
  area_color: string;
  question_count: number;
}

export interface ExamsResponse {
  exams: Exam[];
}

export interface QuestionListItem {
  id: Id;
  code: string;
  statement: string;
  difficulty: string;
  language?: string | null;
  is_official?: boolean;
  exam_year?: number | null;
  concept_id: Id;
  concept_name: string;
  subject_name: string;
  area_name: string;
  source: string | null;
  license: string | null;
  has_attempted: boolean;
  last_attempt_is_correct: boolean | null;
}

export interface QuestionOption {
  label: string;
  text: string;
  image_url?: string | null;
}

export interface QuestionAsset {
  kind: string;
  option_label: string | null;
  url: string;
  position: number;
}

export interface QuestionDetail extends QuestionListItem {
  options: QuestionOption[];
  assets?: QuestionAsset[];
}

export interface QuestionsResponse {
  questions: QuestionListItem[];
}

export interface QuestionResponse {
  question: QuestionDetail;
}

export interface Attempt {
  id: Id;
  is_correct: boolean;
  selected_option: string;
  created_at: string;
}

export interface AttemptResponse {
  attempt: Attempt;
}

export interface Comment {
  id: Id;
  author: string;
  option_label: string | null;
  body: string;
  created_at: string;
  is_own: boolean;
}

export interface Discussion {
  question_id: Id;
  comments: Comment[];
}

export interface CommentResponse {
  comment: Comment;
}

export interface Answer {
  correct_option: string;
  explanation: string;
  source: string | null;
  license: string | null;
}

export interface AnswerResponse {
  answer: Answer;
}

export interface Stats {
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  questions_answered: number;
}

export interface RecentAttempt {
  question_id: Id;
  question_code: string;
  statement_preview: string;
  is_correct: boolean;
  created_at: string;
  concept_name: string;
}

export interface StatsResponse {
  stats: Stats;
  recent_attempts: RecentAttempt[];
}

export interface CalendarEvent {
  id: Id;
  title: string;
  kind: string;
  starts_on: string | null;
  ends_on: string | null;
  description: string | null;
  source_url: string | null;
  confirmed: boolean;
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

export interface PixResponse {
  key: string;
}
