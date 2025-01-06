import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/Persons?authSource=${process.env.MONGO_AUTH_DB}`;

mongoose.connect(url, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
).then(() => {
    console.log('connected to MongoDB');
}).catch((error) => {    
    console.log('error connecting to MongoDB:', error.message);
});