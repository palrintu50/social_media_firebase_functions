const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');
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
    admin
    .firestore()
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
    admin
        .firestore
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
// TODO: Validate Data
  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
  .then(data =>{
      return res.status(201).json({message: 'user ${data.user.uid} signed up successfully'})
  })
  .catch(err =>{
      console.error(err);
      return res.status(500).json({ error: err.code});

  });
});


exports.api = functions.region('asia-southeast1').https.onRequest(app);