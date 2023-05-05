const admin = require('firebase-admin');

 const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await admin.auth().getUserByEmail(decodedToken.email);
    if (user.emailVerified){
      req.userId = decodedToken.uid;
      next();   
    }else{
      res.status(401).json({
        message: 'Email not verified'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: 'Authentication failed. Invalid token.'
    });
  }
};
module.exports = authenticate;