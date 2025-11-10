import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, GraduationCap, Calendar, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        fetchDashboardData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        id,
        amount_paid,
        payment_status,
        purchased_at,
        courses (*)
      `)
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false });

    setOrders(ordersData || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} cartItemsCount={0} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} cartItemsCount={0} />
      
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Student Dashboard
          </h1>
          <p className="text-xl text-white/90">
            Welcome back, {profile?.full_name}!
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{profile?.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                      <p className="font-semibold">{profile?.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">College</p>
                      <p className="font-semibold">{profile?.college_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold">{profile?.year}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  My Courses ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      You haven't enrolled in any courses yet
                    </p>
                    <a
                      href="/courses"
                      className="text-primary hover:underline font-semibold"
                    >
                      Browse Courses
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="bg-secondary">
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">
                                {order.courses?.title}
                              </h3>
                              <p className="text-muted-foreground mb-3">
                                {order.courses?.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">
                                  {order.courses?.mode}
                                </Badge>
                                <Badge className="bg-accent">
                                  Purchased
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary mb-2">
                                ₹{order.amount_paid}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.purchased_at).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;