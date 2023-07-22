from fastapi import FastAPI, HTTPException,Depends,Header,Request,status, UploadFile, File,Query
from fastapi.middleware.cors import CORSMiddleware
from model import Login,auth,SimilarityRequest,StoreData,CorrectQuestion,User,Qdetail,Cpassword
from passlib.hash import bcrypt
import bcrypt as bcrypt_module
from database import db,collection,db1,collection1,collection2,collection8
from bson.objectid import ObjectId
from jose import JWTError, jwt
from datetime import datetime, timedelta,date
import jwt
from typing import Optional,List
import random
import csv
import os
import asyncio
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from transformers import AutoTokenizer, AutoModel
import torch
from sentence_transformers import SentenceTransformer,util
import spacy
import numpy as np
from pymongo import MongoClient



app = FastAPI()

origins=[
        "https://localhost:3000",
         "https://localhost:8000",
         ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return{"Shiva"}





@app.post('/signup')
async def signup_user(user: auth):
    user_dict = user.dict()
    hashed_password = bcrypt.hash(user.password)
    hashed_cpassword = bcrypt.hash(user.password)
    user_dict["password"] = hashed_password
    user_dict["cpassword"] = hashed_cpassword
    if user_dict["email"] == "admin@gmail.com":
        user_dict["role"] = "admin"
    existing_user = await collection.find_one({"email": user_dict["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="email already exists")
    user_id = await collection.insert_one(user_dict)
    user_dict["_id"] = str(user_id.inserted_id)
    return user_dict







@app.post('/login')
async def login_user(log:Login):
    existing_user = await collection.find_one({"email": log.email})
    if not existing_user or not bcrypt.verify(log.password.encode('utf-8'), existing_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    update_login_history(log.email, password_changed=False)
    access_token = jwt.encode({"sub": str(existing_user["_id"]), "exp": datetime.utcnow() + timedelta(minutes=30), "role": existing_user.get("role", "client")}, "secret", algorithm="HS256")
    return {"access_token": access_token, "token_type": "bearer", "role": existing_user.get("role", "client")}








client3 = MongoClient('mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/test')
db4 = client3['test']
collection6 = db4['user']
@app.get("/users")
def get_users():
    users = list(collection6.find({}, {"_id": 0}))
    return users








@app.get('/user')
async def get_user_details(token:str):
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload["sub"]
        user = await collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")                
    user_dict = {
        "id": str(user["_id"]),
        "fname": user["fname"],
        "email": user["email"],
        "role": user.get("role", "client")
    }
    return user_dict





@app.post('/logout')
async def logout_user():
    return {"message": "Logout successful"}







# MongoDB connection setup
client10 = MongoClient("mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/QandA")
db10 = client10["QandA"]
collection101 = db10["java"]
collection102 =db10["python"]

client11 = MongoClient("mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/test")
db11 = client11["test"]
collection11 = db11["correctquestion"]
collection12 = db11["result"]
collection13 =db11["user"]



@app.post("/jquestions", response_model=dict)
async def get_random_questions(user_data: User):
    email = user_data.email
    language = user_data.language.lower()

    # Check if the email exists in the correctquestion collection
    user = collection11.find_one({"email": email})
    if user:
        correct_questions = user.get("correct_questions", {}).get(language, []) 
    else:
        correct_questions = []

    cursor = collection101.find()
    questions = await asyncio.to_thread(list, cursor)
    non_correct_filtered_questions = [q for q in questions if q["Question"] not in correct_questions]

    test_data = collection12.find_one({"email": email})
    if test_data:
        tests = test_data.get("tests", [])
        print('test number:',len(tests));
        language_tests = [test for test in tests if test.get("Language").lower() == language]
        total_test = len(language_tests)
        print('test number for language', language, ':', total_test)
        if total_test >= 3:
            easy_mean_percentage = sum([test.get("easy_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            medium_mean_percentage = sum([test.get("medium_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            hard_mean_percentage = sum([test.get("hard_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            print("Easy:", easy_mean_percentage)
            print("Medium:", medium_mean_percentage)
            print("Hard:", hard_mean_percentage)

            if easy_mean_percentage < 60:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"]
            elif easy_mean_percentage >= 60 and medium_mean_percentage < 50:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"]
            elif easy_mean_percentage >= 60 and medium_mean_percentage >= 50 and hard_mean_percentage < 40:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"]
            else:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"]
        else:
            easy_mean_percentage = 0
            medium_mean_percentage = 0
            hard_mean_percentage = 0
            print("Easy:", easy_mean_percentage)
            print("Medium:", medium_mean_percentage)
            print("Hard:", hard_mean_percentage)
            # Filter questions as 4 easy, 4 medium, and 2 hard
            filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"][:4]
            filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"][:4]
            filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"][:2]

    else:
        total_test = 0
        print('test number:', total_test)
        easy_mean_percentage = 0
        medium_mean_percentage = 0
        hard_mean_percentage = 0
        print("Easy:", easy_mean_percentage)
        print("Medium:", medium_mean_percentage)
        print("Hard:", hard_mean_percentage)
        # Filter questions as 4 easy, 4 medium, and 2 hard
        filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"][:4]
        filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"][:4]
        filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"][:2]

    # Calculate the count of skipped questions
    skipped_count = len(questions) - len(non_correct_filtered_questions)
    random.shuffle(filtered_questions)
    selected_questions = filtered_questions[:10]
    return {
        "skipped_count": skipped_count,
        "questions": [
            {"Topic": q["Topic"], "Difficulty": q["Difficulty"], "Question": q["Question"], "Answer": q["Answer"]}
            for q in selected_questions
        ]
    }





@app.post("/pquestions", response_model=dict)
async def get_random_questions(user_data: User):
    email = user_data.email
    language = user_data.language.lower()

    # Check if the email exists in the correctquestion collection
    user = collection11.find_one({"email": email})  
    if user:
        correct_questions = user.get("correct_questions", {}).get(language, []) 
    else:
        correct_questions = []

    cursor = collection102.find()
    questions = await asyncio.to_thread(list, cursor)
    non_correct_filtered_questions = [q for q in questions if q["Question"] not in correct_questions]

    test_data = collection12.find_one({"email": email})
    if test_data:
        tests = test_data.get("tests", [])
        print('test number:',len(tests));
        language_tests = [test for test in tests if test.get("Language").lower() == language]
        total_test = len(language_tests)
        print('test number for language', language, ':', total_test)
        if total_test >= 3:
            easy_mean_percentage = sum([test.get("easy_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            medium_mean_percentage = sum([test.get("medium_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            hard_mean_percentage = sum([test.get("hard_percentage", 0) for test in test_data.get("tests", []) if test["Language"].lower() == language]) / total_test
            print("Easy:", easy_mean_percentage)
            print("Medium:", medium_mean_percentage)
            print("Hard:", hard_mean_percentage)

            if easy_mean_percentage < 60:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"]
            elif easy_mean_percentage >= 60 and medium_mean_percentage < 50:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"]
            elif easy_mean_percentage >= 60 and medium_mean_percentage >= 50 and hard_mean_percentage < 50:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"]
            else:
                filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"]
        else:
            print("Test are less the 3")
            easy_mean_percentage = 0
            medium_mean_percentage = 0
            hard_mean_percentage = 0
            print("Easy:", easy_mean_percentage)
            print("Medium:", medium_mean_percentage)
            print("Hard:", hard_mean_percentage)
            # Filter questions as 4 easy, 4 medium, and 2 hard
            filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"][:4]
            filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"][:4]
            filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"][:2]

    else:
        print("New user taking First Test")
        total_test = 0
        print('test number:', total_test)
        easy_mean_percentage = 0
        medium_mean_percentage = 0
        hard_mean_percentage = 0
        print("Easy:", easy_mean_percentage)
        print("Medium:", medium_mean_percentage)
        print("Hard:", hard_mean_percentage)
        # Filter questions as 4 easy, 4 medium, and 2 hard
        filtered_questions = [q for q in non_correct_filtered_questions if q["Difficulty"] == "Easy"][:4]
        filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Medium"][:4]
        filtered_questions += [q for q in non_correct_filtered_questions if q["Difficulty"] == "Hard"][:2]

    # Calculate the count of skipped questions
    skipped_count = len(questions) - len(non_correct_filtered_questions)
    random.shuffle(filtered_questions)
    selected_questions = filtered_questions[:10]
    return {
        "skipped_count": skipped_count,
        "questions": [
            {"Topic": q["Topic"], "Difficulty": q["Difficulty"], "Question": q["Question"], "Answer": q["Answer"]}
            for q in selected_questions
        ]
    }







@app.post("/questions")
async def get_tests_data(detail: Qdetail):
    email = detail.email
    lang = detail.language.lower()

    if lang == 'java':
        collection = collection101
    elif lang == 'python':
        collection = collection102
    else:
        return {'message': 'Invalid language selection'}

    user = collection11.find_one({"email": email})

    if not user:
        return {"message": "User not found"}

    correct_questions = user.get("correct_questions", {}).get(lang, [])
    correct_total_questions = len(correct_questions)

    total_questions = collection.count_documents({})

    result = {
        "correct_total_questions": correct_total_questions,
        "total_questions": total_questions,
    }

    return result







@app.post('/upload')
async def upload_csv(file: UploadFile = File(...), language: str =''):
    print('Received Language:', language)
    if not os.path.exists("temp"):
        os.makedirs("temp")

    # Save the file to a temporary location
    file_path = f"temp/{file.filename}"
    with open(file_path, 'wb') as f:
        f.write(await file.read())

    if language.lower() == 'java':
        collection5 = collection1
    elif language.lower() == 'python':
        collection5 = collection2
    else:
        return {'message': 'Invalid language selection'}

    inserted_count = 0
    skipped_count = 0
    with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = [row for row in reader]

    for row in rows:
        topic = row.get('Topic', '').lstrip('\ufeff') 
        difficulty = row.get('Difficulty', '')
        question = row.get('Question', '')
        answer = row.get('Answer', '')

        if not question:
            skipped_count += 1
            continue  
        
        existing_question = await collection5.find_one({'Question': question})

        if existing_question is not None:
            skipped_count += 1
            continue 
        try:
            await collection5.insert_one({
                'Topic': topic,
                'Difficulty': difficulty,
                'Question': question,
                'Answer': answer
            })
            inserted_count += 1
        except Exception as e:
            return {'message': f'Error inserting question: {str(e)}'}

    return {'message': f'File uploaded and data inserted successfully. Inserted: {inserted_count}, Skipped: {skipped_count}'}





@app.post('/userupload')
async def upload_csv(file: UploadFile = File(...)):
    if not os.path.exists("temp"):
        os.makedirs("temp")

    # Save the file to a temporary location
    file_path = f"temp/{file.filename}"
    with open(file_path, 'wb') as f:
        f.write(await file.read())

    inserted_count = 0
    skipped_count = 0
    with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = [row for row in reader]

    for row in rows:
        fname = row.get('fname', '').lstrip('\ufeff') 
        email = row.get('email', '')
        password = row.get('password', '')
        cpassword = row.get('cpassword', '')

        if not email:
            skipped_count += 1
            continue
        
        existing_email = collection13.find_one({'email': email})

        if existing_email is not None:
            skipped_count += 1
            continue

        try:
            hashed_password = bcrypt.hash(password)
            hashed_cpassword = bcrypt.hash(password)

            # Set default role as 'client' if 'role' column is not provided in the CSV
            role = row.get('role', 'client')

            collection13.insert_one({
                'fname': fname,
                'email': email,
                'password': hashed_password,
                'cpassword':hashed_cpassword,
                'role': role
            })
            inserted_count += 1
        except Exception as e:
            return {'message': f'Error inserting user: {str(e)}'}

    return {'message': f'File uploaded and data inserted successfully. Inserted: {inserted_count}, Skipped: {skipped_count}'}





def update_login_history(email: str, password_changed: bool):
    timestamp = datetime.now()

    if password_changed:
        collection13.update_one(
            {"email": email},
            {"$inc": {"passwordChangeCount": 1}}
        )
    else:
         collection13.update_one(
        {"email": email},
        {"$push": {"loginHistory": timestamp}, "$inc": {"loginCount": 1}}
    )
@app.get("/login-history")
async def get_login_history(email: str):
    user = collection13.find_one({"email": email})
    if user and "loginHistory" in user:
        login_count = len(user["loginHistory"])
        password_change_count = user.get("passwordChangeCount", 0)
        return {"email": email, "loginCount": login_count, "passwordChangeCount": password_change_count}
    else:
        return {"email": email, "loginCount": 0, "passwordChangeCount": 0}





@app.put("/change-password")
async def change_password(request: Cpassword):
    
    user = collection13.find_one({"email": request.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not bcrypt.verify(request.current_password.encode('utf-8'),user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect Current Password")
    hashed_password=bcrypt.hash(request.new_password)

    update_result = collection13.update_one(
        {"email":request.email},
        {"$set": {"password": hashed_password, "cpassword": hashed_password}},
    )

    if not update_result.modified_count:
        print("Failed to update password.")
        raise HTTPException(status_code=500, detail="Failed to update password")
    
    update_login_history(request.email, password_changed=True)

    print("Password changed successfully.")
    return {"message": "Password changed successfully"}






model_name = 'paraphrase-MiniLM-L6-v2'
sentence_transformer = SentenceTransformer(model_name)
similarity_threshold = 70  # Set your desired similarity threshold
@app.post("/similarity")
def calculate_similarity(request: SimilarityRequest):
    if not request.sentences1 or not request.sentences2:
        raise HTTPException(status_code=400, detail="Sentence lists are required.")

    if len(request.sentences1) != len(request.sentences2):
        raise HTTPException(status_code=400, detail="Sentence lists must have the same length.")

    result = []
    for i in range(len(request.sentences1)):
        embedding1 = sentence_transformer.encode(request.sentences1[i])
        embedding2 = sentence_transformer.encode(request.sentences2[i])
        similarity = util.cos_sim(embedding1, embedding2)
        similarity_percentage = float(similarity * 100)

        if similarity_percentage >= similarity_threshold:
            status = "Correct"
        else:
            status = "Wrong"

        result.append({"index": i, "similarity_percentage": similarity_percentage, "status": status})

    return {"similarity_results": result}








# Connect to MongoDB
client6 = MongoClient("mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/test")
db6 = client6["test"]  # Replace "test_db" with your actual database name
collection7 = db6["result"]  # Replace "test_collection" with your actual collection name

@app.post("/store_data")
async def store_data(data: StoreData):
    fname = data.fname
    email = data.email
    language = data.language
    correct_answers = data.correct_answers
    easy_percentage = data.easy_percentage
    medium_percentage = data.medium_percentage
    hard_percentage = data.hard_percentage
    topics_data = data.topicsData
    current_datetime = datetime.now()

    # Check if the student already exists in the collection
    existing_student = collection7.find_one({"fname": fname, "email": email})
    
    if existing_student:
        # Get the existing tests for the student
        tests = existing_student.get("tests", [])
        
        # Get the last test number for the student
        last_test_number = tests[-1].get("test_number", 0) if tests else 0
        
        # Increment the test number
        test_number = last_test_number + 1
        
        # Create the test data for the new test result
        test_data = {
            "test_number": test_number,
            "Language": language,
            "correct_answers": correct_answers,
            "easy_percentage": easy_percentage,
            "medium_percentage": medium_percentage,
            "hard_percentage": hard_percentage,
            "topics_data": topics_data,
            "test_datetime": current_datetime
        }
        
        # Append the new test data to the existing tests array
        tests.append(test_data)
        
        # Update the student's data with the updated tests array
        collection7.update_one(
            {"fname": fname, "email": email},
            {"$set": {"tests": tests}}
        )
    else:
        # If the student does not exist, create a new entry for the student with the first test result
        data = {
            "fname": fname,
            "email": email,
            "tests": [
                {
                    "test_number": 1,
                    "Language": language,
                    "correct_answers": correct_answers,
                    "easy_percentage": easy_percentage,
                    "medium_percentage": medium_percentage,
                    "hard_percentage": hard_percentage,
                    "topics_data": topics_data,
                    "test_datetime": current_datetime
                }
            ]
        }

        # Insert the data into the collection
        collection7.insert_one(data)
    
    # Return a response
    return {"message": "Data stored successfully"}







@app.get("/checkEmail")
def check_email(email: str):
        result = collection7.find_one({"email": email})
        exists = bool(result)
        return {"exists": exists}






@app.get("/tests")
async def get_tests_by_email(email: str = Query(..., description="Email address")):
    user = collection7.find_one({"email": email})

    if not user:
        return {"message": "User not found"}

    tests = user.get("tests", [])
    return {"tests": tests}





# MongoDB connection setup
client8 = MongoClient("mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/test")
db8 = client8["test"]
collection4 = db8["correctquestion"]


@app.post("/store-correct-questions")
async def store_correct_questions(correct_question: CorrectQuestion):
    email1 = correct_question.email
    questions = correct_question.questions
    language = correct_question.language.lower()

    # Check if the user exists in MongoDB
    user_data = collection4.find_one({"email": email1})

    if user_data:
        # User already exists, update the correct questions for the user
        existing_questions = user_data.get("correct_questions", {}).copy()

        # Update the correct_questions field for the user based on language
        existing_questions[language] = existing_questions.get(language, []) + questions

        # Update the correct_questions field for the user
        collection4.update_one(
            {"email": email1},
            {"$set": {"correct_questions": existing_questions}}
        )
    else:
        # User doesn't exist, create a new entry for the user with the correct questions
        new_user_data = {"email": email1, "correct_questions": {language: questions}}
        collection4.insert_one(new_user_data)

    # Example: Print the received correct questions
    print(f"Correct questions for user '{email1}' in language '{language}':")
    print(questions)

    return {"message": "Correct questions stored successfully"}







# def calculate_cosine_similarity(list1: List[str], list2: List[str]) -> List[float]:
#     vectorizer = TfidfVectorizer()
#     vectors = vectorizer.fit_transform(list1 + list2)
#     similarity_matrix = cosine_similarity(vectors)
#     similarities = []
    
#     for i in range(10):
#         similarity = similarity_matrix[i, i+10]
#         similarities.append(similarity)
    
#     return similarities

# @app.post("/compare-lists")
# def compare_lists(list_data:ListData):
#     l_dict = list_data.dict()
#     list1 = l_dict["list1"]
#     list2 = l_dict["list2"]
    
#     if len(list1) != 10 or len(list2) != 10:
#         raise HTTPException(status_code=400, detail="Both lists should contain 10 strings.")
    
#     similarities = calculate_cosine_similarity(list1, list2)
#     similarity_percentages = [round(similarity * 100) for similarity in similarities]
    
#     return {"similarity_percentages": similarity_percentages}






# b

# @app.post("/similarity")
# def calculate_similarity(request: SimilarityRequest):
#     sentence1 = request.sentence1
#     sentence2 = request.sentence2

#     # Tokenize the sentences
#     tokens = tokenizer([sentence1, sentence2], padding='max_length', truncation=True, return_tensors='tf')
#     input_ids = tokens['input_ids']
#     attention_mask = tokens['attention_mask']

#     print("Input IDs:", input_ids)

#     # Calculate similarity
#     embeddings = model(input_ids, attention_mask)[0][:, 0, :]
#     similarity = tf.reduce_sum(embeddings[0] * embeddings[1])

#     print("Similarity value:", similarity)

#     # Scale down the similarity value
#     similarity_scaled = similarity / tf.norm(embeddings[0]) / tf.norm(embeddings[1])

#     # Normalize similarity to percentage
#     similarity_percentage = (similarity_scaled + 1) / 2 * 100

#     print("Similarity percentage:", similarity_percentage)

#     return {"similarity_percentage": similarity_percentage.numpy().item()}






# Load the BERT model and tokenizer
# model_name = 'bert-base-uncased'
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModel.from_pretrained(model_name)

# @app.post("/similarity")
# def calculate_similarity(request: SimilarityRequest):
#     sentence1 = request.sentence1
#     sentence2 = request.sentence2

#     # Tokenize the sentences
#     tokens = tokenizer([sentence1, sentence2], padding='max_length', truncation=True, return_tensors='pt')
#     input_ids = tokens['input_ids']
#     attention_mask = tokens['attention_mask']

#     print("Input IDs:", input_ids)
#     print("Attention Mask:", attention_mask)

#     # Calculate embeddings
#     with torch.no_grad():
#         embeddings = model(input_ids, attention_mask=attention_mask)[0][:, 0, :].cpu()
#         print("Shape of embeddings:", embeddings.shape)
#         print("Embeddings:", embeddings)

#     # Calculate cosine similarity
#     similarity = torch.cosine_similarity(embeddings[0], embeddings[1]).item()
#     print("Similarity value:", similarity)

#     # Normalize similarity to percentage
#     similarity_percentage = (similarity + 1) / 2 * 100
#     print("Similarity percentage:", similarity_percentage)

#     return {"similarity_percentage": similarity_percentage}




# Load the sentence transformer model
# model = SentenceTransformer('bert-base-nli-mean-tokens')

# # Load the sentence transformer model
# @app.post("/similarity")
# def calculate_similarity(request: SimilarityRequest):
#     sentences1 = request.sentences1
#     sentences2 = request.sentences2

#     # Calculate similarity percentages for each pair
#     similarity_percentages = []
#     for i in range(10):
#         # Encode the sentences at index i from both lists
#         sentence1 = sentences1[i]
#         sentence2 = sentences2[i]
#         embedding1 = model.encode([sentence1], convert_to_tensor=True)
#         embedding2 = model.encode([sentence2], convert_to_tensor=True)

#         # Calculate cosine similarity between the embeddings
#         similarity = torch.cosine_similarity(embedding1, embedding2).item()

#         # Convert similarity to a percentage
#         percentage = (similarity + 1) / 2 * 100
#         similarity_percentages.append(percentage)

#     return {"similarity_percentages": similarity_percentages}




# nlp = spacy.load('en_core_web_md')
# @app.post('/similarity')
# def compare_lists(list1: List[str], list2: List[str]):
#     if len(list1) != 10 or len(list2) != 10:
#         return {"error": "Both lists must have a size of 10."}
    
#     similarities = []
#     for str1, str2 in zip(list1, list2):
#         similarity = calculate_similarity_percentage(str1, str2)
#         similarities.append(similarity)
    
#     return {"similarities": similarities}

# def calculate_similarity_percentage(str1: str, str2: str) -> float:
#     doc1 = nlp(str1)
#     doc2 = nlp(str2)
#     similarity_score = cosine_similarity(doc1.vector.reshape(1, -1), doc2.vector.reshape(1, -1))
#     similarity_percentage = similarity_score[0][0] * 100
#     return similarity_percentage





# # Load the pre-trained model
# model = SentenceTransformer('bert-base-nli-mean-tokens')


# # MongoDB connection
# client5 = MongoClient('mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/QandA')
# db3 = client5['QandA']
# collection4 = db3['java']


# # Retrieve the dataset from MongoDB
# dataset = collection4.find({}, {'Answer': 1})
# answers = [data['Answer'] for data in dataset]

# # Train the model on the answers
# corpus_embeddings = model.encode(answers).tolist()  # Convert to list

# # Endpoint to calculate similarity
# @app.post("/similarity")
# def calculate_similarity(user_answer: str):
#     # Encode the user's answer
#     user_embedding = model.encode([user_answer])

#     # Calculate the cosine similarity between user's answer and answers
#     similarities = cosine_similarity(user_embedding, corpus_embeddings)[0]

#     # Find the index of the most similar answer
#     most_similar_index = similarities.argmax()

#     # Retrieve the most similar answer and its similarity score
#     most_similar_answer = answers[most_similar_index]
#     similarity_score = similarities[most_similar_index]

#     # Set a threshold for similarity to determine correct or wrong answer
#     similarity_threshold = 0.6

#     # Check if the user's answer is correct or wrong
#     if similarity_score >= similarity_threshold:
#         result = "Correct"
#     else:
#         result = "Wrong"

#     return {
#         "user_answer": user_answer,
#         "most_similar_answer": most_similar_answer,
#         "similarity_score": similarity_score,
#         "result": result
#     }

# model_name = 'paraphrase-MiniLM-L6-v2'
# sentence_transformer = SentenceTransformer(model_name)
# @app.post("/similarity")
# def calculate_similarity(request: SimilarityRequest):
#     if not request.sentences1 or not request.sentences2:
#         raise HTTPException(status_code=400, detail="Sentence lists are required.")

#     if len(request.sentences1) != len(request.sentences2):
#         raise HTTPException(status_code=400, detail="Sentence lists must have the same length.")
    
#     result = []
#     for i in range(len(request.sentences1)):
#         embedding1 = sentence_transformer.encode(request.sentences1[i])
#         embedding2 = sentence_transformer.encode(request.sentences2[i])
#         similarity = util.cos_sim(embedding1, embedding2)
#         percentage = float(similarity * 100)
#         result.append({"index": i, "similarity_percentage": percentage})
#     return {"similarity_results": result}




