const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');
const db = admin.firestore();
firebase.initializeApp();



const firebaseConfig = {
    apiKey: "AIzaSyBkRtwxQPxecqRQz3PsqPjBwAW5gwleJU8",
    authDomain: "socialape-73c3a.firebaseapp.com",
    projectId: "socialape-73c3a",
    storageBucket: "socialape-73c3a.appspot.com",
    messagingSenderId: "284486409459",
    appId: "1:284486409459:web:e25e647bd01de6da8eeb86",
    measurementId: "G-LLTYGFFZ4H"
  };

admin.initializeApp();

app.get('/screams',(req , res) =>{
    db
    .collection('Screams')
    .orderBy('createdAt ', 'desc')
    .get()
    .then(data =>{
        let Screams = [];
        data.forEach(doc => {
            Screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
            });

        });
        return res.json(Screams);
    })
    .catch(err => console.error(err))

})

const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else {
        console.error('No Token Found')
        return res.status(403).json({error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken)
    .then(decodedToken =>{
        req.user = decodedToken;
        console.log(decodedToken);
        return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get(); 
    })
    .then(data => {
        req.user.handle = data.docs[0].data().handle;
    })
}
    



app.post('/screams', FBAuth , (req , res) =>{
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }
    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: 'document {doc.id}created successfully'})
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        })
} );


const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   if (email.match(regEx)) return true;
   else return false;

}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false
}

// Signup Route 
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

if (isEmpty(newUser.email)){
    error.email = 'Email must not be Empty'
} else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
}

if(isEmpty(newUser.password))


    let token,userId;

    db.doc('/users/${newUser.handle}').get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: 'this handle is already taken'})
        } else {
            firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })

    .then((data) =>{
        userId = data.user.uid;
        return data.user.getIdToken()
    })
    .then((idToken) =>{
        token = idToken
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId
        }
       return db.doc('/users/${newUser.handle}').set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({ token});
    })
    .catch(err =>{
        console.error(err);
        if(err.code === 'auth.createdAt-already-in-use'){
            return res.status(400).json({ email: 'Email is already in use'})
        } if (err.code === 'auth/wrong-password') {
            return res.status(403).json({ general: 'Wrong credentials , please Try Again'})
            
        } 
        else {
        return res.status(500).json({error: err.code });
    }
    })
});


exports.api = functions.region('asia-southeast1').https.onRequest(app);