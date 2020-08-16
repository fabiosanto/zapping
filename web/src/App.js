import React from 'react';
import logo from './logo.svg';
import './App.css';
import fire from './firebase'
import YouTube from 'react-youtube';
import loading from './loading.gif';

class App extends React.Component{

  constructor(){
    super()
    this.state = {
      channelId: null,
      videoId: null,
      isLoading: true,
      joinCode: null,
      channels: null,
      userId: null
    };
  }

  componentDidMount(){
    fire.analytics();

    fire.auth().signInAnonymously()
      .then((x)=> {

        this.setState({
          userId: x.user.uid
        })

        this.loadChannel('vvEpa3p2by8lUqNwpzmH')
      })
  }

  loadChannel(userId) {
    const doc = fire.firestore()
          .collection('tv')
          .doc(userId)

    doc.onSnapshot(docSnapshot => {
      const data = docSnapshot.data();

      if(data == null)
      {
        // no user found
        // register new one

        this.setState({
          channelId: null,
          isLoading: true
        })

        fire.firestore()
          .collection('tv')
          .doc(userId)
          .set({
            channelId: null
          })

      } else if (!data.channelId){
        // no active channel found
        // show how to and join code

        const code = Math.floor(Math.random() * 100) + 10
        const code2 = Math.floor(Math.random() * 100) + 10

        this.setState({
          channelId: null,
          isLoading: false,
          joinCode: code + "" + code2
        })

      } else {
        // active channel found
        // play channel
        const channelId = data.channelId

        this.setState({
          channelId: channelId,
          isLoading: true,
          joinCode: null
        })
  
        this.loadVideo(channelId)

      }
    }, err => {
      console.log(`Encountered error: ${err}`);
    });
  }

  async loadVideo(channelId){
    const channel = await fire.firestore()
    .collection('channels')
    .doc(channelId)
    .get()

    console.log(`channelId ${channelId}`);
    const collection = channel.data().collection
    if(!collection) return

    const videos = await fire.firestore()
    .collection(collection)
    .get() 

    
    const videoId = videos.docs[Math.floor(Math.random() * videos.docs.length)].data().ytube
    console.log(videoId)

    this.setState({
      videoId: videoId
    })
  }

  render() {

    const videoId = this.state.videoId
    const isLoading = this.state.isLoading
    const joinCode = this.state.joinCode
    const userId = this.state.userId

    const opts = {
      height: '900',
      width: '100%',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        color: 'white',
        controls: 0,
        disablekb: 1
      }
    };

    return (
      <div className="App">
        {videoId? 
        <YouTube
          onPlay={event => {
            this.setState({
              isLoading: false
            })
          }}
          videoId={videoId}
          opts={opts}   
        /> : null}
        {
          isLoading ? <div className="loading">
            <img src={loading}/>
          </div> : null
        }
        {
          joinCode ? 
          <div className="join">
            <p>Hey Welcome!</p>
            <p>To tune in visit this website from your mobile phone and join with the code</p>
            <p><h1>{joinCode}</h1></p>
            <p><h1>{userId}</h1></p>
          </div> : null
        }

      </div>
    );
  }
}

export default App;
