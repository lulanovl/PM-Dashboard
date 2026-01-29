import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return "Password must contain at least one special character";
        }
        return null; // Valid
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Password Match Validation
        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        // Password Strength Validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await api.post('/auth', {
                username,
                password,
                repeat_password: repeatPassword
            });
            navigate('/login', { state: { from: location.state?.from } });
        } catch (err: any) {
            // Handle HTTP 422 Validation Errors (from Pydantic)
            if (err.response?.status === 422) {
                // Pydantic validation errors structure: detail -> [ { loc, msg, type } ]
                // We'll just show the first error message's 'msg'
                const details = err.response.data.detail;
                if (Array.isArray(details) && details.length > 0) {
                    // Remove "Value error, " prefix if present (common in Pydantic v1, less so v2 but good safety)
                    let msg = details[0].msg;
                    if (msg.startsWith('Value error, ')) {
                        msg = msg.substring(13);
                    }
                    setError(msg);
                } else {
                    setError('Invalid input data');
                }
            } else {
                setError(err.response?.data?.detail || 'Failed to register');
            }
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
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your details to get started
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
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Repeat Password"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
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
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                                ) : (
                                    "Register"
                                )}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
