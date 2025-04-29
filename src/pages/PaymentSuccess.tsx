
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseIds = searchParams.get('course_ids')?.split(',') || [];
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID found. Payment verification failed.");
        setIsVerifying(false);
        return;
      }

      try {
        // In a real app, we'd call the verify-payment edge function
        // For our demo, we'll assume payment is successful and enroll the student

        // Get the current user
        const { data: { user } } = await supabase.auth.getSession();
        if (!user) {
          throw new Error("User not authenticated");
        }

        if (courseIds.length > 0) {
          // Enroll the student in all selected courses
          for (const courseId of courseIds) {
            // Check if enrollment already exists
            const { data: existingEnrollment } = await supabase
              .from('course_enrollments')
              .select('id')
              .eq('student_id', user.id)
              .eq('course_id', courseId)
              .single();

            if (!existingEnrollment) {
              // Create enrollment record
              await supabase.from('course_enrollments').insert({
                student_id: user.id,
                course_id: courseId,
                status: 'enrolled' // Auto-approve enrollment for demo purposes
              });
            } else {
              // Update existing enrollment to enrolled if it's pending
              await supabase
                .from('course_enrollments')
                .update({ status: 'enrolled' })
                .eq('student_id', user.id)
                .eq('course_id', courseId);
            }
          }
          
          // Create payment record
          await supabase.from('payments').insert({
            user_id: user.id,
            amount: 9900 * courseIds.length,
            status: 'completed',
            payment_type: 'course',
            description: `Enrolled in ${courseIds.length} course(s)`,
            transaction_id: sessionId
          });
        }

        // Success! Payment verified and courses enrolled
        setIsVerifying(false);
        
        toast({
          title: "Payment Successful!",
          description: "You have been enrolled in your selected courses.",
        });
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError("There was an error verifying your payment. Please contact support.");
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, courseIds]);

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVerifying ? (
              <p className="text-muted-foreground">Verifying your payment...</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <>
                <p>Your payment has been processed successfully.</p>
                <p className="text-sm text-muted-foreground">
                  You have been enrolled in {courseIds.length} course(s).
                </p>
              </>
            )}
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/my-courses')}>
                View My Courses
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
