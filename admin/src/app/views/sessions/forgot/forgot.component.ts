import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
// import { HttpService } from 'src/app/shared/services/http.service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { environment } from 'src/environments/environment';
// import { animation } from '@angular/animations';
@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
  animations: [SharedAnimations]
})
export class ForgotComponent implements OnInit {
  forgotpass: any;
  submitted = false;
  idd;
  constructor(
    private fb: FormBuilder,
    private validations: ValidationService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private toaster: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // var dataid = route.snapshot.params.id;
    // this.idd = dataid
  }


  ngOnInit() {
    this.forgotpass = this.fb.group({
      email: ['', this.validations.email]

    })
    // console.log(this.idd,"id")

  }
  async onsubmit() {

    this.submitted = true;
    if (!this.forgotpass.invalid) {

      let obj = {
        email: this.forgotpass.value.email,
        role: 'admin',
      }
      let result = await this.http.Post(this.apiurl.url.forgotpassword, obj)
      if (result['status'] == true) {
        this.toaster.success(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true })
        this.router.navigate(['/sessions/signin'])
      }
      else {
        this.toaster.error(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true })
      }
    }

  }

}
