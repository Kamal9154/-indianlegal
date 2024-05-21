var fs = require('fs');
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var moment = require('moment-timezone');

var { dirname } = require('path');
// const io = require("socket.io")(http);
global.nodeEnv = require('dotenv').config({ debug: true });

global.nodeSiteUrl = nodeEnv.parsed.SITE_URL + ':' + nodeEnv.parsed.SERVER_PORT;
global.reset_password_url = nodeEnv.parsed.RESET_PASSWORD_URL
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/assets')));

app.use(express.static(__dirname + '/../admin/dist'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/../admin/dist/index.html')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,transfer-encoding, Authorization, *');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'transfer-encoding', 'GET, PUT, POST');
        // res.setHeader('Access-Control-Allow-Credentials', true);
        return res.status(200).json({});
    }
    next();
});

const Joi = require('joi');
const schema = Joi.object({
    user_id: Joi.number().required().min(1),
    accuracy: Joi.required(),
    latitude: Joi.required(),
    longitude: Joi.required(),
    sos_status: Joi.string().required().min(1),
    sos_date_time: Joi.string().required().min(1),
});


app.use(bodyParser.urlencoded({ limit: '1025mb', extended: true }));
app.use(bodyParser.json({ limit: '1025mb', extended: true }));

var apiRouter = require('./routes/api');
app.use(flash());

app.use('/', apiRouter);

global.appDir = dirname(require.main.filename);

const chatController = require('./controllers/chat-controller')
const lawyerController = require('./controllers/lawyer-controller')
const commonModel = require('./models/common-model')
const commanHelper = require('./helpers/helper')
var server = http.listen(nodeEnv.parsed.SERVER_PORT, function () {
    console.log("Example app listening at " + nodeEnv.parsed.SITE_URL + ":%s", server.address().port);
});
// const socket = require("socket.io");


const io = require('socket.io')(server, { cors: { origin: '*' } });
let connections = [];


