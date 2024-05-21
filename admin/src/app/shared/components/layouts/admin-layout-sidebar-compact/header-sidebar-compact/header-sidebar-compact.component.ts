import { Component, OnInit } from "@angular/core";
import { NavigationService } from "src/app/shared/services/navigation.service";
import { AuthService } from "src/app/shared/services/auth.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-header-sidebar-compact",
  templateUrl: "./header-sidebar-compact.component.html",
  styleUrls: ["./header-sidebar-compact.component.scss"]
})
export class HeaderSidebarCompactComponent implements OnInit {
  notifications: any[];

  constructor(
    private navService: NavigationService,
    private auth: AuthService,
    private modalservice: NgbModal
  ) {

  }

  ngOnInit() { }

  toggelSidebar() {
    const state = this.navService.sidebarState;
    state.sidenavOpen = !state.sidenavOpen;
    state.childnavOpen = !state.childnavOpen;
  }

  signout(content) {
    this.modalservice.open(content)
  }
  submitModal() {
    this.modalservice.dismissAll()
    this.auth.signout();
  }
}
