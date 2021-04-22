/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
//                                                                         //
//               .______        ___    ||     ___       __                 //
//               |   _  \      /   \    ||   /   \     |  |                //
//               |  |_)  |    /  ^  \       /  ^  \    |  |                //
//               |   _  <    /  /_\  \     /  /_\  \   |  |                //
//               |  |_)  |  /  _____  \   /  _____  \  |  `----.           //
//               |______/  /__/     \__\ /__/     \__\ |_______|           //
//                                                                         //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
//
//
//
//                   .....                                ......
//               .';col:;:;,.                         .',;;;:oo:,,.
//              .''..;lc:,',;;,.                    .,:;,',:ll,..',.
//             ...  ..'ldc;,,,,;,                 .,;,,,,;ldc...  ...
//            .......',,ld:'....::.              .::....'cdc',,.......
//           .....,lc:c::lc,'...'c:.            .::'...',ll::::cl,.....
//           ..':lc,.  .;cllc::;:::,           .,:c:;::cllc,.  .'co:'..
//          ..'co:.      'lkxdc;,,';,          ,,',,;ldxxl.      .:l:'..
//          .'cl'         ,ddxd:',,,:'        ,:,,',:dxdo'         'lc'.
//         ..;l'           ckkoc;''.,ol.....'ol,'',:coxk:           'l;.
//         .,c'            'xkddoc;':xo.    .ox:';codoxd.            ':,.
//         ':.             .lOxxxkxooc'......'cooxkxxkOc              .:'
//        ';.              'ONXK0xc'.          .'cxOKXNO'              .;'.
//     .',.               .oKKkl,.                .'ckKKd.               ';'.
//     ';.                ,OKd'.                    ..oK0;                .;.
//                        :Kd..',cllc,.      .':llc;'..oKc
//                        :O;,ox0NWWWKxcclcccxKNWWNKxl',Oc
//                        ,o;cxONMMWNXKk:..;kKXNWMMNOxc,l;
//                        .,cdokKNWNNKx;    ,xKNNWNKkodc,.
//                        .,,oxxkO0kdl,.'::'.'ldk0Okxdd,'.
//                        ,:..',,''..''oXWWXo'...'',;,..;,
//                        .:'    ...''lNWWWWNo'....    ':.
//                         'lc:;;;;...:0Kkk00:...;;,;:ll,
//                          l0KXXKd. ..'.. .... .dKKXXKl
//                          ;kXNXXKl,,,'',,.';,,l0XXNXk;
//                          .o0XXXXklcc;:c:;;cclkXXXXKo.
//                           :kk0X0occ:,;;;;,:cco0X0kk:
//                           ;Okxxdolc::c::c::clodxdkO;
//                           .cxdc;;:;,'....,,;:;;cdxc.
//                              .'',;,..    .',;,'...
//                                   ..'''.''..
//
//
////////////////////////////////////////
////////////////////////////////////////
// Microservice Temperatur
// Projekt BAAL
// Created by Marcel Adam
// Version 0.8
////////////////////////////////////////
////////////////////////////////////////


////////////////////////////////////////
// Initalisiere Anwendung
////////////////////////////////////////

var express = require('express'),
app = express(),
port = process.env.PORT || 9001;

////////////////////////////////////////
// SQL-Verbindung
////////////////////////////////////////

mysql = require('mysql');

// Setzen der Paramenter für Aufbau

db = mysql.createConnection({
  host: process.env.DBHOST || '10.42.0.40',
  user: process.env.DBUSER || 'temp_user',
  password: process.env.DBPW || 'L1nux_dc',
  database: process.env.DBNAME || 'temp_db',
});

// Aufbau der Datenbankverbindung

db.connect((err) => {
  if(err){
    console.log('Datenbank geht nicht');
    return;
    db.end((err) => {
      console.log('Ich beende mich...');
      throw err;
    });
  }
  console.log('Datenbank-Verbindung: OK');
});

////////////////////////////////////////
// Applikation
////////////////////////////////////////
// Starte Socket für Anwendung

app.listen(port);

console.log('Microservice Temp-Port: ' + port);

app.use(express.json());


////////////////////////////////////////
// METHODEN
////////////////////////////////////////

// OPTIONS

app.options('/temp', function(req, res){
        return sendback(res, '');

});


// POST

app.post('/temp', function(req, res){
   if(Object.keys(req.body).length === 0){
        return sendstatus(res, 400, {error: "No Content"})
   }
   var vValue = req.body.value;
   var vID = req.body.id;
   if(vValue && vID){
        var sql='INSERT INTO temp (temp_value, temp_id) VALUES ("' + vValue + '","' + vID + '");';
        db.query(sql,(err,result) => {
                if(err){
                        sendstatus(res, 400, {error: "Database error"})
                }
                return sendstatus(res, 200, {status: "ok"})
        });
   } else {
        return sendstatus(res, 400, {error: "Missing Values"})
   }
});

// GET STATUS - Für Keepalive

app.get('/status', (req, res) => {
  return sendback(res, 'alive');
});

// GET temperatur


app.get('/temp/:id?', (req, res) => {
  var vLimit = req.query.limit; // Überführe QUERY_Limit in Variable
  if (!req.params.id){ // Prüfe ob ID NICHT gesetzt ist
    //Falls true - Alle Sensoren
    var sql = 'SELECT * FROM temp GROUP BY temp_id ORDER BY temp_timestamp;';
  } else {
    // Falls False - Einzelwert eines Sensors
    var vID = req.params.id;
    sql_limit = vLimit || 1;
    var sql = 'SELECT * FROM temp WHERE temp_id='+ vID + ' ORDER BY temp_timestamp LIMIT ' + sql_limit + ';'
  }
  // DB-Query
  db.query(sql,(err,result) => {
    if(err) throw err;
    return sendback(res, result);
  });
});

//////////////////////////////////
// FUNKTIONEN
//////////////////////////////////

// Für die Rücksendung der Daten an Client

function sendback (res, send) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "access-control-allow-origin,content-type,accept,x-requested-wih");
        res.header("Access-Control-Allow-Methods", "POST, GET");
        res.header("Content-Type","application/json");
        res.send(send);
}

function sendstatus(res, code, text) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "access-control-allow-origin,content-type,accept,x-requested-wih");
        res.header("Access-Control-Allow-Methods", "POST, GET");
        res.header("Content-Type","application/json");
        res.status(code).json(text);
}

