
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  description: string;
  course_id: string;
}

interface MCQuestion {
  id: string;
  assignment_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  
  // Teacher mode state
  const [activeTab, setActiveTab] = useState("student");
  const [courses, setCourses] = useState<any[]>([]);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    course_id: "",
    description: "",
    due_date: ""
  });
  
  useEffect(() => {
    loadAssignments();
    loadCourses();
  }, []);

  const loadAssignments = async () => {
    try {
      const { data, error } = await supabase.from("assignments").select("*");
      if (error) throw error;
      setAssignments(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setLoading(false);
    }
  };
  
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const handleStartAssignment = async (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    setAnswers({});
    setShowScore(false);
    
    try {
      // For demo purposes, generating questions on-the-fly
      // In a real app, you'd fetch this from a "questions" table
      const demoQuestions: MCQuestion[] = [
        {
          id: "q1-" + assignmentId,
          assignment_id: assignmentId,
          question_text: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correct_option: 2 // Paris
        },
        {
          id: "q2-" + assignmentId,
          assignment_id: assignmentId,
          question_text: "Which planet is known as the Red Planet?",
          options: ["Jupiter", "Mars", "Venus", "Saturn"],
          correct_option: 1 // Mars
        },
        {
          id: "q3-" + assignmentId,
          assignment_id: assignmentId,
          question_text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correct_option: 1 // 4
        }
      ];
      setQuestions(demoQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitAssignment = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate score
      let correctCount = 0;
      let totalQuestions = questions.length;
      
      questions.forEach(question => {
        if (answers[question.id] === question.correct_option) {
          correctCount++;
        }
      });
      
      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      setScore(finalScore);
      
      // Generate a random UUID for demo purposes
      // In a real app, you would use the authenticated user's ID
      const demoStudentId = crypto.randomUUID();
      
      // Save the grade to the database
      const { error } = await supabase.from("grades").insert({
        assignment_id: selectedAssignment,
        student_id: user?.id || demoStudentId, // Use authenticated user ID if available
        score: finalScore,
        max_score: 100
      });
      
      if (error) throw error;
      
      setShowScore(true);
      
      toast({
        title: "Assignment Submitted",
        description: `Your score: ${finalScore}%`,
      });

    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.title || !newAssignment.course_id || !newAssignment.due_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase.from("assignments").insert(newAssignment);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      
      // Reset form and reload assignments
      setNewAssignment({
        title: "",
        course_id: "",
        description: "",
        due_date: ""
      });
      
      loadAssignments();
      
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToList = () => {
    setSelectedAssignment(null);
    setQuestions([]);
  };

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText />Assignments</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="student">Student View</TabsTrigger>
            <TabsTrigger value="teacher">Teacher View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            {loading ? <p>Loading...</p> : (
              <>
                {!selectedAssignment ? (
                  assignments.length === 0 ? (
                    <p>No assignments found.</p>
                  ) : (
                    <ul className="space-y-4">
                      {assignments.map((asgn) => (
                        <li key={asgn.id} className="rounded-lg border p-4 bg-white">
                          <div className="font-semibold">{asgn.title}</div>
                          <div className="text-gray-500 text-sm">Due: {asgn.due_date}</div>
                          <p className="text-sm mb-3">{asgn.description}</p>
                          <Button 
                            onClick={() => handleStartAssignment(asgn.id)}
                            size="sm"
                          >
                            Start Assignment
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div className="space-y-6">
                    <Button variant="outline" onClick={handleBackToList} className="mb-4">
                      Back to Assignments
                    </Button>
                    
                    {showScore ? (
                      <div className="p-6 border rounded-lg bg-white text-center">
                        <h3 className="text-xl font-bold mb-4">Assignment Completed!</h3>
                        <div className="text-5xl font-bold mb-4 text-primary">{score}%</div>
                        <p>Your score has been recorded</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-2">
                          {assignments.find(a => a.id === selectedAssignment)?.title}
                        </h3>
                        
                        <div className="space-y-8">
                          {questions.map((question, qIndex) => (
                            <div key={question.id} className="border rounded-lg p-4 bg-white">
                              <h4 className="font-medium mb-3">
                                Question {qIndex + 1}: {question.question_text}
                              </h4>
                              
                              <RadioGroup 
                                value={answers[question.id]?.toString()} 
                                onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                                className="space-y-2"
                              >
                                {question.options.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={index.toString()} id={`q${qIndex}-option-${index}`} />
                                    <label htmlFor={`q${qIndex}-option-${index}`} className="text-sm">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          onClick={handleSubmitAssignment} 
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          Submit Answers
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="teacher">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="text-lg font-bold mb-4">Create New Assignment</h3>
              
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input 
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="course">Course</Label>
                  <select 
                    id="course"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAssignment.course_id}
                    onChange={(e) => setNewAssignment({...newAssignment, course_id: e.target.value})}
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
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input 
                    id="due_date"
                    type="date"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Enter assignment details"
                    rows={3}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Assignment
                </Button>
              </form>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Existing Assignments</h3>
              
              {assignments.length === 0 ? (
                <p>No assignments created yet.</p>
              ) : (
                <ul className="space-y-3">
                  {assignments.map((asgn) => (
                    <li key={asgn.id} className="border rounded p-3 bg-white">
                      <div className="font-medium">{asgn.title}</div>
                      <div className="text-sm text-gray-500">Due: {asgn.due_date}</div>
                      {asgn.description && (
                        <div className="text-sm mt-1">{asgn.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
