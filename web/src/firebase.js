 import firebase from 'firebase'
 
 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyAQRRrBHALKKffmKt9PJkOoBWpNC5LfuPo",
    authDomain: "zapping-netflix.firebaseapp.com",
    databaseURL: "https://zapping-netflix.firebaseio.com",
    projectId: "zapping-netflix",
    storageBucket: "zapping-netflix.appspot.com",
    messagingSenderId: "562493051310",
    appId: "1:562493051310:web:220add1ba7137f434ff83f",
    measurementId: "G-WN271NPWZ4"
  };
  // Initialize Firebase
  const fire = firebase.initializeApp(firebaseConfig);
  
  export default fire;