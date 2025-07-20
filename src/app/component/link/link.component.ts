import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { NgxPaginationModule } from "ngx-pagination";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link',
  styleUrls: ['./link.component.scss'],
  standalone: true,
  imports: [NgxPaginationModule, CommonModule,RouterModule] ,// ✅ Add RouterModule
  templateUrl: './link.component.html',
})
export class LinkComponent  {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any = environment.url;

  selectedLink: any = {};
  getData: any[] = []; // ✅ initialize it as an array
  myForm!: FormGroup;

  linkToDeleteId: string | null = null;
  collection: any[] = [];

  @ViewChild('confirmDeleteModal') confirmDeleteModal: any;

  constructor(
    private _apiService: ApiService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.myForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', [Validators.required]]
    });

    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  ngOnInit() {
    this.fetchAllLinks();
  }

  fetchAllLinks() {
    this._apiService.get('link', {}).subscribe({
      next: (res) => {
        this.getData = res["data"];
        console.log('Fetched links:', this.getData["data"]);
      },
      error: (err) => {
        console.error('Error fetching links:', err);
      }
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      this._apiService.delete('link', id).subscribe(() => {
        this.fetchAllLinks();
      });
    }
  }
  

  confirmDelete(modal: any) {
    modal.close('Delete');
  }
}
