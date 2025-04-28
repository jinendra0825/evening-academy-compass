
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  enrollmentDate: string;
  grade: string;
  parentId?: string;
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualifications: string[];
  subjects: string[];
  avatar?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_id?: string;  // Changed from teacherId to match Supabase
  teacherId?: string;   // Keep for backward compatibility
  schedule?: {          // Made optional
    day: string;
    startTime: string;
    endTime: string;
  }[];
  enrolledStudents?: string[];  // Made optional
  room?: string;               // Made optional
}

export interface Attendance {
  id: string;
  date: string;
  courseId: string;
  presentStudentIds: string[];
  absentStudentIds: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentIds: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  recipientIds: string[];
  read: boolean;
  type: "announcement" | "alert" | "message";
}
