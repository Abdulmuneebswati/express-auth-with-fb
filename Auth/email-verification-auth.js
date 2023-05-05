
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const { API_KEY } = process.env;

const exchangeCustomTokenEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`;
const sendEmailVerificationEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;

module.exports = verifyEmail = async(user)=>{
    if (!user.emailVerified) {
      try {
        const customToken = await admin.auth().createCustomToken(user.uid);
        const { idToken } = await fetch(exchangeCustomTokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        }).then((res) => res.json());
  
        const response = await fetch(sendEmailVerificationEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'VERIFY_EMAIL',
            idToken: idToken,
          }),
        }).then((res) => res.json());
        return `Verification email has been sent to ${response.email}`
      } catch (error) {
        console.log(error);
      }
    }
  };