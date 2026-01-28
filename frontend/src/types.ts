export interface User {
    id: number;
    username: string;
    email?: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    owner_id: number;
    created_at: string;
}

export interface Document {
    id: number;
    project_id: number;
    filename: string;
    content_type: string;
    uploaded_at: string;
}
