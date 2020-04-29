import 'package:android_intent/android_intent.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ChannelsList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text('Zapping'),
      ),
      body: ChannelsPage(),
    );
  }
}

class ChannelsPage extends StatelessWidget {
  static var now = new DateTime.now();
  var scheduleId = '${now.year}${now.month}${now.day}';
  var liveSlot = 0.0;
  var liveMinute = 0.0;
  var channelHeight = 550.0;

  var context;

  @override
  Widget build(BuildContext context) {
    this.context = context;
    initTimeValue();

    return StreamBuilder<QuerySnapshot>(
      stream: Firestore.instance
          .collection('channels')
          .where('country', isEqualTo: 'AU')
          .orderBy('position', descending: true)
          .snapshots(),
      builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
        if (snapshot.hasError) return new Text('Error: ${snapshot.error}');

        switch (snapshot.connectionState) {
          case ConnectionState.waiting:
            return buildLoadingContainer();
          default:
            return ListView(
              children:
                  snapshot.data.documents.map((DocumentSnapshot document) {
                var type = document['type'];

                if (type == "title")
                  return buildAppTitle(document);
                else if (type == "intro")
                  return buildIntroCard(document);
                else //is a channel
                  return buildChannelTile(document);
              }).toList(),
            );
        }
      },
    );
  }

