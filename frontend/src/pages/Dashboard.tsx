
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const Dashboard = () => {
    const { logout, user } = useAuth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="mb-4 text-muted-foreground">Welcome back, {user?.username}!</p>
            <Button onClick={logout} variant="destructive">Logout</Button>
        </div>
    );
};

export default Dashboard;
