var mysql = require('mysql')

const commonFun = {};
var connection = mysql.createConnection({
    host: nodeEnv.parsed.DB_HOST,
    user: nodeEnv.parsed.DB_USERNAME,
    password: nodeEnv.parsed.DB_PASSWORD,
    database: nodeEnv.parsed.DB_DATABASE,
    charset: 'utf8mb4'
})

commonFun.runSQLquery = (que) => {
    return new Promise((resolve, reject) => {
        connection.query(que, (err, response) => {
            if (response) resolve(response);
            else reject(err);
        });
    });
}
commonFun.runSqlQueryWithData = (que, data) => {
    return new Promise((resolve, reject) => {
        connection.query(que, data, (err, response) => {
            if (response) resolve(response);
            else reject(err);
        });
    });
}

commonFun.runSqlQueryWithDataforUpdate = (table, where, data) => {
    var columns_values_arr = [];
    for (let [key, value] of Object.entries(data)) {
        var columns_values = "`" + key + "`=" + connection.escape(value) + "";
        columns_values_arr.push(columns_values);
    }
    var que = "update `" + table + "` set " + columns_values_arr + " " + where;
    console.log(que, "update with esc")
    return new Promise((resolve, reject) => {
        connection.query(que, data, (err, response) => {
            if (response) resolve(response);
            else reject(err);
        });
    });
},
    commonFun.runSqlQueryWithDataforInsert = (table, data) => {
        var columns = [];
        var values = [];
        for (let [key, value] of Object.entries(data)) {
            columns.push('`' + key + '`');
            values.push(connection.escape(value));
        }
        var sql = 'insert into `' + table + '` (' + columns.join(',') + ') values (' + values.join(',') + ') ';
        console.log(sql,"insert with esc")
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result) {
                    resolve(result)
                }
                else reject(error);
            });
        });
    }

commonFun.logger = (data) => {
    var que = 'INSERT INTO `logger`(`device_details`,`api_function`, `request_detail`, `log_detail`) VALUES ("' + connection.escape(data.device_details) + '","' + data.api_function + '","' + connection.escape(data.request_detail) + '","' + connection.escape(data.log_detail) + '")';
    return new Promise((resolve, reject) => {
        connection.query(que, data, (err, response) => {
            if (response) resolve(response);
            else reject(err);
        });
    });
},


    module.exports = commonFun;