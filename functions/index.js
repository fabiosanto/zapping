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
// [START addMessageTrig ger]
// exports.addMessage = functions.https.onRequest(async (req, res) => {

//   const year = new Date().getFullYear();
//   const month = new Date().getMonth() + 1;
//   const day = new Date().getDate();

//   const scheduleID = ''.concat(year, month, day);

//   // channel ysWgSNVGVZy41Qhi2Q5V Drama
//   var channelId = 'ysWgSNVGVZy41Qhi2Q5V';
//   generateSchedule(channelId, scheduleID, "drama");
  
//   //channel 7XfzrS9nrMtfN6IwI39w comedies
//   channelId = '7XfzrS9nrMtfN6IwI39w';
//    generateSchedule(channelId, scheduleID, "Comedies");

//   //jxcj9sx09Nc1JQBjR2Hg
//   channelId = 'jxcj9sx09Nc1JQBjR2Hg';
//    generateSchedule(channelId, scheduleID, "Action");

//   //WbtAJAc4VtxBPS6txhYV Thrillers
//   channelId = 'WbtAJAc4VtxBPS6txhYV';
//    generateSchedule(channelId, scheduleID, "Thriller");

//   res.json({ ok: 'finished' });

// });

// exports.schedule = functions.https.onRequest(async (req, res) => {

//   // const db = admin.firestore();
//   // db.collection('channels')
//   //   .get()
//   //   .then(snap => {
//   //     if (snap.empty) {
//   //       console.log('No channels');
//   //       return;
//   //     }

//   //     snap.forEach(channel => {
//   //       scheduleChannel(channel.id, channel.data().collection)
//   //     })
//   //   })

//   scheduleChannel('test123','documentaries')

//   res.json({ ok: 'finished' });
// });

// function scheduleChannel(channelId, collection){
//   const db = admin.firestore();
//   db.collection(collection)
//     .get()
//     .then(snap => {
//       if (snap.empty) {
//         console.log('No videos for channel '+ channelId);
//         return;
//       }

//       var durationTotal = 0;
//       var schedule = [];

//       while(durationTotal < (24 * 60)){
//         const randomVideo = snap[Math.floor(Math.random() * snap.length)].data();
//         durationTotal+= randomVideo.duration;
//         schedule.push(randomVideo);
//         console.log('duration is '+durationTotal);
//       }

//       console.log('schedule size is '+schedule.size);
//       console.log('schedule duration is '+durationTotal);
//       return;

//     }).catch(err => {
//       console.log(err)
//     })
// }

