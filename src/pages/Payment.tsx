import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "registration" | "course";
  required?: boolean;
  courseId?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  room: string;
}

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
    {
      id: "reg-fee",
      name: "Registration Fee",
      description: "One-time registration fee for new students",
      amount: 5000, // $50.00
      type: "registration",
      required: false,
    }
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Set required items as selected by default
    const requiredItemIds = paymentItems
      .filter(item => item.required)
      .map(item => item.id);
    
    setSelectedItems(requiredItemIds);
    
    // Fetch payment history if user is logged in
    if (user) {
      fetchPaymentHistory();
      fetchCourses();
      fetchEnrolledCourses();
    }
  }, [user]);
  
  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setEnrolledCourseIds(data.map(enrollment => enrollment.course_id));
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map courses to payment items
        const coursePaymentItems = data.map((course: Course) => ({
          id: `course-${course.id}`,
          name: course.name,
          description: `Course fee for ${course.code}`,
          amount: 9900, // $99.00 - default price
          type: "course" as const,
          courseId: course.id,
        }));
        
        // Combine registration fee with course items
        setPaymentItems(prev => {
          // Keep only the registration items from previous state
          const registrationItems = prev.filter(item => item.type === "registration");
          return [...registrationItems, ...coursePaymentItems];
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available courses",
        variant: "destructive",
      });
    } finally {
      setCoursesLoading(false);
    }
  };
  
  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };
  
  const getTotal = () => {
    return paymentItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.amount, 0);
  };
  
  const handlePaymentCheckout = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to proceed with payment",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // For a simplified flow, we'll skip the edge function call
      // and directly proceed to the success page
      const selectedCourseIds = paymentItems
        .filter(item => selectedItems.includes(item.id) && item.type === "course")
        .map(item => item.courseId)
        .filter(id => id) as string[];
      
      // Generate a fake session ID
      const fakeSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      
      // Redirect to payment success page
      navigate(`/payment-success?session_id=${fakeSessionId}&course_ids=${selectedCourseIds.join(',')}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const isCourseEnrolled = (courseId: string | undefined) => {
    return courseId ? enrolledCourseIds.includes(courseId) : false;
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Payments</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Courses to Enroll</CardTitle>
                <CardDescription>
                  Choose the courses you want to pay for and enroll in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <p>Loading available courses...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentItems.filter(item => item.type === "course").map(item => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-md">
                        <input
                          type="checkbox"
                          id={item.id}
                          className="mt-1"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                          disabled={isCourseEnrolled(item.courseId)}
                        />
                        <div className="flex-1">
                          <label htmlFor={item.id} className="font-medium flex items-center gap-2">
                            {item.name} 
                            {isCourseEnrolled(item.courseId) && 
                              <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">
                                Already Enrolled
                              </span>
                            }
                          </label>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-lg font-semibold">
                          ${(item.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-stretch">
                <div className="flex justify-between py-4 text-lg font-semibold">
                  <span>Total:</span>
                  <span>${(getTotal() / 100).toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handlePaymentCheckout}
                  disabled={loading || selectedItems.length === 0 || coursesLoading}
                >
                  {loading ? "Processing..." : "Pay & Enroll Now"}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-auto">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">{payment.description}</span>
                          <span className="font-semibold">
                            ${(payment.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {new Date(payment.created_at).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Transaction ID: {payment.transaction_id || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No payment history found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
