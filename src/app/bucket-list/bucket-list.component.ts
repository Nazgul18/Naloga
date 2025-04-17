import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bucket-list',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.css']
})
export class BucketListComponent {
  showForm = false;
  podatki: any[] = [];

  addBucket = new FormGroup({
    name: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required)
  });

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  loadData() {
    this.httpClient.get<any[]>('http://localhost:3000/api/podatki').subscribe({
      next: data => this.podatki = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.addBucket) {
      const podatki = this.addBucket.value;
      this.showForm=false;

      this.httpClient.post('http://localhost:3000/api/podatki', podatki).subscribe({
        next: (res: any) => {
          this.addBucket.reset();
          this.loadData();
        },
        error: (err) => console.error(err),
      });
    }
  }
}