io.on('connection', (socket) => {

    // User joins a room
    socket.on('get_user_chat', async (data) => {
        socket.join(data.user_id); // Join the room associated with the user ID
        // console.log('User joined:');
        let result = await chatController.getUserChat(data);
        io.to(data.user_id).emit("get_user_chat", result);
        // console.log("get_user_chat")
    });
    // Admin sends message to a specific user
    socket.on('admin_send_message', async (msg) => {
        await chatController.adminSendmsg(msg);
        msg.created_at = moment(msg.created_at).format('DD MMM YYYY || h:mm a')
        // io.in(msg.room_id).emit("user_get_message", msg);
        io.to(msg.receiver_id).emit('user_get_message', msg);
    });
    // User sends message to admin
    socket.on('user_send_message', async (msg) => {
        console.log(msg, "msg-user_send_message")
        if (msg.message_type != 'text') {
            const byteData = msg.message;
            const buffer = Buffer.from(byteData);
            let filename
            if (msg.message_type == 'pdf') {
                filename = Date.now() + '.pdf'
            } else {
                filename = Date.now() + '.png'
            }
            fs.writeFile('assets/images/' + filename, buffer, (err) => {
                if (err) throw err;
                console.log('File saved!');
            });
            msg.message = filename
        }

        let returndata = await chatController.userSendmsg(msg);
        returndata.created_at = moment(msg.created_at).format('DD MMM YYYY || h:mm a')
        if (returndata.message_type != 'text') {
            returndata.message = nodeSiteUrl + '/images/' + returndata.message
        }

        io.emit('admin_get_message', returndata);
        io.to(msg.sender_id).emit('user_get_message', returndata);
        // console.log(returndata,"user_get_message end")
    });
    // Update user room status
    socket.on('Update_room_status', async (data) => {
        await chatController.updateRoomStatus(data);
        io.to(data.receiver_id).emit('Update_room_status', data);
    });
       // Update user room status
    socket.on('Update_room_status', async (data) => {
        await chatController.updateRoomStatus(data);    
        io.to(data.receiver_id).emit('Update_room_status', data);
    });
    /* sos section starts */

    socket.on("get_active_sos", async data => {
        socket.join(data.lawyer_id)
        let result = await lawyerController.getActiveSos(data);
  
        io.to(data.lawyer_id).emit("get_active_sos", result);
    });
    socket.on("get_accepted_sos", async data => {
        socket.join(data.lawyer_id)
        let result = await lawyerController.getAcceptedSos(data);
        // console.log('get_accepted_sos',data)
        // console.log(result,"result ")

        io.to(data.lawyer_id).emit('get_accepted_sos', result);

    });
    socket.on("accept_sos", async data => {
        await lawyerController.acceptSos(data);
        let resultallsos = await lawyerController.getActiveSos(data);
        let AcceptedSosresult = await lawyerController.getAcceptedSos(data);
        socket.join(data.lawyer_id)        
        io.emit("get_active_sos", resultallsos);
        io.to(data.lawyer_id).emit('get_accepted_sos', AcceptedSosresult);
        let result1 = await chatController.getLawyerNotificaton(data);
        io.emit('lawyer_accepted_sos',result1)


    });
    // socket.on("hit_sos", async data => {
    //     try {

    //         let wheresos = `where user_id = ${data.user_id} AND is_deleted = 0`
    //         let sosdata = await commonModel.select('sos', wheresos)
    //         if (sosdata.length) {
    //             // update
    //             let updateObject = {
    //                 accuracy: data.accuracy,
    //                 latitude: data.latitude,
    //                 longitude: data.longitude,
    //                 sos_status: data.sos_status,
    //                 sos_date_time: data.sos_date_time,
    //             }
    //             await commonModel.update('sos', wheresos, updateObject)
    //             console.log('update the sos')
    //         }
    //         else {
    //             // insert
    //             let insertObject = {
    //                 user_id: data.user_id,
    //                 accuracy: data.accuracy,
    //                 latitude: data.latitude,
    //                 longitude: data.longitude,
    //                 sos_status: data.sos_status,
    //                 sos_date_time: data.sos_date_time,
    //             }
    //             await commonModel.insert('sos', insertObject)
    //             console.log('insert the sos')

    //         }
    //         let where = `where id = ${data.user_id} AND status = 1`
    //         let Userdata = await commonModel.select('users', where)

    //         if (Userdata[0].lawyer_id) {

    //             // lawyer present so send notification to perticullor lawyer only
    //             let where_law_id = `where id = ${Userdata[0].lawyer_id} AND status = 1 AND is_deleted = 0`
    //             let lawyerdata = await commonModel.select('lawyers', where_law_id)
    //             if (lawyerdata[0].device_type == 'android') {
    //                 let message = ''
    //                    if(data.sos_status == 1) {message = Userdata[0].name + ' has turned on the SOS alert.'}
    //                    else {message = Userdata[0].name + ' has turned off the SOS alert.'}

                    

    //                 await commanHelper.androidLawyerNotification('accepted_sos', lawyerdata[0].device_token, 'SOS', message, '1')
    //             }
    //             if (lawyerdata[0].device_type == 'ios') {
    //                 // await commanHelper.iosSosNotification(userdetails[0].device_token, data.title, data.body,usernotification.length)
    //             }

    //             /* for lawyer */
                // let resultSos = await lawyerController.getAcceptedSos({ lawyer_id: Userdata[0].lawyer_id });
    //             // socket.join(Userdata[0].lawyer_id)              
    //             // socket.join(Userdata[0].lawyer_id)
    //             // io.to(Userdata[0].lawyer_id).emit('get_accepted_sos', resultSos);
                // io.emit('get_accepted_sos', resultSos);
                
    //             /* for user */
    //             socket.join(data.user_id)
    //             let sosstatus = data.sos_status == 1 ? 'ON' : 'OFF'
    //             let result = { status: true, message: 'SOS turned ' + sosstatus, sos_status: data.sos_status }
    //             io.to(data.user_id).emit('hit_sos', result);


    //             // 


    //         } else {
    //             // console.log('lawyer absence')
    //             let sosstatus = data.sos_status == 1 ? 'ON' : 'OFF'
    //             let result = { status: true, message: 'SOS turned ' + sosstatus, sos_status: data.sos_status }
    //             let resultSos = await lawyerController.getActiveSos(data);

    //             io.emit('get_active_sos', resultSos);

    //             // io.emit("hit_sos", result);
    //             socket.join(data.user_id)

    //             io.to(data.user_id).emit('hit_sos', result);

    //             console.log(result, data.user_id, 'hit-sos')
    //             if (result.message == 'SOS turned ON') {
    //                 // lawyer does not present so send notification to all lawyers	
    //                 let lawyerdata = await commonModel.select('lawyers', 'where status = 1 AND is_deleted = 0')

    //                 for (let i = 0; i < lawyerdata.length; i++) {
    //                     if (lawyerdata[i].device_token && lawyerdata[i].device_type == 'android') {
    //                         let message = Userdata[0].name + ' has sent an SOS alert';
    //                         await commanHelper.androidLawyerNotification('active_sos', lawyerdata[i].device_token, 'SOS', message, '1')
    //                     }
    //                     if (lawyerdata[i].device_token && lawyerdata[i].device_type == 'ios') {
    //                         // await commanHelper.iosNotification(lawyerdata[0].device_token, data.title, data.body,usernotification.length)
    //                     }
    //                 }
    //             }

    //         }

    //        /*starts  save notification for show to admin  */
    //             let whereuser = `where id = ${data.user_id} `
    //             let userdata = await commonModel.select('users', whereuser)
    //             let newobj = {sos_status:data.sos_status,name:userdata[0].name,email:userdata[0].email,message:`${userdata[0].name} turned ${data.sos_status == 1 ? 'on' : 'off'} the SOS alert`,}
                
    //             io.emit('admin_get_sos_alarm', newobj); // for admin alarm
                
    //             let object = {
    //                 body: `${userdata[0].name} turned ${data.sos_status == 1 ? 'on' : 'off'} the SOS alert`,
    //                 type: 'admin',
    //                 user_id: data.user_id,
    //                 title: 'SOS Alert'
    //             }
    //             await commonModel.insert('notification', object)
    //     /* ends */
    //     }
    //     catch (err) {
    //         // console.log(err)
    //     }
    // });
    socket.on("hit_sos", async data => {
        console.log(data,"data at the starting of hit-sos")
        try {
            /** check if any lawyer assign to user and remove it */ 
            await commonModel.runSQLquery('UPDATE `users` SET `lawyer_id` = NULL WHERE `users`.`id` = '+data.user_id+'')
            await commonModel.runSQLquery('UPDATE `sos` SET `lawyer_id` = NULL WHERE `user_id` = '+data.user_id+'')

            /** ad details into sos table */
            let wheresos = `where user_id = ${data.user_id} AND is_deleted = 0`
            let sosdata = await commonModel.select('sos', wheresos)
            if (sosdata.length) {
                // update
                let updateObject = {
                    accuracy: data.accuracy,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    sos_status: data.sos_status,
                    sos_date_time: data.sos_date_time,                    
                }
                console.log('updating',updateObject)
                await commonModel.update('sos', wheresos, updateObject)
            }
            else {
                // insert
                let insertObject = {
                    user_id: data.user_id,
                    accuracy: data.accuracy,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    sos_status: data.sos_status,
                    sos_date_time: data.sos_date_time,
                }
                await commonModel.insert('sos', insertObject)
            }

            let where = `where id = ${data.user_id} AND status = 1`
            let Userdata = await commonModel.select('users', where)

        
               /** socket tp all lawyers */
                let resultSos = await lawyerController.getActiveSos(data);
                io.emit('get_active_sos', resultSos);

                /** socket to user */
                let sosstatus = data.sos_status == 1 ? 'ON' : 'OFF'
                let result = { status: true, message: 'SOS turned ' + sosstatus, sos_status: data.sos_status }
                socket.join(data.user_id)
                io.to(data.user_id).emit('hit_sos', result);
                console.log('response of hit sos to user',result)
                   
                /** send notification to all lawyers */                               
                    let lawyerdata = await commonModel.select('lawyers', 'where status = 1 AND is_deleted = 0')
                    for (let i = 0; i < lawyerdata.length; i++) {
                        if (lawyerdata[i].device_token && lawyerdata[i].device_type == 'android') {
                            let message = Userdata[0].name + ' has turner '+sosstatus+' the SOS alert';
                            commanHelper.androidLawyerNotification('active_sos', lawyerdata[i].device_token, 'SOS', message, '1')
                        }
                        if (lawyerdata[i].device_token && lawyerdata[i].device_type == 'ios') {
                            // await commanHelper.iosNotification(lawyerdata[0].device_token, data.title, data.body,usernotification.length)
                        }
                    }
                

            

           /* starts  save notification for show to admin  */
                let whereuser = `where id = ${data.user_id} `
                let userdata = await commonModel.select('users', whereuser)
                let newobj = {sos_status:data.sos_status,name:userdata[0].name,email:userdata[0].email,message:`${userdata[0].name} turned ${data.sos_status == 1 ? 'on' : 'off'} the SOS alert`,}
                
                io.emit('admin_get_sos_alarm', newobj); // for admin alarm
                
                let object = {
                    body: `${userdata[0].name} turned ${data.sos_status == 1 ? 'on' : 'off'} the SOS alert`,
                    type: 'admin',
                    user_id: data.user_id,
                    title: 'SOS Alert'
                }
                await commonModel.insert('notification', object)
        /* ends */
        }
        catch (err) {
        console.log(err)
		commonModel.logger('hit_sos', data, err);

        }
    });
    /* sos section ends */

    socket.on('disconnect', () => {
        // console.log('User disconnected:', socket.id);
    });

    socket.on("lawyer_status", async data => {
        socket.join(data.lawyer_id)
        let result = await chatController.getLawyerStatus(data);
        io.to(data.lawyer_id).emit("get_lawyer_status", result);
    });

});



// sos.id,sos.user_id,sos.lawyer_id,sos.latitude,sos.longitude,sos.sos_date_time,sos.sos_status,users.name as user_name,users.user_country as nationality


module.export = connections;