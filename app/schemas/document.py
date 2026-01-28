from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class DocumentBase(BaseModel):
    pass

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    # What can be updated? Maybe filename or content, but usually just metadata here if requested.
    # Requirement: "PUT /document/<document_id> - Update document"
    # This might mean re-uploading the file content or just renaming.
    # The prompt doesn't specify deeply, but says "Update document".
    # I'll allow updating filename or re-uploading (handled in API).
    # For schema, maybe just filename?
    filename: Optional[str] = None

class Document(DocumentBase):
    id: int
    project_id: int
    filename: str
    content_type: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True
