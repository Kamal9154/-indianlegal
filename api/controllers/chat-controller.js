var commonModel = require('../models/common-model')
var resMessage = require('../helpers/response-message')
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY, { pbkdf2Iterations: 10000, saltLength: 10 });
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const commanHelper = require('../helpers/helper');
const { func } = require('joi');
const fs = require("fs");


//1
exports.getLatestChatList = async function (req, res) {

    try {
        let where = ''
        if (req.body.filter) {
            where += ` AND (users.name LIKE '%${req.body.filter}%' OR users.email LIKE '%${req.body.filter}%')`
        }
        let result = await commonModel.selectLatestChatlist(req.body.admin_id, where)

        result.sort(function (a, b) {
            return moment(b.created_at) - moment(a.created_at);
        });
        result.forEach(element => {    
            element.profile_image = fs.existsSync(nodeSiteUrl + '/users/' + element.profile_image) ? nodeSiteUrl + '/users/' + element.profile_image : '';
            element.created_at = moment(element.created_at).format('DD MMM YYYY || h:mm a');
        });       
        if(result.length){
            res.send({ status: true, message: resMessage.dataFound, data: result });
        }else{
            res.send({ status: false, message: resMessage.dataNotFound, data: [] });
        }
    } catch (err) {
        console.log(err)
        commonModel.logger('getChatList', req, err);
        res.send({ status: false, message: "Somthing went wrong." });
    }
}
//2
exports.getSosChatList = async function (req, res) {
    try {
        let where = ''
        if (req.body.filter) {
            where += ` AND (users.name LIKE '%${req.body.filter}%' OR users.email LIKE '%${req.body.filter}%')`
        }
        let result = await commonModel.selectSosChatlist(req.body.admin_id, where)
        result.sort(function (a, b) {
            return moment(b.created_at) - moment(a.created_at);
        });
        result.forEach(element => {
            element.profile_image = fs.existsSync(nodeSiteUrl + '/users/' + element.profile_image) ? nodeSiteUrl + '/users/' + element.profile_image : '';
            element.created_at = element.created_at ? moment(element.created_at).format('DD MMM YYYY || h:mm a') : ''
        });
        if(result.length){
            res.send({ status: true, message: resMessage.dataFound, data: result });
        }else{
            res.send({ status: false, message: resMessage.dataNotFound, data: [] });
        }

    } catch (err) {
        console.log(err)
        commonModel.logger('getChatList', req, err);
        res.send({ status: false, message: "Somthing went wrong." });
    }
}
//3
exports.getAllChatList = async function (req, res) {
    try {
        let where = ''
        if (req.body.filter) {
            where += ` AND (users.name LIKE '%${req.body.filter}%' OR users.email LIKE '%${req.body.filter}%')`
        }
        let result = await commonModel.selectAllChatlist(req.body.admin_id, where)

        result.sort(function (a, b) {
            return moment(b.created_at) - moment(a.created_at);
        });
        // console.log(result)
        result.forEach(element => {
            element.profile_image = fs.existsSync(nodeSiteUrl + '/users/' + element.profile_image) ? nodeSiteUrl + '/users/' + element.profile_image : '';
            element.created_at = element.created_at ? moment(element.created_at).format('DD MMM YYYY || h:mm a') : ''
        });

        /* place empty in last */
        result.sort((a, b) => {
            if (a.created_at === '') {
                return 1;
            } else if (b.created_at === '') {
                return -1;
            } else {
                return 0;
            }
        })

        if(result.length){
            res.send({ status: true, message: resMessage.dataFound, data: result });
        }else{
            res.send({ status: false, message: resMessage.dataNotFound, data: [] });
        }

    } catch (err) {
        console.log(err)
        commonModel.logger('getChatList', req, err);
        res.send({ status: false, message: "Somthing went wrong." });
    }
}
//4
exports.adminSendmsg = async (data) => {
    try {

        let object = {
            created_at: moment(data.created_at).format('YYYY-MM-DD HH:mm:ss'),
            message: data.message,
            message_type: data.message_type,
            receiver_id: data.receiver_id,
            room_id: data.room_id,
            seen_status: data.seen_status,
            sender_id: data.sender_id,
            user_type: data.user_type,
        }


        await commonModel.insert('chat', object)
        let where = `where room_id = '${data.room_id}' AND receiver_id = '${data.sender_id}' AND seen_status = 0 `
        let result = await commonModel.update('chat', where, { seen_status: '1' })

        let userdetails = await commonModel.select('users', `where id = ${data.receiver_id} `, '', 'device_token,device_type,room_status')
        if (userdetails[0].room_status == '0') {
            let whereChat = `where seen_status = 0 AND sender_id = 1 AND receiver_id = ${data.receiver_id}`;
            let chatCount = await commonModel.select('chat', whereChat, 'order by created_at desc', 'COUNT(seen_status) as count')
            let whereNoti = `where user_id = ${data.receiver_id} and read_status = 0 AND status = 1`;
            let notiCount = await commonModel.select('notification', whereNoti, 'order by created_at desc', 'COUNT(notification.id) as count')

            let totalCount = notiCount[0].count + chatCount[0].count;

            if (userdetails[0].device_type == 'android') {
                await commanHelper.newAndroidNotification('admin_notification', userdetails[0].device_token, 'Indian Legal Helps', data.message, totalCount, chatCount[0].count, notiCount[0].count)
            }
            if (userdetails[0].device_type == 'ios') {
                // await commanHelper.androidNotification('admin_notification', userdetails[0].device_token, data.user_type, data.message)
            }
        }



    } catch (err) {
        console.log(err)
        commonModel.logger('adminSendmsg', data, err);
    }
}
//5
exports.getChats = async function (req, res) {
    try {
        let where = `where room_id = '${req.body.room_id}' AND is_deleted = '0' `
        let result = await commonModel.select('chat', where)
        result.forEach(element => {
            element.created_at = moment(element.created_at).format('DD MMM YYYY || h:mm a')
            if (element.message_type != 'text') {
                element.message = nodeSiteUrl + '/images/' + element.message
            }

        });
        if (result.length) {
            res.send({ status: true, message: resMessage.dataFound, data: result })
        } else {
            res.send({ status: false, message: resMessage.dataNotFound, data: [] })
        }

    } catch (err) {
        console.log(err)
        commonModel.logger('getChats', req, err);
        res.send({ status: false, message: resMessage.pleaseTryAgain });

    }
}
//6
exports.userSendmsg = async (data) => {
    try {

        let object = {
            created_at: data.created_at,
            message: data.message,
            message_type: data.message_type,
            receiver_id: data.receiver_id,
            room_id: data.room_id,
            seen_status: data.seen_status,
            sender_id: data.sender_id,
            user_type: data.user_type,
        }
        let a = await commonModel.insert('chat', object)
        // console.log('testing----------',object);
        object.id = a.insertId
        return object
        // console.log(a.insertId,"aaaaaaaaaaaaaaaaa")
    } catch (err) {
        console.log(err)
        // commonModel.logger('userSendmsg', data, err);
    }
}
//7
exports.getUserChat = async (data) => {
    // user_id
    try {
        let where = `where room_id = '1_${data.user_id}' AND is_deleted = '0' `
        // console.log(where)
        let result = await commonModel.select('chat', where)

        if (result.length) {
            result.forEach(element => {
                element.created_at = moment(element.created_at).format('DD MMM YYYY || h:mm a')
                if (element.message_type != 'text') {
                    element.message = nodeSiteUrl + '/images/' + element.message
                }
            });
            // console.log(result)
            return result
            // res.send({ status: true, message: resMessage.dataFound, data: result })
        } else {
            return []
            // res.send({ status: false, message: resMessage.dataNotFound, data: [] })
        }

    } catch (err) {
        console.log(err)
        // commonModel.logger('getUserChat', req, err);
        // res.send({ status: false, message: resMessage.pleaseTryAgain });

    }
}
//8
exports.updateSeenByAdmin = async function (req, res) {
    try {
        let where = `where room_id = '${req.body.room_id}' AND receiver_id = '${req.body.receiver_id}' `
        let result = await commonModel.update('chat', where, { seen_status: '1' })
        res.send({ status: true, message: resMessage.dataUpdated })

    } catch (err) {
        console.log(err)
        commonModel.logger('updateSeenByAdmin', req, err);
        res.send({ status: false, message: resMessage.pleaseTryAgain });

    }
}
exports.updateRoomStatus = async (data) => {
    // user_id
    //room_status
    // console.log('updateRoomStatus socket--------------', data)
    let where = `where id = '${data.user_id}'`
    if (data.user_id && (data.room_status == '0' || '1')) {
        let result = await commonModel.update('users', where, { room_status: data.room_status })
        let where1 = `where seen_status = '0' AND sender_id = '1' AND receiver_id = ${data.user_id}`
        let result1 = await commonModel.update('chat', where1, { seen_status: '1' })
        return { status: true, roomStatus: '1' };
    } else {
        return { status: false, roomStatus: '0' };
    }
}


