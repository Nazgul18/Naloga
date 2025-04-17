import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './info.component.html',
})
export class InfoComponent {

  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private router: Router) {}

  bucketId: number = 0;
  files: { bucketId: number, name: string, modified: string, size: number }[] = [];
  selectedFile: any = null;
  BucketName: string="";
  BucketLocation: string="";
  totalSize: number = 0;
  selectedTab: 'files' | 'details' = 'files';


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.bucketId = id ? +id : 0;
      this.refreshFiles();
    });
  }

  fileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const fileData = {
        name: file.name,
        modified: new Date().toLocaleDateString(),
        size: Math.round(file.size / 1024),
        bucketId: this.bucketId
      };

      this.files.push(fileData);

      this.httpClient.post('http://localhost:3000/api/files', fileData).subscribe({
        next: () => this.refreshFiles(),
        error: err => console.error(err),
      });
    }
  }

  refreshFiles() {
    this.httpClient.get<any[]>('http://localhost:3000/api/podatki').subscribe({
      next: buckets => {
        const currentBucket = buckets.find(bucket => bucket.id === this.bucketId);
        this.files = currentBucket.files;

        this.BucketName = currentBucket.name;
        this.BucketLocation = currentBucket?.location;


        this.totalSize = this.files.reduce((sum, file) => {
          return sum + file.size;
        }, 0);
      },
      error: err => console.error(err)
    });
  }

  selectFile(file: any) {
    this.selectedFile = file;
  }

  deleteBucket(): void {
    this.httpClient.post('http://localhost:3000/api/deleteBucket', { bucketId: this.bucketId }).subscribe({
      next: () => this.router.navigate(['']),
      error: (err) => console.error(err),
    });
  }

  formatFileSize(sizeInKB: number): string {
    const sizeInBytes = sizeInKB * 1024;
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 ** 2) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else if (sizeInBytes < 1024 ** 3) return `${(sizeInBytes / 1024 ** 2).toFixed(1)} MB`;
    else return `${(sizeInBytes / 1024 ** 3).toFixed(1)} GB`;
  }

  deleteFile(): void {
    this.httpClient.post('http://localhost:3000/api/deleteFile', { bucketId: this.bucketId, selectedFile: this.selectedFile}).subscribe({
      next: () => this.refreshFiles(),
      error: (err) => console.error(err),
    });
  }
}
