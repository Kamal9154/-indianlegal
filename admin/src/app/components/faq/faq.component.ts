import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  faqData: any
  addeditform: FormGroup
  selectArr = []
  submitted = false
  faq_id = ''

  constructor(
    private toastr: ToastrService,
    private http: HttpService,
    private apiUrl: ApiUrlService,
    private router: Router,
    private modalservice: NgbModal,
    private fb: FormBuilder,
    private validation: ValidationService
  ) { }

  ngOnInit(): void {
    this.getFaqData()
    this.addeditform = this.fb.group({
      s_no: ['', this.validation.required],
      question: ['', this.validation.required],
      answer: ['', this.validation.required]
    })
  }
  async getFaqData(filter?: any) {
    try {

      let result = await this.http.post(this.apiUrl.url.getFaq, { filter: filter })
      
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.faqData = result['data']

        // this.toastr.success(result['message'])
      }
      else {
        this.toastr.error(result['message'])
      }

    } catch (error) {
      console.log(error)

    }
  }
  addnewfaq(content: any) {
    this.addeditform.reset();
    this.submitted = false
    this.addeditform.patchValue({ s_no: '' });
    this.faq_id = ''
    this.selectArr = []
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        // this.addeditform.reset();
        // this.submitted = false
        this.modalservice.dismissAll();
        // this.addeditform.patchValue({s_no:''});

      });
    for (let i = 0; i <= this.faqData.length; i++) {
      this.selectArr.push(i + 1)
    }
  }
  applyFilter(a: any) {
    this.getFaqData(a)
  }
  async addEditfaq() {
    this.submitted = true
    if (!this.addeditform.valid) {
      return
    }
    if (this.faq_id) {
      this.addeditform.value.faq_id = this.faq_id
    }
    try {
      let result = await this.http.post(this.apiUrl.url.addEditfaq, this.addeditform.value)
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.faqData = result['data']

        this.toastr.success(result['message'])
      }
      else {
        this.toastr.error(result['message'])
      }

    } catch (error) {
      console.log(error)

    }
    this.modalservice.dismissAll();

  }
  onEdit(content, data) {
    this.faq_id = data.id
    this.addeditform.patchValue({ s_no: data.s_no, question: data.question, answer: data.answer });
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.addeditform.reset();
        this.submitted = false
        this.modalservice.dismissAll();

      });
    this.selectArr = []
    for (let i = 0; i <= this.faqData.length; i++) {
      this.selectArr.push(i + 1)
    }
  }

  onDelete(content, id) {
    this.faq_id = id
    this.modalservice.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        // this.addeditform.reset();
        // this.submitted = false
        this.modalservice.dismissAll();
        // this.addeditform.patchValue({s_no:''});
      });
  }
  async deleteFaq() {

    let result = await this.http.post(this.apiUrl.url.deletefaqData, { faq_id: this.faq_id })
    this.faqData = result['data']

    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }
    if (result['status']) {
      this.toastr.success(result['message'])
      this.faqData = result['data']
    }
    else {
      this.toastr.error(result['message'])
    }
    this.modalservice.dismissAll();

  }
}
