
import { Student, Teacher, Course, Attendance, Grade, Parent, Notification } from "../types/models";

// Mock Students
export const students: Student[] = [
  {
    id: "s1",
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    address: "123 Student St, College Town",
    enrollmentDate: "2023-01-15",
    grade: "11th",
    parentId: "p1",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=0694a2&color=fff"
  },
  {
    id: "s2",
    name: "Maya Patel",
    email: "maya@example.com",
    phone: "(555) 234-5678",
    address: "456 Learn Ave, Study City",
    enrollmentDate: "2023-02-01",
    grade: "10th",
    parentId: "p2",
    avatar: "https://ui-avatars.com/api/?name=Maya+Patel&background=0694a2&color=fff"
  },
  {
    id: "s3",
    name: "Tyler Wilson",
    email: "tyler@example.com",
    phone: "(555) 345-6789",
    address: "789 Education Rd, School County",
    enrollmentDate: "2023-01-10",
    grade: "12th",
    parentId: "p3",
    avatar: "https://ui-avatars.com/api/?name=Tyler+Wilson&background=0694a2&color=fff"
  },
  {
    id: "s4",
    name: "Sophia Rodriguez",
    email: "sophia@example.com",
    phone: "(555) 456-7890",
    address: "101 Academy Blvd, Learning Heights",
    enrollmentDate: "2023-01-20",
    grade: "11th",
    parentId: "p4",
    avatar: "https://ui-avatars.com/api/?name=Sophia+Rodriguez&background=0694a2&color=fff"
  },
  {
    id: "s5",
    name: "Jamal Thompson",
    email: "jamal@example.com",
    phone: "(555) 567-8901",
    address: "202 Knowledge Lane, Wisdom Woods",
    enrollmentDate: "2023-02-05",
    grade: "10th",
    parentId: "p5",
    avatar: "https://ui-avatars.com/api/?name=Jamal+Thompson&background=0694a2&color=fff"
  }
];

// Mock Teachers
export const teachers: Teacher[] = [
  {
    id: "t1",
    name: "Dr. Sarah Miller",
    email: "sarah@academy.com",
    phone: "(555) 901-2345",
    qualifications: ["Ph.D. Mathematics", "M.Sc. Applied Mathematics"],
    subjects: ["Mathematics", "Calculus"],
    avatar: "https://ui-avatars.com/api/?name=Sarah+Miller&background=7e3af2&color=fff"
  },
  {
    id: "t2",
    name: "Prof. David Chen",
    email: "david@academy.com",
    phone: "(555) 012-3456",
    qualifications: ["Ph.D. Literature", "M.A. English"],
    subjects: ["English Literature", "Creative Writing"],
    avatar: "https://ui-avatars.com/api/?name=David+Chen&background=7e3af2&color=fff"
  },
  {
    id: "t3",
    name: "Dr. Michael Okonkwo",
    email: "michael@academy.com",
    phone: "(555) 123-4567",
    qualifications: ["Ph.D. Physics", "B.Sc. Engineering"],
    subjects: ["Physics", "Engineering Principles"],
    avatar: "https://ui-avatars.com/api/?name=Michael+Okonkwo&background=7e3af2&color=fff"
  },
  {
    id: "t4",
    name: "Prof. Jennifer Walsh",
    email: "jennifer@academy.com",
    phone: "(555) 234-5678",
    qualifications: ["Ph.D. Chemistry", "M.Sc. Biochemistry"],
    subjects: ["Chemistry", "Biochemistry"],
    avatar: "https://ui-avatars.com/api/?name=Jennifer+Walsh&background=7e3af2&color=fff"
  }
];

