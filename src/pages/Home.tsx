import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Clock, Award, BookOpen, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const { user } = useAuth();
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCartItemsCount(count || 0);
  };

  const stats = [
    { icon: Users, label: "Students Taught", value: "5,000+" },
    { icon: Clock, label: "Students Currently Learning", value: "1,200+" },
    { icon: Award, label: "Live Sessions Completed", value: "850+" },
  ];

  const features = [
    {
      icon: Users,
      title: "Live Interactive Classes",
      description: "Join live sessions 3 days a week with experienced instructors",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Resources",
      description: "Access recorded lectures, notes, PDFs, and practice assignments",
    },
    {
      icon: TrendingUp,
      title: "Real-World Projects",
      description: "Build practical applications and boost your portfolio",
    },
    {
      icon: Award,
      title: "Certification",
      description: "Earn a completion certificate to showcase your skills",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} cartItemsCount={cartItemsCount} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master Java Programming with Live Coaching
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Transform your career with industry-ready Java skills. Join 5,000+ students who have already started their journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center shadow-card">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See What Makes Us Different
            </h2>
            <p className="text-xl text-muted-foreground">
              Watch our introduction to understand our teaching methodology
            </p>
          </div>
          <div className="max-w-4xl mx-auto aspect-video bg-muted rounded-lg flex items-center justify-center shadow-premium">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Introductory video coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose JavaMaster?
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to become a Java expert
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-premium transition-shadow">
                  <CardContent className="pt-6">
                    <Icon className="h-10 w-10 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Java Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our next batch starting 21st Nov. Limited seats available!
          </p>
          <Link to="/courses">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8">
              Enroll Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;