// var admin = require("firebase-admin");
// var fcm = require('fcm-notification');
const admin = require('firebase-admin');
var fs = require('fs');
var apn = require('apn');
const commanModel = require('../helpers/common-middle-validation');
const serviceAccount1 = require("./fff");
const serviceAccount2 = require("./vvvvn");

const app1 = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount1),
    // Other configuration options
});

const app2 = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount2),
    // Other configuration options
}, 'app2');


// var serviceAccount = require("./fff");
// var lawyerAccount = require("./vvvvn");

// const certPath = admin.credential.cert(serviceAccount);
// var FCM = new fcm(certPath);
// const certPath1 = admin.credential.cert(lawyerAccount);
// // var FCM1 = new fcm(certPath1);


if (nodeEnv.parsed.PUSH_NOTIFICATION_MODE == 'true') { var production = true; console.log("production", production) }
else { var production = false; console.log("production", production) }
const options = {
    token: {
        key: fs.readFileSync(__dirname + '/Asss.p8'),
        teamId: '2WCssCPT',
        keyId: 'CGZssG'
    },
    production: production,
};
const apnProvider = new apn.Provider(options);

async function iosNotification(deviceToken, msgtitle, msgbody, badge) {
    try {
        const note = new apn.Notification({ aps: { "content-available": 0 } });
        note.expiry = Math.floor(Date.now() / 1000) + 3600;
        note.badge = badge;
        note.sound = "ping.aiff";
        note.alert = msgtitle;
        note.payload = { data: { title: msgtitle, body: msgbody } };
        note.topic = "app.SketchHaus";
        let a = await apnProvider.send(note, deviceToken)

        return true;
    } catch (err) {
        console.log('error in ios notifiation', err)
        return false;
    }
}
async function androidNotification(type, deviceToken, msgtitle, msgbody, badge) {
    try {       
        const payload = {
            data: {
                body: JSON.stringify({ type: type, title: msgtitle, body: msgbody, badge: badge }),
            },
            token: deviceToken,
        };
        app1.messaging().send(payload)
            .then(response => {
                // console.log('Notification sent to app1:', response);
            })
            .catch(error => {
                // console.error('Error sending notification to app1:', error);
            });
    } catch (err) {
        console.log(err)
        return false;
    }
}


async function newAndroidNotification(type, deviceToken, msgtitle, msgbody, badge, chat, noti) {
    try {
        const payload = {
            data: {
                body: JSON.stringify({ type: type, title: msgtitle, body: msgbody, badge: badge, chatCount: chat, notiCount: noti }),
            },
            token: deviceToken,
        };
        app1.messaging().send(payload)
            .then(response => {
                // console.log('Notification sent to app1:', response);
            })
            .catch(error => {
                // console.error('Error sending notification to app1:', error);
            });
    } catch (err) {
        console.log(err)
        return false;
    }
}



async function androidLawyerNotification(type, deviceToken, msgtitle, msgbody, badge) {
  
    try {     

        const payload = {
            data: {
                body: JSON.stringify({ type: type, title: msgtitle, body: msgbody, badge: badge }),
            },
            token: deviceToken,
        };            

        app2.messaging().send(payload)
            .then(response => {
                // console.log('Notification sent to app2:', response);
            })
            .catch(error => {
                // console.error('Error sending notification to app2:');
            });
    } catch (err) {
        // console.log(err)
        return false;
    }
}








// sendPushNotification = async (fcm_token, title, body) => {
//     try {
//         let message = {
//             android: {
//                 notification: {
//                     title: title,
//                     body: body,
//                 },
//             },
//             token: fcm_token
//         };FCM.send(message, function (err, resp) {
//             if (err) {
//                 throw err;
//             } else {
//                 console.log('Successfully sent notification');
//             }
//         });
//     } catch (err) {
//         throw err;
//     }
// }


module.exports = {
    androidNotification,
    iosNotification,
    newAndroidNotification,
    androidLawyerNotification,
};
