import { Component, OnInit } from '@angular/core';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  loading: boolean;
  loadingText: string;
  resetForm: FormGroup;
  showHidePass = true;
  showHidecPass = true;
  submitted = false;
  expired = false
  user_id: any
  user_type: any
  matched = true
  token: any
  deviceInfo: DeviceInfo;
  deviceType = ''
  resetSuccessMessage = false
  showResetForm = true
  errorMessage = false
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private toaster: ToastrService,
    private validations: ValidationService,
    private activatedroute: ActivatedRoute,
    private deviceDetectorService: DeviceDetectorService
    // private jwtHelper: JwtHelperService
  ) {
    this.token = this.activatedroute.snapshot.params.token;
    this.checkauth();
    this.deviceInfo = this.deviceDetectorService.getDeviceInfo();
    // console.log(this.deviceInfo.deviceType)

    if (this.deviceInfo.deviceType == 'desktop') {
      this.deviceType = 'desktop'
    }
    else {
      this.deviceType = 'mobile'
    }
  }


  async checkauth() {

    let admindata = await this.http.Post(this.apiurl.url.getadminbyauth, { auth_token: this.token })
    // console.log(admindata['data'])
    if (admindata['status'] == true) {
      this.user_id = admindata['data'].user_id
      this.user_type = admindata['data'].user_type
      if (admindata['expired'] == true) {
        this.toaster.error(admindata['message'], '', { timeOut: 3000, closeButton: true, progressBar: true });
        if (this.deviceType == 'desktop') {
          this.router.navigate(['/sessions/signin'])
        } else {
          this.errorMessage = true
          this.showResetForm = false
        }
      }
    }
    else {
      this.toaster.error(admindata['message'], '', { timeOut: 3000, closeButton: true, progressBar: true });
      if (this.deviceType == 'desktop') {
        this.router.navigate(['/sessions/signin'])
      }
      else {
        this.errorMessage = true
        this.showResetForm = false
      }
    }
  }

  async ngOnInit() {
    this.resetForm = this.fb.group({
      password: ['', this.validations.required],
      cpassword: ['', this.validations.required]
    });
  }

  async onReset() {
    this.checkauth()
    // console.log('reset')
    this.submitted = true
    if (!this.resetForm.invalid) {
      let result = await this.http.Post(this.apiurl.url.Resetpassword, { user_id: this.user_id, password: this.resetForm.value.password, auth_token: this.token, user_type: this.user_type });
      if (result['status'] == true) {
        this.toaster.success(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true });
        if (this.deviceType == 'desktop') {
          this.router.navigate(['/sessions/signin'])
        } else {
          this.resetSuccessMessage = true
          this.showResetForm = false

        }
      }
      else {
        this.toaster.error(result['message'])
      }
    }
    else {
      return;
    }
  }
  showHidePassword() {
    if (this.showHidePass) this.showHidePass = false;
    else this.showHidePass = true

  }
  showHidecPassword() {
    if (this.showHidecPass) this.showHidecPass = false;
    else this.showHidecPass = true
  }
  onkeypresspass(event: any, input: any) {

    if (input == 'cpassword') {
      if (event.target.value != this.resetForm.value.password) {
        this.matched = false        
      }
      else {
        this.matched = true
      }
    }
    else {
      if (event.target.value != this.resetForm.value.cpassword) {
        this.matched = false
      }
      else {
        this.matched = true
      }
    }
  }

}