exports.getLawyerStatus = async (data) => {
    try {
        let where = `where id = '${data.lawyer_id}' AND is_deleted = 0`
        let result = await commonModel.select('lawyers', where, 'order by created_at desc', 'status')
        return result[0]
    } catch (err) {
        console.log(err)
    }
}


exports.getLawyerNotificaton = async (data) => {
    try {
        if (data) {
            let result = await commonModel.getUserAndLawyer(data.user_id)
            let bodyData = `${result[0].lawyer} successfully accepted ${result[0].user}'s SOS`
            let object = {
                body: bodyData,
                type: 'admin',
                user_id: data.user_id,
                title: 'SOS Alert'
            }
            await commonModel.insert('notification', object)
            return result[0]
        }
    } catch (error) {
        console.log('getLawyerNotificatonError', error)
    }
}


exports.getAdminNotificatonList = async function (req, res) {
    // console.log(req.body, "getLawyerNotificatonList body")
    try {
        let where = `where type = 'admin'`
        let notiData = await commonModel.select('notification', where, 'order by created_at desc','title,body,created_at');
        let unseencount = await commonModel.select('notification', `where type LIKE 'admin' and read_status = 0 AND status = 1`, '',`COUNT(*) as unseen_count`);
        res.send({ status: true, data: notiData, unseencount: unseencount[0].unseen_count })
    } catch (err) {
      console.log(err)
      res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
    }
  }
  exports.seenAdminNotification = async function (req, res) {
    // console.log(req.body, "getLawyerNotificatonList body")
    try {
        let where = ` where type = 'admin' and read_status = 0 AND status = 1 `
        let notiData = await commonModel.update('notification', where, {read_status : 1});
        res.send({ status: true, message:'Success' })
    } catch (err) {
      console.log(err)
      res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
    }
  }
  


// exports.readUnreadNotifications = async (req, res) => {
//     try {
        
//     } catch (error) {
//         console.log('readUnreadNotifications===========',error);
//     }
// }