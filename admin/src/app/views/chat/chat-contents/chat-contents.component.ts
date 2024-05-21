import { Component, OnInit, ViewChild, ViewChildren, Input, Output, OnDestroy, OnChanges, EventEmitter, ChangeDetectorRef, ElementRef } from '@angular/core';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { ChatService, ChatCollection, User, Chat } from '../chat.service';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { ToastrService } from 'ngx-toastr';
declare const $: any;
@Component({
  selector: 'app-chat-contents',
  templateUrl: './chat-contents.component.html',
  styleUrls: ['./chat-contents.component.scss'],
  animations: [SharedAnimations]
})
export class ChatContentsComponent implements OnInit, OnDestroy, OnChanges {
  user: User = new User();
  activeContact: User = new User();
  public chatCollection: ChatCollection;
  // admin_id = localStorage.getItem('user_id');
  admin_id = '1'
  showempty = true
  userUpdateSub: Subscription;
  chatUpdateSub: Subscription;
  chatSelectSub: Subscription;
  isExist;
  @Input() userData;
  @Input() userProfileData;
  @Input() chat;
  @Output() sendMsg = new EventEmitter;
  @Output() scrolldown = new EventEmitter;
  adminData = { admin_id: '', profile_image: '', name: '' };
  @ViewChild(PerfectScrollbarDirective) psContainer: PerfectScrollbarDirective;
  @ViewChildren('msgInput') msgInput;
  @ViewChild('msgForm') msgForm: NgForm;

  notificationform: FormGroup
  submitted = false
  constructor(
    public chatService: ChatService,
    private ref: ChangeDetectorRef,
    private modalService: NgbModal,
    private validation: ValidationService,
    private fb: FormBuilder,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private toaster: ToastrService
  ) {
    this.notificationform = this.fb.group({
      title: ['', this.validation.name],
      body: ['', this.validation.name],
    })
  }
  ngOnChanges() {
    if (this.chat.length) this.scrollToBottom();
    if (this.chat.length) this.showempty = false
    // console.log(this.userProfileData, 'userProfileData')
    // this.ref.detectChanges()
    // console.log(this.userData,'ssssssssss')
  }
  getMessage() {
    this.chatService.socket.on('admin_get_message', (message) => {
      // console.log('admin_get_message', message)
      let msgObj = {
        created_at: message.created_at,
        message: message.message,
        message_type: message.message_type,
        receiver_id: message.receiver_id,
        room_id: message.room_id,
        seen_status: message.seen_status,
        sender_id: message.sender_id,
        user_type: message.user_type
      }
      // this.chat.push(msgObj);
      // this.scrollToBottom();
      // console.log(this.userData, "this.userData")
      if (this.userData) {
        if (this.userData.user_id == message.sender_id) {
          this.chat.push(msgObj);
          this.scrollToBottom();
        }
      }
    });
  }
  ngOnInit() {
    // console.log(this.chat, 'ssssssssss')
    // Listen for user update
    this.adminData.profile_image = localStorage.getItem("profile_image");
    this.adminData.name = localStorage.getItem("name");
    this.adminData.admin_id = '1'
    // this.adminData.admin_id = localStorage.getItem("user_id");
    // console.log(this.adminData)
    this.getMessage();

    this.userUpdateSub = this.chatService.onUserUpdated.subscribe(user => {
      this.user = user;
    });

    // Listen for contact change
    this.chatSelectSub = this.chatService.onChatSelected.subscribe(res => {
      if (res) {
        this.chatCollection = res.chatCollection;
        this.activeContact = res.contact;
        this.initMsgForm();
      }
    });

    // Listen for chat update
    this.chatUpdateSub = this.chatService.onChatsUpdated.subscribe(chat => {
      this.chatCollection.chats.push(chat);
      this.scrollToBottom();
    });



  }
  ngOnDestroy() {
    if (this.userUpdateSub) { this.userUpdateSub.unsubscribe(); }
    if (this.chatSelectSub) { this.chatSelectSub.unsubscribe(); }
    if (this.chatUpdateSub) { this.chatUpdateSub.unsubscribe(); }
  }

  sendMessage(e) {
    let roomId = this.admin_id + '_' + this.userData.user_id
    let textForm = this.msgForm.form.value.message;
    if (!textForm) return
    let msgObj: any = {
      created_at: moment().format(),
      message: textForm,
      message_type: "text",
      receiver_id: this.userData.user_id,
      room_id: roomId,
      seen_status: 0,
      sender_id: parseInt(this.admin_id),
      user_type: 'admin'
    }
    this.sendMsg.emit(msgObj);
    msgObj.created_at = moment(msgObj.created_at).format('DD MMM YYYY || h:mm a')
    this.chat.push(msgObj);
    this.scrollToBottom();
    this.msgForm.form.reset();

  }
  scrollToDown() {
    this.scrolldown.emit();
  }
  initMsgForm() {
    setTimeout(() => {
      this.msgForm.reset();
      this.msgInput.first.nativeElement.focus();
      this.scrollToBottom();
    });
  }
  scrollToBottom() {
    setTimeout(() => {
      this.psContainer.update();
      this.psContainer.scrollToBottom(-10000, 400);
    });
  }

  showpdfInvoice(content) {
    // console.log(this.userProfileData)
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.modalService.dismissAll();
      });
  }
  userAllNotifications
  async getNotification() {
    this.notificationform.reset();
    this.submitted = false
    let result = await this.http.post(this.apiurl.url.getNotification, { user_id: this.userData.user_id });
    // console.log(result)
    this.userAllNotifications = result['data']
    for (let i = 0; i < result['data'].length; i++) {
      result['data'][i].created_at = moment(result['data'][i].created_at).format('DD MMM YYYY || h:mm a')
    }
  }

  async sendNotification() {

    // console.log(this.notificationform)

    this.submitted = true
    if (this.notificationform.invalid) return
    let body = {
      user_id: this.userData.user_id,
      title: this.notificationform.value.title,
      body: this.notificationform.value.body,
    }

    let result = await this.http.post(this.apiurl.url.sendNotification, body);
    if (result['status']) {
      $('#notificationmodal').modal('hide');
      this.toaster.success(result['message'], '', { timeOut: 2000 });

      this.submitted = false
      this.notificationform.reset();
      this.modalService.dismissAll();

    }
    else {
      this.toaster.error(result['message'], '', { timeOut: 2000 });

    }

  }

}
