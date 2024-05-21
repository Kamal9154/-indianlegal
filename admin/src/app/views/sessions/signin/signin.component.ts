import { Component, OnInit } from '@angular/core';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    animations: [SharedAnimations]
})
export class SigninComponent implements OnInit {
    loading: boolean;
    loadingText: string;
    signinForm: FormGroup;
    showHidePass = true;
    submitted = false;
    isSOS: boolean = false;
    audioUrl: string = '../assets/sos_alarm_sound/police-car-siren-in-traffic-14655.mp3';

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private http: HttpService,
        private apiurl: ApiUrlService,
        private toaster: ToastrService,
        private validations: ValidationService
    ) { }


    ngOnInit() {
        if (localStorage.getItem('user_id')) this.router.navigate(['/dashboard'])

        this.signinForm = this.fb.group({
            email: ['', this.validations.email],
            password: ['', this.validations.required]
        });
    }

    async login() {
        this.submitted = true
        if (!this.signinForm.invalid) {
            // console.log(this.signinForm.value)
            // return
            let result = await this.http.Post(this.apiurl.url.login, this.signinForm.value);
            // console.log(result, "result of api")
            // return
            if (result['status'] == true) {
                localStorage.setItem('profile_image', result['data'].profile_image)
                localStorage.setItem('name', result['data'].name)
                localStorage.setItem('user_id', result['data'].id)
                localStorage.setItem('auth_token', result['data'].auth_token)
                this.router.navigate(['/chat'])
                if (result['sosData'] == true) {
                    this.triggerSOS()
                }
                this.toaster.success(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true });
            }
            else {
                this.toaster.error(result['message'])
            }
        }
        else {
            return;
        }
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


    showHidePassword() {
        if (this.showHidePass) this.showHidePass = false;
        else this.showHidePass = true

    }


}
