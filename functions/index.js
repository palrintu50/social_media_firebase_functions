const functions = require("firebase-functions");
const admin = require('firebase-admin');


admin.initializeApp();


exports.getScream = functions.https.onRequest((req , res) =>{
    admin.firestore().collection('Screams').get()
    .then(data =>{
        let Screams = [];
        data.forEach(doc => {
            Screams.push(doc.data());

        });
        return res.json(Screams);
    })
    .catch(err => console.error(err))

} );

exports.createScream = functions.https.onRequest((req , res) =>{
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    admin.firestore
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: 'document ${doc.id} created successfully'})
        })

} );
