import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IMenuItem {
    id?: string;
    title?: string;
    description?: string;
    type: string;       // Possible values: link/dropDown/extLink
    name?: string;      // Used as display text for item and title for separator type
    state?: string;     // Router state
    icon?: string;      // Material icon name
    tooltip?: string;   // Tooltip text
    disabled?: boolean; // If true, item will not be appeared in sidenav.
    sub?: IChildItem[]; // Dropdown items
    badges?: IBadge[];
    active?: boolean;
}
export interface IChildItem {
    id?: string;
    parentId?: string;
    type?: string;
    name: string;       // Display text
    state?: string;     // Router state
    icon?: string;
    sub?: IChildItem[];
    active?: boolean;
}

interface IBadge {
    color: string;      // primary/accent/warn/hex color codes(#fff000)
    value: string;      // Display text
}

interface ISidebarState {
    sidenavOpen?: boolean;
    childnavOpen?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    public sidebarState: ISidebarState = {
        sidenavOpen: true,
        childnavOpen: false
    };
    selectedItem: IMenuItem;

    constructor() {
    }

    defaultMenu: IMenuItem[] = [       
        {
            icon: 'i-Speach-Bubble-3', name: 'Chat', state: '/chat', type: 'link'
        },
        {
            icon: 'i-Business-Man', name: 'Lawyers', state: '/lawyer', type: 'link'
        },
        {
            icon: 'i-Tag', name: 'Police', state: '/police', type: 'link'
        },
        {
            icon: 'i-Consulting', name: 'Consulates', state: '/consulates', type: 'link'
        },
        {
            icon: 'i-File-Clipboard-Text--Image', name: 'FAQ', state: '/faq', type: 'link'
        },
        {
            icon: 'i-Newspaper', name: 'News & Updates', state: '/news-updates', type: 'link'
        },
        {
            icon: 'i-Address-Book', name: 'Contact', state: '/contact', type: 'link'
        }
       
    ];


    // sets iconMenu as default;
    menuItems = new BehaviorSubject<IMenuItem[]>(this.defaultMenu);
    // navigation component has subscribed to this Observable
    menuItems$ = this.menuItems.asObservable();

}
