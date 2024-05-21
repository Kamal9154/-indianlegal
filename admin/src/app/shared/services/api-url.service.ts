import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  constructor() { }
  public url = {
    login: 'admin/login',
    deletetoken: 'admin/deletetoken',
    Resetpassword: 'admin/resetpassword/',
    getPoliceData: 'admin/getPoliceData',
    addEditPoliceData: 'admin/addEditPoliceData',
    deletePoliceData: 'admin/deletePoliceData',
    getConsulateData: 'admin/getConsulateData',
    addEditConsulateData: 'admin/addEditConsulateData',
    deleteConsulateData: 'admin/deleteConsulateData',
    getFaq: 'admin/getFaq',
    addEditfaq: 'admin/addEditfaq',
    deletefaqData: 'admin/deletefaqData',
    getNewsData: 'admin/getNewsData',
    addEditNews: 'admin/addEditNews',
    deleteNewsData: 'admin/deleteNewsData',
    getLatestChatList: 'admin/getLatestChatList',
    getSosChatList: 'admin/getSosChatList',
    getAllChatList: 'admin/getAllChatList',
    getChats: 'admin/getChats',
    updateSeenByAdmin: 'admin/updateSeenByAdmin',
    getUserProfile: 'admin/getUserProfile',
    sendNotification: 'admin/sendNotification',
    getNotification: 'admin/getNotification',
    updateContactDetails: 'admin/updateContactDetails',
    getContactDetails: 'admin/getContactDetails',
    getLawyer: 'admin/getLawyer',
    addEditLawyer: 'admin/addEditLawyer',
    changeLawyerStatus: 'admin/changeLawyerStatus',
    deleteLawyer: 'admin/deleteLawyer',
    getAdminNotificatonList: 'admin/getAdminNotificatonList',
    seenAdminNotification: 'admin/seenAdminNotification',
    getadminbyauth: 'admin/getadminbyauth',
    getadminUserById: 'admin/getadminUserById/',
    forgotpassword: 'admin/forgotpassword',
    getuserlist: 'admin/getuserlist',
    getUserById: 'admin/getUserById',
    uploadpdf: 'admin/uploadPdf',
    changeproress: 'admin/changeproress',
    dashboardTotalcounts: 'admin/dashboardTotalcounts',
    userchart: 'admin/userchart',
    initialuserchart: 'admin/initialuserchart',
    inprogressuserchart: 'admin/inprogressuserchart',
    delivereduserchart: 'admin/delivereduserchart',
    deleteuserById: 'admin/deleteuserById',
    getusrefolder: 'admin/getusrefolder',
    getusreimagesbyfolder: 'admin/getusreimagesbyfolder',
    adminUpdate: 'admin/adminUpdate',
    changeUserStatus: 'admin/changeUserStatus/',
    deleteiamges: 'admin/deleteiamges',
    getuserpdffiles: 'admin/getuserpdffiles',
    deletefolders: 'admin/deletefolders',
    deletepdf: 'admin/deletepdf',






    EditProfile: 'EditProfile/',
    registration: 'registration',
    getnavbar: 'getnavbar',
    getNavbardata: 'getNavbardata/',
    getnavbarList: 'getnavbarList/',
    // deleteuserById: 'deleteuserById/',

  }
}
