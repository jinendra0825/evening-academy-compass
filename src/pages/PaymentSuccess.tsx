
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
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
        // Call the verify-payment edge function
        const { error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) throw new Error(error.message);

        // Success! Payment verified
        setIsVerifying(false);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError("There was an error verifying your payment. Please contact support.");
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

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
                  Transaction ID: {sessionId}
                </p>
              </>
            )}
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/payment')}>
                View Payment History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
