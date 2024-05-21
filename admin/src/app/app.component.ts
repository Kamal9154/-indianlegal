import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from './views/chat/chat.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'bootDash';
  isSOS: boolean = false;
  audioUrl: string = '../assets/sos_alarm_sound/police-car-siren-in-traffic-14655.mp3';

  constructor(private socketService: ChatService, private toastr: ToastrService,
    private modalservice: NgbModal,
  ) { }



  ngOnInit() {
    this.socketService.setupSocketConnection();
    this.getSosData();
    this.notification();
    // this.openpopup()
  }
  ngOnDestroy() {
    this.socketService.disconnect();
  }
  sosData: any
  getSosData() {
    this.socketService.socket.on('admin_get_sos_alarm', (sosData) => {
      let authToken = localStorage.getItem('auth_token')
      if (authToken) {
        this.triggerSOS()
        this.sosData = sosData
        this.openpopup()
      }
    })
  }
  notification() {
    this.socketService.socket.on('lawyer_accepted_sos', async (data) => {
      this.toastr.info(
        `${data.lawyer} successfully accepted ${data.user}'s SOS`,
        'SOS Alert', {
        positionClass: 'toast-top-right',
        timeOut: 6000,
        closeButton: true
      });
    })
  }
  triggerSOS() {
    this.isSOS = true;
    const audio = new Audio(this.audioUrl);
    audio.play();
    setTimeout(() => {
      audio.pause();
      this.isSOS = false;
    }, 10000);
  }
  @ViewChild('addlawmodal', { static: true }) addlawmodal: any;
  openpopup() {
    this.toastr.info(
      this.sosData.message,
      'SOS Alert', {
      positionClass: 'toast-top-right',
      timeOut: 10000,
      closeButton: true
    });

    // this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true,backdrop: 'static'  })
    //   .result.then((result) => { console.log(result)}, (reason) => {
    //     this.modalservice.dismissAll();
    //     console.log(reason,"reason");
    //   });
  }
}
