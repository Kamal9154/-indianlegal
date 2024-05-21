import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { emit } from 'process';
import { Subscription } from 'rxjs';
import { User, ChatService } from '../chat.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';

@Component({
  selector: 'app-chat-left-sidebar',
  templateUrl: './chat-left-sidebar.component.html',
  styleUrls: ['./chat-left-sidebar.component.scss']
})
export class ChatLeftSidebarComponent implements OnInit {

  userUpdateSub: Subscription;
  loadDataSub: Subscription;
  // admin_id = localStorage.getItem('user_id')
  admin_id = 1
  isSidenavOpen = true;

  currentUser: User = new User();
  contacts: any[];

  constructor(
    private chatService: ChatService,
    private http: HttpService,
    private apiUrl: ApiUrlService,
    private ref: ChangeDetectorRef,
    private socketService:ChatService
  ) { }
  @Input() users;
  @Input() typingStatus;
  @Output() userDetails = new EventEmitter();
  @Output() search = new EventEmitter();
  @Output() getLatest = new EventEmitter;
  @Output() getSos = new EventEmitter;
  @Output() getAll = new EventEmitter;
  listName: any = 'latest'

  ngOnInit() {
    this.getMessage()
    localStorage.setItem('listName', 'latest');
    this.socketService.socket.on('admin_get_sos_alarm', (sosData) => {
      let authToken = localStorage.getItem('auth_token')
        if(sosData.sos_status == '1' || '0' && authToken ){
         if (this.listName == 'latest') this.getLatestUserList()
         if (this.listName == 'sos') this.getSosUserList()
         if (this.listName == 'all') this.getAllUserList()
        }
      })
  }
  

  ngOnDestroy() {
  }

  async getChatByContact(data, i) {
    if (this.listName == 'latest') this.getLatestUserList()
    if (this.listName == 'sos') this.getSosUserList()
    if (this.listName == 'all') this.getAllUserList()

    this.userDetails.emit(data);
    this.ref.detectChanges()
  }
  async getLatestUserList() {
    // console.log('lateeeeeeeee')
    await this.getLatest.emit();
    this.listName = 'latest'
    localStorage.setItem('listName', this.listName);


  }
  async getAllUserList() {
    await this.getAll.emit();
    this.listName = 'all'
    localStorage.setItem('listName', this.listName);

  }
  async getSosUserList() {
    await this.getSos.emit();
    this.listName = 'sos'
    localStorage.setItem('listName', this.listName);

  }

  getMessage() {
    this.chatService.socket.on('admin_get_message', (message) => {
      // console.log('admin_get_message', message)
      // console.log(this.listName)
      if (this.listName == 'latest') this.getLatest.emit();
      if (this.listName == 'sos') this.getSos.emit();
      if (this.listName == 'all') this.getAll.emit();

    });
  }


  searchUser(e) {
    // this.search.emit(e.target.value);
  }


}
