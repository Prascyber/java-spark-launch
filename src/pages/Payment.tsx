import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch cart items
    const { data: cartData } = await supabase
      .from("cart_items")
      .select(`
        id,
        course_id,
        courses (*)
      `)
      .eq("user_id", user.id);

    if (cartData && cartData.length === 0) {
      navigate("/cart");
      return;
    }

    setCartItems(cartData || []);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.courses?.discounted_price || 0);
    }, 0);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create orders for each cart item
      for (const item of cartItems) {
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user!.id,
          course_id: item.course_id,
          amount_paid: item.courses.discounted_price,
          payment_status: "completed",
          payment_id: `PAY_${Date.now()}`,
        });

        if (orderError) throw orderError;
      }

      // Clear cart
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user!.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Payment Successful!",
        description: "Your enrollment is confirmed. Check your email for details.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} cartItemsCount={0} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} cartItemsCount={cartItems.length} />
      
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Checkout
          </h1>
          <p className="text-xl text-white/90">
            Complete your enrollment
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={profile?.full_name || ""} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={profile?.email || ""} disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Mobile Number</Label>
                      <Input value={profile?.mobile || ""} disabled />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input value={profile?.year || ""} disabled />
                    </div>
                  </div>
                  <div>
                    <Label>College Name</Label>
                    <Input value={profile?.college_name || ""} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information (Demo)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" required />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input placeholder="123" type="password" required />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-hero"
                      size="lg"
                      disabled={processing}
                    >
                      {processing ? "Processing..." : `Pay ₹${getTotalAmount()}`}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      🔒 This is a demo payment. No actual charges will be made.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-premium sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pb-3 border-b">
                      <p className="font-semibold">{item.courses?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.courses?.discounted_price}
                      </p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Payment;