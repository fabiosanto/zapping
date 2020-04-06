import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ChannelsList extends StatelessWidget {
  static var now = new DateTime.now();
  var scheduleId = '${now.year}${now.month}${now.day}';
  var liveSlot = 0;
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
//    var hour = now.hour;
    var hour = 10;

    if (hour % 2 == 0) {
      liveSlot = hour;
      liveMinute = now.minute * 60.0;
    } else {
      liveSlot = hour - 1;
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
          .where('slot',
              isGreaterThanOrEqualTo: liveSlot,
              isLessThanOrEqualTo: liveSlot + 6)
          .snapshots(),
      builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
        if (snapshot.hasError) return new Text('Error: ${snapshot.error}');

        switch (snapshot.connectionState) {
          case ConnectionState.waiting:
            return ListTile(title: new Text('Loading...'));
          default:
            return ListTile(
              title: Text(document['name']),
              subtitle: SizedBox(
                height: 140,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children:
                      snapshot.data.documents.map((DocumentSnapshot document) {
                    return buildTitleTile(document);
                  }).toList(),
                ),
              ),
            );
        }
      },
    );
  }

  SizedBox buildTitleTile(DocumentSnapshot document) {
    return SizedBox(
        width: 260,
        child: DecoratedBox(
            child: Column(
              children: <Widget>[
                Padding(
                  padding: EdgeInsets.all(8),
                  child: Image.network(
                    document['logo'],
                    height: 70,
                    width: 150,
                  ),
                ),
                buildSlider(document['slot'])
              ],
            ),
            decoration: BoxDecoration(color: Colors.grey[800])));
  }

  Widget buildSlider(int slot) {
    if (slot != liveSlot)
      return SizedBox(
          height: 8,
          child: DecoratedBox(
              child: Text(''),
              decoration: BoxDecoration(color: Colors.grey[800])));

    return Slider(
      min: 0,
      max: 7200,
      value: liveMinute,
      onChanged: null,
    );
  }
}
