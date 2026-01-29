import { useState } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Copy, Check, Loader2, UserPlus, Link as LinkIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
}

const ShareDialog = ({ isOpen, onClose, projectId }: ShareDialogProps) => {
    const [mode, setMode] = useState<'invite' | 'link'>('invite');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await api.post(`/project/${projectId}/invite?user=${username}`);
            setMessage({ type: 'success', text: `Successfully invited ${username}` });
            setUsername('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to invite user' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setGeneratedLink('');

        try {
            const response = await api.get(`/project/${projectId}/share?with=${email}`);
            setGeneratedLink(response.data.link);
            setMessage({ type: 'success', text: 'Link generated successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to generate link' });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                    <DialogDescription>
                        Invite others to collaborate on this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 border-b mb-4">
                    <button
                        className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", mode === 'invite' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                        onClick={() => { setMode('invite'); setMessage(null); }}
                    >
                        Invite User
                    </button>
                    <button
                        className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", mode === 'link' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                        onClick={() => { setMode('link'); setMessage(null); }}
                    >
                        Share Link
                    </button>
                </div>

                {mode === 'invite' ? (
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">Username</label>
                            <div className="flex gap-2">
                                <Input
                                    id="username"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="text-foreground"
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleGenerateLink} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Recipient Email</label>
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="friend@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="text-foreground"
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">This will generate a unique one-time link for this email.</p>
                        </div>

                        {generatedLink && (
                            <div className="mt-4 p-3 bg-secondary rounded-md flex items-center justify-between gap-2 overflow-hidden">
                                <code className="text-xs text-foreground break-all whitespace-pre-wrap flex-1">{generatedLink}</code>
                                <Button size="icon" variant="ghost" type="button" onClick={copyToClipboard} className="h-6 w-6 shrink-0">
                                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                        )}
                    </form>
                )}

                {message && (
                    <div className={cn("p-2 rounded-md text-sm", message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive")}>
                        {message.text}
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
