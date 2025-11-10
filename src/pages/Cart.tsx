import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        fetchCartItems();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        course_id,
        courses (*)
      `)
      .eq("user_id", user.id);

    if (!error && data) {
      setCartItems(data);
    }
    setLoading(false);
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
      fetchCartItems();
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.courses?.discounted_price || 0);
    }, 0);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} cartItemsCount={0} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart...</p>
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
            Shopping Cart
          </h1>
          <p className="text-xl text-white/90">
            Review your selected courses
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {cartItems.length === 0 ? (
            <Card className="max-w-2xl mx-auto shadow-card text-center">
              <CardContent className="pt-12 pb-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Browse our courses and add them to your cart
                </p>
                <Button onClick={() => navigate("/courses")} className="bg-gradient-hero">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="shadow-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {item.courses?.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {item.courses?.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.courses?.mode}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-4">
                            ₹{item.courses?.discounted_price}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="shadow-premium sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items ({cartItems.length})</span>
                      <span className="font-semibold">₹{getTotalAmount()}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">₹{getTotalAmount()}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-hero"
                      size="lg"
                      onClick={() => navigate("/payment")}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;