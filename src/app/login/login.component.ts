// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  
  // Add properties for alert modal
  showSuccessAlert: boolean = false;
  alertMessage: string = '';
  pendingRedirectPath: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private as: AlertService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value)
        .pipe(
          catchError(error => {
            console.error('Login failed', error);
            this.isLoading = false;
            
            // Handle different types of errors
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.status === 401) {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.status === 404) {
              errorMessage = 'User not found. Please check your email.';
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            
            this.as.errorToast(errorMessage);
            return of(null);
          })
        )
        .subscribe((resp: any) => {
          this.isLoading = false;
          
          if (resp && resp.success) {
            this.tokenService.setToken(resp.accessToken, resp.refreshToken);
            this.tokenService.setUser(resp.user);
            
            // Show success alert instead of toast
            this.showSuccessAlert = true;
            this.alertMessage = "Login successful! Welcome back.";
            this.pendingRedirectPath = '/dashboard';
            
          } else if (resp && !resp.success) {
            // Handle case where response is received but success is false
            const errorMessage = resp.message || 'Invalid credentials. Please try again.';
            this.as.errorToast(errorMessage);
          }
        });
    } else {
      // Form is invalid
      this.markFormGroupTouched(this.loginForm);
      this.as.errorToast('Please fill in all required fields correctly.');
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      this.authService.register(this.registerForm.value)
        .pipe(
          catchError(error => {
            console.error('Registration failed', error);
            this.isLoading = false;
            
            // Handle different types of registration errors
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.status === 409) {
              errorMessage = 'Email already exists. Please use a different email or try logging in.';
            } else if (error.status === 422) {
              errorMessage = 'Invalid data provided. Please check your information.';
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            
            this.as.errorToast(errorMessage);
            return of(null);
          })
        )
        .subscribe(response => {
          this.isLoading = false;
          
          if (response) {
            console.log('Registration successful', response);
            this.as.successToast('Registration successful! You can now log in with your credentials.');
            this.isLoginMode = true;  // Switch to login mode after successful registration
            this.registerForm.reset(); // Clear the form
          }
        });
    } else {
      // Form is invalid
      this.markFormGroupTouched(this.registerForm);
      this.as.errorToast('Please fill in all required fields correctly.');
    }
  }

  // Method to handle OK button click in success alert
  onAlertOkClick(): void {
    this.showSuccessAlert = false;
    if (this.pendingRedirectPath) {
      this.router.navigate([this.pendingRedirectPath]);
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.isLoading = false;
    
    // Reset forms when switching modes
    this.loginForm.reset();
    this.registerForm.reset();
    
    // Clear any existing validation errors
    this.markFormGroupUntouched(this.loginForm);
    this.markFormGroupUntouched(this.registerForm);
  }

  // Helper method to mark all form controls as touched (to show validation errors)
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to mark all form controls as untouched (to hide validation errors)
  private markFormGroupUntouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsUntouched();
    });
  }

  // Getter methods for easy access to form controls in template
  get loginEmail() {
    return this.loginForm.get('email');
  }

  get loginPassword() {
    return this.loginForm.get('password');
  }

  get registerUsername() {
    return this.registerForm.get('username');
  }

  get registerEmail() {
    return this.registerForm.get('email');
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }
}