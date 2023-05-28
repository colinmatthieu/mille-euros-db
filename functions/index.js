/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const express = require('express');
var engines = require('consolidate');
const hbs = require('handlebars');
const admin = require('firebase-admin');

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

var serviceAccount = require("./credentials.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jdme-f3de7-default-rtdb.europe-west1.firebasedatabase.app"
});

async function getFirestore(){
    const firestore_con = await admin.firestore();

    const writeResult =
    firestore_con.collection('questions').doc('sample_question').get().then(doc => 
        {
            if (!doc.exists) {console.log('No such document!');}
            else {return doc.data();}})
        .catch(err => {console.log('Error getting document', err);});
    
    return writeResult
}

app.get('/', async (request, response) => {
    var db_result = await getFirestore();
    response.render('index', {db_result});
});
exports.app = functions.https.onRequest(app);
