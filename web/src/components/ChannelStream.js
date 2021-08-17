import React, { useState, useEffect } from 'react';
import moment from 'moment';
import fire from '../firebase'
import ReactPlayer from 'react-player'

function ChannelsStream(props) {

        const [state, setState] = useState({channelId: null});

        const [schedule, setSchedule] = useState(null);
        const [live, setLive] = useState(null);


        useEffect(() => {
                const { userId } = props
                if(!userId) return 
                if(state.channelId == null) {
                        fire.firestore().collection('tv')
                        .doc(userId).onSnapshot(snap => {
                                setSchedule(null)
                                setLive(null)
                                if(snap.exists){
                                        loadChannel(snap.data())
                                }else {
                                        //no tv found for user, create one, first channel selected
                                        fire.firestore().collection('channels').get().then(snap => {
                                        fire.firestore().collection('tv').doc(x.user.uid).set({channelId: snap.docs[0].id})
                                        loadChannel(snap.docs[0])
                                        })
                                }
                        })
                }
        })

        function loadChannel(tvData){

                fire.firestore()
                .collection('channels')
                .doc(tvData['channelId'])
                .get().then(snap => {
                        setState({
                                channelId : tvData['channelId'],
                                remoteId : tvData['remoteId'],
                                channelName: snap.data()['name']
                        })
                })
        } 

        useEffect(() => {
                if(!state.channelId) return 
                if(schedule == null) {
                        const dateTime = moment();
                                
                        fire.firestore()
                        .collection('channels')
                        .doc(state.channelId)
                        .collection('schedule')
                        .doc(dateTime.year().toString())
                        .collection('months')
                        .doc((dateTime.month() + 1).toString())
                        .collection('days')
                        .doc(dateTime.date().toString())
                        .collection('items')
                        .get().then(snap => {
                                setSchedule(snap.docs)
                        })
                }
        })

        useEffect(()=> {
                if(!state.channelId) return 
                if(live == null) {

                        const dateTime = moment();

                        const dateTimeQueryString = dateTime.format();
                        const whatsLive = fire.functions().httpsCallable('whatsLive');
                        whatsLive({channelId: state.channelId, datetime: dateTimeQueryString })
                        .then(result => {
                                setLive(result.data)
                        })
                }
        })

        console.log('render')

        let videoUrl = null

        if(live && schedule){
                videoUrl = "https://www.youtube.com/watch?v=" + schedule[live.liveItemIndex].data().id
        }

    return (
        <div>
                {state.channelName}
                <div>{videoUrl ? <ReactPlayer 
                                        config={{youtube: {
                                                        autoplay: 1,
                                                        color: 'white',
                                                        disablekb: 1,
                                                        controls: 0,
                                                        start: live.liveTimePassed
                                                }}}
                                        playing={true} url={videoUrl} /> : null}</div>
        </div>
        )
}

export default ChannelsStream
