// import { AgmInfoWindow } from '@agm/core';
import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import MarkerClusterer from "@google/markerclustererplus";

// declare var google: any;

@Component({
  selector: 'app-consulates',
  templateUrl: './consulates.component.html',
  styleUrls: ['./consulates.component.scss']
})
export class ConsulatesComponent implements OnInit {
  markerCluster: any;
  addeditform: FormGroup
  mapMarkers: any = [];
  infoWindow: google.maps.InfoWindow;

  user_id = localStorage.getItem('user_id')
  consulate: any
  submitted = false
  consulate_id: any
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: google.maps.Map;
  marker: google.maps.Marker;

  async ngAfterViewInit() {
    await this.getConsulateData()
    this.mapInit();
  }
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private validation: ValidationService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private router: Router,
    private toastr: ToastrService,
  ) { }
  async mapInit() {
    /*<-- center the map */
    let center = new google.maps.LatLng(this.consulate[0].lat, this.consulate[0].lng);
    let mapOptions: google.maps.MapOptions = {
      center: center,
      zoom: 5
    };
    /* center the map -->*/

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({ position: center, map: this.map })
    this.infoWindow = new google.maps.InfoWindow();
    for (let i of this.consulate) {
      const tempMarker = new google.maps.Marker({ position: i, map: this.map });
      tempMarker.addListener('click', ((tempMarker, map, infoWindow) => {
        return () => {
          this.openPopup(tempMarker, i)
        }
      })(tempMarker, this.map, this.infoWindow));
      this.mapMarkers.push(tempMarker);
    }
  }
  currentPopup: any;
  openPopup(marker: google.maps.Marker, data) {
    const infoWindow = new google.maps.InfoWindow();
    // Create a div element to hold the popup content
    const contentDiv = document.createElement('div');

    // Create the HTML content including a button with an onclick event
    contentDiv.innerHTML = `
    <div class="card-body">
    <h5 class="card-title">${data.title}</h5>
    <p class="card-text">${data.address}</p> 
    <div data-toggle="modal" data-target="#myModal" id="editButton" class="editbtn btn btn-primary">Edit</div>
    <div data-toggle="modal" data-target="#deleteModal" class="btn btn-danger">Delete</div></div>`;

    // Add the content to the infoWindow
    infoWindow.setContent(contentDiv);
    // Open the infoWindow on the map
    if (this.currentPopup) {
      this.currentPopup.close();
    }
    infoWindow.open(this.map, marker);
    this.currentPopup = infoWindow

    // Add a click event listener to the button
    contentDiv.addEventListener('click', (event) => {
      this.onEdit(data);
    });

  }

  async ngOnInit() {
    this.addeditform = this.fb.group({
      title: ['', this.validation.name],
      address: ['', this.validation.address],
      contact_number: ['', this.validation.address],
      latitude: ['', this.validation.latitude],
      longitude: ['', this.validation.longitude],
    })
  }
  addnewInvoice(content) {
    this.addeditform.reset();
    this.submitted = false
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        this.addeditform.reset();
        this.submitted = false
        this.modalService.dismissAll();
      });
  }

  async addEditConsulate(edit?: any) {

    this.submitted = true
    if (!this.addeditform.valid) {
      // this.toastr.error('Form is invalid')
      return
    }
    else {
      if (edit == 'edit') {
        this.addeditform.value.consulate_id = this.consulate_id
      }
      this.addeditform.value.latitude = Number(this.addeditform.value.latitude)
      this.addeditform.value.longitude = Number(this.addeditform.value.longitude)
      this.addeditform.value.user_id = this.user_id
      let result = await this.http.post(this.apiurl.url.addEditConsulateData, this.addeditform.value)
      if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
        localStorage.clear()
        this.router.navigateByUrl("/sessions/signin")
        this.toastr.error(result['message'])
      }
      if (result['status']) {
        this.addeditform.reset()
        this.submitted = false
        this.modalService.dismissAll();
        this.consulate = result['data']
        this.toastr.success(result['message'])
      }
      else {
        this.toastr.error(result['message'])
        this.modalService.dismissAll();
      }
    }
    this.mapInit();
  }
  async getConsulateData() {
    let result = await this.http.post(this.apiurl.url.getConsulateData, { user_id: this.user_id })
    this.consulate = result['data']
    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }
  }
  onEdit(data) {
    this.addeditform.reset();
    this.submitted = false
    let object = {
      address: data.address,
      contact_number: data.contact_number,
      latitude: data.lat,
      longitude: data.lng,
      title: data.title
    }
    this.consulate_id = data.id
    this.addeditform.setValue(object);
  }

  async deleteData(id: any) {
    let result = await this.http.post(this.apiurl.url.deleteConsulateData, { consulate_id: id })
    this.consulate = result['data']

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
    await this.getConsulateData()
    this.mapInit();
  }
}

