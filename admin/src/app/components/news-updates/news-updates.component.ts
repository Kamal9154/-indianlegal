import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import * as moment from 'moment';

@Component({
  selector: 'app-news-updates',
  templateUrl: './news-updates.component.html',
  styleUrls: ['./news-updates.component.scss'],
})
export class NewsUpdatesComponent implements OnInit {
  addEditform: FormGroup
  news_id: any
  NewsData: any
  imageSrc: any;
  imageData: any;
  submitted = false

  constructor(
    private toastr: ToastrService,
    private http: HttpService,
    private apiUrl: ApiUrlService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private validation: ValidationService
  ) { }

  open(modal) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => {
      }, (reason) => {
        console.log('Err!', 'reason');
      });
  }
  ngOnInit(): void {
    this.getNewUpdateData()
    this.addEditform = this.fb.group({
      title: ['', this.validation.required],
      body: ['', this.validation.required],
      source: ['', this.validation.required],
      date: ['', this.validation.required],
    })
  }
  async getNewUpdateData(filter?: any) {
    let result = await this.http.post(this.apiUrl.url.getNewsData, { filter: filter })
    this.NewsData = result['data']
  }
  addEditnewsInvoice(content, newsData?: any) {
    if (newsData) {
      this.news_id = newsData.id;
      this.addEditform.value.news_id = newsData.id;
      this.imageSrc = newsData.image
      this.addEditform.patchValue({ title: newsData.title, body: newsData.body, source: newsData.source });
      this.addEditform.get('date').patchValue(moment(newsData.created_at).format('yyyy-MM-DD'));

    }
    else {
      this.news_id = ''
      this.addEditform.get('date').patchValue(moment().format('yyyy-MM-DD'));
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {
        // console.log('dismiss')
        this.addEditform.reset();
        this.news_id = ''
        this.imageSrc = ''
        this.submitted = false
        this.modalService.dismissAll();
      });
  }
  async addEditNews() {
    this.submitted = true
    if (this.addEditform.invalid) {
      return
    }
    if (!this.imageSrc) {
      this.toastr.error('image is required')
      return
    }

    const formData = new FormData

    formData.append("body", this.addEditform.value.body);
    formData.append("source", this.addEditform.value.source);
    formData.append("title", this.addEditform.value.title);
    formData.append("news_id", this.news_id);
    formData.append("date", this.addEditform.value.date);
    // console.log(this.data.original,"this.data.original")
    if (this.imageData) {
      formData.append("image", this.imageData);
    }
    // console.log(this.addEditform.value)
    let result = await this.http.post(this.apiUrl.url.addEditNews, formData)
    // console.log(result)
    if (result['status']) {
      this.toastr.success(result['message'])
      this.modalService.dismissAll()
    }
    else {
      this.toastr.error(result['message'])
    }
    this.NewsData = result['data']
  }
  onChange(e: any) {
    // console.log(e.target.files[0])
    const file = e.target.files[0]
    const reader = new FileReader();
    reader.onload = e => this.imageSrc = reader.result;
    reader.readAsDataURL(file);
    this.imageData = e.target.files[0]
  }


  deleteInvoice(modal, id) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(async (result) => {
        // console.log('result');
        let resultData = await this.http.post(this.apiUrl.url.deleteNewsData, { news_id: id })
        if (resultData['status']) {
          this.toastr.success(resultData['message'])
          this.modalService.dismissAll()
        }
        else {
          this.toastr.error(resultData['message'])
        }
        this.NewsData = resultData['data']
      }, (reason) => {
        // console.log('Err!', 'reason');
      });
  }

  async deleteNews() {

    // let result = await this.http.post(this.apiUrl.url.deleteNewsData, { news_id:})
  }

}
