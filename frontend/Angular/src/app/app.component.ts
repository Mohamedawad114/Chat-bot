import { Component, OnInit } from '@angular/core';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from './auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'socialLoginApp';
  user: SocialUser | null = null;
  loggedIn = false;
  facebookToken: string | null = null;

  constructor(
    private socialAuthService: SocialAuthService,
    public _authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // ===== Google Login =====
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.user = user;
        this.loggedIn = true;
        this.loginWithGoogle(user.idToken);
      }
    });

    // ===== Facebook Login =====
    this.route.queryParams.subscribe((params) => {
      const token = params['token']; // JWT من الباك بعد Facebook login
      if (token) {
        localStorage.setItem('facebookJwt', token);
        this.facebookToken = token;
        // بعد تخزين التوكن نقدر نعمل redirect للصفحة الرئيسية
        this.router.navigate(['/']);
      }
    });
  }

  // ===== Google Login Handler =====
  loginWithGoogle(idToken: string) {
    this._authService.loginWithGmail({ idToken }).subscribe((data) => {
      console.log('Google login response:', data);
    });
  }

  // ===== Facebook Login Handler =====
  facebookLogin() {
    // redirect للبك إند لبدء عملية Facebook OAuth
    window.location.href = 'http://localhost:3000/Auth/facebook/callback';
  }
}
