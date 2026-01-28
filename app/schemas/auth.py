from typing import Optional
from pydantic import BaseModel, validator

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    repeat_password: str

    @validator('repeat_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True
