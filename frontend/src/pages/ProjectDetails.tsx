import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Project, Document } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, File, Trash2, Download, Upload, ArrowLeft, Share2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import ShareDialog from '../components/projects/ShareDialog';
import EditProjectDialog from '../components/projects/EditProjectDialog';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const projectId = id ? parseInt(id) : 0;

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const projectRes = await api.get<Project>(`/project/${projectId}/info`);
                setProject(projectRes.data);

                const docsRes = await api.get<Document[]>(`/project/${projectId}/documents`);
                setDocuments(docsRes.data);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load project details');
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !projectId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post<Document>(`/project/${projectId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setDocuments([...documents, response.data]);
            setIsUploadOpen(false);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            // Handle error (maybe show toast)
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDocument = async (docId: number) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await api.delete(`/document/${docId}`);
            setDocuments(documents.filter(d => d.id !== docId));
        } catch (err) {
            console.error("Failed to delete document", err);
            alert("Failed to delete document. You might not be the owner.");
        }
    };

    const handleDownload = async (docId: number, filename: string) => {
        try {
            const response = await api.get(`/document/${docId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return <div className="text-center p-8">Project not found</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-4 w-4" /> Back to Projects
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">{project.description || "No description provided."}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => setIsShareOpen(true)}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
                    <Button onClick={() => setIsUploadOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                            <File className="h-10 w-10 mb-4 opacity-20" />
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <Card key={doc.id} className="group flex flex-col justify-between transition-all hover:shadow-md bg-card/50">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary mt-1">
                                            <File className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base line-clamp-1 break-all" title={doc.filename}>
                                                {doc.filename}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.filename)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDocument(doc.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Select a file to upload to this project.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload}>
                        <div className="grid gap-4 py-4">
                            <Input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isUploading || !selectedFile}>
                                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Share Dialog */}
            <ShareDialog
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                projectId={projectId}
            />

            <EditProjectDialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                project={project}
                onUpdate={(updated) => setProject(updated)}
            />
        </div>
    );
};

export default ProjectDetails;
