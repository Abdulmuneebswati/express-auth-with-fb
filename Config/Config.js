const admin = require("firebase-admin");
const serviceAccount = require("../fir-auth-with-express-firebase-adminsdk-4tihg-8ce3483445.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://fir-auth-with-express.appspot.com"
});

module.exports = admin;
