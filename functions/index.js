const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
// [END import]

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original
// [START addMessageTrigger]
exports.addMessage = functions.https.onRequest(async (req, res) => {
  
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  const scheduleID = ''.concat(year, month, day);

  // channel ysWgSNVGVZy41Qhi2Q5V Drama
  const channelId = 'ysWgSNVGVZy41Qhi2Q5V';
  generateSchedule(channelId, scheduleID, null);


  res.json({ ok: 'finished' });
});

function generateSchedule(channelId, scheduleID, genreId) {

  const db = admin.firestore();

  const totalSlot = 12;
  const startSlot = 0;

  let movies = db.collection('movies')
    .orderBy('views')
    .limit(totalSlot);

  // channel query
  let query = null;
  if(genreId !== null) {
    query = movies.where('genreId', '==', genreId)
  } else {
    query = movies
  }

  query.get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }
      let index = 0;
      snapshot.forEach(doc => {
        //update view count
        db.collection('movies').doc(doc.id).update({
          views: doc.get('views') + 1
        });
        console.log(doc.id, ' => ', doc.data());
        const obj = {
          image: doc.get('image'),
          nId: doc.get('nId'),
          name: doc.get('name'),
          slot: index + startSlot
        };
        // console.log('creating...', obj);
        db.collection('channels/' + channelId + '/schedule/' + scheduleID + '/slots').add(obj);
        index++;
        console.log('new doc created');
      });

      console.log('finished');
      return;
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

