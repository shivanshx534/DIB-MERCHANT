import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { InvoicesPage } from './features/invoices/invoices.page';
import { QrTerminalPage } from './features/qr/qr-terminal.page';
import { QrDownloadPage } from './features/qr/qr-download.page';

export const routes: Routes = [
	{ path: '', component: LoginComponent },
	{
		path: 'dashboard',
		component: DashboardComponent,
		children: [
			{ path: '', component: DashboardPage },
			{ path: 'invoices', component: InvoicesPage },
			{ path: 'qr-code', component: QrTerminalPage },
			{ path: 'qr-download', component: QrDownloadPage },
		],
	},
	{ path: '**', redirectTo: '' },
];
