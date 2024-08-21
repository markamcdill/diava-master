import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-security-consent',
  templateUrl: './security-consent.component.html',
  styleUrls: ['./security-consent.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SecurityConsentComponent implements OnInit {

  showSplash: boolean = true;
  timedOut: boolean;

  constructor(private router: Router) {}


  ngOnInit(): void {}

  acceptSecurity() {
    this.showSplash = !this.showSplash; //This removes the splash screen 
    this.router.navigate(['./home']);
  }

}

