import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ChatService } from '../../views/chat/chat.service'
@Component({
  selector: 'app-lawyer',
  templateUrl: './lawyer.component.html',
  styleUrls: ['./lawyer.component.scss']
})
export class LawyerComponent implements OnInit {

  LawyerData: any
  addeditform: FormGroup
  submitted = false
  lawyer_id = ''
  admin_id = localStorage.getItem('user_id');

  constructor(
    private toastr: ToastrService,
    private http: HttpService,
    private apiUrl: ApiUrlService,
    private router: Router,
    private modalservice: NgbModal,
    private fb: FormBuilder,
    private validation: ValidationService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.getLawyerData()
    this.addeditform = this.fb.group({
      name: ['', this.validation.required],
      email: ['', this.validation.email],
      password: ['', this.validation.required]
    })
  }
  async getLawyerData(filter?: any) {
    try {
      let result = await this.http.post(this.apiUrl.url.getLawyer, { filter: filter, admin_id: this.admin_id })
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.LawyerData = result['data']
      }
      else {
        this.LawyerData = result['data']
      }

    } catch (error) {
      console.log(error)

    }
  }
  addnewLawyer(content: any) {
    this.addeditform.reset();
    this.submitted = false
    this.addeditform.patchValue({ s_no: '' });
    this.lawyer_id = ''
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.modalservice.dismissAll();

      });
  }
  applyFilter(a: any) {
    this.getLawyerData(a)
  }
  async addEditLawyer() {
    this.submitted = true
    if (!this.addeditform.valid) {
      return
    }
    if (this.lawyer_id) {
      this.addeditform.value.lawyer_id = this.lawyer_id
    }
    try {
      let result = await this.http.post(this.apiUrl.url.addEditLawyer, this.addeditform.value)
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.LawyerData = result['data']

        this.toastr.success(result['message'])
      }
      else {
        this.toastr.error(result['message'])
        return
      }

    } catch (error) {
      console.log(error)

    }
    this.modalservice.dismissAll();

  }
  onEdit(content, data) {
    this.lawyer_id = data.id
    this.addeditform.patchValue({ name: data.name, email: data.email, password: data.password });
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.addeditform.reset();
        this.submitted = false
        this.modalservice.dismissAll();
      });

  }

  onDelete(content, id) {
    this.lawyer_id = id
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.modalservice.dismissAll();
      });
  }
  async deleteLawyer() {

    let result = await this.http.post(this.apiUrl.url.deleteLawyer, { lawyer_id: this.lawyer_id })
    this.LawyerData = result['data']

    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }
    if (result['status']) {
      this.toastr.success(result['message'])
      this.LawyerData = result['data']
    }
    else {
      this.toastr.error(result['message'])
    }
    this.modalservice.dismissAll();
    this.getLawyerData()
  }
  async changeStatus(id, status) {
    try {
      let result = await this.http.post(this.apiUrl.url.changeLawyerStatus, { status: status, lawyer_id: id })
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.toastr.success(result['message'])
        
        this.LawyerData = result['data']
        // this.getLawyerData()

        this.chatService.socket.emit('lawyer_status', {lawyer_id: id.toString()} );   
        
      }
    } catch (error) {
      console.log(error)

    }
  }
}
