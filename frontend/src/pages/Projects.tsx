import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Project } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Folder, Calendar, Trash2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/Dialog"
import { deleteProject } from '../services/api';

const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await deleteProject(projectToDelete.id);
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            setProjectToDelete(null);
        } catch (error) {
            console.error('Failed to delete project:', error);
            setError('Failed to delete project. You might not be the owner.');
        } finally {
            setIsDeleting(false);
        }
    };

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
                            <CardFooter className="flex gap-2">
                                <Button variant="secondary" className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                                    <Link to={`/projects/${project.id}`}>View Details</Link>
                                </Button>
                                {/* Debug: {user?.id} vs {project.owner_id} */}
                                {String(user?.id) === String(project.owner_id) && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setProjectToDelete(project);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}


            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">{projectToDelete?.name}</span>?
                            This action cannot be undone and will delete all associated documents.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Project'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Projects;
