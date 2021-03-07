const { parentPort } = require('worker_threads');
const admin = require("firebase-admin");

//firebase credentials
let firebaseConfig = {
    apiKey: "XXXXXXXXXXXX-XXX-XXX",
    authDomain: "XXXXXXXXXXXX-XXX-XXX",
    databaseURL: "XXXXXXXXXXXX-XXX-XXX",
    projectId: "XXXXXXXXXXXX-XXX-XXX",
    storageBucket: "XXXXXXXXXXXX-XXX-XXX",
    messagingSenderId: "XXXXXXXXXXXX-XXX-XXX",
    appId: "XXXXXXXXXXXX-XXX-XXX"
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);
let db = admin.firestore();
// get current data in DD-MM-YYYY format
let date = new Date();
let currDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
// recieve crawled data from main thread
parentPort.once("message", (message) => {
    console.log("Recieved data from mainWorker...");
    // store data gotten from main thread in database
    db.collection("Rates").doc(currDate).set({
        rates: JSON.stringify(message)
    }).then(() => {
        // send data back to main thread if operation was successful
        parentPort.postMessage("Data saved successfully");
    })
    .catch((err) => console.log(err))    
});