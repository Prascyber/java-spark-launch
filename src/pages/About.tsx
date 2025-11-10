import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, BookOpen, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower college students with industry-ready Java programming skills through personalized coaching and hands-on learning.",
    },
    {
      icon: Users,
      title: "Student-Centric",
      description: "We prioritize individual attention, doubt support, and practical learning to ensure every student succeeds.",
    },
    {
      icon: BookOpen,
      title: "Quality Education",
      description: "Comprehensive curriculum designed by industry experts with real-world projects and certification.",
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "5,000+ students taught with 95% satisfaction rate and successful career placements.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About JavaMaster
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your trusted partner in mastering Java programming
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
            <p className="text-lg text-muted-foreground mb-6">
              JavaMaster is a premier online learning platform dedicated to teaching Java programming to college students. 
              Founded with the vision of making quality programming education accessible to everyone, we've successfully 
              trained over 5,000 students across India.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Our live coaching approach combines the best of interactive learning, practical projects, and personalized 
              mentorship. With experienced instructors and a comprehensive curriculum, we ensure that every student gains 
              not just theoretical knowledge, but real-world skills that matter in the industry.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-premium transition-shadow">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Commitment</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We are committed to providing the highest quality Java programming education through live interactive 
              sessions, comprehensive study materials, real-world projects, and continuous support. Every student 
              receives personalized attention and guidance to help them achieve their career goals.
            </p>
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg">
              <p className="text-lg font-semibold">
                "Education is not the filling of a pail, but the lighting of a fire."
              </p>
              <p className="text-muted-foreground mt-2">- Our Teaching Philosophy</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;