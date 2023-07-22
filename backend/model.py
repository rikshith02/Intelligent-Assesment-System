from pydantic import BaseModel
from typing import Optional,List,Dict,Union


class auth(BaseModel):
    fname:str
    email:str
    password:str
    cpassword:str
    role: Optional[str] = "client"



class Login(BaseModel):
    email: str
    password: str

    
    
    
    
class Upload(BaseModel):
    Topic:str
    Difficulty:str
    Question:str
    Answer:str
    
    

class SimilarityRequest(BaseModel):
    sentences1: List[str]
    sentences2: List[str]



class StoreData(BaseModel):
    fname: str 
    email: str 
    language:str
    correct_answers: int
    easy_percentage: float
    medium_percentage: float 
    hard_percentage: float
    topicsData: dict
    
    
class CorrectQuestion(BaseModel):
    email:str
    questions: List[str]
    language:str


class User(BaseModel):
    email:str
    language:str



class Qdetail(BaseModel):
    email:str
    language:str
    
    
    

class Cpassword(BaseModel):
    email: str
    current_password: str
    new_password: str