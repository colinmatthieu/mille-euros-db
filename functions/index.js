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

// Require dependencies
const functions = require('firebase-functions');
const path = require('path')
const express = require('express');
var engines = require('consolidate');
const hbs = require('handlebars');
const admin = require('firebase-admin');
const firestore_req = require('firebase-admin/firestore')

// Express set up
const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// Firebase connection
var serviceAccount = require("./credentials.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jdme-f3de7-default-rtdb.europe-west1.firebasedatabase.app"
});

// Get item from Firestore database
async function getFirestore(){
    const db = await admin.firestore();

    const writeResult =
    db.collection('questions').doc('sample_question').get().then(doc => 
        {
            if (!doc.exists) {console.log('No such document!');}
            else {return doc.data();}})
        .catch(err => {console.log('Error getting document', err);});
    
    return writeResult
}

async function getLastTenItems(){
    const db = await admin.firestore();

    const lastTenItems = await db.collection('questions').orderBy('date-added', 'desc').limit(10).get()

    return lastTenItems;
}

async function insertFormData(request){
    const writeResult = await
        admin.firestore().collection('questions').add({
            question: request.body.question,
            answer: request.body.answer,
            date: request.body.date,
            difficulty: request.body.difficulty,
            status: request.body.status,
            hints: request.body.hints,
            createdAt: firestore_req.FieldValue.serverTimestamp()
        })
        .then(function() {console.log("Document successfully written!"+request.body.date);})
        .catch(function(error) {console.error("Error writing document: ", error);});
}

// Basic routing
app.get('/', async (request, response) => {
    var db_result = await getFirestore();
    response.render('index', {db_result});
});

app.get('/submit/', function (request, response) {
    response.render('submit');
})

app.post('/insert-data', async (request, response) => {
    var insert = await insertFormData(request);
    response.sendStatus(200);
});

app.get('/questions', async (request, response) => {
    response.render('questions');
})

// Run the app
exports.app = functions.https.onRequest(app);
