import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    FolderOpen,
    Settings,
    LogOut,
    Plus
} from 'lucide-react';
import { Button } from '../ui/Button';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    const links = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FolderOpen },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r bg-card/30 backdrop-blur-md px-4 py-6">
            <div className="space-y-6">
                <div className="px-2">
                    <h1 className="text-xl font-bold tracking-tight text-primary">PM Dashboard</h1>
                </div>

                <div className="space-y-1">
                    <Button className="w-full justify-start gap-2 mb-4" variant="default" asChild>
                        <Link to="/projects/new">
                            <Plus className="h-4 w-4" /> New Project
                        </Link>
                    </Button>

                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4 px-2">
                <div className="flex items-center gap-3 rounded-md bg-secondary/50 p-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">{user?.username}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email || 'User'}</span>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
