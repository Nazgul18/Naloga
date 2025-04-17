import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./bucket-list/bucket-list.component').then((m) => m.BucketListComponent);
        }
    },
    {
        path:'bucket/:id',
        loadComponent: () => {
            return import('./info/info.component').then((m) => m.InfoComponent);
        }
    }
];
