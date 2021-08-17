import fire from '../firebase'
import React, { useState, useEffect } from 'react';

function ChannelsList(props) {

    const [channelsList, setChannelsList] = useState(null);

    useEffect(() => {
        if(channelsList == null){
            fire.firestore().collection('channels').onSnapshot(snap => {
                setChannelsList(snap.docs)
            })
        }
    })

    function changeChannel(id){
        console.log(id)
        fire.firestore().collection('tv').doc(props.userId).update({
            channelId: id
        })
    }

    return (
        <div>
            {channelsList ? channelsList.map(doc => 
                
                <a href="#" onClick={() => changeChannel(doc.id)}>
                    <div className=" p-10 m-10 bg-gray-900">
                    <div>{doc.data()['name']}</div>
                    </div>
                </a>
                
                ) : "loading..."}
        </div>
        )
}

export default ChannelsList
