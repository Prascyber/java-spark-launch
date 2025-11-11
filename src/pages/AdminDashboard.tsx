import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingBag, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalStudents: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchCartCount();
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchCartCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCartItemsCount(count || 0);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch orders with course and profile data
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          courses (title, discounted_price),
          profiles (full_name, email, mobile, college_name)
        `)
        .order("purchased_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (studentsError) throw studentsError;

      // Calculate stats
      const revenue = ordersData?.reduce((sum, order) => sum + Number(order.amount_paid), 0) || 0;
      const sales = ordersData?.length || 0;
      const totalStudents = studentsData?.length || 0;

      setStats({
        totalRevenue: revenue,
        totalSales: sales,
        totalStudents: totalStudents,
      });
      setOrders(ordersData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefund = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
      fetchDashboardData();
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} cartItemsCount={cartItemsCount} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} cartItemsCount={cartItemsCount} />

      <section className="py-8 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/90 mt-2">Manage your course sales and students</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover-scale transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSales}</div>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(orders, "orders.csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Orders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.courses?.title}</TableCell>
                        <TableCell>₹{order.amount_paid}</TableCell>
                        <TableCell>
                          {new Date(order.purchased_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.payment_status === "completed"
                                ? "default"
                                : order.payment_status === "refunded"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.payment_status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefund(order.id)}
                            >
                              Refund
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Students Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Registered Students</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(students, "students.csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Students
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.mobile}</TableCell>
                        <TableCell>{student.college_name}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>
                          {new Date(student.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
