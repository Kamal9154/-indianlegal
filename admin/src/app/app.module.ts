import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
import { HttpClientModule } from '@angular/common/http';
import { PoliceComponent } from './components/police/police.component';
import { ConsulatesComponent } from './components/consulates/consulates.component';
import { FaqComponent } from './components/faq/faq.component';
import { NewsUpdatesComponent } from './components/news-updates/news-updates.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { ImageCropperModule } from 'ngx-image-cropper';
import { environment } from 'src/environments/environment';
import { ChatService } from './views/chat/chat.service';

// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
// const config: SocketIoConfig = { url: environment.socketUrl, options: { transports: ['polling'] } }; //live server(4004) final url
// const config: SocketIoConfig = { url: environment.socketUrl, options: { transports: ['websocket'] } }; //local
import { ViewportScroller } from '@angular/common';
import { ContactComponent } from './components/contact/contact.component';
import { LawyerComponent } from './components/lawyer/lawyer.component';
import { ToastrModule } from 'ngx-toastr'

@NgModule({
  declarations: [
    AppComponent,
    PoliceComponent,
    ConsulatesComponent,
    FaqComponent,
    NewsUpdatesComponent,
    ContactsComponent,
    ContactComponent,
    LawyerComponent,
  ],
  imports: [
    // ImageCropperModule,
    BrowserModule,
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    // InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
    AppRoutingModule,
    ReactiveFormsModule,
    NgbModule,
    ToastrModule.forRoot()
    // SocketIoModule.forRoot(config), 
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
