export interface CaptchaResponse {
  captchaId: string;
  secureRuntimeToken: string;
  captchaImage: string;
}

export interface CaptchaApiResponse {
  captchaId?: string;
  secureRuntimeToken?: string;
  captchaImage?: string;
  captchaText?: string;
  detail?: {
    captchaId?: string;
    secureRuntimeToken?: string;
    captchaImage?: string;
    captchaText?: string;
  };
}

export interface EncryptPasswordRequest {
  captchaId: string;
  secureRuntimeToken: string;
  password: string;
}

export interface EncryptPasswordApiResponse {
  success?: boolean;
  errorDescription?: string | null;
  password?: string;
  detail?: {
    password?: string;
  };
}

export interface AuthenticateRequest {
  username: string;
  password: string;
  captchaId: string;
  captchaValue: string;
  deviceId: string;
  requestDateTime: string;
}

export interface AuthenticateApiResponse {
  success?: boolean;
  errorDescription?: string | null;
  detail?: {
    otpReferenceId?: string;
  };
}

export interface VerifyOtpRequest {
  otpReferenceId: string;
  userName: string;
  otp: string;
  deviceId: string;
  requestDateTime: string;
}

export interface VerifyOtpApiResponse {
  success?: boolean;
  errorDescription?: string | null;
  detail?: {
    auth_token?: string;
  };
}

export interface ResendOtpRequest {
  userName: string;
  otpReferenceId: string;
  deviceId: string;
  requestDateTime: string;
}

export interface ResendOtpApiResponse {
  success?: boolean;
  errorDescription?: string | null;
  detail?: {
    otpReferenceId?: string;
  };
}