// Mock Courses
export const courses: Course[] = [
  {
    id: "c1",
    name: "Advanced Mathematics",
    code: "MATH301",
    description: "Higher-level mathematics covering calculus and statistics for evening students",
    teacherId: "t1",
    schedule: [
      { day: "Monday", startTime: "18:00", endTime: "20:00" },
      { day: "Wednesday", startTime: "18:00", endTime: "20:00" }
    ],
    enrolledStudents: ["s1", "s3", "s5"],
    room: "Room 101"
  },
  {
    id: "c2",
    name: "English Literature",
    code: "ENG201",
    description: "Study of classic literature and writing techniques",
    teacherId: "t2",
    schedule: [
      { day: "Tuesday", startTime: "17:30", endTime: "19:30" },
      { day: "Thursday", startTime: "17:30", endTime: "19:30" }
    ],
    enrolledStudents: ["s2", "s4", "s5"],
    room: "Room 102"
  },
  {
    id: "c3",
    name: "Physics Fundamentals",
    code: "PHYS101",
    description: "Introduction to basic physics concepts and principles",
    teacherId: "t3",
    schedule: [
      { day: "Monday", startTime: "16:00", endTime: "18:00" },
      { day: "Friday", startTime: "16:00", endTime: "18:00" }
    ],
    enrolledStudents: ["s1", "s2", "s3"],
    room: "Room 103"
  },
  {
    id: "c4",
    name: "Chemistry Basics",
    code: "CHEM101",
    description: "Introduction to chemical elements and reactions",
    teacherId: "t4",
    schedule: [
      { day: "Tuesday", startTime: "15:30", endTime: "17:30" },
      { day: "Thursday", startTime: "15:30", endTime: "17:30" }
    ],
    enrolledStudents: ["s2", "s4", "s5"],
    room: "Room 104"
  }
];

// Mock Attendance
export const attendances: Attendance[] = [
  {
    id: "a1",
    date: "2023-03-01",
    courseId: "c1",
    presentStudentIds: ["s1", "s3"],
    absentStudentIds: ["s5"]
  },
  {
    id: "a2",
    date: "2023-03-01",
    courseId: "c2",
    presentStudentIds: ["s2", "s4", "s5"],
    absentStudentIds: []
  },
  {
    id: "a3",
    date: "2023-03-02",
    courseId: "c3",
    presentStudentIds: ["s1", "s3"],
    absentStudentIds: ["s2"]
  },
  {
    id: "a4",
    date: "2023-03-02",
    courseId: "c4",
    presentStudentIds: ["s2", "s5"],
    absentStudentIds: ["s4"]
  },
  {
    id: "a5",
    date: "2023-03-03",
    courseId: "c1",
    presentStudentIds: ["s1", "s3", "s5"],
    absentStudentIds: []
  }
];

// Mock Grades
export const grades: Grade[] = [
  {
    id: "g1",
    studentId: "s1",
    courseId: "c1",
    assessmentName: "Midterm Exam",
    score: 85,
    maxScore: 100,
    date: "2023-02-15"
  },
  {
    id: "g2",
    studentId: "s2",
    courseId: "c2",
    assessmentName: "Essay Assignment",
    score: 92,
    maxScore: 100,
    date: "2023-02-20"
  },
  {
    id: "g3",
    studentId: "s3",
    courseId: "c3",
    assessmentName: "Lab Experiment",
    score: 78,
    maxScore: 100,
    date: "2023-02-18"
  },
  {
    id: "g4",
    studentId: "s4",
    courseId: "c4",
    assessmentName: "Chemical Formulas Quiz",
    score: 88,
    maxScore: 100,
    date: "2023-02-22"
  },
  {
    id: "g5",
    studentId: "s5",
    courseId: "c1",
    assessmentName: "Midterm Exam",
    score: 76,
    maxScore: 100,
    date: "2023-02-15"
  },
];

