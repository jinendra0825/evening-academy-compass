
export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  submitted_at?: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  transaction_id?: string;
  status: string;
  payment_type?: string;
  created_at?: string;
  updated_at?: string;
}
