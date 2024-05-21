const Joi = require('joi');

loginValidation = (req, res, next) => { 
    const schema = Joi.object({
        email: Joi.string().required().regex(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/).min(1).messages({ 'string.pattern.base': 'email is invalid' }),
        password: Joi.string().required().min(1),
        device_token: Joi.optional(),
        user_type: Joi.string().required().custom(userTypeValidation).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),
        device_type: Joi.string().required().custom(deviceTypeValidation).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),

    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};

registerValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required().min(1),
        email: Joi.string().required().regex(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/).min(1).messages({ 'string.pattern.base': 'email is invalid' }),
        password: Joi.string().required().min(1),
        device_token: Joi.required(),
        mobile: Joi.optional(),
        country_code: Joi.optional(),
        user_type: Joi.string().required().min(1),
        device_type: Joi.string().required().custom(deviceTypeValidation).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
updateDeviceToken = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        device_token: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
logout = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
saveDocument = (req, res, next) => {
    console.log(req.body, "body")
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        file_type: Joi.string().required().custom(fileNameValidation).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getDocument = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
getNotifications = (req, res, next) => {
    // console.log(req.body,"dddd")
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        filter: Joi.any().optional()
    }).options({ allowUnknown: true });
    validateRequestArr(req, next, schema, res, req.body);
};
deleteNotifications = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        notification_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getIteneryDetail = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
addEditIteneryDetail = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        date_of_entry: Joi.string().required().min(1),
        date_of_exit: Joi.string().required().min(1),
        port_of_entry: Joi.string().required().min(1),
        port_of_exit: Joi.string().required().min(1),
        cities_traveled: Joi.required(),
        // city_1: Joi.string().required().min(1),
        // city_2: Joi.required(),
        // city_3: Joi.required(),
        // city_4: Joi.required(),
        // city_5: Joi.required(),
        // city_1_entry_date: Joi.string().required().min(1),
        // city_2_entry_date: Joi.required(),
        // city_3_entry_date: Joi.required(),
        // city_4_entry_date: Joi.required(),
        // city_5_entry_date: Joi.required(),
        // city_1_exit_date: Joi.string().required().min(1),
        // city_2_exit_date: Joi.required(),
        // city_3_exit_date: Joi.required(),
        // city_4_exit_date: Joi.required(),
        // city_5_exit_date: Joi.required(),
        comment: Joi.string().required().min(1),
        emergency_email: Joi.string().required().min(1),
        emergency_name: Joi.string().required().min(1),
        emergency_address: Joi.string().required().min(1),
        emergency_contact: Joi.required(),
        // emergency_mobile_1: Joi.string().required().min(1),
        // emergency_mobile_2: Joi.required(),
        // emergency_mobile_3: Joi.required(),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
updateProfile = (req, res, next) => {
    console.log(req.body)
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        name: Joi.string().required().min(1),
        mobile: Joi.string().required().min(1),
        country_code: Joi.string().required().min(1),
        email: Joi.string().required().regex(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/).min(1).messages({ 'string.pattern.base': 'email is invalid' }),
        passport_issue_date: Joi.string().required().min(1),
        passport_no: Joi.string().required().min(1),
        passport_expiry_date: Joi.string().required().min(1),
        user_address: Joi.string().required().min(1),
        emergency_contact_email: Joi.string().required().min(1),
        emergency_contact_name: Joi.string().required().min(1),
        emergency_contact_mobile: Joi.string().required().min(1),
        emergency_contact_country_code: Joi.string().required().min(1),
        


    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
hitSos = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        accuracy: Joi.string().required().min(1),
        latitude: Joi.string().required().min(1),
        longitude: Joi.string().required().min(1),
        sos_status: Joi.string().required().min(1),
        sos_date_time: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
newsUpdates = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1)
    }).options({ allowUnknown: true });
    validateRequestArr(req, next, schema, res, req.body);
};
readNotifications = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1)
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};







adminloginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().min(1),
        password: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
admingetpolice = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
addEditPoliceData = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().required().min(1),
        longitude: Joi.number().required().min(1),
        latitude: Joi.number().required().min(1),
        contact_number: Joi.string().required().min(1),
        address: Joi.string().required().min(1),
        user_id: Joi.number().required().min(1),
        police_id: Joi.optional(),

    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
