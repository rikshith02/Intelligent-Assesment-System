# from model import auth


import motor.motor_asyncio



client = motor.motor_asyncio.AsyncIOMotorClient('mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/test')
db=client.test
collection = db.user
collection8 =db.result



client1 = motor.motor_asyncio.AsyncIOMotorClient('mongodb+srv://shiva1566:8688921162@cluster0.r7lg0ih.mongodb.net/QandA')
db1=client1.QandA
collection1 =db1.java
collection2=db1.python
    