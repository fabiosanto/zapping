import React from 'react';
import logo from './logo.svg';
import './App.css';
import fire from './firebase'
import YouTube from 'react-youtube';
import loading from './loading.gif';
import tiviLogo from './tivi_large.png';

import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile
} from "react-device-detect";
import moment from 'moment';

class App extends React.Component{

  constructor(){
    super()
    this.state = {
      channelId: null,
      videoId: null,
      isLoading: true,
      joinCode: null,
      channels: null,
      userId: null,
      remoteJoin: false,
      readyToZap: false,
      joinCodeValue: "",
      schedule: null,
      live: {}
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(){
    fire.analytics();

    fire.auth().signInAnonymously()
      .then((x)=> {

        this.setState({
          userId: x.user.uid
        })

        if(isMobile) {
          this.loadRemote(x.user.uid)
        } else {
          this.loadChannel(x.user.uid)
        }

      })
  }

  async loadChannels(){
    const channels = await fire.firestore()
    .collection('channels')
    .get()

    //console.log(channels.docs)
     const data = channels.docs;
        this.setState({
          channels: data
        })
  }

  loadRemote(remoteId){
    const doc = fire.firestore()
          .collection('remotes')
          .doc(remoteId)

          doc.onSnapshot(docSnapshot => {
            const data = docSnapshot.data();

            if(data == null){
              // no remote found
              // show join with code
              this.setState({
                remoteJoin : true
              })
            } else {
                //remote found 

                const tvId = data.tvId
                this.setState({
                  userId : tvId
                })

                this.loadChannels();
            }

          }); 
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

        // create new user TV

        fire.firestore()
        .collection('tv')
        .doc(userId)
        .set({
          channelId: null
        })

      } else if (!data.remoteId && !data.channelId){
        // no active channel found
        // show how to and join code

        const code = Math.floor(Math.random() * 100) + 10
        const code2 = Math.floor(Math.random() * 100) + 10

        const joinCode = code + "" + code2;

        this.setState({
          channelId: null,
          isLoading: false,
          videoId: null,
          joinCode: joinCode
        })

        fire.firestore()
        .collection('joins')
        .doc()
        .set({
          code: joinCode,
          userId: userId
        })

      } else if(data.channelId){
        // active channel found
        // play channel

        const channelId = data.channelId

        this.setState({
          channelId: channelId,
          isLoading: true,
          joinCode: null
        })
  
        this.loadVideo(channelId)

      } else {
        //remote is available but no channel is active
        this.setState({
          readyToZap: true,
          channelId: null,
          joinCode: null,
          videoId: null,
          isLoading: false
        })
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

    const collection = channel.data().collection
    const channelName = channel.data().name

    if(!collection) return

    const scheduleData = await this.loadSchedule(channelId);

    this.setState({
      videoId: scheduleData.schedule[scheduleData.live.liveItemIndex].data().id,
      schedule: scheduleData.schedule,
      live: scheduleData.live,
      channelName: channelName,
    })
  }

  async loadSchedule(channelId){
    const dateTime = moment();

    const scheduleSnap = await fire.firestore()
    .collection('channels')
    .doc(channelId)
    .collection('schedule')
    .doc(dateTime.year().toString())
    .collection('months')
    .doc((dateTime.month() + 1).toString())
    .collection('days')
    .doc(dateTime.date().toString())
    .collection('items')
    .get()

    const dateTimeQueryString = dateTime.format();

    var whatsLive = fire.functions().httpsCallable('whatsLive');
    const result = await whatsLive({channelId: channelId, datetime: dateTimeQueryString })

   return {
      schedule: scheduleSnap.docs,
      live: result.data 
    };
  }

  setActiveChannel(id){
    const tvId = this.state.userId

    fire.firestore()
    .collection('tv')
    .doc(tvId)
    .update({
      channelId: id
    })
  }

  // join form
  handleChange(event) {
    this.setState({joinCodeValue: event.target.value});
  }

  handleSubmit(event) {
    const joinCode = this.state.joinCodeValue;

    fire.firestore()
      .collection('joins')
      .where("code", "==", joinCode)
      .get()
      .then(snap => {
          if(!snap.isEmpty) {
            console.log(snap)
            const tvId = snap.docs[0].data().userId;
            const remoteId = this.state.userId;

              fire.firestore()
              .collection('remotes')
              .doc(remoteId)
              .set({
                tvId: tvId
              })

              fire.firestore()
              .collection('tv')
              .doc(tvId)
              .set({
                remoteId: remoteId,
                channelId: null
              })

              this.setState({
                remoteJoin: false
              })
              
          } else {
            alert('there`s no tv with given code waiting for you');
          }
      })

    event.preventDefault();
  }

  render() {
    const isLoading = this.state.isLoading
    const joinCode = this.state.joinCode
    const userId = this.state.userId
    const videoId = this.state.videoId
    const channels = this.state.channels
    const remoteJoin = this.state.remoteJoin
    const readyToZap = this.state.readyToZap
    const schedule = this.state.schedule
    const live = this.state.live
    const channelName = this.state.channelName

    const opts = {
      height: window.innerHeight,
      width:  window.innerWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        color: 'white',
        disablekb: 1,
        controls: 0,
        start: live.liveTimePassed
      }
    };

    return (
      <div className="parent">
        <div className="brandline"/>
        <BrowserView>
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
                    schedule ? 
                    <div className="whatson">
                      <div className="channelName">
                        <img src={tiviLogo} height="30"/>
                        <h1 className="nineties"> Tivy {channelName}</h1>
                      </div>
                    
                      <h2>LIVE NOW - {schedule[live.liveItemIndex].data().title}</h2>
                      <p>COMING NEXT - {schedule[live.liveItemIndex + 1].data().title}</p>

                       {/* {schedule.map((item, i) => 
                          <div> 
                            { i == live.liveItemIndex ? 
                                <h2>LIVE - { item.data().title }</h2> : 
                                item.data().title
                           }
                          </div>
                        )} */}
                    </div> : null
                  }
                {
                  isLoading ? <div className="loading">
                    <img className="loading-image" src={loading}/>
                  </div> : null
                }
                {
                  joinCode ? 
                  <div className="join">
                    <h1 className="nineties">Hey Welcome!</h1>
                    <p>To tune in visit this website from your mobile phone and join with the code</p>
                    <h1 className="nineties">{joinCode}</h1>
                  </div> : null
                }
                {
                  readyToZap ? 
                  <div className="join">
                    <h1 className="nineties">You made it!</h1>
                    <p>Select a channel from your mobile and start zapping the web!</p>
                  </div> : null
                }
        </BrowserView>
        <MobileView>
            <div className="remote">
              { channels ? 
                  <div className="channels">
                      {channels.map(item => 
                        <div className="channel"><a href="#" onClick={()=> this.setActiveChannel(item.id)}>{item.data().name}</a></div>
                      )}
                  </div> : null
              }
              {
                  remoteJoin ? 
                  <div className="join">
                    <h1 className="nineties">Hey Welcome!</h1>
                    <p>Do you have your TV code yet?</p>
                    <form onSubmit={this.handleSubmit}>
                      <p>
                        <input className="codeInput" type="text" value={this.state.joinCodeValue} onChange={this.handleChange} />
                        <input className="submitButton" type="submit" value="Join" />
                      </p>
                    </form>
                  </div> : null
                }
            </div>
        </MobileView>

        <br/><br/><br/><br/>       
        <div>To change channel visit tivy.app from your mobile device or download the app.</div>
        <p>All copyrights are reserved to each respective owners.</p>
  </div>
    );
  }
}

export default App;
