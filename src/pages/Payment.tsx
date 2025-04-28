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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/auth";

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "registration" | "course";
  required?: boolean;
}

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
    {
      id: "reg-fee",
      name: "Registration Fee",
      description: "One-time registration fee for new students",
      amount: 5000, // $50.00
      type: "registration",
      required: true,
    },
    {
      id: "course-math101",
      name: "Mathematics 101",
      description: "Basic mathematics course fee",
      amount: 9900, // $99.00
      type: "course",
    },
    {
      id: "course-eng101",
      name: "English 101",
      description: "Basic english course fee",
      amount: 8900, // $89.00
      type: "course",
    },
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  useEffect(() => {
    // Set required items as selected by default
    const requiredItemIds = paymentItems
      .filter(item => item.required)
      .map(item => item.id);
    
    setSelectedItems(requiredItemIds);
    
    // Fetch payment history if user is logged in
    if (user) {
      fetchPaymentHistory();
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
      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items: paymentItems.filter(item => selectedItems.includes(item.id)),
          user_id: user?.id,
          user_email: user?.email,
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Payments</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Items to Pay</CardTitle>
                <CardDescription>
                  Choose the fees you want to pay for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentItems.map(item => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-md">
                      <input
                        type="checkbox"
                        id={item.id}
                        className="mt-1"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        disabled={item.required}
                      />
                      <div className="flex-1">
                        <Label htmlFor={item.id} className="font-medium">
                          {item.name} {item.required && <span className="text-sm text-muted-foreground">(Required)</span>}
                        </Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-lg font-semibold">
                        ${(item.amount / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch">
                <div className="flex justify-between py-4 text-lg font-semibold">
                  <span>Total:</span>
                  <span>${(getTotal() / 100).toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handlePaymentCheckout}
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
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
