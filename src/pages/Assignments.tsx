
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";

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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    loadAssignments();
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
      
      // Save the grade to the database
      const { error } = await supabase.from("grades").insert({
        assignment_id: selectedAssignment,
        student_id: "demo-student", // In a real app, use auth.user.id
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

  const handleBackToList = () => {
    setSelectedAssignment(null);
    setQuestions([]);
  };

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText />Assignments</h2>
        
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
      </div>
    </MainLayout>
  );
}
