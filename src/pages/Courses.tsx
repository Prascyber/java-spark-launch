import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Award, BookOpen, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (!error && data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const fetchCartCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCartItemsCount(count || 0);
  };

  const addToCart = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add courses to cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      course_id: courseId,
    });

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already in Cart",
          description: "This course is already in your cart",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to cart",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: "Course added to cart!",
      });
      fetchCartCount();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} cartItemsCount={cartItemsCount} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} cartItemsCount={cartItemsCount} />
      
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Courses
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Industry-ready Java programming courses designed for college students
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {courses.map((course) => (
            <Card key={course.id} className="max-w-5xl mx-auto shadow-premium mb-8">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-lg">{course.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="secondary">{course.mode}</Badge>
                      {course.limited_seats && (
                        <Badge variant="destructive">Limited Seats</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ₹{course.discounted_price}
                    </div>
                    <div className="text-lg text-muted-foreground line-through">
                      ₹{course.original_price}
                    </div>
                    <Badge className="mt-2 bg-accent">Save 40%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    What You'll Get
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Course Modules
                  </h3>
                  <div className="space-y-4">
                    {course.modules?.map((module: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Module {index + 1}: {module.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {module.topics?.map((topic: string, topicIndex: number) => (
                              <Badge key={topicIndex} variant="outline">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg mb-2">🎯 Early Bird Offer</p>
                      <p className="text-muted-foreground">
                        25% extra discount for first 20 students • {course.seats_remaining} seats left
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Batch starts from {course.batch_start_date}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-hero"
                      onClick={() => addToCart(course.id)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;