// The App recommends great movies to play like if you were zapping through them

  Widget buildIntroCard(DocumentSnapshot document) {
    return StreamBuilder<QuerySnapshot>(
      stream: Firestore.instance
          .collection('channels')
          .document(document.documentID)
          .collection('pages')
          .orderBy('index')
          .snapshots(),
      builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
        if (snapshot.hasError) return new Text('Error: ${snapshot.error}');

        switch (snapshot.connectionState) {
          case ConnectionState.waiting:
            return Container(
              height: 160,
              child: Text('loading pages'),
            );
          default:
            return Container(
              height: 160,
              child: ListView(
                padding: EdgeInsets.fromLTRB(10, 10, 10, 10),
                scrollDirection: Axis.horizontal,
                children:
                    snapshot.data.documents.map((DocumentSnapshot document) {
                  return Container(
                    width: 300,
                    child: Card(
                      child: Container(
                          padding: EdgeInsets.all(16.0),
                          alignment: Alignment.center,
                          child: Text(
                            document['text'],
                            style: TextStyle(fontSize: 16),
                          )),
                    ),
                  );
                }).toList(),
              ),
            );
        }
      },
    );
  }

  Container buildAppTitle(DocumentSnapshot document) {
    return Container(
      padding: EdgeInsets.all(16.0),
      child: Text(
        document['text'],
        style: TextStyle(fontSize: 22),
      ),
    );
  }

  void initTimeValue() {
    //showing 12 movies for each day.
    // more than that number will require more movies in db...

    var hour = now.hour;
//    var hour = 2;

    if (hour % 2 == 0) {
      liveSlot = hour / 2;
      liveMinute = now.minute * 60.0;
    } else {
      liveSlot = (hour - 1) / 2;
      liveMinute = 90 * 60.0;
    }
  }

  Widget buildChannelTile(DocumentSnapshot document) {
    return StreamBuilder<QuerySnapshot>(
      stream: Firestore.instance
          .collection('channels')
          .document(document.documentID)
          .collection('schedule')
          .document(scheduleId)
          .collection('slots')
          .orderBy('slot')
          .where('slot',
              isGreaterThanOrEqualTo: liveSlot,
              isLessThanOrEqualTo: liveSlot + 1)
          .snapshots(),
      builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
        if (snapshot.hasError) return new Text('Error: ${snapshot.error}');

        switch (snapshot.connectionState) {
          case ConnectionState.waiting:
            return buildLoadingContainer();
          default:
            return buildListItemContainer(document, snapshot.data.documents);
        }
      },
    );
  }

  Container buildLoadingContainer() {
    return Container(
      height: channelHeight,
      color: Colors.grey[800],
      child: ListTile(title: new Text('Loading...')),
    );
  }

  Container buildListItemContainer(
      DocumentSnapshot document, List<DocumentSnapshot> documents) {
    return Container(
      margin: EdgeInsets.fromLTRB(0.0, 0.0, 0.0, 8.0),
      child: DecoratedBox(
        decoration: BoxDecoration(color: Colors.grey[800]),
        child: Column(
          children: <Widget>[
            buildChannelTitle(document),
            buildScheduleTimeline(documents)
          ],
        ),
      ),
    );
  }

  Widget buildMaterialButton(String nId) {
    return Container(
      child: Row(
        children: <Widget>[
          RaisedButton.icon(
            color: Colors.redAccent[700],
            onPressed: () {
              launchTitle(nId, liveMinute.toInt());
            },
            icon: Icon(Icons.flash_on),
            label: Text('Zap'),
            shape: StadiumBorder(),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(16, 0, 0, 0),
            child: RaisedButton.icon(
              elevation: 0.0,
              color: Colors.grey[700],
              onPressed: () {
                launchTitle(nId, 0);
              },
              icon: Icon(Icons.play_arrow),
              label: Text('Play'),
              shape: StadiumBorder(),
            ),
          ),
        ],
      ),
    );
  }

  void launchTitle(String title, int time) {
    try {
      final AndroidIntent intent = AndroidIntent(
          action: 'action_view',
          data:
              Uri.encodeFull('http://www.netflix.com/watch/${title}?t=${time}'),
          package: 'com.netflix.mediaclient');
      intent.launch();
    } catch (exc) {
      print(exc);
      showAppNotInstalledSnackBar();
    }
  }

  void showAppNotInstalledSnackBar() {
    final snackBar = SnackBar(content: Text('You need the Netflix app and an active subscription to play this movie.'));
    Scaffold.of(context).showSnackBar(snackBar);
  }

  void launchTitleDetail(String title) {
    try {
      final AndroidIntent intent = AndroidIntent(
          action: 'action_view',
          data: Uri.encodeFull('http://www.netflix.com/title/$title'),
          package: 'com.netflix.mediaclient');
      intent.launch();
    } catch (exc) {
      print(exc);
      showAppNotInstalledSnackBar();
    }
  }

  Widget buildScheduleTimeline(List<DocumentSnapshot> documents) {
    return Container(
      height: channelHeight,
      child: ListView(
        padding: EdgeInsets.fromLTRB(10, 0, 10, 0),
        scrollDirection: Axis.horizontal,
        children: documents.map((DocumentSnapshot document) {
          return buildTitleTile(document);
        }).toList(),
      ),
    );
  }

  Widget buildChannelTitle(DocumentSnapshot document) {
    return Container(
      alignment: AlignmentGeometry.lerp(
          Alignment.centerLeft, Alignment.centerLeft, 0.0),
      padding: EdgeInsets.all(16),
      child: Text(document['name'],
          style: TextStyle(
              fontFamily: 'RobotoCondensed',
              color: Colors.grey[100],
              fontStyle: FontStyle.normal,
              fontSize: 20)),
    );
  }

  Widget buildTitleTile(DocumentSnapshot document) {
    return Container(
      padding: EdgeInsets.all(8.0),
      width: 300,
      child: Column(
        children: <Widget>[
          buildTitleCard(document),
          buildTime(document['slot']),
          buildSlider(document['slot']),
          buildMaterialButton(document['nId'])
        ],
      ),
    );
  }

  //unused
  Container buildTime(int slot) {
    var labelStart = '${slot * 2}.00';

    labelStart = 'Live Now';

    return Container(
      padding: EdgeInsets.fromLTRB(8, 12, 8, 0),
      alignment: Alignment.centerLeft,
      child: Text(
        labelStart,
        style: TextStyle(fontSize: 14.0, color: Colors.white70),
      ),
    );
  }

  static const showTmdbImages = true;

  Widget buildTitleCard(DocumentSnapshot document) {
    return Container(
        child: Card(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(10))),
      clipBehavior: Clip.antiAlias,
      elevation: 10.0,
      child: MaterialButton(
        padding: EdgeInsets.all(0.0),
        onPressed: () {
          launchTitleDetail(document['nId']);
        },
        child: showTmdbImages
            ? buildTitleImage(document)
            : buildTitleImage2(document),
      ),
    ));
  }

  //title card no image
  Widget buildTitleImage2(DocumentSnapshot document) {
    return Stack(
      alignment: Alignment.center,
      children: <Widget>[
        Container(
          color: Colors.grey[600],
        ),
        Text(
          document['name'],
          style: TextStyle(fontSize: 18.0),
        )
      ],
    );
  }

  //title card with image
  Image buildTitleImage(DocumentSnapshot document) {
    return Image.network(
      document['image'],
      height: 420,
      fit: BoxFit.fitHeight,
    );
  }

  Widget buildSlider(int slot) {
    var value = 0.0;
    // liveMinute : 7200 = x : 1
    // x = liveMinute

    if (true) value = liveMinute / 7200;

    return Container(
      padding: EdgeInsets.all(6.0),
      child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: LinearProgressIndicator(
            backgroundColor: Colors.grey[700],
            valueColor: AlwaysStoppedAnimation(Colors.redAccent[700]),
            value: value,
          )),
    );
  }
}
