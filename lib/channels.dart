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
              isLessThanOrEqualTo: liveSlot + 4)
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
            MaterialButton(child: Text('aaa'),)
          ],
        ),
      ),
    );
  }

  Widget buildScheduleTimeline(List<DocumentSnapshot> documents) {
    return Container(
      height: 130,
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
          buildSlider(document['slot'])
        ],
      ),
    );
  }

  Widget buildTitleCard(DocumentSnapshot document) {
    return Container(
      height: 110,
      child: Card(
        clipBehavior: Clip.antiAlias,
        elevation: 0.0,
        child: Image.network(
          document['image'],
          width: 200,
          fit: BoxFit.fitWidth,
        ),
      ),
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
