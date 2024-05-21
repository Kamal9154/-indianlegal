import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGaurd } from './shared/services/auth.gaurd';
import { BlankLayoutComponent } from './shared/components/layouts/blank-layout/blank-layout.component';
import { AdminLayoutSidebarLargeComponent } from './shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component';
import { PoliceComponent } from './components/police/police.component';
import { ConsulatesComponent } from './components/consulates/consulates.component';
import { FaqComponent } from './components/faq/faq.component';
import { NewsUpdatesComponent } from './components/news-updates/news-updates.component';
import { ContactComponent } from './components/contact/contact.component';
import { LawyerComponent } from './components/lawyer/lawyer.component';

const adminRoutes: Routes = [

  {
    path: 'chat',
    loadChildren: () => import('./views/chat/chat.module').then(m => m.ChatModule)
  }, 
  {
    path: 'police', 
    component: PoliceComponent
  },
  {
    path: 'lawyer', 
    component: LawyerComponent
  },
  {
    path: 'consulates', 
    component: ConsulatesComponent
  },
  {
    path: 'faq', 
    component: FaqComponent
  },
  {
    path: 'news-updates', 
    component: NewsUpdatesComponent
  },
  {
    path: 'contact', 
    component: ContactComponent
  }
];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'others',
        loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutSidebarLargeComponent,
    canActivate: [AuthGaurd],
    children: adminRoutes
  },
  {
    path: '**',
    redirectTo: 'others/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
