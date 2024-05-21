const commonDbModel = {};
const commonFun = require('../helpers/dbConfig');

commonDbModel.select = (table, where, orderBy, columns) => {
    let que = ''
    if (columns) {
        que = `SELECT ${columns} FROM ${table} `;
    }
    else {
        que = `SELECT * FROM ${table} `;
    }
    if (where) que += `${where} `
    if (orderBy) que += `${orderBy} `
    console.log(que)
    return commonFun.runSqlQueryWithData(que);
}
commonDbModel.insert = (table, data) => {
    var que = `INSERT INTO ${table} SET ?`;
    return commonFun.runSqlQueryWithData(que, data);
}
commonDbModel.insertEscap = (table, data) => {
    // var que = `INSERT INTO ${table} SET ?`;

    return commonFun.runSqlQueryWithDataforInsert(table, data);
}
commonDbModel.update = (table, where, data) => {
    var columns_values_arr = [];
    for (let [key, value] of Object.entries(data)) {
        var columns_values = ` ${key} = "${value}" `;
        columns_values_arr.push(columns_values);
    }
    var que = `UPDATE ${table} set ${columns_values_arr} ${where} `;
// console.log(que)
    return commonFun.runSqlQueryWithData(que, data);
}
commonDbModel.updateEscap = (table, where, data) => {
    // var columns_values_arr = [];
    // for (let [key, value] of Object.entries(data)) {
    //     var columns_values = ` ${key} = "${value}" `;
    //     columns_values_arr.push(columns_values);
    // }
    // var que = `UPDATE ${table} set ${columns_values_arr} ${where} `;
    // console.log(que, "update")
    // return commonFun.runSqlQueryWithData(que, data);
    return commonFun.runSqlQueryWithDataforUpdate(table, where, data);
}

commonDbModel.logger = (api, request, error) => {

    // var userAgent = request.get('User-Agent');
    // const result_os = detector.detect(userAgent);
    // os = JSON.stringify(result_os.os);
    os = '';
    var logObject = {
        device_details: os,
        api_function: api,
        request_detail: JSON.stringify(request.body),
        log_detail: JSON.stringify(error)
    };
    return commonFun.logger(logObject);
}

commonDbModel.delete = (table, where) => {
    var que = `DELETE FROM ${table} ${where}`;
    return commonFun.runSQLquery(que);
}

