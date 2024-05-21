var commonModel = require('../models/common-model')
var resMessage = require('../helpers/response-message')
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY, { pbkdf2Iterations: 10000, saltLength: 10 });
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
var jwt = require('jsonwebtoken');


let transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  tls: {
      rejectUnauthorized: false
  }
});

//1
exports.login = async function (req, res) {
  console.log(req.body, "login body")
  //user_type == user
  //user_type == lawyer
  try {


    if (req.body.user_type == 'user') {
      let where = `where email = '${req.body.email}' AND is_deleted = 0`
      let checkEmail = await commonModel.select('users', where, '')
      console.log(checkEmail)
      if (checkEmail.length) {/* check user exist */
      if(checkEmail[0].status == 0){
        res.send({ status: false, message: resMessage.userBlocked, data: {} });
      }else{

        if (req.body.password == cryptr.decrypt(checkEmail[0].password)) {
          /* generate new auth token  */
          let newAuthToken = cryptr.encrypt(req.body.email + moment().format('YYYY-MM-DD HH:mm:ss'))
          await commonModel.update('users', `where id = '${checkEmail[0].id}' AND is_deleted = 0`, { auth_token: newAuthToken, device_type: req.body.device_type, device_token: req.body.device_token })
          checkEmail[0].auth_token = newAuthToken
          let object = {
            name: checkEmail[0].name,
            email: checkEmail[0].email,
            device_type: checkEmail[0].device_type,
            device_token: checkEmail[0].device_token,
            auth_token: newAuthToken,
            id: checkEmail[0].id,
            profile_image: nodeSiteUrl + '/users/' + checkEmail[0].profile_image,
            user_type: 'User',
            mobile: checkEmail[0].mobile,
            country_code: checkEmail[0].country_code,
          }
          var result = { status: true, message: resMessage.loginSuccess, data: object };
        }
        else {
          var result = { status: false, message: resMessage.incorrectPass, data: {} };
        }

      }

      } else {
        var result = { status: false, message: resMessage.userNotFound, data: {} };
      }
    }

    if (req.body.user_type == 'lawyer') {
      let whereLawyer = `where email = '${req.body.email}' AND is_deleted = 0`
      let checkEmailOfLwyr = await commonModel.select('lawyers', whereLawyer, '')
      if (checkEmailOfLwyr.length) {
        if (req.body.password == cryptr.decrypt(checkEmailOfLwyr[0].password)) {
          if (checkEmailOfLwyr[0].status == 0) {
            var result = { status: false, message: resMessage.pendingAccount, data: {} };
          } else {
            /* generate new auth token  */
            let newAuthToken = cryptr.encrypt(req.body.email + moment().format('YYYY-MM-DD HH:mm:ss'))
            await commonModel.update('lawyers', `where id = '${checkEmailOfLwyr[0].id}'`, { auth_token: newAuthToken, device_type: req.body.device_type, device_token: req.body.device_token })
            checkEmailOfLwyr[0].auth_token = newAuthToken
            let object = {
              name: checkEmailOfLwyr[0].name,
              email: checkEmailOfLwyr[0].email,
              device_type: checkEmailOfLwyr[0].device_type,
              device_token: checkEmailOfLwyr[0].device_token,
              auth_token: newAuthToken,
              id: checkEmailOfLwyr[0].id,
              profile_image: nodeSiteUrl + '/users/' + checkEmailOfLwyr[0].profile_image,
              user_type: 'Lawyer'
            }
            var result = { status: true, message: resMessage.loginSuccess, data: object };
          }
        }
        else {
          var result = { status: false, message: resMessage.incorrectPass, data: {} };
        }
      } else {
        var result = { status: false, message: resMessage.userNotFound, data: {} };

      }

    }

    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('login', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }
}
//2
exports.registration = async function (req, res) {
  console.log(req.body, "registration")
  try {

    var where = `where email = '${req.body.email}' AND is_deleted = 0`;
    var checkEmail = await commonModel.select('users', where);
    var whereLawyer = `where email = '${req.body.email}' AND is_deleted = 0`;

    var checkEmaillawyer = await commonModel.select('lawyers', whereLawyer);
    if (!checkEmail.length && !checkEmaillawyer.length) {
      // user registration
      if (req.body.user_type == 'User') {
        let newUserObject = {
          name: req.body.name,
          email: req.body.email,
          password: cryptr.encrypt(req.body.password),
          device_type: req.body.device_type,
          device_token: req.body.device_token,
          auth_token: cryptr.encrypt(req.body.email + moment().format('YYYY-MM-DD HH:mm:ss')),
          profile_image: 'default.png',
          mobile:req.body.mobile ?? '',
          country_code:req.body.country_code ?? '',
        }
        var insert = await commonModel.insert('users', newUserObject);
        newUserObject.id = insert.insertId
        delete newUserObject.password
        delete newUserObject.profile_image
        newUserObject.profile_image = nodeSiteUrl + '/users/default.png'
        newUserObject.user_type = 'User'

        let notification_arr = [
          {
            user_id: newUserObject.id,
            title: 'Welcome',
            body: 'Welcome to "Indian Legal Helps" family. We are happy to have you with us.',
            icon_type: 'welcome'
          },
          {
            user_id: newUserObject.id,
            title: 'Profile Update',
            body: 'Please complete your profile, documents and itinerary to get proper legal helps during visits in India.',
            icon_type: 'profileUpdate'
          },
          {
            user_id: newUserObject.id,
            title: 'Reminder',
            body: 'Currently you are at Free membership level. Please upgrade your membership to enjoy best services',
            icon_type: 'reminder'
          },
        ]
        for (let i = 0; i < notification_arr.length; i++) {
          commonModel.insertEscap('notification', notification_arr[i]);
        }

        var result = { status: true, message: resMessage.registrationSucc, data: newUserObject };

      }// lawyer registration
      else {
        let newlawyerObject = {
          name: req.body.name,
          email: req.body.email,
          password: cryptr.encrypt(req.body.password),
          device_type: req.body.device_type,
          device_token: req.body.device_token,
          auth_token: cryptr.encrypt(req.body.email + moment().format('YYYY-MM-DD HH:mm:ss')),
          profile_image: 'default.png',
          status: 0,
        }
        var insert = await commonModel.insert('lawyers', newlawyerObject);
        newlawyerObject.id = insert.insertId
        delete newlawyerObject.password
        delete newlawyerObject.profile_image
        newlawyerObject.profile_image = nodeSiteUrl + '/users/default.png'
        newlawyerObject.user_type = 'Lawyer'
        var result = { status: true, message: resMessage.registrationSucc, data: newlawyerObject };
      }
    }
    else {
      var result = { status: false, message: resMessage.EmailAlready, data: {} };
    }

    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('registration', req, err);
    res.send({ status: false, message: 'Please try again.', data: {} });
  }
}
//3
exports.updateDeviceToken = async function (req, res) {
  try {
    let where = `where id = '${req.body.user_id}'`
    let updatedData = await commonModel.update('users', where, { device_token: req.body.device_token })
    var result = { status: true, message: resMessage.devicetokenUpdated };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('updateDeviceToken', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
}
//4
exports.logout = async function (req, res) {
  try {
    let where = `where id = '${req.body.user_id}'`
    await commonModel.update('users', where, { device_token: '' })
    var result = { status: true, message: resMessage.logoutSuccess };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('logout', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
}
//5
exports.dashboard = async function (req, res) {
  try {
    let paymentdata = await commonModel.select('payment', `where user_id = ${req.body.user_id}`, 'ORDER BY created_at DESC LIMIT 1', 'expiry_date,type')

    let membership_type = 'free'
    let is_expired = true
    if (paymentdata.length) {
      membership_type = paymentdata[0].type
      if (moment(paymentdata[0].expiry_date) > moment()) {// if not expired
        // update the user payment status 
        is_expired = false
        await commonModel.update('users', `WHERE id = ${req.body.user_id}`, { membership_type: paymentdata[0].type })
      }
      else {// if package is expired update user table
        is_expired = true
        await commonModel.update('users', `WHERE id = ${req.body.user_id}`, { membership_type: 'free' })
      }
    }
    let data = await commonModel.select('contact')
    let sosdata = await commonModel.select('sos', `where user_id = ${req.body.user_id}`)
    let userdata = await commonModel.select('users', `WHERE id = ${req.body.user_id} AND name IS NOT NULL AND passport_no IS NOT NULL AND passport_issue_date IS NOT NULL  AND passport_expiry_date IS NOT NULL AND user_address IS NOT NULL AND emergency_contact_email IS NOT NULL AND emergency_contact_name IS NOT NULL AND emergency_contact_mobile IS NOT NULL`)
    let wherecount = `where user_id = ${req.body.user_id} and read_status = 0 and type='user' and status = 1`;
    let countdata = await commonModel.select('notification', wherecount, 'order by created_at desc', 'COUNT(notification.id) as count')
    let sosStatus = 0
    let profileStatus = 0
    let whereChat = `where seen_status = 0 AND sender_id = 1 AND receiver_id = ${req.body.user_id}`;
    let chatCount = await commonModel.select('chat', whereChat, 'order by created_at desc', 'COUNT(seen_status) as count')

    if (sosdata.length) {
      sosStatus = sosdata[0].sos_status
    }
    if (userdata.length) {
      profileStatus = 1
    }
    console.log(userdata[0])
    let object = {
      call_number: data[0].call_number,
      whatsapp_number: data[0].whatsapp_number,
      text_number: data[0].text_number,
      sos_status: sosStatus,
      profile_status: profileStatus,
      notification_count: countdata[0].count ?? 0,
      membership_type: membership_type,
      expiry_date: paymentdata.length ? paymentdata[0].expiry_date : '',
      razorpay_key: data[0].rzp_key,
      chat_count: chatCount[0].count ?? 0,
      is_expired: is_expired,
      emergency_contact_email:userdata.length ? userdata[0].emergency_contact_email : '',
      emergency_contact_mobile:userdata.length ? userdata[0].emergency_contact_mobile : '',
    }
    var result = { status: true, message: resMessage.dataFound, data: object };
    console.log(result, "dashboard")
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('dashboard', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }
}
//6
exports.saveDocument = async function (req, res) {
  // console.log(req.file, "dfffffffffffff")
  if (!req.file) {
    res.send({ status: false, message: resMessage.fileisrequired });
    return
  }
  try {
    let where = `where id = ${req.body.user_id}`;
    switch (req.body.file_type) {

      case 'passport':
        obj = { passport_file_url: req.file.filename }
        break;
      case 'nationality':
        obj = { nationality_id_url: req.file.filename }
        break;
      case 'visa':
        obj = { visa_file_url: req.file.filename }
        break;
      case 'insurance':
        obj = { insurance_file_url: req.file.filename }
        break;
      case 'driving':
        obj = { driving_file_url: req.file.filename }
        break;
      case 'emergency':
        obj = { emergency_file_url: req.file.filename }
        break;
    }
    await commonModel.update('users', where, obj)

    var result = { status: true, message: resMessage.docUpdated };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('saveDocument', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }

}
//7
exports.getDocument = async function (req, res) {

  try {
    let where = `where id = ${req.body.user_id}`;

    let data = await commonModel.select('users', where, '', `id,passport_file_url,nationality_id_url,visa_file_url,insurance_file_url,driving_file_url,emergency_file_url`)
    // console.log(data)
    let object = {
      user_id: data[0].id,
      nationality_id_url: data[0].nationality_id_url ? nodeSiteUrl + `/files/` + data[0].nationality_id_url : "",
      visa_file_url: data[0].visa_file_url ? nodeSiteUrl + `/files/` + data[0].visa_file_url : "",
      insurance_file_url: data[0].insurance_file_url ? nodeSiteUrl + `/files/` + data[0].insurance_file_url : "",
      driving_file_url: data[0].driving_file_url ? nodeSiteUrl + `/files/` + data[0].driving_file_url : "",
      emergency_file_url: data[0].emergency_file_url ? nodeSiteUrl + `/files/` + data[0].emergency_file_url : "",
      passport_file_url: data[0].passport_file_url ? nodeSiteUrl + `/files/` + data[0].passport_file_url : "",
    }

    var result = { status: true, message: resMessage.dataFound, data: object };
    // console.log(result)
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('saveDocument', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }

}
//8
exports.getNotifications = async function (req, res) {

  try {
    let where = `where user_id = ${req.body.user_id} and status = 1 and type = 'user'`;
    let data = await commonModel.select('notification', where, 'order by created_at desc', 'id,user_id,title,body,icon_type,read_status,status,created_at')
    // console.log(data)
    if (data.length) {
      var result = { status: true, message: resMessage.dataFound, data: data };
    }
    else {
      var result = { status: false, message: resMessage.noNotification, data: [] };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getNotifications', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: [] });
  }

}
//9
exports.deleteNotifications = async function (req, res) {
  // console.log(req.body)
  try {
    let where = `where type = 'user' and user_id = ${req.body.user_id} and id IN(${req.body.notification_id})`;
    await commonModel.update('notification', where, { status: 0 })
    var result = { status: true, message: resMessage.notificationdeleted };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('deleteNotifications', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }

}
//10
exports.getIteneryDetail = async function (req, res) {
  // console.log(req.body)
  try {
    let where = `where user_id = ${req.body.user_id} AND is_deleted = 0`;
    let data = await commonModel.select('itenery', where)
    // console.log(data[0])
    if (data.length) {

      delete data[0].id
      delete data[0].user_id
      delete data[0].created_at
      delete data[0].updated_at
      data[0].emergency_contact = JSON.parse(data[0].emergency_contact)
      data[0].cities_traveled = JSON.parse(data[0].cities_traveled)
      var result = { status: true, message: resMessage.dataFound, data: data[0] };
    }
    else {
      var result = { status: false, message: resMessage.dataNotFound, data: {} };

    } res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getIteneryDetail', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }

}
//11
exports.addEditIteneryDetail = async function (req, res) {
  // console.log(req.body)

  try {

    let where = `where user_id = ${req.body.user_id} AND is_deleted = 0`;
    let data = await commonModel.select('itenery', where)
    if (data.length) {
      await commonModel.updateEscap('itenery', where, req.body)
    }
    else {
      // console.log('no length')
      await commonModel.insert('itenery', req.body)
    }
    let updateddata = await commonModel.select('itenery', where)
    // console.log(updateddata)
    var result = { status: true, message: resMessage.iteneryUpdated };
    res.send(result);
  } catch (err) {
    console.log(err)
    // commonModel.logger('addEditIteneryDetail', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }

}
//12
exports.getFaq = async function (req, res) {
  try {
    let where = `where is_deleted = 0`
    if (req.body.filter) {
      where += ` AND (question LIKE '%${req.body.filter}%' OR answer LIKE '%${req.body.filter}%')`
    }
    let data = await commonModel.select('faq', where, 'ORDER BY `faq`.`s_no` ASC', 'id,question,answer,created_at')
    if (data.length) {
      var result = { status: true, message: resMessage.dataFound, data: data };
    }
    else {
      var result = { status: false, message: resMessage.dataNotFound, data: [] };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getFaq', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: [] });
  }
}
//13
exports.getPolice = async function (req, res) {
  try {
    let data = await commonModel.select('police', 'where is_deleted = 0', '', 'id,address,contact_number,latitude,longitude,title,created_at,updated_at')
    if (data.length) {
      // console.log(data,"data")
      var result = { status: true, message: resMessage.dataFound, data: data };
    }
    else {
      var result = { status: true, message: resMessage.dataNotFound, data: {} };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getPolice', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }
}
//14
exports.getConsulates = async function (req, res) {
  try {
    let data = await commonModel.select('consulates', 'where is_deleted = 0', '', 'id,address,contact_number,latitude,longitude,title,created_at,updated_at')
    if (data.length) {
      var result = { status: true, message: resMessage.dataFound, data: data };
    }
    else {
      var result = { status: true, message: resMessage.dataNotFound, data: {} };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getConsulates', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }
}
//15
exports.getProfile = async function (req, res) {
  try {
    let where = `where id=${req.body.user_id}`
    let data = await commonModel.select('users', where)
    if (data.length) {
      let dataObject = {
        id: data[0].id,
        name: data[0].name ? data[0].name : '',
        email: data[0].email,
        dob: data[0].dob ? data[0].dob : '',
        device_token: data[0].device_token ? data[0].device_token : '',
        mobile: data[0].mobile ? data[0].mobile : '',
        emergency_contact_email: data[0].emergency_contact_email ? data[0].emergency_contact_email : '',
        emergency_contact_name: data[0].emergency_contact_name ? data[0].emergency_contact_name : '',
        emergency_contact_mobile: data[0].emergency_contact_mobile ? data[0].emergency_contact_mobile : '',
        emergency_contact_country_code: data[0].emergency_contact_country_code ? data[0].emergency_contact_country_code : '',        
        gender: data[0].gender ? data[0].gender : '',
        membership_type: data[0].membership_type ? data[0].membership_type : '',
        passport_expiry_date: data[0].passport_expiry_date ? data[0].passport_expiry_date : '',
        passport_issue_date: data[0].passport_issue_date ? data[0].passport_issue_date : '',
        passport_no: data[0].passport_no ? data[0].passport_no : '',
        place: data[0].place ? data[0].place : '',
        profile_image: nodeSiteUrl + '/users/' + data[0].profile_image,
        role: data[0].role ? data[0].role : '',
        user_address: data[0].user_address ? data[0].user_address : '',
        mobile:data[0].mobile,
        country_code:data[0].country_code,
      }
      var result = { status: true, message: resMessage.dataFound, data: dataObject };
    }
    else {
      var result = { status: true, message: resMessage.dataNotFound, data: {} };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('getProfile', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
  }
}
//16
exports.updateProfile = async function (req, res) {
  // console.log(req.file)
  try {
    let object = {
      name: req.body.name,
      email: req.body.email,
      passport_issue_date: req.body.passport_issue_date,
      passport_expiry_date: req.body.passport_expiry_date,
      user_address: req.body.user_address,
      emergency_contact_email: req.body.emergency_contact_email,
      emergency_contact_name: req.body.emergency_contact_name,
      emergency_contact_mobile: req.body.emergency_contact_mobile,
      emergency_contact_country_code: req.body.emergency_contact_country_code,      
      passport_no: req.body.passport_no,
      mobile: req.body.mobile,
      country_code: req.body.country_code,

    }
    if (req.file) {
      object.profile_image = req.file.filename
    }


    let where = `where id=${req.body.user_id}`
    await commonModel.update('users', where, object)

    var result = { status: true, message: resMessage.profileUpdated };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('updateProfile', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
}
//17
exports.readNotifications = async function (req, res) {
  try {
    let where = `where user_id = ${req.body.user_id} and type = 'user'`
    await commonModel.update('notification', where, { read_status: 1 })

    var result = { status: true, message: resMessage.notificationUpdated };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('newsUpdates', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
}
//18
exports.newsUpdates = async function (req, res) {
  try {
    let data = await commonModel.select('news', 'where is_deleted = 0', '', 'id,title,body,image,source,created_at')
    // console.log(data)
    for (let i = 0; i < data.length; i++) {
      data[i].image = nodeSiteUrl + '/news/' + data[i].image
    }

    var result = { status: true, message: resMessage.dataFound, data: data };
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('newsUpdates', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: [] });
  }
}
//19
exports.forgotPassword = async function (req, res) {

  try {
    let where = `where id = '${req.body.user_id}' AND status = 1`
    let checkId = await commonModel.select('users', where, '')
    let result = '';
    if (checkId.length) {
      var random = Math.floor(100000 + Math.random() * 900000);
      await commonModel.update('users', where, { otp: random })
      const mailOptions = {
        from: 'noreply@indianlegalhelp.com',
        to: `${checkId[0].email}`,
        subject: 'Sleep Guardian Reset Password',
        html: `<html>
<head>
  <style type="text/css">
    @media only screen and (min-width: 620px) {
      .u-row {
        width: 600px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
      .u-row .u-col-100 {
        width: 600px !important;
      }
    }
    @media (max-width: 620px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-row {
        width: 100% !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col>div {
        margin: 0 auto;
      }
    }
    body {
      margin: 0;
      padding: 0;
    }
    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }
    p {
      margin: 0;
    }
    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }
    * {
      line-height: inherit;
    }
    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }
    table,
    td {
      color: #000000;
    }

    @media (max-width: 480px) {
      #u_content_heading_1 .v-font-size {
        font-size: 22px !important;
      }

      #u_content_text_1 .v-container-padding-padding {
        padding: 25px 20px 70px !important;
      }

      #u_content_text_1 .v-text-align {
        text-align: justify !important;
      }
    }
  </style>


</head>

<body class="clean-body u_body" style="margin: 20;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">

  <table
    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;width:100%"
    cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">



          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="background-color: #013a33;height: 100%;width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

                      <table style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Open Sans',sans-serif;"
                              align="left">

                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">

                                    <img align="center" border="0"
                                      src="${nodeSiteUrl}/Indianlegalhelps-logo.png" alt="Image"
                                      title="Image"
                                      style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: 100px;float: none;width: 50%;max-width: 100px;"
                                      width="600" />

                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>


                    </div>
                  </div>

                </div>
              </div>
            </div>



            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row"
                style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div
                  style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                  <div class="u-col u-col-100"
                    style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                    <div
                      style="background-color: #013a33;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                      <div
                        style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                        <table id="u_content_heading_1" style="font-family:'Open Sans',sans-serif;" role="presentation"
                          cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody>
                            <tr>
                              <td class="v-container-padding-padding"
                                style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 20px;font-family:'Open Sans',sans-serif;"
                                align="left">

                                <h1 class="v-text-align v-font-size"
                                  style="margin: 0px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Rubik',sans-serif; font-size: 26px; ">
                                  <div><strong>You have requested to</strong><br /><strong>reset your password</strong>
                                  </div>
                                </h1>

                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table id="u_content_text_1" style="font-family:'Open Sans',sans-serif;" role="presentation"
                      cellpadding="0" cellspacing="0" width="100%" border="0">
                      <tbody>
                        <tr>
                          <td class="v-container-padding-padding"
                            style="overflow-wrap:break-word;word-break:break-word;padding:25px 50px 70px;font-family:'Open Sans',sans-serif;"
                            align="left">

                            <div class="v-text-align v-font-size"
                              style="color: #ffffff; line-height: 160%; text-align: justify; word-wrap: break-word;">


                              <p style="font-size: 14px; line-height: 160%;"><span
                                  style="font-size: 16px; line-height: 25.6px;"><strong>Hi, ${checkId[0].first_name}
                                    ${checkId[0].last_name}</strong></span>
                              </p>

                              <p style="font-size: 14px; line-height: 160%;"> </p>
                              <p style="font-size: 14px; line-height: 160%;"><strong
                                  style="font-size: 20px;">verification code : ${random}</strong></p>
                              <p style="font-size: 14px; line-height: 160%;"> </p>
                              <p style="font-size: 14px; line-height: 160%;"><strong>
                                  Thank you for choosing sleep Guardian. We cannot simply send you your old
                                  password,
                                  Use the following OTP to Reset your Password. OTP is valid for 2 minutes
                                </strong></p>
                                <br><br>
                                <p style="font-size: 14px; line-height: 160%;"><strong>Regards</strong></p>
                                  <p style="font-size: 14px; line-height: 160%;"> </p>
                                  <p style="font-size: 14px; line-height: 160%;"><strong>Team Sleep Guardian</strong></p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div
                        style="background-color: #153166;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                          <table style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td class="v-container-padding-padding"
                                  style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Open Sans',sans-serif;"
                                  align="left">

                                  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                    width="63%"
                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #95a5a6;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                    <tbody>
                                      <tr style="vertical-align: top">
                                        <td
                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <span>&#160;</span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                </td>
                              </tr>
                            </tbody>
                          </table>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>
               `
      };

      transport.sendMail(mailOptions, async function (err, info) {
      })
      result = { status: true, message: resMessage.mailSuccess };
    } else {
      result = { status: false, message: resMessage.userNotExist };
    }
    res.send(result);
  } catch (err) {
    console.log(err)
    commonModel.logger('forgotPassword', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
}
//20
exports.deleteUserAccount = async function (req, res) {
  try {
    await commonModel.update('chat', `where sender_id = '${req.body.user_id}' OR receiver_id= '${req.body.user_id}'`, { is_deleted: 1 })
    await commonModel.update('itenery', `where user_id = '${req.body.user_id}'`, { is_deleted: 1 })
    await commonModel.update('notification', `where type = 'user' and user_id = '${req.body.user_id}'`, { status: 1 })
    await commonModel.update('sos', `where user_id = '${req.body.user_id}'`, { is_deleted: 1 })
    await commonModel.update('users', `where id = '${req.body.user_id}'`, { status: 0,is_deleted : 1 })
    res.send({
      status: true,
      message: "User account has been successfully deleted"
    })

  } catch (err) {
    console.log(err)
    commonModel.logger('deleteUserAccount', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain })
  }
}
//21
exports.forgotpassword = async (req, res, next) => {
  try {

    var where = `where email = '${req.body.email}' AND role = 'user' AND status = 1`;
    let checkUser = await commonModel.select('users', where);
    let token
    if (!checkUser.length) {
      console.log('user length not found')
      var where = `where email = '${req.body.email}' AND status = 1`;
      checkUser = await commonModel.select('lawyers', where);
      if (!checkUser.length) {
        console.log('lawyer length not found')
        res.send({ status: false, message: resMessage.userNotExist });
        return
      } else {
        console.log('lawyer length found')
        token = jwt.sign({ user_id: checkUser[0].id }, 'secret', { expiresIn: '10 m' });
        await commonModel.insert('forgot_password', { auth_token: token, user_id: checkUser[0].id, user_type: 'lawyer' });
      }
    } else {
      console.log('user length found')
      token = jwt.sign({ user_id: checkUser[0].id }, 'secret', { expiresIn: '10 m' });
      await commonModel.insert('forgot_password', { auth_token: token, user_id: checkUser[0].id, user_type: 'user' });
    }



    const mailOptions = {
      from: 'noreply@indianlegalhelp.com',
      to: `${checkUser[0].email}`,
      subject: 'Indian Legal Helps Reset Password',
      html: `<html>
      <head>
        <style type="text/css">
        @media only screen and (min-width: 620px) {
          .u-row {
          width: 600px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }
          .u-row .u-col-100 {
          width: 600px !important;
          }
        }
        @media (max-width: 620px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: 100% !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col>div {
          margin: 0 auto;
          }
        }
        body {
          margin: 0;
          padding: 0;
        }
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
        p {
          margin: 0;
        }
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
        * {
          line-height: inherit;
        }
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
        table,
        td {
          color: #000000;
        }
        @media (max-width: 480px) {
          #u_content_heading_1 .v-font-size {
          font-size: 22px !important;
          }
          #u_content_text_1 .v-container-padding-padding {
          padding: 25px 20px 70px !important;
          }
          #u_content_text_1 .v-text-align {
          text-align: justify !important;
          }
        }
        </style>
      </head>
      <body class="clean-body u_body" style="margin: 20;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
        <table
        style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;width:100%"
        cellpadding="0" cellspacing="0">
        <tbody>
          <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
              style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
              <div class="u-col u-col-100"
                style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                <div style="background-color: #013a33;height: 100%;width: 100% !important;">
                <div
                  style="border: 2px solid #e0b160; box-sizing: border-box; height: 100%; padding: 0px;">
                  <table style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0"
                  cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                    <td class="v-container-padding-padding"
                      style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Open Sans',sans-serif;"
                      align="left">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
                        <img align="center" border="0"
                          src="${nodeSiteUrl}/Indianlegalhelps-logo.png" alt=" logo"
                          title="Image"
                          style="outline: none;text-decoration: none;
                          -ms-interpolation-mode: bicubic;clear: both;
                          display: inline-block !important;border: none;
                          height: 100px;float: none;width: 50%;max-width: 100px;"
                          width="600" />
                        </td>
                      </tr>
                      </table>
                    </td>
                    </tr>
                  </tbody>
                  </table>
                </div>
                </div>
              </div>
              </div>
            </div>
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                <div class="u-col u-col-100"
                style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                <div
                  style="background-color: #013a33;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                  <div
                  style="border: 2px solid #e0b160;border-top: 0px; box-sizing: border-box; height: 100%; padding: 0px;">
                  <table id="u_content_heading_1" style="font-family:'Open Sans',sans-serif;" role="presentation"
                    cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                    <tr>
                      <td class="v-container-padding-padding"
                      style="overflow-wrap:break-word;word-break:break-word;padding:50px 10px 20px;font-family:'Open Sans',sans-serif;"
                      align="left">
                      <h1 class="v-text-align v-font-size"
                        style="margin: 0px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Rubik',sans-serif; font-size: 26px; ">
                        <div><strong>You have requested to</strong><br /><strong>reset your password</strong>
                        </div>
                      </h1>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                  <table id="u_content_text_1" style="font-family:'Open Sans',sans-serif;" role="presentation"
                    cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                    <tr>
                      <td class="v-container-padding-padding"
                      style="overflow-wrap:break-word;word-break:break-word;padding:20px 50px 40px;font-family:'Open Sans',sans-serif;"
                      align="left">
                      <div class="v-text-align v-font-size"
                        style="color: #ffffff; line-height: 160%; text-align: justify; word-wrap: break-word;">
                        <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px;
                                ">
                          <strong>Hi, ${checkUser[0].name.charAt(0).toUpperCase() + checkUser[0].name.slice(1)} </strong>
                        </span>
                        </p>
                        <p style="font-size: 14px; line-height: 100%;"> </p>
                        <p style="font-size: 14px; line-height: 160%;"><strong>
                          Thank you for choosing Indian Legal Helps. We cannot simply send you your old
                          password,
                          <br>
                          Use the following Link given below to reset your password
                        </strong></p>
                        <a href="${process.env.RESET_PASSWORD_URL}${token}" style="color: #0d86ec;">Click here</a>
                        <br><br>
                        <p style="font-size: 14px; line-height: 160%;"><strong>Regards</strong></p>
                        <p style="font-size: 14px; line-height: 160%;"> </p>
                        <p style="font-size: 14px; line-height: 160%;"><strong>Indian Legal Helps</strong>
                        </p>
                      </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
                </div>
              </div>
              </div>
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row"
                style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div
                  style="background-color: #013a33;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                  <div
                    style="border: 2px solid #e0b160;border-top: 0px; box-sizing: border-box; height: 100%; padding: 0px">
                    <table style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0"
                    cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                      <td class="v-container-padding-padding"
                        style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Open Sans',sans-serif;"
                        align="left">
                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                        width="63%"
                        style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #95a5a6;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                        <tbody>
                          <tr style="vertical-align: top">
                          <td
                            style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                            <span>&#160;</span>
                          </td>
                          </tr>
                        </tbody>
                        </table>
                      </td>
                      </tr>
                    </tbody>
                    </table>
                  </div>
                  </div>
                </div>
                </div>
              </div>
          </td>
          </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
    };
    // console.log(mailOptions.html)
    transport.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err)
      }

    })
    var result = { status: true, message: 'Reset password link has been sent to your email address' };



    res.send(result);

  }
  catch (err) {
    console.log(err)
    commonModel.logger('userforgotpassword', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }
};
//22
exports.resetpassword = async function (req, res) {

  try {
    let whereauth = "where auth_token = '" + req.body.auth_token + "'"
    await commonModel.delete('forgot_password', whereauth)

    let where = "where id = '" + req.body.user_id + "'"
    await commonModel.update('users', where, { password: cryptr.encrypt(req.body.password) })

    res.send({ status: true, message: resMessage.updatePassword });

  } catch (err) {
    console.log(err)
    commonModel.logger('resetpassword', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain });
  }

}
//23
exports.buySubscription = async function (req, res) {
  try {
    // user_id,amount,type,payment_id
    let object = {
      user_id: req.body.user_id,
      type: req.body.type,
      amount: req.body.amount,
      payment_id: req.body.payment_id,
      created_at: moment().format('YYYY-MM-DD 00:00:00'),
      expiry_date: moment().add(1, 'year').format('YYYY-MM-DD 00:00:00')
    }

    let payResult = await commonModel.insert('payment', object)
    await commonModel.update('users', `where id = ${req.body.user_id}`, { membership_type: req.body.type })

    console.log()
    if (payResult.insertId) {
      let data = await commonModel.select('payment', `where id = ${payResult.insertId}`)
      var result = { status: true, message: resMessage.paymentsuccess, data: data[0] }
    }
    else {
      var result = { status: false, message: resMessage.pleaseTryAgain, data: {} }
    }
    res.send(result)
  } catch (err) {
    console.log(err)
    commonModel.logger('buySubscription', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} })

  }
}
//24
exports.travelPlan = async function (req, res) {
  try {
    let object = {
      user_id: req.body.user_id,
      duration: req.body.duration,
      duration_unit: req.body.duration_unit,
      arrival_reason: req.body.arrival_reason,
    }
    let result = await commonModel.select('travel_plan', `where user_id = ${req.body.user_id}`)
    if (result.length){
      await commonModel.update('travel_plan',`where user_id = ${req.body.user_id}`, object)
    }else{
      await commonModel.insert('travel_plan', object)
    }
    res.send({ status: true, message: resMessage.datainserted })
  } catch (err) {
    console.log(err)
    commonModel.logger('travelPlan', req, err);
    res.send({ status: false, message: resMessage.pleaseTryAgain })

  }
}
//25
exports.deleteUserAccountWebView = async (req, res) => {
  try {
      let webPage = {
          pageName: "Indian Legal Helps Delete User"
      }
      res.render('./deleteUserAccountWeb', { webPage: webPage })
  } catch (error) {
      console.log('delete User Account Web Link ERROR', error);
  }
}
//26
exports.deleteUserAccountWebLink = async (req, res) => {
  try {
      var where = ` WHERE email = '${req.body.email}' AND is_deleted = 0`;
      var checkUser = await commonModel.select('users', where);
      var checkLawyer = await commonModel.select('lawyers', where);

      if (checkUser.length) {
          let pass = cryptr.decrypt(checkUser[0].password)
          if (pass == req.body.password) {

            await commonModel.update('chat', `where sender_id = '${checkUser[0].id}' OR receiver_id= '${checkUser[0].id}'`, { is_deleted: 1 })
            await commonModel.update('itenery', `where user_id = '${checkUser[0].id}'`, { is_deleted: 1 })
            await commonModel.update('notification', `where type = 'user' and user_id = '${checkUser[0].id}'`, { status: 0 })
            await commonModel.update('sos', `where user_id = '${checkUser[0].id}'`, { is_deleted: 1 })
            await commonModel.update('users', `where id = '${checkUser[0].id}'`, { status: 0,is_deleted : 1 })
              var result = { status: true, message: 'Account has been deleted' };
          }
          else {
              var result = { status: false, message: 'Invalid password', data: {} };
          }
      }else if(checkLawyer.length){

        let pass = cryptr.decrypt(checkLawyer[0].password)
        if (pass == req.body.password) {

        await commonModel.update('lawyers', `where id = ${checkLawyer[0].id}`, { is_deleted: 1 })
        await commonModel.runSQLquery('UPDATE `sos` SET `lawyer_id` = NULL WHERE `lawyer_id` = '+checkLawyer[0].id+'')
      }
      else {
          var result = { status: false, message: 'Invalid password', data: {} };
      }

      }
      else {
          var result = { status: false, message: 'User Not Found.', data: {} };
      }
      res.send(result);

  }
  catch (err) {
      console.log(err)
      res.send({ status: false, message: 'Please try again.', data: {} });
  }
}



