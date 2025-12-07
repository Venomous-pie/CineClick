import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Ticket, CreditCard, Settings, Mail, Phone, Lock } from "lucide-react";

const Account = () => {
  const { user, loading, isAuthenticated, login, register, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  
  // Login state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    emailNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        emailNotifications: user.emailNotifications === 1,
        smsNotifications: user.smsNotifications === 1,
      });
      
      // Redirect admin users to admin dashboard after login/register
      // Only redirect once and only if coming from authentication (not direct navigation)
      const fromAuth = location.state?.fromAuth;
      if (user.role === "admin" && isAuthenticated && fromAuth && !hasRedirected.current) {
        hasRedirected.current = true;
        // Small delay to allow toast to show
        setTimeout(() => {
          navigate("/admin", { replace: true });
        }, 500);
      }
    }
  }, [user, isAuthenticated, navigate, location.state]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({ email, password });
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        // Set fromAuth flag for redirect logic
        navigate('/account', { state: { fromAuth: true }, replace: true });
      } else {
        await register({ email, password, firstName, lastName, phone });
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
        // Set fromAuth flag for redirect logic
        navigate('/account', { state: { fromAuth: true }, replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        emailNotifications: profileData.emailNotifications,
        smsNotifications: profileData.smsNotifications,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (field: 'emailNotifications' | 'smsNotifications', value: boolean) => {
    const updatedData = { ...profileData, [field]: value };
    setProfileData(updatedData);

    try {
      await updateProfile({
        emailNotifications: updatedData.emailNotifications,
        smsNotifications: updatedData.smsNotifications,
      });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      // Revert on error
      setProfileData(profileData);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-card via-background to-card">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {isLoginMode ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {isLoginMode
                  ? "Sign in to access your account and manage your bookings"
                  : "Join CineMax to book tickets and enjoy exclusive offers"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Auth Form */}
        <main className="container mx-auto px-6 py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>{isLoginMode ? "Sign In" : "Sign Up"}</CardTitle>
              <CardDescription>
                {isLoginMode
                  ? "Enter your credentials to access your account"
                  : "Create a new account to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLoginMode && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required={!isLoginMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required={!isLoginMode}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {isLoginMode && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-border"
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <a
                      href="#"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Please wait..."
                    : isLoginMode
                    ? "Sign In"
                    : "Create Account"}
                </Button>
              </form>

              <Separator className="my-6" />

              <p className="text-center text-sm text-muted-foreground">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setEmail("");
                    setPassword("");
                    setFirstName("");
                    setLastName("");
                    setPhone("");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLoginMode ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-card via-background to-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Account
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your profile, bookings, and preferences
            </p>
          </motion.div>
        </div>
      </section>

      {/* Account Content */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="profileFirstName">First Name</Label>
                      <Input
                        id="profileFirstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileLastName">Last Name</Label>
                      <Input
                        id="profileLastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="profileEmail"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="profilePhone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gold"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Booking History
                </CardTitle>
                <CardDescription>
                  View and manage your movie bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Your booking history will appear here
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/my-tickets">View All Tickets</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your saved payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">GCash</p>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• 1234
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          Email Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about bookings and promotions
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={profileData.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('emailNotifications', checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          SMS Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive booking confirmations via SMS
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={profileData.smsNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('smsNotifications', checked)
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="gap-2 w-full md:w-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Account;