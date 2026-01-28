import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Project } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Folder, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Check API endpoint. Previously user said /projects
                const response = await api.get<{ projects: Project[] } | Project[]>('/projects');
                // Adjust based on actual API response format.
                // Assuming it returns a list directly or list wrapped in object.
                if (Array.isArray(response.data)) {
                    setProjects(response.data);
                } else if (Array.isArray((response.data as any).projects)) {
                    setProjects((response.data as any).projects);
                } else {
                    // Fallback/Safety
                    setProjects([]);
                }
            } catch (err: any) {
                setError('Failed to load projects');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage and track your ongoing projects</p>
                </div>
                <Button asChild>
                    <Link to="/projects/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Project
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                    {error}
                </div>
            )}

            {!error && projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    <Folder className="h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
                    <p className="mb-4">Get started by creating your first project.</p>
                    <Button variant="outline" asChild>
                        <Link to="/projects/new">Create Project</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                    {project.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                                    <Link to={`/projects/${project.id}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