// Mock Parents
export const parents: Parent[] = [
  {
    id: "p1",
    name: "Robert Johnson",
    email: "robert@example.com",
    phone: "(555) 789-0123",
    studentIds: ["s1"]
  },
  {
    id: "p2",
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "(555) 890-1234",
    studentIds: ["s2"]
  },
  {
    id: "p3",
    name: "Gregory Wilson",
    email: "gregory@example.com",
    phone: "(555) 901-2345",
    studentIds: ["s3"]
  },
  {
    id: "p4",
    name: "Elena Rodriguez",
    email: "elena@example.com",
    phone: "(555) 012-3456",
    studentIds: ["s4"]
  },
  {
    id: "p5",
    name: "Marcus Thompson",
    email: "marcus@example.com",
    phone: "(555) 123-4567",
    studentIds: ["s5"]
  }
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: "n1",
    title: "End of Semester Approaching",
    message: "Final exams will be held next week. Please review the schedule.",
    date: "2023-03-10T09:00:00",
    recipientIds: ["s1", "s2", "s3", "s4", "s5", "t1", "t2", "t3", "t4", "p1", "p2", "p3", "p4", "p5"],
    read: false,
    type: "announcement"
  },
  {
    id: "n2",
    title: "Parent-Teacher Meeting",
    message: "Annual parent-teacher meetings scheduled for March 15th.",
    date: "2023-03-08T14:30:00",
    recipientIds: ["p1", "p2", "p3", "p4", "p5", "t1", "t2", "t3", "t4"],
    read: false,
    type: "announcement"
  },
  {
    id: "n3",
    title: "Assignment Due Date Extended",
    message: "The due date for the Chemistry assignment has been extended to next Friday.",
    date: "2023-03-07T11:15:00",
    recipientIds: ["s2", "s4", "s5"],
    read: true,
    type: "alert"
  },
  {
    id: "n4",
    title: "School Closure",
    message: "School will be closed on March 20th for staff development.",
    date: "2023-03-05T08:45:00",
    recipientIds: ["s1", "s2", "s3", "s4", "s5", "t1", "t2", "t3", "t4", "p1", "p2", "p3", "p4", "p5"],
    read: true,
    type: "alert"
  },
  {
    id: "n5",
    title: "Course Material Updated",
    message: "New study materials have been added to the Physics course.",
    date: "2023-03-04T16:20:00",
    recipientIds: ["s1", "s2", "s3"],
    read: false,
    type: "message"
  }
];

// Helper function to get student by ID
export const getStudentById = (id: string): Student | undefined => {
  return students.find(student => student.id === id);
};

// Helper function to get teacher by ID
export const getTeacherById = (id: string): Teacher | undefined => {
  return teachers.find(teacher => teacher.id === id);
};

// Helper function to get course by ID
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

// Helper function to get parent by ID
export const getParentById = (id: string): Parent | undefined => {
  return parents.find(parent => parent.id === id);
};

// Helper function to get courses for a student
export const getCoursesForStudent = (studentId: string): Course[] => {
  return courses.filter(course => course.enrolledStudents.includes(studentId));
};

// Helper function to get courses for a teacher
export const getCoursesForTeacher = (teacherId: string): Course[] => {
  return courses.filter(course => course.teacherId === teacherId);
};

// Helper function to get grades for a student
export const getGradesForStudent = (studentId: string): Grade[] => {
  return grades.filter(grade => grade.studentId === studentId);
};

// Helper function to get attendance for a student
export const getAttendanceForStudent = (studentId: string): { attendance: Attendance; course: Course | undefined }[] => {
  const studentAttendances: { attendance: Attendance; course: Course | undefined }[] = [];
  
  attendances.forEach(attendance => {
    if (attendance.presentStudentIds.includes(studentId) || attendance.absentStudentIds.includes(studentId)) {
      const course = getCourseById(attendance.courseId);
      studentAttendances.push({ attendance, course });
    }
  });
  
  return studentAttendances;
};

// Helper function to get notifications for a user
export const getNotificationsForUser = (userId: string): Notification[] => {
  return notifications.filter(notification => notification.recipientIds.includes(userId));
};

// Helper function to get students for a parent
export const getStudentsForParent = (parentId: string): Student[] => {
  return students.filter(student => student.parentId === parentId);
};
