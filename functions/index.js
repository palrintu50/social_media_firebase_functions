const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');
firebase.initializeApp();
const db = admin.firestore();



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


app.post('/screams', (req , res) =>{
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


// Signup Route 
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    db.doc('/users/${newUser.handle}').get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: 'this handle is already taken'})
        } else {
            firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })

    .then(data =>{
        return data.user.getIdToken()
    })
    .then(token=>{
        return res.status(201).json({ token });
    })
    .catch(err =>{
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({ email: 'Email is already in use'})
        } else {
        return res.status(500).json({error: err.code });
    }
    })
});


exports.api = functions.region('asia-southeast1').https.onRequest(app);