import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {


  public url = environment.apiUrl;
  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }


  Get(url, data) { return this.http.get(this.url + url, data).toPromise() }

  GET(url, data) { return this.http.get(this.url + url, data).toPromise() };

  get(url, headers) { return this.http.get(this.url + url, headers).toPromise() };

  update(url, data, headers) { return this.http.post(this.url + url, data, headers).toPromise() };

  post(url, data?) {
    let httpOptions = {
      headers: new HttpHeaders({
        'authorization': localStorage.getItem('auth_token')
      })
    };
    return this.http.post(this.url + url, data, httpOptions).toPromise()
  };

  Post(url, data?) { return this.http.post(this.url + url, data).toPromise() };


  checkApiAuth(result: any) {
    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }
    return
  }



}
