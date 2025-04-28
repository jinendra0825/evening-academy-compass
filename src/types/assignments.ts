
export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}
