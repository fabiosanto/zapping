import 'package:android_intent/android_intent.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ChannelsList extends StatelessWidget {
  static var now = new DateTime.now();
  var scheduleId = '${now.year}${now.month}${now.day}';
  var liveSlot = 0.0;
  var liveMinute = 0.0;

  @override
  Widget build(BuildContext context) {
    initTimeValue();

    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text('Zapping'),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: Firestore.instance.collection('channels').snapshots(),
        builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
          if (snapshot.hasError) return new Text('Error: ${snapshot.error}');

          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return new Text('Loading...');
            default:
              return ListView(
                children:
                    snapshot.data.documents.map((DocumentSnapshot document) {
                  return buildChannelTile(document);
                }).toList(),
              );
          }
        },
      ),
    );
  }

  void initTimeValue() {
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
            return ListTile(title: new Text('Loading...'));
          default:
            return buildListItemContainer(document, snapshot.data.documents);
        }
      },
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
            buildScheduleTimeline(documents),
            documents.isNotEmpty
                ? buildMaterialButton(documents.first['nId'])
                : Container()
          ],
        ),
      ),
    );
  }

  Widget buildMaterialButton(String nId) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: <Widget>[
          MaterialButton(
            child: Text('Play'),
            color: Colors.red[900],
            shape: StadiumBorder(),
            elevation: 0,
            onPressed: () {
              launchTitle(nId, liveMinute.toInt());
            },
          )
        ],
      ),
    );
  }

  void launchTitle(String title, int time) {
    try {
      final AndroidIntent intent = AndroidIntent(
          action: 'action_view',
          data: Uri.encodeFull(
              'http://www.netflix.com/watch/$title?t=liveMinute'),
          package: 'com.netflix.mediaclient');
      intent.launch();
    } catch (exc) {
      print(exc);
    }
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
    }
  }

  Widget buildScheduleTimeline(List<DocumentSnapshot> documents) {
    return Container(
      height: 150,
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
      width: 200,
      child: Column(
        children: <Widget>[
          buildTitleCard(document),
          buildSlider(document['slot']),
          buildTime(document['slot'])
        ],
      ),
    );
  }

  Container buildTime(int slot) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 4.0, horizontal: 4.0),
      alignment: Alignment.centerLeft,
      child: Text(
        '${slot * 2}.00',
        style: TextStyle(fontSize: 10.0),
      ),
    );
  }

  //feature flag here!
  static const showNflixImages = true;

  Widget buildTitleCard(DocumentSnapshot document) {
    return Container(
        height: 110,
        child: Card(
          clipBehavior: Clip.antiAlias,
          elevation: 0.0,
          child: MaterialButton(
            padding: EdgeInsets.all(0.0),
            onPressed: () {
              launchTitleDetail(document['nId']);
            },
            child: showNflixImages? buildTitleImage(document) : buildTitleImage2(document),
          ),
        ));
  }

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

  Image buildTitleImage(DocumentSnapshot document) {
    return Image.network(
      document['image'],
      width: 200,
      fit: BoxFit.fitWidth,
    );
  }

  Widget buildSlider(int slot) {
    var value = 0.0;
    // liveMinute : 7200 = x : 1
    // x = liveMinute

    if (slot == liveSlot) value = liveMinute / 7200;

    return Padding(
        padding: EdgeInsets.fromLTRB(4, 6, 4, 0),
        child: SizedBox(
          height: 3,
          child: LinearProgressIndicator(
            backgroundColor: Colors.grey[700],
            value: value,
          ),
        ));
  }
}
