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
const https = require('https');

const tmdbApiKey = '933b65fca5ee88d5b921aa00f8d3e767';

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
  var channelId = 'ysWgSNVGVZy41Qhi2Q5V';
  generateSchedule(channelId, scheduleID, "drama");
  
  //channel 7XfzrS9nrMtfN6IwI39w comedies
  channelId = '7XfzrS9nrMtfN6IwI39w';
   generateSchedule(channelId, scheduleID, "Comedies");

  //jxcj9sx09Nc1JQBjR2Hg
  channelId = 'jxcj9sx09Nc1JQBjR2Hg';
   generateSchedule(channelId, scheduleID, "Action");

  //WbtAJAc4VtxBPS6txhYV Thrillers
  channelId = 'WbtAJAc4VtxBPS6txhYV';
   generateSchedule(channelId, scheduleID, "Thriller");

  res.json({ ok: 'finished' });

});

exports.addTitle = functions.https.onRequest(async (req, res) => {
  
  const db = admin.firestore();

  let titleObj = {
    genre: [req.query.genre],
    nId: req.query.nId,
    views: 0,
    name: req.query.name,
    country: [req.query.country]
  };

  db.collection('movies').where('nId', '==', titleObj.nId).get().then(snapshot => {
    if (snapshot.empty) {
      console.log('No matching documents.');
      fetchImageAndAdd(titleObj, db);
      return;
    }

    console.log('already added, skipping');
    return;
  }).catch(err => {
    console.log('Error getting documents', err);  
    res.json({ ok: 'error, check log' });
  });


  res.json({ ok: 'check log' });

});

exports.updatePosters = functions.https.onRequest(async (req, res) => {
  
  const db = admin.firestore();

  db.collection('movies').get().then(snapshot => {
    snapshot.forEach(doc => {
      console.log('fetching...'+ doc.get('name'));

      https.get('https://api.themoviedb.org/3/search/movie?api_key='+tmdbApiKey+'&query='+doc.get('name'), (resp) => {
        // The whole response has been received. Print out the result.

        let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            const jsonResponse = JSON.parse(data);
            // console.log(jsonResponse.results[0].poster_path);
            // console.log(jsonResponse.results[0].original_title);

            db.collection('movies').doc(doc.id).update({
              image: 'https://image.tmdb.org/t/p/w400'+jsonResponse.results[0].poster_path
            })

          });
      });

    });

    
    return;
  }).catch(err => {
    console.log('Error getting documents', err);  
    res.json({ ok: 'error, check log' });
  });

});

function fetchImageAndAdd(titleObj, db) {
  https.get('https://api.themoviedb.org/3/search/movie?api_key=' + tmdbApiKey + '&query=' + titleObj.name, (resp) => {
    // The whole response has been received. Print out the result.
    let data = '';
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      const jsonResponse = JSON.parse(data);
      titleObj.image = 'https://image.tmdb.org/t/p/w400' + jsonResponse.results[0].poster_path;
      db.collection('movies').add(titleObj);
      console.log('added', titleObj);
    });
  });
}

function generateSchedule(channelId, scheduleID, genre) {

  const db = admin.firestore();

  const totalSlot = 12;
  const startSlot = 0;

  let movies = db.collection('movies')
    movies.where("genre", 'array-contains', genre)
    .orderBy('views')
    .limit(totalSlot)
    .get()
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