exports.addSport = functions.https.onRequest(async (req, res) => {
  
  addToDb('sports', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addDoc = functions.https.onRequest(async (req, res) => {
  
  addToDb('documentaries', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addNature = functions.https.onRequest(async (req, res) => {
  
  addToDb('nature', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addComedies= functions.https.onRequest(async (req, res) => {
  
  addToDb('comedies', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addShorts = functions.https.onRequest(async (req, res) => {
  
  addToDb('shorts', req.query.id)

  res.json({ ok: 'finished' });

})

function addToDb(collection, url){

  const db = admin.firestore();

  let id = url.split('v=')[1]

  db.collection(collection).where('ytube', '==', id)
  .get().then(snap => {
    if(snap.empty){
        db.collection(collection)
        .add({
          ytube: id
        })
        console.log('Adding to '+ collection+ ' -> ' + id);
    }
    return;
  }).catch(err => {
    console.log(err)
  })

}

// exports.addTitle = functions.https.onRequest(async (req, res) => {
  
//   const db = admin.firestore();

//   let titleObj = {
//     genre: [req.query.genre],
//     nId: req.query.nId,
//     views: 0,
//     name: req.query.name,
//     country: [req.query.country]
//   };

//   db.collection('movies').where('nId', '==', titleObj.nId).get().then(snapshot => {
//     if (snapshot.empty) {
//       console.log('No matching documents.');
//       a(titleObj);
//       return;
//     }

//     console.log('already added, skipping');
//     return;
//   }).catch(err => {
//     console.log('Error getting documents', err);  
//     res.json({ ok: 'error, check log' });
//   });


//   res.json({ ok: 'check log' });

// });

// async function isExistingTitle(id) {
//   const db = admin.firestore();

//   return db.collection('movies').where('nId', '==', id).get().then(snapshot => {
//     if (snapshot.empty) {
//       console.log('No matching documents.');
//       return false;
//     }

//     console.log('already added, skipping');
//     return true;
//   }).catch(err => {
//     console.log('Error getting documents', err);      
//     return true;
//   });
// }

// exports.startScrape = functions.https.onRequest(async (req, res) => {

//   const apiUrl = 'https://simplescraper.io/api/2YfugZqeu3K20A2MaoRs?apikey=KUrttY9MTmGxVWO5gK1d96wyLC0UZSYA&offset=0&limit=100';

//   fetchScrapeAPI(apiUrl, 'Action', 'US')

//   res.json({ ok: 'check log' });

// });

// function fetchScrapeAPI(apiUrl, genreId, countryId) {
//   https.get(apiUrl, (resp) => {
//     let data = '';
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });
//     resp.on('end', () => {
//       const jsonResponse = JSON.parse(data);

//       jsonResponse.data.forEach(item => {

//         let doesExist = isExistingTitle(item.movie_link);

//         if(!doesExist){
//           let titleObj = {
//             genre: [genreId],
//             nId: item.movie_link,
//             views: 0,
//             name: item.movie,
//             country: [countryId]
//           };
  
//           a(titleObj);
//         }
//       });
//     });
//   });
// }

// exports.updatePosters = functions.https.onRequest(async (req, res) => {
  
//   const db = admin.firestore();

//   db.collection('movies').get().then(snapshot => {
//     snapshot.forEach(doc => {
//       console.log('fetching...'+ doc.get('name'));

//       https.get('https://api.themoviedb.org/3/search/movie?api_key='+tmdbApiKey+'&query='+doc.get('name'), (resp) => {
//         // The whole response has been received. Print out the result.

//         let data = '';

//           // A chunk of data has been recieved.
//           resp.on('data', (chunk) => {
//             data += chunk;
//           });

//           resp.on('end', () => {
//             const jsonResponse = JSON.parse(data);
//             // console.log(jsonResponse.results[0].poster_path);
//             // console.log(jsonResponse.results[0].original_title);

//             db.collection('movies').doc(doc.id).update({
//               image: 'https://image.tmdb.org/t/p/w780'+jsonResponse.results[0].poster_path
//             })

//           });
//       });

//     });

    
//     return;
//   }).catch(err => {
//     console.log('Error getting documents', err);  
//     res.json({ ok: 'error, check log' });
//   });

// });

// function a(titleObj) {

//   https.get('https://api.themoviedb.org/3/search/movie?api_key=' + tmdbApiKey + '&query=' + titleObj.name, (resp) => {
//     // The whole response has been received. Print out the result.
//     let data = '';
//     // A chunk of data has been recieved.
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });
//     resp.on('end', () => {
//       const db = admin.firestore();

//       const jsonResponse = JSON.parse(data);
//       titleObj.image = 'https://image.tmdb.org/t/p/w780' + jsonResponse.results[0].poster_path;
//       db.collection('movies').add(titleObj);
//       console.log('added', titleObj);
//     });
//   });
// }

// function generateSchedule(channelId, scheduleID, genre) {

//   const db = admin.firestore();

//   const totalSlot = 12;
//   const startSlot = 0;
//   console.log('starting...'+ genre);

//   let movies = db.collection('movies')
//     movies.where("genre", 'array-contains', genre)
//     .orderBy('views')
//     .limit(totalSlot)
//     .get()
//     .then(snapshot => {
//       if (snapshot.empty) {
//         console.log('No matching documents.');
//         return;
//       }
//       let index = 0;
//       snapshot.forEach(doc => {
//         //update view count
//         db.collection('movies').doc(doc.id).update({
//           views: doc.get('views') + 1
//         });
// //        console.log(doc.id, ' => ', doc.data());

//         const obj = {
//           image: doc.get('image'),
//           nId: doc.get('nId'),
//           name: doc.get('name'),
//           slot: index + startSlot
//         };
//         // console.log('creating...', obj);
//         db.collection('channels/' + channelId + '/schedule/' + scheduleID + '/slots').add(obj);
//         index++;
//         console.log('...created '+scheduleID+' / '+obj.name);
//       });
//       console.log('finished...');

//       return;
//     })
//     .catch(err => {
//       console.log('Error getting documents', err);
//     });
// }