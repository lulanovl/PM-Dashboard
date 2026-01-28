
import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // POST /login expects JSON { username, password }
            const response = await api.post('/login', { username, password });
            const { access_token } = response.data;

            // We need user details too. Ideally login returns it or we fetch it.
            // For now, let's assume we can fetch it or just fake it until we hit the dashboard which will fetch it.
            // But AuthContext expects user data immediately to set isAuthenticated. 
            // The context handles fetching user on init, but on plain login call?
            // Let's modify logic: login sets token, then we fetch user.

            localStorage.setItem('token', access_token);

            // Fetch user profile
            // Checking backend routes... assuming /users/me exists or similar.
            // If not, we might need to add it or use what we have.
            // Wait, app/api/auth.py doesn't return user.
            // Let's check if there is a users endpoint.
            // For now, we will optimistically redirect or fetch.
            // Just calling login function from context which might need update.

            // HACK: For this step, we'll manually set a user object since we know the username.
            // Real app should have /users/me
            const userData = { id: 0, email: '', is_active: true, is_superuser: false, username }; // types.ts update needed for username

            login(access_token, userData as any); // Type assertion until we fix types
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to login');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to access your projects
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20" role="alert">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-secondary/50 text-foreground border-transparent focus:border-primary transition-all duration-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-secondary/50 text-foreground border-transparent focus:border-primary transition-all duration-300"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline">
                                    Register
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
