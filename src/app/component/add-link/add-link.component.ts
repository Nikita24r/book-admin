import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-link',
  standalone: true,
  templateUrl: './add-link.component.html',
  styleUrls: ['./add-link.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ <-- THIS FIXES THE ERROR
    RouterModule
  ]
})
export class AddLinkComponent  {
  myForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private as: AlertService,
    private route: Router
  ) {
    this.myForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(5)]],
      link: ['', [Validators.required, Validators.pattern('https?://.+')]], // simple URL pattern
    });
  }    

  ngOnInit(): void {}

  onSubmit(frm: FormGroup): void {
    console.log('Form valid?', frm.valid); // Check this too

    if (frm.valid) {
      this.isLoading = true;

      this.api.post('link', frm.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res) {
            this.route.navigate(['/link']);
            this.as.successToast('Link created successfully!');
          } else {
            this.as.warningToast(res?.error?.message || 'Unknown warning.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.as.errorToast(error.message || 'Submission failed.');
        }
      });
    }
  }
}