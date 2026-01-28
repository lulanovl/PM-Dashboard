import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// We'll use this as a page for now, but style it to look good.
// Actually, since I created a Dialog component, let's use it properly.
// But the user clicked "Create Project" which goes to /projects/new.
// So I will make /projects/new render this Dialog on top of /projects?
// Or just a standalone page that looks like a centered card.
// Standalone page is easier for routing right now.

const CreateProject = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/projects', { name, description }); // Check API endpoint
            navigate('/projects');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
            <div className="w-full max-w-md space-y-6 p-8 rounded-xl border bg-card text-card-foreground shadow-lg backdrop-blur-xl">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Create Project</h1>
                    <p className="text-muted-foreground">Start a new workspace for your team.</p>
                </div>

                {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none">Project Name</label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Website Redesign"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none">Description (Optional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe your project..."
                            className={cn(
                                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/projects')}>
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
