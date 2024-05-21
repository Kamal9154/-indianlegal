import { Component, OnInit, ViewChild } from '@angular/core';
// import { ApiUrlService } from '../../../shared/services/apiUrl.service'
// import { HttpService } from '../../../shared/services/http.service'
import { ChatService } from '../chat.service'
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { Socket } from 'ngx-socket-io';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild(PerfectScrollbarDirective) psContainer: PerfectScrollbarDirective;

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpService,
    private chatService: ChatService,
    private router:Router,
    private toastr:ToastrService
  ) { }
  users = [];
  chat: any = [];
  userDetails;
  userProfile;
  typingStatus;
  isShow = true;
  // admin_id = localStorage.getItem('user_id')
  admin_id = 1
  showProfile = false
  filterData: any;
  currentListName: any;
  filterName :string;

  ngOnInit() {
    this.getAllContacts();
    this.getMessage();
    this.activeStatus();
    this.scrollToTop()
    this.listNameData();
  }

  async getAllContacts() {
    let result = await this.http.post(this.apiUrl.url.getLatestChatList, { admin_id: this.admin_id });
    this.http.checkApiAuth(result)
    if (result['status']) this.users = result['data'];

  }
  async getUserDetails(data) {
    this.userDetails = data;
    let userdetails = await this.http.post(this.apiUrl.url.getUserProfile, { user_id: data.user_id });
    this.http.checkApiAuth(userdetails)
    if (userdetails['status']) { 
      this.userProfile = userdetails['data'] 
      this.userProfile.cities_traveled = this.userProfile.cities_traveled ? this.userProfile.cities_traveled?.filter(obj => obj.city != '') : []
    }
    await this.http.post(this.apiUrl.url.updateSeenByAdmin, { room_id: data.room_id, receiver_id: this.admin_id });
    this.getUserChat(data.room_id);
  }

  async getUserChat(id) {
    this.showProfile = true;
    let result = await this.http.post(this.apiUrl.url.getChats, { room_id: id });
    this.http.checkApiAuth(result)

    if (result['status']) { this.chat = result['data'] }
    else { this.chat = [] }

  }
  sendMsg(e) {
    this.sendMessage(e);
  }

  sendMessage(data) {
    let listName = localStorage.getItem('listName')

    if (listName == 'latest') this.getLatestUserList();
    if (listName == 'sos') this.getSosUserList();
    if (listName == 'all') this.getAllUserList();
    this.chatService.socket.emit('admin_send_message', data);
  }
  typing(data) { }
  // arraymove(arr, fromIndex, toIndex) {
  //   let element = arr[fromIndex];
  //   arr.splice(fromIndex, 1);
  //   arr.splice(toIndex, 0, element);
  //   this.users = arr;
  // }
  activeStatus() { }
  getMessage() {

    this.chatService.socket.on('admin_get_message', (message) => {
      // console.log('admin_get_message', message)
      this.scrollToBottomchat()
    });
  }

  scrollToBottom() {
    // window.scrollTo(0, document.body.scrollHeight);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottomchat() {
    setTimeout(() => {
      this.psContainer?.update();
      // this.psContainer.scrollToBottom(0, 400);
    });
  }

  listNameData() {
    let listName = localStorage.getItem('listName')
    this.currentListName = listName;
  }

  chatFilter(filter: any) {
    this.filterData = filter
    this.listNameData()
    if (this.currentListName == "latest") {
      this.getLatestUserList();
    } else if (this.currentListName == "sos") {
      this.getSosUserList();
    } else {
      this.getAllUserList();
    }
  }


  async getLatestUserList() {
    let result = await this.http.post(this.apiUrl.url.getLatestChatList, { admin_id: this.admin_id, filter: this.filterData });
    this.http.checkApiAuth(result)
    if (result['status']) this.users = result['data'];
    else this.users = []
    // console.log(this.users, "usersssssssss")
  }
  async getAllUserList() {
    // console.log(this.admin_id)
    let result = await this.http.post(this.apiUrl.url.getAllChatList, { admin_id: this.admin_id, filter: this.filterData });
    this.http.checkApiAuth(result)
    if (result['status']) this.users = result['data'];
    else this.users = []
    // console.log(this.users, "get allll usersssssssss")
  }
  async getSosUserList() {
    let result = await this.http.post(this.apiUrl.url.getSosChatList, { admin_id: this.admin_id, filter: this.filterData });
    this.http.checkApiAuth(result)
    if (result['status']) this.users = result['data'];
    else this.users = []
    // console.log(this.users, "usersssssssss")
  }
  clear(){
    this.filterName = '';
    this.chatFilter('');
  }
}