commonDbModel.getUserList = (req) => {
    let que = "SELECT * FROM users WHERE 1";
    if (req.body.filter) {
        que += " && (last_name LIKE '%" + req.body.filter + "%' OR first_name LIKE '%" + req.body.filter + "%' OR email LIKE '%" + req.body.filter + "%' OR concat(users.first_name,users.last_name) LIKE '%" + req.body.filter.replace(/ /g, "") + "%')";
    }
    if (req.body.sfilter) {
        que += " && status LIKE '%" + req.body.sfilter + "%'";
    }

    que += ' ORDER BY `id` DESC';
    return commonFun.runSQLquery(que)
}
commonDbModel.getUserChart = (year) => {
    let que = `SELECT MONTH(created_at) as month , COUNT(id) as count FROM users WHERE YEAR(created_at) = '${year}' GROUP BY MONTH(created_at)`;
    return commonFun.runSQLquery(que)
}
commonDbModel.getUserAndLawyer = (user) => {
    let que = `SELECT users.name AS 'user', lawyers.name as 'lawyer' FROM users LEFT JOIN lawyers ON users.lawyer_id = lawyers.id WHERE users.is_deleted = 0 AND users.id = ${user}`;
    return commonFun.runSQLquery(que)
}
commonDbModel.userCount = () => {
    let que = `SELECT COUNT(users.id) as user  FROM users`
    return commonFun.runSQLquery(que)
}
commonDbModel.selectLatestChatlist = (admin_id,LikeData) => {
    let que = `SELECT COALESCE(sos.sos_status, 0) AS sos_status, chat.id,chat.room_id,chat.sender_id,chat.receiver_id,users.name,users.id as user_id,users.profile_image, 

    (SELECT chat.message FROM chat WHERE chat.room_id = CONCAT( '${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY chat.created_at DESC LIMIT 1) AS last_message, 

    (SELECT chat.message_type FROM chat WHERE chat.room_id = CONCAT( '${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY chat.created_at DESC LIMIT 1) AS message_type,

    (SELECT chat.created_at FROM chat WHERE chat.room_id = CONCAT( '${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY chat.created_at DESC LIMIT 1) AS created_at, 

    (SELECT COUNT(chat.message) FROM chat WHERE chat.sender_id = users.id AND chat.seen_status  = 0 AND chat.is_deleted = 0) AS unseen_message 
    
    FROM chat LEFT JOIN users ON chat.sender_id = users.id OR chat.receiver_id = users.id 
    LEFT JOIN sos on users.id = sos.user_id 
    WHERE users.is_deleted = 0 AND users.role = 'user' ${LikeData} GROUP BY chat.room_id `
    // console.log('selectLatestChatlist',que)
    return commonFun.runSQLquery(que)
}
commonDbModel.selectSosChatlist = (admin_id, LikeData) => {
 let que = `SELECT sos.sos_status ,chat1.id,chat1.room_id,chat1.sender_id,chat1.receiver_id,users.profile_image,users.id as user_id,users.name,

    (SELECT chat.message FROM chat WHERE chat.room_id = CONCAT('${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as last_message,

    (SELECT chat.created_at FROM chat WHERE chat.room_id = CONCAT('${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as created_at,

    (SELECT chat.message_type FROM chat WHERE chat.room_id = CONCAT( '${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY chat.created_at DESC LIMIT 1) AS message_type,
    
    (SELECT COUNT(chat.id) FROM chat WHERE chat.sender_id = users.id AND chat.is_deleted = 0 AND chat.seen_status = 0 ORDER BY created_at DESC LIMIT 1) as unseen_message
    
    FROM sos LEFT JOIN users ON users.id = sos.user_id LEFT JOIN chat as chat1 ON (chat1.sender_id = users.id OR chat1.receiver_id = users.id) WHERE users.is_deleted = 0 AND users.role = 'user' AND users.status = 1 AND sos.sos_status = 1 ${LikeData} GROUP BY sos.user_id`
    
    // console.log('selectSosChatlist',que)
    
    return commonFun.runSQLquery(que)
}
commonDbModel.selectAllChatlist = (admin_id, LikeData) => { // done
  let que = `SELECT COALESCE(sos.sos_status, 0) AS sos_status, users.id as user_id , chat.id, chat.room_id,chat.receiver_id,chat.sender_id,users.profile_image,users.name,
    (SELECT chat.message FROM chat WHERE chat.room_id = CONCAT('${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as last_message, 

    (SELECT chat.message_type FROM chat WHERE chat.room_id = CONCAT('${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as message_type,  

    (SELECT chat.created_at FROM chat WHERE chat.room_id = CONCAT('${admin_id}_',users.id) AND chat.is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as created_at,  

    (SELECT COUNT(chat.message) FROM chat WHERE chat.sender_id = users.id AND chat.is_deleted = 0 AND chat.seen_status = 0 ORDER BY created_at DESC LIMIT 1) as unseen_message 

    FROM users LEFT JOIN chat ON chat.sender_id = users.id OR chat.receiver_id = users.id 
    LEFT JOIN sos ON users.id = sos.user_id
    WHERE users.is_deleted = 0 AND users.role = 'user'${LikeData} GROUP by users.id
    `
    // console.log('selectAllChatlist',que)


    return commonFun.runSQLquery(que)
}
commonDbModel.runSQLquery = (que) => {
    return commonFun.runSQLquery(que)
}

module.exports = commonDbModel;
