import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaptchaResponse } from '../core/models/captcha.model';
import { CaptchaService } from '../core/services/captcha.service';
import { environment } from '../../environments/environment';
import enStrings from '../i18n/en.json';
import arStrings from '../i18n/ar.json';

type Lang = 'en' | 'ar';

interface LangStrings {
  dir: string;
  toggleLabel: string;
  step1: string;
  step2: string;
  step3: string;
  loginTitle: string;
  loginSubtitle: string;
  lblMerchantId: string;
  lblPassword: string;
  lblRemember: string;
  lblForgot: string;
  lblContinue: string;
  captchaTitle: string;
  captchaSubtitle: string;
  captchaLabel: string;
  captchaVerified: string;
  captchaInputLabel: string;
  captchaInputPlaceholder: string;
  captchaRefreshLabel: string;
  captchaCodeLabel: string;
  otpTitle: string;
  otpSubtitle: string;
  lblResendPrefix: string;
  resend: string;
  resendIn: string;
  footerText: string;
  errCredentials: string;
  errTextCaptcha: string;
  errCaptcha: string;
  errOtp: string;
  toastOtpSent: string;
  toastSuccess: string;
  back: string;
  verify: string;
}

const STRINGS: Record<Lang, LangStrings> = {
  en: enStrings,
  ar: arStrings,
};

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page-pattern" aria-hidden="true"></div>
    <div class="auth-shell">
      <div class="auth-card-shell">
        <!-- Visual panel: merchant brand storytelling -->
        <aside class="auth-visual">
          <div class="auth-visual__caption">
            <span class="auth-visual__eyebrow">DUBAI ISLAMIC BANK</span>
            <strong>Built for every sale.</strong>
            <span>Manage payments, settlements, and growth from one secure place.</span>
          </div>
        </aside>

        <!-- Form panel -->
        <main class="auth-panel">
          <div class="auth-panel__top">
            <button class="text-size-toggle" type="button" title="Toggle text size" (click)="toggleTextSize()">A<span>+</span></button>
            <a href="#" class="lang-switch" (click)="toggleLanguage($event)">{{ s.toggleLabel }}</a>
          </div>

          <div class="auth-card">
            <div class="auth-card__logo">
              <div class="auth-visual__mark">M</div>
              <div>
                <strong>MAPS Merchant</strong>
                <span>Dubai Islamic Bank</span>
              </div>
            </div>

            <div class="auth-steps">
              <div class="auth-step-dot" [class.active]="dotClass(1).active" [class.complete]="dotClass(1).complete">
                <span>1</span><small>{{ s.step1 }}</small>
              </div>
              <div class="auth-step-line"></div>
              <div class="auth-step-dot" [class.active]="dotClass(2).active" [class.complete]="dotClass(2).complete">
                <span>2</span><small>{{ s.step2 }}</small>
              </div>
              <div class="auth-step-line"></div>
              <div class="auth-step-dot" [class.active]="dotClass(3).active" [class.complete]="dotClass(3).complete">
                <span>3</span><small>{{ s.step3 }}</small>
              </div>
            </div>

            <!-- Step 1: Credentials -->
            <section class="auth-step" [class.active]="isStepActive(1)">
              <h2>{{ s.loginTitle }}</h2>
              <p class="auth-step__sub">{{ s.loginSubtitle }}</p>

              <form novalidate (ngSubmit)="onCredentialsSubmit()">
                <div class="field">
                  <label>{{ s.lblMerchantId }} <span class="req">*</span></label>
                  <input
                    class="input"
                    name="merchantId"
                    placeholder="e.g. 10000981 or name@company.com"
                    autocomplete="username"
                    required
                    [(ngModel)]="merchantId"
                  />
                </div>
                <div class="field">
                  <label>{{ s.lblPassword }} <span class="req">*</span></label>
                  <div class="password-field">
                    <input
                      class="input"
                      name="password"
                      [type]="passwordVisible ? 'text' : 'password'"
                      placeholder="Enter your password"
                      autocomplete="current-password"
                      required
                      [(ngModel)]="password"
                    />
                    <button type="button" class="password-toggle" aria-label="Show password" (click)="togglePassword()">{{ passwordToggleIcon }}</button>
                  </div>
                </div>
                <div class="text-captcha field">
                  <label>{{ s.captchaCodeLabel }} <span class="req">*</span></label>
                  <div class="text-captcha__row">
                    <div class="text-captcha__image" aria-label="CAPTCHA challenge">
                      <img *ngIf="captchaImage" [src]="captchaImage" alt="CAPTCHA challenge" />
                      <span *ngIf="captchaLoading" class="captcha-loading-spinner" aria-label="Loading"></span>
                      <span *ngIf="!captchaLoading && !captchaImage">CAPTCHA unavailable</span>
                      <button
                        type="button"
                        class="captcha-refresh"
                        [attr.aria-label]="s.captchaRefreshLabel"
                        [title]="s.captchaRefreshLabel"
                        (click)="refreshTextCaptcha()"
                      >&#8635;</button>
                    </div>
                  </div>
                  <label for="textCaptchaInput">{{ s.captchaInputLabel }} <span class="req">*</span></label>
                  <input
                    id="textCaptchaInput"
                    class="input"
                    name="textCaptchaInput"
                    [placeholder]="s.captchaInputPlaceholder"
                    autocomplete="off"
                    required
                    [(ngModel)]="textCaptchaInput"
                  />
                </div>
                <div class="auth-row">
                  <label class="remember-me">
                    <input type="checkbox" name="rememberMe" [(ngModel)]="rememberMe" /> <span>{{ s.lblRemember }}</span>
                  </label>
                  <a href="#" class="auth-link" (click)="onForgotPassword($event)">{{ s.lblForgot }}</a>
                </div>
                <div class="field-error" *ngIf="credentialsError">{{ credentialsError }}</div>
                <div class="field-error" *ngIf="textCaptchaError">{{ textCaptchaError }}</div>
                <button type="submit" class="btn btn-primary auth-submit" [disabled]="encryptingPassword">
                  {{ encryptingPassword ? 'Encrypting...' : s.lblContinue }}
                </button>
              </form>
            </section>

            <!-- Step 2: Captcha -->
            <section class="auth-step" [class.active]="isStepActive(2)">
              <h2>{{ s.captchaTitle }}</h2>
              <p class="auth-step__sub">{{ s.captchaSubtitle }}</p>

              <div class="captcha-box">
                <div class="captcha-track" #captchaTrack [class.verified]="verified">
                  <div class="captcha-fill" [style.width.px]="fillWidth"></div>
                  <div class="captcha-label">{{ verified ? s.captchaVerified : s.captchaLabel }}</div>
                  <div
                    class="captcha-handle"
                    #captchaHandle
                    [style.left.px]="handleLeft"
                    (pointerdown)="onCaptchaPointerDown($event)"
                    (pointermove)="onCaptchaPointerMove($event)"
                    (pointerup)="onCaptchaPointerUp($event)"
                    (pointercancel)="onCaptchaPointerUp($event)"
                  >&#8594;</div>
                </div>
                <button type="button" class="captcha-refresh" title="Reset" (click)="resetCaptcha()">&#8635; Reset</button>
              </div>
              <div class="field-error" *ngIf="captchaError">{{ captchaError }}</div>

              <div class="auth-actions">
                <button type="button" class="btn btn-outline" (click)="backToCredentials()">{{ s.back }}</button>
                <button type="button" class="btn btn-primary" [disabled]="!verified" (click)="onCaptchaContinue()">{{ s.lblContinue }}</button>
              </div>
            </section>

            <!-- Step 3: OTP -->
            <section class="auth-step" [class.active]="isStepActive(3)">
              <h2>{{ s.otpTitle }}</h2>
              <p class="auth-step__sub">
                <span>{{ s.otpSubtitle }}</span>
                <strong>+971 5X&nbsp;XXX&nbsp;XX12 &amp; a&bull;&bull;&bull;&#64;fsstech.com</strong>
              </p>

              <div class="otp-inputs" [class.shake]="otpShake">
                <div
                  *ngFor="let box of otpSlots; let i = index"
                  class="otp-box"
                  [class.filled]="!!otpCode[i]"
                  [class.active]="i === otpCode.length && otpCode.length < otpSlots.length"
                >{{ otpCode[i] || '' }}</div>
                <input
                  #otpInput
                  class="otp-capture"
                  maxlength="6"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  [(ngModel)]="otpCode"
                  (ngModelChange)="onOtpCodeChange($event)"
                />
              </div>
              <div class="field-error" *ngIf="otpError">{{ otpError }}</div>

              <div class="otp-resend">
                <span>{{ s.lblResendPrefix }}</span>
                <button type="button" class="auth-link" [disabled]="resendDisabled || resendingOtp" (click)="onResendClick()">
                  <ng-container *ngIf="resendDisabled; else resendReady">{{ s.resendIn }} <span>{{ resendSeconds }}</span>s</ng-container>
                  <ng-template #resendReady>{{ s.resend }}</ng-template>
                </button>
              </div>

              <div class="auth-actions">
                <button type="button" class="btn btn-outline" (click)="goToStep(2)">{{ s.back }}</button>
                <button type="button" class="btn btn-primary" (click)="otpVerify()">{{ s.verify }}</button>
              </div>
            </section>

            <div class="auth-footer">
              <span>{{ s.footerText }}</span> &middot; DIB &copy; 2026
            </div>
          </div>
        </main>
      </div>
    </div>

    <div class="toast" [class.show]="toastVisible">{{ toastMessage }}</div>
  `,
  styles: [`
    /* ---- Theme variables scoped to this component (emerald palette from theme.css) ---- */
    :host {
      --color-primary: #0e7a4a;
      --color-primary-dark: #095c38;
      --color-primary-light: #e5f5ee;
      --color-accent: #a4123f;
      --color-bg: #f2f5f4;
      --color-surface: #ffffff;
      --color-border: #e6eae9;
      --color-text: #1c2b2a;
      --color-text-muted: #6b7876;
      --color-success: #14a44d;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --transition: 180ms ease;
      --shadow-md: 0 4px 16px rgba(16, 24, 40, .10);
      --shadow-lg: 0 12px 32px rgba(16, 24, 40, .14);
      --font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;

      display: block;
      font-family: var(--font-family);
      color: var(--color-text);
      font-size: 14px;
      -webkit-font-smoothing: antialiased;
    }
    :host * { box-sizing: border-box; }
    :host a { color: inherit; text-decoration: none; }
    :host button { font-family: inherit; }

    /* Full-viewport diamond pattern behind the floating card */
    .auth-page-pattern {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(45deg, rgba(14, 122, 74, .08) 25%, transparent 25%, transparent 75%, rgba(14, 122, 74, .08) 75%),
        linear-gradient(45deg, rgba(14, 122, 74, .08) 25%, transparent 25%, transparent 75%, rgba(14, 122, 74, .08) 75%);
      background-size: 46px 46px;
      background-position: 0 0, 23px 23px;
      mask-image: radial-gradient(1px 1px, #000 1px, transparent 0);
      mask-size: 46px 46px;
    }

    .auth-shell {
      position: relative; z-index: 1; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 16px;
      background: #f3f7f5;
    }

    .auth-card-shell {
      width: min(1120px, 100%);
      min-height: min(640px, calc(100dvh - 32px));
      display: flex;
      background: var(--color-surface);
      border: 1px solid #dbe7e1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(15, 69, 47, .14);
    }

    /* ---------------- Visual / brand panel ---------------- */
    .auth-visual {
      flex: 0 0 52%;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      color: #fff;
      background:
        linear-gradient(0deg, rgba(3, 52, 31, .88) 0%, rgba(3, 52, 31, .34) 42%, rgba(3, 52, 31, .04) 72%),
        url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85') center / cover,
        #0e7a4a;
    }

    .auth-visual__caption {
      position: relative; z-index: 1; padding: 42px;
      max-width: 520px;
    }
    .auth-visual__caption strong { display: block; font-size: 32px; line-height: 1.12; letter-spacing: 0; font-weight: 700; margin: 10px 0; }
    .auth-visual__caption span { display: block; font-size: 14px; line-height: 1.55; opacity: .9; }
    .auth-visual__caption .auth-visual__eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .14em; opacity: 1; }

    /* ---------------- Form panel ---------------- */
    .auth-panel { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow-y: auto; padding: 48px; position: relative; }
    .auth-panel__top { position: absolute; top: 18px; inset-inline-end: 20px; display: flex; align-items: center; gap: 8px; }
    .text-size-toggle {
      border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-accent);
      border-radius: 5px; padding: 4px 8px; font-size: 12px; font-weight: 800; cursor: pointer; line-height: 1;
    }
    .text-size-toggle span { font-size: 15px; }
    .lang-switch {
      color: var(--color-primary); font-size: 12.5px; font-weight: 700; text-decoration: none;
      cursor: pointer; padding: 5px 2px;
    }
    .lang-switch:hover { color: var(--color-primary-dark); text-decoration: underline; }
    :host-context(body.auth-large-text) .auth-card { zoom: 1.12; }

    .auth-card { width: 100%; max-width: 370px; margin-block: auto; }
    .auth-card__logo { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; margin-bottom: 28px; }
    .auth-card__logo .auth-visual__mark {
      width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-primary); color: #fff;
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;
    }
    .auth-card__logo strong { display: block; font-size: 16px; }
    .auth-card__logo span { display: block; font-size: 11px; color: var(--color-text-muted); letter-spacing: .04em; }

    /* Step indicator */
    .auth-steps { display: flex; align-items: center; margin-bottom: 26px; }
    .auth-step-dot { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
    .auth-step-dot span {
      width: 30px; height: 30px; border-radius: 50%; background: var(--color-bg); border: 2px solid var(--color-border);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--color-text-muted);
      transition: all var(--transition);
    }
    .auth-step-dot small { font-size: 10.5px; color: var(--color-text-muted); white-space: nowrap; }
    .auth-step-dot.active span { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }
    .auth-step-dot.complete span { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
    .auth-step-dot.active small, .auth-step-dot.complete small { color: var(--color-primary); font-weight: 700; }
    .auth-step-line { flex: 1; height: 2px; background: var(--color-border); margin: 0 6px 18px; }

    /* Steps content */
    .auth-step { display: none; animation: pageFadeIn .3s ease; }
    .auth-step.active { display: block; }
    .auth-step h2 { margin: 0 0 4px; font-size: 22px; color: #123a2b; }
    .auth-step__sub { margin: 0 0 22px; font-size: 13px; color: var(--color-text-muted); }

    .password-field { position: relative; }
    .password-field input { padding-inline-end: 40px; }
    .password-toggle {
      position: absolute; inset-inline-end: 6px; top: 50%; transform: translateY(-50%);
      border: none; background: transparent; cursor: pointer; font-size: 15px; opacity: .6; padding: 6px;
    }

    .auth-row { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 18px; font-size: 12.5px; flex-wrap: wrap; gap: 8px; }
    .remember-me { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted); cursor: pointer; }
    .auth-link { color: var(--color-primary); font-weight: 600; cursor: pointer; background: none; border: none; font-size: 12.5px; padding: 0; }
    .auth-submit { width: 100%; justify-content: center; margin-top: 6px; }

    .field-error {
      background: #fdeceb; color: #a4123f; border-radius: var(--radius-sm); padding: 9px 12px;
      font-size: 12px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }

    .auth-actions { display: flex; gap: 10px; margin-top: 6px; }
    .auth-actions .btn { flex: 1; justify-content: center; }

    /* Captcha */
    .captcha-box { margin-bottom: 6px; }
    .captcha-track {
      position: relative; height: 48px; border-radius: 999px; background: #edf8f2;
      border: 1px solid #b9dfca; overflow: hidden; user-select: none; touch-action: none;
    }
    .captcha-fill {
      position: absolute; left: 0; top: 0; bottom: 0; width: 46px;
      background: #ccebd9; border-right: 1px solid #a9d7c1;
    }
    .text-captcha { padding-top: 2px; }
    .text-captcha__row { display: flex; align-items: center; margin-bottom: 10px; }
    .text-captcha__image {
      position: relative; overflow: hidden; height: 52px; width: 100%; display: flex; align-items: center; justify-content: center;
      border: 1px solid #b8ddcc; border-radius: 6px; color: #126c4a;
      background: linear-gradient(135deg, #e8f8ef 0%, #cceedd 100%);
      font-size: 18px; font-weight: 800; letter-spacing: .3em; text-shadow: 1px 1px 0 rgba(255,255,255,.9);
      user-select: none;
    }
    .text-captcha__image img { display: block; width: 100%; height: 100%; object-fit: fill; }
    .captcha-loading-spinner {
      width: 22px; height: 22px; border: 3px solid rgba(14, 122, 74, .2); border-top-color: #168052;
      border-radius: 50%; animation: captchaSpin .75s linear infinite;
    }
    @keyframes captchaSpin { to { transform: rotate(360deg); } }
    .text-captcha__image .captcha-refresh {
      position: absolute; top: 4px; right: 4px; z-index: 1;
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; margin: 0; padding: 0;
      border: 1px solid rgba(14, 122, 74, .16); border-radius: 5px;
      background: rgba(255, 255, 255, .76); color: #168052; font-size: 15px; line-height: 1;
    }
    .text-captcha__image .captcha-refresh:hover { background: #fff; color: var(--color-primary-dark); }
    .text-captcha label { display: block; font-weight: 600; font-size: 12.5px; margin-bottom: 6px; }
    .captcha-label {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      font-size: 12.5px; font-weight: 600; color: var(--color-text-muted); pointer-events: none;
    }
    .captcha-handle {
      position: absolute; top: 3px; left: 3px; width: 42px; height: 42px; border-radius: 50%;
      background: var(--color-surface); box-shadow: var(--shadow-md); display: flex; align-items: center; justify-content: center;
      cursor: grab; font-weight: 700; color: var(--color-primary); border: 1px solid var(--color-border); touch-action: none;
      will-change: left;
    }
    .captcha-handle:active { cursor: grabbing; }
    .captcha-track.verified .captcha-fill { background: var(--color-success); opacity: .18; }
    .captcha-track.verified .captcha-label { color: var(--color-success); }
    .captcha-track.verified .captcha-handle { color: #fff; background: var(--color-success); border-color: var(--color-success); }
    .captcha-refresh {
      border: none; background: transparent; color: var(--color-text-muted); font-size: 12px; cursor: pointer;
      margin-top: 8px; padding: 0;
    }

    /* OTP */
    .otp-inputs { position: relative; display: flex; gap: 10px; margin-bottom: 8px; cursor: text; }
    .otp-box {
      flex: 1 1 0; min-width: 0; height: 58px; display: flex; align-items: center; justify-content: center;
      text-align: center; font-size: 24px; line-height: 1; font-weight: 700;
      font-variant-numeric: tabular-nums;
      border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);
      color: var(--color-text); outline: none;
    }
    .otp-box:focus { border-color: var(--color-primary); }
    .otp-box.filled { border-color: var(--color-primary); background: var(--color-primary-light); }
    .otp-box.active { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(14, 122, 74, .12); }
    .otp-box.active::after {
      content: ''; width: 2px; height: 26px; margin-left: 2px; background: var(--color-primary);
      animation: otpCaret .9s steps(1, end) infinite;
    }
    @keyframes otpCaret { 50% { opacity: 0; } }
    .otp-capture {
      position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: text;
      border: 0; outline: 0; padding: 0; font-size: 1px;
    }
    .otp-inputs.shake { animation: otpShake .4s ease; }
    @keyframes otpShake {
      10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); }
      30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); }
    }
    .otp-resend { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--color-text-muted); margin-bottom: 4px; }
    .otp-resend .auth-link:disabled { color: var(--color-text-muted); cursor: default; opacity: .8; }

    @media (max-width: 480px) {
      .otp-inputs { gap: 7px; }
      .otp-box { height: 52px; font-size: 22px; }
    }

    .auth-footer { text-align: center; font-size: 11.5px; color: var(--color-text-muted); margin-top: 24px; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 999px; border: 1px solid transparent;
      font-weight: 700; font-size: 13px; cursor: pointer; transition: all var(--transition);
    }
    .btn-primary { background: var(--color-accent); color: #fff; }
    .btn-primary:hover { filter: brightness(1.08); }
    .btn-outline { background: var(--color-surface); border-color: var(--color-border); color: var(--color-text); }
    .btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .auth-card .btn-primary, .auth-card .btn-outline { border-radius: 8px; padding: 13px 16px; font-size: 14px; }
    .auth-card .btn-primary { background: linear-gradient(180deg, #14885a, #0b6c41); }
    .auth-card .btn-primary:hover { filter: brightness(1.05); }

    /* Form fields */
    .input {
      width: 100%; padding: 11px 12px; border-radius: var(--radius-md);
      border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
      font-size: 13px; outline: none;
    }
    .input:focus { border-color: var(--color-primary); }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-weight: 600; font-size: 12.5px; margin-bottom: 6px; }
    .field label .req { color: #d64550; }

    /* Toast */
    .toast {
      position: fixed; bottom: 20px; inset-inline-end: 20px; background: var(--color-text); color: var(--color-surface);
      padding: 12px 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: 13px;
      opacity: 0; transform: translateY(10px); transition: all var(--transition); z-index: 100; pointer-events: none;
    }
    .toast.show { opacity: 1; transform: translateY(0); }

    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }

    /* Responsive */
    @media (max-width: 760px) {
      .auth-card-shell { flex-direction: column; min-height: 0; }
      .auth-visual { flex: 0 0 auto; min-height: 260px; }
      .auth-visual__caption { padding: 28px 24px; }
      .auth-visual__caption strong { font-size: 26px; }
      .auth-panel { padding: 28px 24px 32px; }
    }

    @media (min-width: 761px) and (max-height: 760px) {
      .auth-card-shell { height: calc(100dvh - 32px); min-height: 0; }
      .auth-panel { padding: 30px 36px; }
      .auth-panel { overflow-y: auto; }
      .auth-card__logo { margin-bottom: 18px; }
      .auth-steps { margin-bottom: 18px; }
      .auth-footer { margin-top: 16px; }
    }
  `],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  /* ---------------- Language / text size ---------------- */
  lang: Lang = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('maps_lang') as Lang) || 'en'
    : 'en';

  get s(): LangStrings {
    return STRINGS[this.lang];
  }

  onLangChange(value: string): void {
    this.lang = value as Lang;
    localStorage.setItem('maps_lang', this.lang);
    this.applyDocumentLangAttrs();
  }

  toggleLanguage(event: Event): void {
    event.preventDefault();
    this.onLangChange(this.lang === 'en' ? 'ar' : 'en');
  }

  toggleTextSize(): void {
    this.renderer[this.largeText ? 'removeClass' : 'addClass'](document.body, 'auth-large-text');
    this.largeText = !this.largeText;
  }
  private largeText = false;

  private applyDocumentLangAttrs(): void {
    this.renderer.setAttribute(document.documentElement, 'dir', this.s.dir);
    this.renderer.setAttribute(document.documentElement, 'lang', this.lang);
  }

  /* ---------------- Toast ---------------- */
  toastMessage = '';
  toastVisible = false;
  private toastTimer: any;

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 2400);
  }

  /* ---------------- Step navigation ---------------- */
  currentStep = 1;

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }
  dotClass(step: number): { active: boolean; complete: boolean } {
    return { active: this.currentStep === step, complete: this.currentStep > step };
  }

  goToStep(step: number): void {
    this.currentStep = step;
    if (step === 3) {
      this.startResendTimer();
      setTimeout(() => this.otpInput?.nativeElement.focus(), 150);
    }
  }

  backToCredentials(): void {
    this.goToStep(1);
    this.encryptedPassword = '';
    this.otpReferenceId = '';
    this.refreshTextCaptcha();
  }

  /* ---------------- Step 1: Credentials ---------------- */
  merchantId = '';
  password = '';
  textCaptchaInput = '';
  textCaptchaError = '';
  captchaResponse: CaptchaResponse | null = null;
  captchaImage = '';
  captchaLoading = false;
  rememberMe = false;
  passwordVisible = false;
  credentialsError = '';
  encryptingPassword = false;
  encryptedPassword = '';

  get passwordToggleIcon(): string {
    return this.passwordVisible ? '\u{1F576}' : '\u{1F441}';
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  refreshTextCaptcha(): void {
    this.textCaptchaInput = '';
    this.textCaptchaError = '';
    this.captchaResponse = null;
    this.captchaImage = '';
    this.captchaLoading = true;

    this.captchaService.load().subscribe({
      next: response => {
        this.captchaResponse = response;
        this.captchaImage = this.toCaptchaImage(response.captchaImage);
        this.captchaLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.captchaLoading = false;
        this.textCaptchaError = 'CAPTCHA could not be loaded. Please refresh and try again.';
        this.changeDetector.detectChanges();
      }
    });
  }

  onCredentialsSubmit(): void {
    const id = this.merchantId.trim();
    const pw = this.password.trim();
    if (!id || !pw) {
      this.credentialsError = this.s.errCredentials;
      return;
    }
    if (!this.captchaResponse || !this.textCaptchaInput.trim()) {
      this.textCaptchaError = this.s.errTextCaptcha;
      return;
    }
    this.credentialsError = '';
    this.textCaptchaError = '';
    if (!this.captchaResponse) return;

    this.encryptingPassword = true;
    this.captchaService.encryptPassword({
      captchaId: this.captchaResponse.captchaId,
      secureRuntimeToken: this.captchaResponse.secureRuntimeToken,
      password: pw,
    }).subscribe({
      next: encryptedPassword => {
        this.encryptedPassword = encryptedPassword;
        this.captchaService.authenticate({
          username: id,
          password: encryptedPassword,
          captchaId: this.captchaResponse!.captchaId,
          captchaValue: this.textCaptchaInput.trim(),
          deviceId: environment.deviceId,
          requestDateTime: new Date().toISOString(),
        }).subscribe({
          next: otpReferenceId => {
            this.otpReferenceId = otpReferenceId;
            this.encryptingPassword = false;
            this.goToStep(2);
            this.changeDetector.detectChanges();
          },
          error: error => {
            this.encryptingPassword = false;
            this.credentialsError = error instanceof Error
              ? error.message
              : 'The CAPTCHA value is invalid. Please try again.';
            this.refreshTextCaptcha();
            this.changeDetector.detectChanges();
          },
        });
      },
      error: error => {
        this.encryptingPassword = false;
        this.credentialsError = error instanceof Error
          ? error.message
          : 'Password encryption failed. Please try again.';
        this.changeDetector.detectChanges();
      },
    });
  }

  otpReferenceId = '';

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.showToast('Password reset link sent (prototype only).');
  }

  private toCaptchaImage(value: string): string {
    if (value.startsWith('data:')) return value;
    return `data:${this.detectImageType(value)};base64,${value}`;
  }

  private detectImageType(base64: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    if (base64.startsWith('/9j/')) return 'image/jpeg';
    if (base64.startsWith('iVBOR')) return 'image/png';
    if (base64.startsWith('R0lGOD')) return 'image/gif';
    if (base64.startsWith('UklGR')) return 'image/webp';
    return 'image/jpeg';
  }

  /* ---------------- Step 2: Slide-to-verify captcha ---------------- */
  @ViewChild('captchaTrack') trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('captchaHandle') handleRef!: ElementRef<HTMLDivElement>;

  handleLeft = 3; // px, matches CSS default (.captcha-handle { left: 3px })
  fillWidth = 46; // px, matches CSS default (.captcha-fill { width: 46px })
  verified = false;
  captchaError = '';

  private dragging = false;
  private pointerOffset = 0;

  private trackRange(): number {
    const track = this.trackRef.nativeElement;
    const handle = this.handleRef.nativeElement;
    return track.clientWidth - handle.clientWidth - 6;
  }

  private setHandleX(x: number): void {
    const max = this.trackRange();
    const clamped = Math.max(0, Math.min(x, max));
    const handleWidth = this.handleRef.nativeElement.clientWidth;
    this.handleLeft = clamped + 3;
    this.fillWidth = clamped + handleWidth + 3;
    if (clamped >= max - 2 && !this.verified) {
      this.verified = true;
      this.captchaError = '';
    }
  }

  resetCaptcha(): void {
    this.dragging = false;
    this.verified = false;
    this.handleLeft = 3;
    this.fillWidth = (this.handleRef?.nativeElement.clientWidth || 42) + 3;
  }

  onCaptchaPointerDown(event: PointerEvent): void {
    if (this.verified) return;
    event.preventDefault();
    const track = this.trackRef.nativeElement;
    const handle = this.handleRef.nativeElement;
    const rect = track.getBoundingClientRect();
    this.dragging = true;
    this.pointerOffset = event.clientX - rect.left - this.handleLeft;
    handle.setPointerCapture(event.pointerId);
  }

  onCaptchaPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    event.preventDefault();
    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    const nextLeft = event.clientX - rect.left - this.pointerOffset;
    this.setHandleX(nextLeft - 3);
  }

  onCaptchaPointerUp(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.handleRef.nativeElement.hasPointerCapture(event.pointerId)) {
      this.handleRef.nativeElement.releasePointerCapture(event.pointerId);
    }
    if (!this.verified) this.setHandleX(0);
  }

  onCaptchaContinue(): void {
    if (!this.verified) {
      this.captchaError = this.s.errCaptcha;
      return;
    }
    this.goToStep(3);
  }

  /* ---------------- Step 3: OTP ---------------- */
  readonly otpSlots = [0, 1, 2, 3, 4, 5];
  otpCode = '';
  otpError = '';
  otpShake = false;
  @ViewChild('otpInput') otpInput!: ElementRef<HTMLInputElement>;

  onOtpCodeChange(value: string): void {
    this.otpCode = value.replace(/\D/g, '').slice(0, 6);
  }

  otpVerify(): void {
    const code = this.otpCode;
    if (code.length < 6) {
      this.otpError = this.s.errOtp;
      this.otpShake = true;
      setTimeout(() => (this.otpShake = false), 400);
      return;
    }
    this.otpError = '';
    this.encryptingPassword = true;
    this.captchaService.verifyOtp({
      otpReferenceId: this.otpReferenceId,
      userName: this.merchantId.trim(),
      otp: code,
      deviceId: environment.deviceId,
      requestDateTime: new Date().toISOString(),
    }).subscribe({
      next: authToken => {
        this.encryptingPassword = false;
        sessionStorage.setItem('maps_auth', '1');
        sessionStorage.setItem('maps_auth_token', authToken);
        this.showToast(this.s.toastSuccess);
          setTimeout(() => void this.router.navigateByUrl('/dashboard'), 900);
      },
      error: error => {
        this.encryptingPassword = false;
        this.otpError = error instanceof Error
          ? error.message
          : 'OTP verification failed. Please try again.';
        this.otpShake = true;
        setTimeout(() => (this.otpShake = false), 400);
        this.changeDetector.detectChanges();
      },
    });
  }

  /* Resend timer */
  resendSeconds = 30;
  resendingOtp = false;
  private resendTimerId: any;

  get resendDisabled(): boolean {
    return this.resendSeconds > 0;
  }

  private startResendTimer(): void {
    clearInterval(this.resendTimerId);
    this.resendSeconds = 30;
    this.resendTimerId = setInterval(() => {
      this.resendSeconds -= 1;
      if (this.resendSeconds <= 0) clearInterval(this.resendTimerId);
    }, 1000);
  }

  onResendClick(): void {
    if (this.resendDisabled || this.resendingOtp) return;

    this.resendingOtp = true;
    this.captchaService.resendOtp({
      userName: this.merchantId.trim(),
      otpReferenceId: this.otpReferenceId,
      deviceId: environment.deviceId,
      requestDateTime: new Date().toISOString(),
    }).subscribe({
      next: otpReferenceId => {
        this.otpReferenceId = otpReferenceId;
        this.resendingOtp = false;
        this.showToast(this.s.toastOtpSent);
        this.startResendTimer();
        this.changeDetector.detectChanges();
      },
      error: error => {
        this.resendingOtp = false;
        this.otpError = error instanceof Error
          ? error.message
          : 'OTP resend failed. Please try again.';
        this.changeDetector.detectChanges();
      },
    });
  }

  constructor(
    private renderer: Renderer2,
    private captchaService: CaptchaService,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof document !== 'undefined') this.applyDocumentLangAttrs();
  }

  ngAfterViewInit(): void {
    this.refreshTextCaptcha();
    this.resetCaptcha();
  }

  ngOnDestroy(): void {
    clearInterval(this.resendTimerId);
    clearTimeout(this.toastTimer);
  }
}
