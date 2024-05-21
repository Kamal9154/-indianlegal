var express = require('express');
const commonMiddleValidation = require('../helpers/common-middle-validation');
const userController = require('../controllers/user-controller')
var router = express.Router();
// const cronController = require('../controllers/cron-controller')
var resMessage = require('../helpers/response-message')
const commonModel = require('../models/common-model')
const adminController = require('../controllers/admin-controller')
const lawyerController = require('../controllers/lawyer-controller')
const chatController = require('../controllers/chat-controller')
var jwt = require('jsonwebtoken');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/files/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
});
const storage2 = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/users/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
});
const storageNews = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/news/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'application/pdf' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'multipart/form-data') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}
const userUpload = multer({ storage: storage, fileFilter: fileFilter });
const userprofileUpload = multer({ storage: storage2, fileFilter: fileFilter });
const neswUpload = multer({ storage: storageNews, fileFilter: fileFilter });

/* ADMIN STARTS */
router.post('/admin/forgotpassword', [commonMiddleValidation.forgotpassword], adminController.forgotpassword);
router.post('/admin/login', [commonMiddleValidation.adminloginValidation], adminController.login)
router.post('/admin/deletetoken', adminController.deletetoken)
router.post('/admin/resetpassword', adminController.resetpassword)
router.post('/admin/getPoliceData', [commonMiddleValidation.admingetpolice, adminAuthentication], adminController.getPoliceData)
router.post('/admin/addEditPoliceData', [commonMiddleValidation.addEditPoliceData, adminAuthentication], adminController.addEditPoliceData)
router.post('/admin/deletePoliceData', [commonMiddleValidation.deletePoliceData, adminAuthentication], adminController.deletePoliceData)
router.post('/admin/getConsulateData', [commonMiddleValidation.admingetConsulate, adminAuthentication], adminController.getConsulateData)
router.post('/admin/addEditConsulateData', [commonMiddleValidation.addEditConsulateData, adminAuthentication], adminController.addEditConsulateData)
router.post('/admin/deleteConsulateData', [commonMiddleValidation.deleteConsulateData, adminAuthentication], adminController.deleteConsulateData)
router.post('/admin/getFaq', [adminAuthentication], adminController.getFaq)
router.post('/admin/addEditfaq', [commonMiddleValidation.addEditfaq, adminAuthentication], adminController.addEditfaq)
router.post('/admin/deletefaqData', [commonMiddleValidation.deletefaqData, adminAuthentication], adminController.deletefaqData)
router.post('/admin/getNewsData', [adminAuthentication], adminController.getNewsData)
router.post('/admin/addEditNews', neswUpload.single('image'), [commonMiddleValidation.addEditNews, adminAuthentication], adminController.addEditNews)
router.post('/admin/deleteNewsData', [commonMiddleValidation.deleteNewsData, adminAuthentication], adminController.deleteNewsData)
router.post('/admin/getLatestChatList', [commonMiddleValidation.getLatestChatList, adminAuthentication], chatController.getLatestChatList)
router.post('/admin/getSosChatList', [adminAuthentication], chatController.getSosChatList)
router.post('/admin/getAllChatList', [adminAuthentication], chatController.getAllChatList)
router.post('/admin/getChats', [adminAuthentication], chatController.getChats)
router.post('/admin/updateSeenByAdmin', [adminAuthentication], chatController.updateSeenByAdmin)
router.post('/admin/getUserProfile', [adminAuthentication], adminController.getUserProfile)
router.post('/admin/getNotification', [adminAuthentication], userController.getNotifications)
router.post('/admin/sendNotification', [commonMiddleValidation.sendNotification, adminAuthentication], adminController.sendNotification)
router.post('/admin/updateContactDetails', [commonMiddleValidation.updateContactDetails, adminAuthentication], adminController.updateContactDetails)
router.post('/admin/getContactDetails', [commonMiddleValidation.getContactDetails, adminAuthentication], adminController.getContactDetails)
router.post('/admin/getadminbyauth', [commonMiddleValidation.getadminbyauth], adminController.getadminbyauth)
router.post('/admin/getAdminNotificatonList',[adminAuthentication], chatController.getAdminNotificatonList)
router.post('/admin/seenAdminNotification',[adminAuthentication], chatController.seenAdminNotification)

