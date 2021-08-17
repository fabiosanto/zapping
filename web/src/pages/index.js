import React, { useState, useEffect } from 'react';
import Header from "../components/Header"
import Footer from "../components/Footer"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import ChannelsList from "../components/ChannelsList"
import fire from '../firebase'
import ChannelsStream from '../components/ChannelStream';

function IndexPage(props) {
  const data = props.data

  const [userId, setUserId] = useState();

  fire.analytics();

  useEffect(()=> {
    if(userId == null){
        fire.auth().signInAnonymously()
        .then((x)=> {
            setUserId(x.user.uid)
        })
    }
  })

  return <div className="h-screen bg-black font-sans" >
      <Helmet>
          <meta charSet="utf-8" />
          <title>Tivy App</title>
          <link rel="canonical" href="https://tivy.app" />
      </Helmet>
    {/* {Header()} */}

        <div className="grid grid-cols-4 h-full text-white">
            <div className="col-span-1  overflow-scroll">
                {ChannelsList({userId: userId})}
            </div>
            <div className="col-span-3">
                {ChannelsStream({userId: userId})}
            </div>

        </div>

    {/* {Footer()} */}
  </div>
}

export default IndexPage
