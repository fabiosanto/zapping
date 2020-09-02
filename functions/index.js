const functions = require('firebase-functions');
const {google} = require('googleapis');
const moment = require('moment');

// initialize the Youtube API library
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyAcmTpa5cVpYPpYhr5bL-88ZH5n3suUSc8'
});

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
// const https = require('https');

// const tmdbApiKey = '933b65fca5ee88d5b921aa00f8d3e767';

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
  
  await addYTVideo('sports', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addDoc = functions.https.onRequest(async (req, res) => {
  
  await addYTVideo('documentaries', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addNature = functions.https.onRequest(async (req, res) => {
  
  await addYTVideo('nature', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addComedies= functions.https.onRequest(async (req, res) => {
  
  await addYTVideo('comedies', req.query.id)

  res.json({ ok: 'finished' });

})

exports.addShorts = functions.https.onRequest(async (req, res) => {
  
  await addYTVideo('shorts', req.query.id)

  res.json({ ok: 'finished' });

})

exports.whatsLive = functions.https.onCall(async (data, context) => {
  
  const channelId = data.channelId;

  //example 2020-08-31T12:53:36+00:00 --> use %2B for +
  const momentDateTime = moment(data.datetime).utcOffset(data.datetime);

  // console.log('datetime is '+ data.datetime);

  var month = momentDateTime.month() + 1;
  var day = momentDateTime.date();
  var year = momentDateTime.year();

  var hours = momentDateTime.hours();
  var minutes = momentDateTime.minute();
  var seconds = momentDateTime.second();

  const path = 'channels/'+ channelId + '/schedule' + year + '/months' + month + '/days' + day + '/items';
  console.log('trying query for -> ' + path );

  const db = admin.firestore();

  const snap = await db.collection('channels')
                        .doc(channelId)
                        .collection('schedule')
                        .doc(year.toString())
                        .collection('months')
                        .doc(month.toString())
                        .collection('days')
                        .doc(day.toString())
                        .collection('items')
                        .get()
  if(snap.empty){
    throw new functions.https.HttpsError('invalid-argument', 'no videos here -> ' + path);
  }

  const liveSeconds = (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60) + parseInt(seconds); 

  var durationTotal = 0;
  let liveItemIndex = -1;
  let liveTimePassed = 0;

  var index = -1;
  do {
    index++;
    durationTotal += getSecondsDuration(snap.docs[index].data().duration);
  } while(durationTotal < liveSeconds)

  liveItemIndex = index;
  liveTimePassed = durationTotal - liveSeconds;

  const videoTimeLive = getSecondsDuration(snap.docs[liveItemIndex].data().duration) - liveTimePassed;

  return { liveItemIndex: liveItemIndex, liveTimePassed: videoTimeLive}
})

exports.generate = functions.https.onRequest(async (req, res) => {
  
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  const channelsSnap = await db.collection('channels').get()

  const channelPath = 'channels/' + '7XfzrS9nrMtfN6IwI39w';

  const db = admin.firestore();

  const snap = await db.collection('documentaries').get()
  
  if(snap.empty){
      res.json({ error: 'no videos here' });
      return;
  }

  const batch = db.batch();
  const channelRef = db.doc(channelPath);

  const yearRef = channelRef.collection('schedule').doc(year.toString());
  batch.set(yearRef, {}, {merge: true});

  const monthRef = yearRef.collection('months').doc(month.toString());
  batch.set(monthRef, {}, {merge: true})

  const dayRef = monthRef.collection('days').doc(day.toString());
  batch.set(dayRef, {}, {merge: true})

  const dayScheduleRef = dayRef.collection('items');

  const daySchedule = getSchedule(snap);
  daySchedule.forEach(item => {
    batch.create(dayScheduleRef.doc(), item); 
    console.log('Adding to item -> '+ channelPath);
  })    

  await batch.commit();

  res.json({ result: 'ok', docCreated: daySchedule.length });
})

function getSchedule(snap){
  const dayTotalSecs = 24 * 60 * 60
  var durationTotal = 0;
  var schedule = [];
  while (durationTotal <= dayTotalSecs) {
    const item = getRandomItem(snap.docs).data();
    schedule.push({
      id: item.ytube,
      title: item.title,
      duration: item.duration,
      thumb: item.thumb
    })

    durationTotal += getSecondsDuration(item.duration);
  }

  return schedule;
}

function getRandomItem(array){
  return array[Math.floor(Math.random() * array.length)];
}

function getSecondsDuration(isoDuration){
  // example PT1H26M40S -> 1|26|40
  const formattedTime = isoDuration.replace("PT","").replace("H","|").replace("M","|").replace("S","");
  const timeSplit = formattedTime.split('|');

  const hoursIndex = timeSplit.length === 3 ? 0 : -1
  const minsIndex = timeSplit.length === 3 ? 1 : 0
  const secsIndex = timeSplit.length === 3 ? 2 : 1

  const hours = parseInt(timeSplit[hoursIndex]);
  const mins = parseInt(timeSplit[minsIndex]);
  const secs = parseInt(timeSplit[secsIndex]);

  if(hoursIndex === -1) {
    return (mins * 60) + secs;
  } else {
    return (hours * 60 * 60) + (mins * 60) + secs;
  }
}

async function addYTVideo(collection, video){
  let videoId = '';

    if(video.startsWith('https')) {
      videoId = video.split('v=')[1]
    } else {
      videoId = video
    }

    const res = await youtube.videos.list({
        part: 'snippet,contentDetails',
        id: videoId});

    await addToDbYT(collection, res.data.items[0])
}

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


async function addToDbYT(collection, data){

  const db = admin.firestore();

  const snap = await db.collection(collection).where('ytube', '==', data.id).get()
    if(snap.empty) {
      db.collection(collection)
          .add({
            ytube: data.id,
            duration: data.contentDetails.duration,
            title: data.snippet.title,
            desc: data.snippet.description,
            thumb: data.snippet.thumbnails.standard.url,
            lang: data.snippet.defaultAudioLanguage || ''
          })
      console.log('Adding to '+ collection+ ' -> ' + snap.id);
  }
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