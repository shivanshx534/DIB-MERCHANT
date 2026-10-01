import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LoginComponent],
		}).compileComponents();
	});

	it('should create the login page', () => {
		const fixture = TestBed.createComponent(LoginComponent);
		expect(fixture.componentInstance).toBeTruthy();
	});
});
