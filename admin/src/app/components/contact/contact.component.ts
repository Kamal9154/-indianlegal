import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  submitted = false;
  admin_id = localStorage.getItem('user_id')

  constructor(
    private fb: FormBuilder,
    private validation: ValidationService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  contactForm: FormGroup
  async ngOnInit() {
    this.contactForm = this.fb.group({
      call_number: ['', this.validation.required],
      whatsapp_number: ['', this.validation.required],
      text_number: ['', this.validation.required],
      rzp_key: ['', this.validation.required],
    })
    let result = await this.http.post(this.apiurl.url.getContactDetails, { admin_id: this.admin_id })
    result
    this.contactForm.patchValue({ call_number: result['data'].call_number, whatsapp_number: result['data'].whatsapp_number, text_number: result['data'].text_number, rzp_key: result['data'].rzp_key })
  }

  async saveContact() {

    this.submitted = true
    if (this.contactForm.invalid) return
    this.contactForm.value.admin_id = this.admin_id
    let result = await this.http.post(this.apiurl.url.updateContactDetails, this.contactForm.value)
    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }
    if (result['status']) {

      this.toastr.success(result['message'])
    }
    else {
      this.toastr.error(result['message'])
    }

  }

}
