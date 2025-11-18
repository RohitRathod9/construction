import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { signInAdmin } from "@/lib/firebase/firebase.auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@company.com"); // Demo email
  const [password, setPassword] = useState("Password123!"); // Demo password
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string, form?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { user, error } = await signInAdmin(email, password);
      if (error) {
        throw error;
      }
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed", { description: error.message });
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Construction Record Book</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your construction sites</p>
        </div>

        <div className="bg-card p-8 rounded-xl card-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email || errors.form ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password || errors.form ? "border-destructive" : ""}
              />
            </div>

            {errors.form && (
                <p className="text-sm text-destructive text-center">{errors.form}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

             <div className="text-sm text-center text-muted-foreground">
              Use a valid Firebase user to sign in.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
