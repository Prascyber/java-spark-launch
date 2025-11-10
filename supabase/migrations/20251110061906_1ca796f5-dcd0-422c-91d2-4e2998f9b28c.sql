-- Create profiles table for student information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  college_name TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT,
  features TEXT[],
  modules JSONB,
  original_price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2) NOT NULL,
  batch_start_date TEXT,
  limited_seats BOOLEAN DEFAULT false,
  seats_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses policies (public read access)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function to update profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile, college_name, year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'college_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert the Java course
INSERT INTO public.courses (
  title,
  description,
  mode,
  features,
  modules,
  original_price,
  discounted_price,
  batch_start_date,
  limited_seats,
  seats_remaining
) VALUES (
  'Java Full Live Coaching Program',
  'Complete Java programming course with live classes, recorded lectures, assignments, and hands-on projects. Perfect for college students looking to master Java and build real-world applications.',
  'Live Classes (3 days/week) + Recorded Lectures',
  ARRAY[
    'Live Interactive Sessions',
    'Recorded Lecture Access',
    'Assignments & Practice Problems',
    'Comprehensive Notes & PDFs',
    'Real-world Projects',
    '24/7 Doubt Support',
    'Completion Certificate'
  ],
  '[
    {
      "title": "Java Fundamentals",
      "topics": ["Variables & Data Types", "Operators", "Control Flow", "Loops", "Arrays"]
    },
    {
      "title": "Object-Oriented Programming",
      "topics": ["Classes & Objects", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation"]
    },
    {
      "title": "Advanced Java Concepts",
      "topics": ["Exception Handling", "Collections Framework", "Multithreading", "File I/O", "Generics"]
    },
    {
      "title": "Java Web Development",
      "topics": ["Servlets", "JSP", "JDBC", "Spring Framework Basics", "RESTful APIs"]
    },
    {
      "title": "Projects & Interview Prep",
      "topics": ["Banking System Project", "E-commerce Application", "Data Structures in Java", "Interview Questions", "Resume Building"]
    }
  ]'::jsonb,
  4999.00,
  2999.00,
  '21st Nov',
  true,
  20
);