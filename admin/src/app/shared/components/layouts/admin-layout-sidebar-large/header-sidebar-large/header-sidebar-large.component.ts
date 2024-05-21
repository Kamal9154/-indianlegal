import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../../services/navigation.service';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatService } from 'src/app/views/chat/chat.service';

@Component({
  selector: 'app-header-sidebar-large',
  templateUrl: './header-sidebar-large.component.html',
  styleUrls: ['./header-sidebar-large.component.scss']
})
export class HeaderSidebarLargeComponent implements OnInit {
  admindata;
  data;
  notifications: any[];
  id = localStorage.getItem("user_id");
  lawyerAllNotifications: any
  notificationCount: any

  constructor(
    private navService: NavigationService,
    private auth: AuthService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private modalservice: NgbModal,
    private socketService:ChatService
  ) { }

  async ngOnInit() {
    this.getAdminNotification()
    this.socketService.socket.on('admin_get_sos_alarm', (sosData) => {
      let authToken = localStorage.getItem('auth_token')
        if(sosData.sos_status == '1' || '0' && authToken ){
          this.getAdminNotification()
        }
      })
  }

  toggelSidebar() {
    const state = this.navService.sidebarState;
    if (state.childnavOpen && state.sidenavOpen) {
      return state.childnavOpen = false;
    }
    if (!state.childnavOpen && state.sidenavOpen) {
      return state.sidenavOpen = false;
    }
    // item has child items
    if (!state.sidenavOpen && !state.childnavOpen
      && this.navService.selectedItem.type === 'dropDown') {
      state.sidenavOpen = true;
      setTimeout(() => {
        state.childnavOpen = true;
      }, 50);
    }
    // item has no child items
    if (!state.sidenavOpen && !state.childnavOpen) {
      state.sidenavOpen = true;
    }
  }
  signout(content) {
    this.modalservice.open(content)
  }
  submitModal() {
    this.modalservice.dismissAll()
    this.auth.signout();
  }
  async getAdminNotification() {
    let result = await this.http.post(this.apiurl.url.getAdminNotificatonList);
    this.lawyerAllNotifications = result['data']
    this.notificationCount = result['unseencount'];
  }
  async seenAdminNotification() {
    let result = await this.http.post(this.apiurl.url.seenAdminNotification);
    this.lawyerAllNotifications = result['data']
    this.notificationCount = result['unseencount'];
  }

 async notificationPopUp() {
    const notificationBox = document.getElementsByClassName('notification--box')[0];
    if (notificationBox)
      if (notificationBox.classList.contains('open')) {
        notificationBox.classList.remove('open');
      } else {
       await this.seenAdminNotification();
       await this.getAdminNotification();
        notificationBox.classList.add('open');
      }
  }
}