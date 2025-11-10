import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  collegeName: z.string().min(2, "College name is required").max(200),
  year: z.string().min(1, "Please select your year"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    collegeName: "",
    year: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse(formData);
      setLoading(true);

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validated.fullName,
            mobile: validated.mobile,
            college_name: validated.collegeName,
            year: validated.year,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4 py-12">
      <Card className="w-full max-w-2xl shadow-premium">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <CardDescription>Join 5,000+ students learning Java</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name</Label>
              <Input
                id="collegeName"
                placeholder="Your College Name"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Login
              </Link>
            </p>
            <Link to="/" className="block text-sm text-muted-foreground hover:text-primary">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;