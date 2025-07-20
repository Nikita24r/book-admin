import { Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { AddPoemComponent } from './add-poem/add-poem.component';
import { PoemComponent } from './poem/poem.component';
import { LinkComponent } from './link/link.component';
import { AddLinkComponent } from './add-link/add-link.component';
import { EditLinkComponent } from './edit-link/edit-link.component';


export const ComponentsRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'table',
				component: TableComponent
			},
			{
				path: 'add-poem',
				component: AddPoemComponent
			},
			{
				path: 'poem',
				component: PoemComponent
			},
			{
				path: 'link',
				component:  LinkComponent
			},
			{
				path: 'link/add-link',
				component: AddLinkComponent
			},
			{
				path: 'link/edit-link/:id',
				component:  EditLinkComponent
			},
			
		]
	}
];
