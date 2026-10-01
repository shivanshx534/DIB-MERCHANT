import { TestBed } from '@angular/core/testing';
import { CaptchaService } from '../core/services/captcha.service';
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

describe('CaptchaService', () => {
	it('should bypass the backend for a valid six-digit OTP when direct dashboard is allowed', (done) => {
		const service = new CaptchaService();
		const fetchSpy = spyOn(window, 'fetch');

		service.verifyOtp({
			otpReferenceId: 'ref-123',
			userName: 'merchant',
			otp: '123456',
			deviceId: 'test-device',
			requestDateTime: new Date().toISOString(),
		}).subscribe({
			next: token => {
				expect(token).toBe('local-dashboard-token');
				expect(fetchSpy).not.toHaveBeenCalled();
				done();
			},
			error: done.fail,
		});
	});
});
