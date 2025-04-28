
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Upload, Download, Calendar, Mail, Lock, File } from "lucide-react";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function AssignmentManagement() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [activeTab, setActiveTab] = useState("view");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // New assignment form state
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    course_id: ""
  });

  // Student submission state
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
    if (!isTeacher) {
      fetchStudentSubmissions();
    }
  }, [isTeacher, user?.id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Could not load assignments",
        description: "There was an error loading assignments. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudentSubmissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      setStudentSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching student submissions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewAssignment({
      ...newAssignment,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // 1. Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `assignments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

      // 3. Create the assignment record in the database
      const { error: insertError } = await supabase.from('assignments').insert({
        ...newAssignment,
        file_url: publicURLData.publicUrl,
        file_name: selectedFile.name,
        file_type: selectedFile.type
      });

      if (insertError) throw insertError;

      toast({
        title: "Assignment created",
        description: "Assignment was successfully created and uploaded.",
      });

      // Reset form and refresh assignments
      setNewAssignment({
        title: "",
        description: "",
        due_date: "",
        course_id: ""
      });
      setSelectedFile(null);
      fetchAssignments();
      setActiveTab("view");

    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Failed to create assignment",
        description: "There was an error creating your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!selectedFile || !user?.id) return;

    try {
      setUploading(true);
      
      // 1. Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}-${user.id}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      // 3. Create the submission record in the database
      const { error: insertError } = await supabase.from('assignment_submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: publicURLData.publicUrl,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        submitted_at: new Date().toISOString()
      });

      if (insertError) throw insertError;

      toast({
        title: "Assignment submitted",
        description: "Your assignment was successfully submitted.",
      });

      setSelectedFile(null);
      fetchStudentSubmissions();

    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Failed to submit assignment",
        description: "There was an error submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadAssignment = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSubmitted = (assignmentId: string) => {
    return studentSubmissions.some(sub => sub.assignment_id === assignmentId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" /> Assignments
          </h1>
        </div>

        {isTeacher ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="view">View Assignments</TabsTrigger>
              <TabsTrigger value="create">Create Assignment</TabsTrigger>
              <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <Card>
                <CardHeader>
                  <CardTitle>All Assignments</CardTitle>
                  <CardDescription>
                    View and manage all assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">Loading assignments...</div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No assignments found. Create your first assignment using the "Create Assignment" tab.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => {
                          const course = courses.find(c => c.id === assignment.course_id);
                          return (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">{assignment.title}</TableCell>
                              <TableCell>{course?.name || "Unknown Course"}</TableCell>
                              <TableCell>
                                {assignment.due_date ? format(new Date(assignment.due_date), 'MMM dd, yyyy') : 'No date set'}
                              </TableCell>
                              <TableCell>
                                {assignment.file_url ? assignment.file_name : 'No file'}
                              </TableCell>
                              <TableCell className="text-right">
                                {assignment.file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadAssignment(assignment.file_url!, assignment.file_name!)}
                                  >
                                    <Download className="h-4 w-4 mr-1" /> Download
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Assignment</CardTitle>
                  <CardDescription>
                    Upload a new assignment for your course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAssignment} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={newAssignment.title}
                        onChange={handleInputChange}
                        placeholder="Enter assignment title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="course_id">Course</Label>
                      <select
                        id="course_id"
                        name="course_id"
                        value={newAssignment.course_id}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2 text-base bg-background"
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        value={newAssignment.due_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Assignment Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newAssignment.description}
                        onChange={handleInputChange}
                        placeholder="Enter assignment details and instructions"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file">Assignment File (PDF, DOCX, etc.)</Label>
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <span className="font-medium mb-1">
                            {selectedFile ? selectedFile.name : "Click to upload a file"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {!selectedFile && "Supports PDF, DOCX, and image files"}
                          </span>
                        </Label>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? "Uploading..." : "Create Assignment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle>Student Submissions</CardTitle>
                  <CardDescription>
                    View and download student submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    Student submissions will be shown here.
                    <br />
                    This feature is under development.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Student view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assignments</CardTitle>
                <CardDescription>
                  View and submit your assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No assignments have been assigned yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const course = courses.find(c => c.id === assignment.course_id);
                      const submitted = isSubmitted(assignment.id);
                      const dueDate = new Date(assignment.due_date);
                      const isOverdue = dueDate < new Date();
                      
                      return (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between">
                              <CardTitle>{assignment.title}</CardTitle>
                              <span className={`px-3 py-1 text-xs rounded-full ${
                                submitted ? 'bg-green-100 text-green-800' : 
                                isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {submitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                              </span>
                            </div>
                            <CardDescription>
                              Course: {course?.name || "Unknown Course"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                Due: {format(new Date(assignment.due_date), 'MMMM d, yyyy')}
                              </div>
                              
                              <p className="text-sm">{assignment.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-4">
                                {assignment.file_url && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadAssignment(assignment.file_url!, assignment.file_name!)}
                                  >
                                    <Download className="h-4 w-4 mr-1" /> Download Assignment
                                  </Button>
                                )}
                                
                                {!submitted && (
                                  <div className="flex-1 flex items-center gap-2">
                                    <Input
                                      type="file"
                                      onChange={handleFileChange}
                                      className="max-w-xs"
                                    />
                                    <Button
                                      onClick={() => handleSubmitAssignment(assignment.id)}
                                      disabled={uploading || !selectedFile}
                                      size="sm"
                                    >
                                      {uploading ? "Uploading..." : "Submit"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
