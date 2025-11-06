import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() toggleSidenav = new EventEmitter<void>();toggleTheme() {
  
  document.documentElement.classList.toggle('dark-mode');
}

}
