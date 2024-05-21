
const commonModel = require('../models/common-model')
const commanHelper = require('../helpers/helper')
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY, { pbkdf2Iterations: 10000, saltLength: 10 });
var jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
var generateSafeId = require('generate-safe-id');
const nodemailer = require('nodemailer');
const resMessage = require('../helpers/response-message');
var fs = require('fs');
let transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD
	}
});

//1
exports.login = async function (req, res) {
	try {
		var where = "where email = '" + req.body.email + "' AND status = 1 AND is_deleted = 0";
		var checkUser = await commonModel.select('users', where);
		if (checkUser.length) {
			if (checkUser[0].role == 'admin') {

				let token = "" + req.body.email + "IndianLegalHelps";
				var get_token = jwt.sign({ data: token }, 'secret', { expiresIn: '100h' });
				let B_token = 'Bearer_' + get_token + '';
				await commonModel.insert('admin_auth', { user_id: checkUser[0].id, auth_token: B_token })
				let pass = cryptr.decrypt(checkUser[0].password)
				if (pass == req.body.password) {
					delete checkUser[0].password
					checkUser[0].profile_image = nodeSiteUrl + '/users/' + checkUser[0].profile_image

					checkUser[0].auth_token = B_token;
					let sosAlert = await commonModel.select('sos', `WHERE sos_status = '1' AND is_deleted = '0' LIMIT 1`)
					let sosData = false;
					if (sosAlert.length > 0) {
						sosData = true;
					}
					var result = { status: true, message: resMessage.loginSuccess, data: checkUser[0], sosData };
				}
				else {
					var result = { status: false, message: resMessage.incorrectPass, data: {} };
				}

			} else {

				var result = { status: false, message: resMessage.You_are_not_allowed, data: {} };

			}


		}
		else {
			var result = { status: false, message: resMessage.userNotExist, data: {} };
		}
		res.send(result);
	}
	catch (err) {
		console.log(err)
		commonModel.logger('adminlogin', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
}
//2
exports.deletetoken = async function (req, res) {
	try {
		let where = "where auth_token = '" + req.body.auth_token + "'"
		let result = await commonModel.delete('admin_auth', where)

		res.send({ status: true, message: "logged out successfull" });

	} catch (err) {
		console.log(err)
		commonModel.logger('deletetoken', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}

}
//3
exports.forgotpassword = async (req, res, next) => {
	try {
		var where = `where email = '${req.body.email}' AND role = 'admin' AND status = 1 AND is_deleted = 0`;
		console.log(where)
		var checkUser = await commonModel.select('users', where);
		if (checkUser[0]) {

			let token = jwt.sign({ user_id: checkUser[0].id }, 'secret', { expiresIn: '10 m' });
			await commonModel.insert('forgot_password', { auth_token: token, user_id: checkUser[0].id, user_type: 'user' });

			const mailOptions = {
				from: 'phpdeveloper.samosys@gmail.com',
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
												style="overflow-wrap:break-word;word-break:break-word;padding:25px 50px 70px;font-family:'Open Sans',sans-serif;"
												align="left">
												<div class="v-text-align v-font-size"
												  style="color: #ffffff; line-height: 160%; text-align: justify; word-wrap: break-word;">
												  <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px;
																  ">
													  <strong>Hi, ${checkUser[0].name} </strong>
													</span>
												  </p>
												  <p style="font-size: 14px; line-height: 160%;"> </p>
				
												  <p style="font-size: 14px; line-height: 160%;"> </p>
												  <p style="font-size: 14px; line-height: 160%;"><strong>
													  Thank you for choosing Indian Legal Helps. We cannot simply send you your old
													  password,
													  <br>
													  Use the following Link given below to reset your password
													</strong></p>
												  <a href="${process.env.RESET_PASSWORD_URL}${token}">Click</a>
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

		} else {
			var result = { status: false, message: 'User Not Found.' };
		}

		res.send(result);

	}
	catch (err) {
		console.log(err)
		commonModel.logger('adminforgotPassword', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
};
//4
exports.resetpassword = async function (req, res) {
	console.log(req.body)
	// return
	try {
		let whereauth = "where auth_token = '" + req.body.auth_token + "'"
		await commonModel.delete('forgot_password', whereauth)

		let where = "where is_deleted = 0 AND id = '" + req.body.user_id + "' "
		if (req.body.user_type == 'user') {
			console.log('update pass user')
			await commonModel.update('users', where, { password: cryptr.encrypt(req.body.password) })
		}
		if (req.body.user_type == 'lawyer') {
			console.log('update pass lawyer')
			await commonModel.update('lawyers', where, { password: cryptr.encrypt(req.body.password) })
		}
		res.send({ status: true, message: resMessage.updatePassword });

	} catch (err) {
		console.log(err)
		commonModel.logger('resetpassword', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}

}
//5
exports.getPoliceData = async function (req, res) {

	try {
		let data = await commonModel.select('police', 'where is_deleted = 0', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
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
//6
exports.addEditPoliceData = async function (req, res) {
	// console.log(req.body)
	try {
		let object = {
			title: req.body.title,
			address: req.body.address,
			contact_number: req.body.contact_number,
			latitude: req.body.latitude,
			longitude: req.body.longitude,

		}
		if (req.body.police_id) {
			//update
			let where = `where id = ${req.body.police_id}`
			await commonModel.update('police', where, object)
			var result = { status: true, message: resMessage.dataUpdated };
		}
		else {
			await commonModel.insert('police', object)
			var result = { status: true, message: resMessage.datainserted };
		}
		let policedata = await commonModel.select('police', 'where is_deleted = 0', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
		result.data = policedata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('addEditPoliceData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });

	}
}
//7
exports.deletePoliceData = async function (req, res) {
	// console.log(req.body)
	try {
		let where = `where id = ${req.body.police_id}`
		await commonModel.update('police', where, { is_deleted: 1 })
		var result = { status: true, message: resMessage.dataUpdated };

		let policedata = await commonModel.select('police', '', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
		result.data = policedata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('deletePoliceData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });

	}
}
//8
exports.getConsulateData = async function (req, res) {

	try {
		let data = await commonModel.select('consulates', 'where is_deleted = 0', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
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
//9
exports.addEditConsulateData = async function (req, res) {
	// console.log(req.body)
	try {
		let object = {
			title: req.body.title,
			address: req.body.address,
			contact_number: req.body.contact_number,
			latitude: req.body.latitude,
			longitude: req.body.longitude,

		}
		if (req.body.consulate_id) {
			//update
			let where = `where id = ${req.body.consulate_id}`
			await commonModel.update('consulates', where, object)
			var result = { status: true, message: resMessage.dataUpdated };
		}
		else {
			await commonModel.insert('consulates', object)
			var result = { status: true, message: resMessage.datainserted };
		}
		let consulatedata = await commonModel.select('consulates', 'where is_deleted = 0', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
		result.data = consulatedata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('addEditConsulateData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//10
exports.deleteConsulateData = async function (req, res) {
	// console.log(req.body)
	try {
		let where = `where id = ${req.body.consulate_id}`
		await commonModel.update('consulates', where, { is_deleted: 1 })
		var result = { status: true, message: resMessage.dataUpdated };

		let consulatedata = await commonModel.select('consulates', '', '', `id,address,contact_number,title,latitude as lat, longitude as lng`)
		result.data = consulatedata

		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('deleteConsulateData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//11
exports.getFaq = async function (req, res) {

	try {

		let where = `where is_deleted = 0`
		if (req.body.filter) {
			where += ` AND (question LIKE '%${req.body.filter}%' OR answer LIKE '%${req.body.filter}%')`
		}
		let data = await commonModel.select('faq', where, 'ORDER BY `faq`.`s_no` ASC', '')
		if (data.length) {
			var result = { status: true, message: resMessage.dataFound, data: data };
		}
		else {
			var result = { status: true, message: resMessage.dataNotFound, data: {} };
		}
		res.send(result);
	} catch (err) {
		console.log(err)
		commonModel.logger('getFaq', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain, data: {} });
	}
}
//12
exports.addEditfaq = async function (req, res) {
	// console.log(req.body)
	try {
		let object = {
			s_no: req.body.s_no,
			question: req.body.question,
			answer: req.body.answer
		}
		if (req.body.faq_id) {
			//update
			let where = `where id = ${req.body.faq_id}`
			await commonModel.delete('faq', where)
			// why delete - because update does not allowing to add single and double quotation mark
			var result = { status: true, message: resMessage.dataUpdated };
		}else{
			var result = { status: true, message: resMessage.datainserted };
		}	
			await commonModel.insert('faq', object)
		

		let faqdata = await commonModel.select('faq', 'where is_deleted = 0', 'ORDER BY `faq`.`s_no` ASC', '')
		result.data = faqdata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('addEditConsulateData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//13
exports.deletefaqData = async function (req, res) {
	// console.log(req.body)
	try {
		let where = `where id = ${req.body.faq_id}`
		await commonModel.update('faq', where, { is_deleted: 1 })
		var result = { status: true, message: resMessage.dataDeleted };

		let faqdata = await commonModel.select('faq', 'where is_deleted = 0', 'ORDER BY `faq`.`s_no` ASC', '')
		result.data = faqdata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('deletefaqData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//14
exports.getNewsData = async function (req, res) {
	// console.log(req.body)
	try {
		let where = `where is_deleted = 0`
		if (req.body.filter) {
			where += ` AND(title LIKE '%${req.body.filter}%' OR body LIKE '%${req.body.filter}%' OR source LIKE '%${req.body.filter}%')`
		}
		let faqdata = await commonModel.select('news', where, 'ORDER BY `news`.`created_at` DESC')
		for (let i = 0; i < faqdata.length; i++) {
			faqdata[i].image = faqdata[i].image ? nodeSiteUrl + '/news/' + faqdata[i].image : ''
			faqdata[i].created_at = moment(faqdata[i].created_at).format('DD-MMM-YYYY')

		}
		var result = { status: true, message: resMessage.dataFound, data: faqdata };

		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('getNewsData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//15
exports.addEditNews = async function (req, res) {
	// console.log(req.body)
	// console.log(req.file)
	// return
	try {
		let object = {
			title: req.body.title,
			body: req.body.body,
			source: req.body.source,
			created_at: req.body.date,
		}
		if (req.body.news_id) {
			// update
			let where = `where id = ${req.body.news_id}`
			let newsData = await commonModel.select('news', where)
			if (req.file) {// user want to update image
				if (newsData[0].image) { // remove old file
					var filePath = appDir + '/assets/news/' + newsData[0].image;
					if (fs.existsSync(filePath)) {
						fs.unlinkSync(filePath);
					}
				}
				object.image = req.file.filename
			}
			// console.log(object, "updating new file")
			await commonModel.update('news', where, object)
			var result = { status: true, message: resMessage.dataUpdated };
		}
		else {
			//insert	
			if (req.file) {
				object.image = req.file.filename
			}
			await commonModel.insert('news', object)
			var result = { status: true, message: resMessage.datainserted };
		}
		let newsdata = await commonModel.select('news', 'where is_deleted = 0', 'ORDER BY `news`.`created_at` DESC')
		for (let i = 0; i < newsdata.length; i++) {
			newsdata[i].image = newsdata[i].image ? nodeSiteUrl + '/news/' + newsdata[i].image : ''
			newsdata[i].created_at = moment(newsdata[i].created_at).format('DD-MMM-YYYY')

		}
		result.data = newsdata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('getNewsData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//16
exports.deleteNewsData = async function (req, res) {
	// console.log(req.body)
	try {
		let where = `where id = ${req.body.news_id}`
		await commonModel.update('news', where, { is_deleted: 1 })
		var result = { status: true, message: resMessage.dataDeleted };

		let newsdata = await commonModel.select('news', 'where is_deleted = 0', 'ORDER BY `news`.`created_at` DESC')
		for (let i = 0; i < newsdata.length; i++) {
			newsdata[i].image = newsdata[i].image ? nodeSiteUrl + '/news/' + newsdata[i].image : ''
			newsdata[i].created_at = moment(newsdata[i].created_at).format('DD-MMM-YYYY')

		}
		result.data = newsdata
		res.send(result)
	} catch (err) {
		console.log(err)
		commonModel.logger('deleteNewsData', req, err);
		res.send({ status: false, message: resMessage.pleaseTryAgain });
	}
}
//17
exports.logout = async function (req, res) {
	try {
		let where = `where auth_token = '${req.body.auth_token}'`
		await commonModel.delete('admin_auth', where)
		res.send({ status: true, message: "logged out successfull" });

	} catch (err) {
		console.log(err)
		commonModel.logger('logout', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
//18
exports.getUserProfile = async function (req, res) {
	try {
		let whereuser = `where id = ${req.body.user_id} AND is_deleted = 0`
		let userresult = await commonModel.select('users', whereuser)
		let whereitenery = `where user_id = ${req.body.user_id} AND is_deleted = 0`
		let iteneryresult = await commonModel.select('itenery', whereitenery)
		// let paymentresult = await commonModel.select('users',`LEFT JOIN payment ON users.id = payment.user_id  WHERE users.id = ${req.body.user_id} and users.membership_type != 'free'`,'ORDER BY `payment`.`created_at` DESC LIMIT 1 ','users.name,payment.*')
		let alldata = {
			...userresult[0],
			...iteneryresult[0]
		}

		alldata.profile_image = nodeSiteUrl + '/users/' + alldata.profile_image

		alldata.nationality_id_url = alldata.nationality_id_url ? nodeSiteUrl + '/files/' + alldata.nationality_id_url : ''
		alldata.visa_file_url = alldata.visa_file_url ? nodeSiteUrl + '/files/' + alldata.visa_file_url : ''
		alldata.insurance_file_url = alldata.insurance_file_url ? nodeSiteUrl + '/files/' + alldata.insurance_file_url : ''
		alldata.driving_file_url = alldata.driving_file_url ? nodeSiteUrl + '/files/' + alldata.driving_file_url : ''
		alldata.emergency_file_url = alldata.emergency_file_url ? nodeSiteUrl + '/files/' + alldata.emergency_file_url : ''
		alldata.passport_file_url = alldata.passport_file_url ? nodeSiteUrl + '/files/' + alldata.passport_file_url : ''

		alldata.cities_traveled = alldata.cities_traveled ? JSON.parse(alldata.cities_traveled) : []
		alldata.emergency_contact = alldata.emergency_contact ? JSON.parse(alldata.emergency_contact) : []

		res.send({ status: true, message: resMessage.dataFound, data: alldata });

	} catch (err) {
		console.log(err)
		commonModel.logger('getUserProfile', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
//19
exports.sendNotification = async function (req, res) {
	try {
		let userdetails = await commonModel.select('users', `where id = ${req.body.user_id} AND is_deleted = 0`, '', 'device_token,device_type')
		await commonModel.insert('notification', req.body)
		// android ios

		let whereNoti = `where user_id = ${req.body.user_id} and read_status = 0 AND status = 1`;
		let countdata = await commonModel.select('notification', whereNoti, 'order by created_at desc', 'COUNT(notification.id) as count')
		let whereChat = `where seen_status = 0 AND sender_id = 1 AND receiver_id = ${req.body.user_id}`;
		let chatCount = await commonModel.select('chat', whereChat, 'order by created_at desc', 'COUNT(seen_status) as count')

		let totalCount = countdata[0].count + chatCount[0].count;

		if (userdetails[0].device_type == 'android') {
			await commanHelper.newAndroidNotification('admin_notification', userdetails[0].device_token, req.body.title, req.body.body, totalCount, chatCount[0].count, countdata[0].count)
		}
		if (userdetails[0].device_type == 'ios') {
			// await commanHelper.iosNotification('admin_notification',userdetails[0].device_token, req.body.title, req.body.body,usernotification.length)
		}

		res.send({ status: true, message: resMessage.sendNotification });
	} catch (err) {
		console.log(err)
		commonModel.logger('sendNotification', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
//20
exports.updateContactDetails = async function (req, res) {
	try {
		let object = {
			whatsapp_number: req.body.whatsapp_number,
			call_number: req.body.call_number,
			text_number: req.body.text_number,
			rzp_key: req.body.rzp_key
		}
		await commonModel.update('contact', `where id = '1'`, object)
		res.send({ status: true, message: resMessage.dataUpdated });
	} catch (err) {
		console.log(err)
		commonModel.logger('updateContactDetails', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
//21
exports.getContactDetails = async function (req, res) {
	try {
		let result = await commonModel.select('contact')
		if (result.length) {
			res.send({ status: true, message: resMessage.dataFound, data: result[0] });
		}
		else {
			res.send({ status: true, message: resMessage.dataNotFound, data: [] });
		}
	} catch (err) {
		console.log(err)
		commonModel.logger('getContactDetails', req, err);
		res.send({ status: false, message: "Somthing went wrong.", data: [] });
	}
}
//22
exports.getadminbyauth = async function (req, res) {
	try {
		let data = await commonModel.select('forgot_password', `where auth_token = '${req.body.auth_token}'`)

		let expired = false

		jwt.verify(req.body.auth_token, 'secret', function (err, decoded) {

			if (err) {
				expired = true
				let whereauth = "where auth_token = '" + req.body.auth_token + "'"
				commonModel.delete('forgot_password', whereauth)
			}
			else {
				expired = false

			}
		})

		if (data.length) {
			if (expired) {
				res.send({ status: false, message: resMessage.linkExpired, expired: expired, data: data[0] })
			} else {
				res.send({ status: true, message: resMessage.dataFound, expired: expired, data: data[0] })
			}
		} else {
			res.send({ status: false, message: resMessage.linkExpired, expired: true, data: [] })
		}
		console.log(expired)
	} catch (error) {
		console.log(error)
		res.send({ status: false, message: resMessage.linkExpired, expired: true, data: [] })

	}
}
