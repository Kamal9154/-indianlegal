import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { HttpService } from "./http-service";
import { ApiUrlService } from "./api-url.service";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  //Only for demo purpose
  authenticated = true;

  constructor(
    private router: Router,
    private toaster: ToastrService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private route: ActivatedRoute,
    // private route1:ActivatedRouteSnapshot

  ) {

  }
  public isAuthenticated(): boolean {
    const id = localStorage.getItem('user_id');
    if (id) return true;
    else return false;
  };

  async signout() {
    let token = localStorage.getItem('auth_token')
    let result = await this.http.Post(this.apiurl.url.deletetoken, { auth_token: token });
    // console.log(result)
    localStorage.clear();
    this.toaster.success('Sign out successfully', '', { timeOut: 2000, closeButton: true, progressBar: true })
    localStorage.clear()
    this.router.navigateByUrl("/sessions/signin")
  }

}