/* ADMIN ENDS */


/* USER STARTS */
router.post('/api/ilh-1628437-registration', [commonMiddleValidation.registerValidation], userController.registration)
router.post('/api/ilh-1628437-login', [commonMiddleValidation.loginValidation], userController.login)
router.post('/api/ilh-1628437-update-device-token', [commonMiddleValidation.updateDeviceToken, requiredUserAuthentication], userController.updateDeviceToken)
router.post('/api/ilh-1628437-logout', [commonMiddleValidation.logout], userController.logout)
router.post('/api/ilh-1628437-dashboard', [commonMiddleValidation.logout, requiredUserAuthentication], userController.dashboard)
router.post('/api/ilh-1628437-save-document', userUpload.single('file'), [commonMiddleValidation.saveDocument, requiredUserAuthentication], userController.saveDocument)
router.post('/api/ilh-1628437-get-document', [commonMiddleValidation.getDocument, requiredUserAuthentication], userController.getDocument)
router.post('/api/ilh-1628437-get-notification', [commonMiddleValidation.getNotifications, requiredUserAuthentication], userController.getNotifications)
router.post('/api/ilh-1628437-delete-notification', [commonMiddleValidation.deleteNotifications, requiredUserAuthentication], userController.deleteNotifications)
router.post('/api/ilh-1628437-read-notifications', [commonMiddleValidation.readNotifications, requiredUserAuthentication], userController.readNotifications)
router.post('/api/ilh-1628437-get-iteneryDetail', [commonMiddleValidation.getIteneryDetail, requiredUserAuthentication], userController.getIteneryDetail)
router.post('/api/ilh-1628437-addedit-iteneryDetail', [commonMiddleValidation.addEditIteneryDetail, requiredUserAuthentication], userController.addEditIteneryDetail)
router.post('/api/ilh-1628437-get-faq', [commonMiddleValidation.getNotifications, requiredUserAuthentication], userController.getFaq)
router.post('/api/ilh-1628437-get-profile', [commonMiddleValidation.getDocument, requiredUserAuthentication], userController.getProfile)
router.post('/api/ilh-1628437-get-police', [commonMiddleValidation.getNotifications, requiredUserAuthentication], userController.getPolice)
router.post('/api/ilh-1628437-get-consulates', [commonMiddleValidation.getNotifications, requiredUserAuthentication], userController.getConsulates)
router.post('/api/ilh-1628437-update-profile', userprofileUpload.single('profile_image'), [commonMiddleValidation.updateProfile, requiredUserAuthentication], userController.updateProfile)
router.post('/api/ilh-1628437-get-news-updates', [commonMiddleValidation.newsUpdates, requiredUserAuthentication], userController.newsUpdates)
router.post('/api/ilh-1628437-hit-sos', [commonMiddleValidation.hitSos, requiredUserAuthentication], lawyerController.hitSos)
router.post('/api/ilh-1628437-delete-user-account', [commonMiddleValidation.deleteUserAccount, requiredUserAuthentication], userController.deleteUserAccount)
router.post('/api/ilh-1628437-forgot-password', [commonMiddleValidation.forgotpassword], userController.forgotpassword);
router.post('/api/ilh-1628437-buy-subscription', [commonMiddleValidation.buySubscription, requiredUserAuthentication], userController.buySubscription);
router.post('/api/ilh-1628437-add-travel_plan', [commonMiddleValidation.travelPlan, requiredUserAuthentication], userController.travelPlan);
router.post('/api/ilh-1628437-delete-user-account-web-link',userController.deleteUserAccountWebLink);
router.get('/api/ilh-1628437-delete-user-account-web-link',userController.deleteUserAccountWebView);


/* USER ENDS */