deletePoliceData = (req, res, next) => {

    const schema = Joi.object({
        police_id: Joi.optional()
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
admingetConsulate = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
addEditConsulateData = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().required().min(1),
        longitude: Joi.number().required().min(1),
        latitude: Joi.number().required().min(1),
        contact_number: Joi.string().required().min(1),
        address: Joi.string().required().min(1),
        user_id: Joi.number().min(1),
        consulate_id: Joi.optional(),

    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
deleteConsulateData = (req, res, next) => {
    const schema = Joi.object({
        consulate_id: Joi.required()
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
deletefaqData = (req, res, next) => {
    const schema = Joi.object({
        faq_id: Joi.required()
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
addEditfaq = (req, res, next) => {
    const schema = Joi.object({
        s_no: Joi.optional(),
        faq_id: Joi.optional(),
        question: Joi.string().required().min(1),
        answer: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
addEditNews = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().required().min(1),
        body: Joi.string().required().min(1),
        source: Joi.string().required().min(1),
        date: Joi.string().required().min(1),
        news_id: Joi.optional(),

    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
deleteNewsData = (req, res, next) => {
    const schema = Joi.object({
        news_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getLatestChatList = (req, res, next) => {
    const schema = Joi.object({
        admin_id: Joi.number().required().min(1),
        filter: Joi.any().optional()
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getChats = (req, res, next) => {
    const schema = Joi.object({
        admin_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
sendNotification = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        title: Joi.string().required().min(1),
        body: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
deleteUserAccount = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
buySubscription = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        amount: Joi.string().required().min(1),
        type: Joi.string().required().custom(paymentTypeValidation).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),
        payment_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
acceptSos = (req, res, next) => {
    const schema = Joi.object({
        sos_id: Joi.number().required().min(1),
        lawyer_id: Joi.number().required().min(1),

    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getAllOnSos = (req, res, next) => {
    const schema = Joi.object({
        lawyer_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestArr(req, next, schema, res, req.body);
};
deleteLawyerAccount = (req, res, next) => {
    const schema = Joi.object({
        lawyer_id: Joi.required(),
    }).options({ allowUnknown: true });
    validateRequestArr(req, next, schema, res, req.body);
};
getLawyerPlofile = (req, res, next) => {
    const schema = Joi.object({
        lawyer_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
updateContactDetails = (req, res, next) => {
    const schema = Joi.object({
        admin_id: Joi.number().required().min(1),
        call_number: Joi.number().required().min(1),
        text_number: Joi.number().required().min(1),
        whatsapp_number: Joi.number().required().min(1),
        rzp_key: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
getContactDetails = (req, res, next) => {
    const schema = Joi.object({
        admin_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
getLawyer = (req, res, next) => {
    const schema = Joi.object({
        admin_id: Joi.number().required().min(1),
        filter: Joi.optional()
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
addEditLawyer = (req, res, next) => {
    const schema = Joi.object({
        lawyer_id: Joi.optional(),
        name: Joi.string().required().min(1),
        email: Joi.string().required().min(1),
        password: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
changeLawyerStatus = (req, res, next) => {
    const schema = Joi.object({
        lawyer_id: Joi.number().required().min(1),
        status: Joi.number().required(),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
getadminbyauth = (req, res, next) => {
    const schema = Joi.object({
        auth_token: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
forgotpassword = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
travelPlan = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
        duration: Joi.number().required().min(1),
        duration_unit: Joi.string().required().custom(travelPlanUnit).options({ messages: { 'any.invalid': '{{#message}}' } }).min(1),
        arrival_reason: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequestObj(req, next, schema, res, req.body);
};
function validateRequest(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors })
    } else {
        req.body = value;
        next();
    }
}
function validateRequestObj(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors, data: {} })
    } else {
        req.body = value;
        next();
    }
}
function validateRequestArr(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors, data: [] })
    } else {
        req.body = value;
        next();
    }
}

const userTypeValidation = (value, helpers) => {
    if (value !== 'user' && value !== 'lawyer') {
        return helpers.error('any.invalid', { message: 'user_type is invalid' });
    }
    return value;
};
const travelPlanUnit = (value, helpers) => {
    if (value !== 'days' && value !== 'months' && value !== 'years') {
        return helpers.error('any.invalid', { message: 'The duration_unit must be specified in days, months, or years.' });
    }
    return value;
};
const deviceTypeValidation = (value, helpers) => {
    if (value !== 'ios' && value !== 'android') {
        return helpers.error('any.invalid', { message: 'device_type is invalid' });
    }
    return value;
};
const paymentTypeValidation = (value, helpers) => {
    if (value !== 'basic' && value !== 'advance') {
        return helpers.error('any.invalid', { message: 'type is invalid' });
    }
    return value;
};
const fileNameValidation = (value, helpers) => {

    if (value !== 'passport' && value !== 'nationality' && value !== 'visa' && value !== 'insurance' && value !== 'driving' && value !== 'emergency') {
        return helpers.error('any.invalid', { message: 'file_type is invalid' });
    }
    return value;
};

const CommonMiddleValidation = {
    loginValidation,
    registerValidation,
    updateDeviceToken,
    logout,
    saveDocument,
    getDocument,
    getNotifications,
    deleteNotifications,
    getIteneryDetail,
    addEditIteneryDetail,
    updateProfile,
    hitSos,
    newsUpdates,
    readNotifications,
    acceptSos,
    getAllOnSos,
    getLawyerPlofile,
    deleteUserAccount,
    deleteLawyerAccount,
    buySubscription,
    travelPlan,
    forgotpassword,
    adminloginValidation,
    admingetpolice,
    addEditPoliceData,
    deletePoliceData,
    admingetConsulate,
    addEditConsulateData,
    deleteConsulateData,
    deletefaqData,
    addEditfaq,
    addEditNews,
    deleteNewsData,
    getLatestChatList,
    getChats,
    sendNotification,
    updateContactDetails,
    getContactDetails,
    getadminbyauth,
    getLawyer,
    addEditLawyer,
    changeLawyerStatus







}
module.exports = CommonMiddleValidation;
