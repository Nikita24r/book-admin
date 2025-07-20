import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-link',
  standalone: true,
  templateUrl: './edit-link.component.html',
  styleUrls: ['./edit-link.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ <-- THIS FIXES THE ERROR
    RouterModule
  ]
})
export class EditLinkComponent {
  myForm!: FormGroup;
  id!: string;
  selectedId;
  isLoading = false;

  constructor(  private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private as: AlertService) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      link: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });


     // Get ID from route
     this.id = this.route.snapshot.paramMap.get('id') || '';
     if (this.id) {
       this.fetchLinkData();
     }
   }

  

  fetchLinkData(): void {
    this.api.getById('link', this.id).subscribe({
      next: (data: any) => {
        this.selectedId= data.data._id;
        this.myForm.patchValue({
          title: data.data.title,
          description: data.data.description,
          link: data.data.link
        });
      },
      error: (err) => {
        this.as.errorToast('Failed to load link data.');
        console.error(err);
      }
    });
  }





  onSubmit(): void {
    if (this.myForm.valid) {
      const linkData = this.myForm.value;
      console.log('Link submitted:', linkData);
     
      // Submit logic (e.g. send to API) goes here
      this.api.put('link', this.selectedId,linkData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res) {
            this.router.navigate(['/component/link']);
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
    } else {
      console.log('Form is invalid');
      this.myForm.markAllAsTouched();
    }
  }
}