/* LAWYER STARTS */
router.post('/api/ilh-1628437-get-lawyer-profile', [commonMiddleValidation.getLawyerPlofile, requiredlawyerAuthentication], lawyerController.getlawyerProfile)
router.post('/api/ilh-1628437-logout-lawyer', [commonMiddleValidation.getLawyerPlofile], lawyerController.logoutLawyer)
router.post('/api/ilh-1628437-delete-lawyer-account', [commonMiddleValidation.deleteLawyerAccount, requiredlawyerAuthentication], lawyerController.deleteLawyerAccount)
router.post('/admin/getLawyer', [commonMiddleValidation.getLawyer, adminAuthentication], lawyerController.getLawyer);
router.post('/admin/addEditLawyer', [commonMiddleValidation.addEditLawyer, adminAuthentication], lawyerController.addEditLawyer);
router.post('/admin/changeLawyerStatus', [commonMiddleValidation.changeLawyerStatus, adminAuthentication], lawyerController.changeLawyerStatus);
router.post('/admin/deleteLawyer', [commonMiddleValidation.deleteLawyerAccount, adminAuthentication], lawyerController.deleteLawyerAccount);
/* LAWYER ENDS */


/* MOBILE ENDS */





async function requiredUserAuthentication(req, res, next) {
    // console.log(req.body)
    // console.log(req.headers)
    try {
        var where = "where is_deleted = 0 AND is_deleted = 0 AND id ='" + req.body.user_id + "'";
        var checkUser = await commonModel.select('users', where);
        console.log(checkUser)
        if (checkUser.length) {
            if (checkUser[0].status == 1) {
                if (req.headers.authorization && checkUser[0].auth_token == req.headers.authorization) {
                    next();
                }
                else {
                    var result = { status: false, message: resMessage.wrongAuth }
                    res.send(result);
                }
            }
            else {
                var result = { status: false, message: resMessage.userBlocked }
                res.send(result);
            }
        }
        else {
            var result = { status: false, message: resMessage.userNotFound }
            res.send(result);
        }
    }
    catch (err) {
        console.log(err)
    }
}
async function requiredlawyerAuthentication(req, res, next) {
    try {
        var where = "where is_deleted = 0 AND id ='" + req.body.lawyer_id + "'";
        var checkUser = await commonModel.select('lawyers', where);
        if (checkUser.length) {
            if (checkUser[0].status == 1) {
                if (req.headers.authorization && checkUser[0].auth_token == req.headers.authorization) {
                    next();
                }
                else {
                    var result = { status: false, message: resMessage.wrongAuth }
                    res.send(result);
                }
            }
            else {
                var result = { status: false, message: resMessage.userBlocked }
                res.send(result);
            }
        }
        else {
            var result = { status: false, message: resMessage.userNotFound }
            res.send(result);
        }
    }
    catch (err) {
        console.log(err)
    }
}
async function adminAuthentication(req, res, next) {
    try {
        if (!req.headers.authorization) {
            var result = { status: false, message: 'Wrong authorization' }
            return res.send(result);
        }
        let authToken = req.headers.authorization.split("Bearer_")[1]
        var decoded_token = await jwt.verify(authToken, 'secret', function (err, decoded) {
            if (err) {
                return false;
            }
            else {
                return true;
            }
        })
        if (decoded_token == true) {

            var where = `where auth_token='${req.headers.authorization}'`;
            var checkUser = await commonModel.select('admin_auth', where);
            if (checkUser[0]) {
                next();
            }
            else {

                await commonModel.delete('admin_auth', where)
                var result = { status: false, message: 'Wrong authorization' }
                res.send(result);
            }
        }
        else {
            var where = `where auth_token='${req.headers.authorization}'`;
            await commonModel.delete('admin_auth', where)
            var result = { status: false, message: 'Session is expired please login again' }
            res.send(result);
        }
    }
    catch (err) {
        console.log(err)
        var where = "where `auth_token`='" + req.headers.authorization + "'";
        await commonModel.delete('admin_auth', where)
        var result = { status: false, message: 'Session is expired please login again' }
        res.send(result)
    }
}
module.exports = router;
