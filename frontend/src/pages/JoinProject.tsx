import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinProject = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [projectId, setProjectId] = useState<number | null>(null);

    useEffect(() => {
        const join = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No invite token provided');
                return;
            }

            try {
                // api.get('/join') requires token query param
                const response = await api.get(`/join?token=${token}`);
                setStatus('success');
                setMessage(response.data.message);
                setProjectId(response.data.project_id);

                // Optional: Auto redirect after few seconds
                // setTimeout(() => navigate(`/projects/${response.data.project_id}`), 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Failed to join project');
            }
        };

        join();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="flex justify-center mb-2">
                            {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                            {status === 'success' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                            {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}
                        </CardTitle>
                        <CardTitle>
                            {status === 'loading' && 'Joining Project...'}
                            {status === 'success' && 'Welcome!'}
                            {status === 'error' && 'Something went wrong'}
                        </CardTitle>
                        <CardDescription>
                            {status === 'loading' && 'Please wait while we verify your invitation'}
                            {status !== 'loading' && message}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-6">
                        {status === 'success' && projectId && (
                            <Button onClick={() => navigate(`/projects/${projectId}`)}>
                                Go to Project
                            </Button>
                        )}
                        {status === 'error' && (
                            <Button variant="outline" onClick={() => navigate('/')}>
                                Go to Dashboard
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default JoinProject;
