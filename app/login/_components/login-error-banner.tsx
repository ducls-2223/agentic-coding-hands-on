/**
 * Error banner rendered when ?error=<code> is present in searchParams.
 * Maps known OAuth error codes to Vietnamese user-friendly messages.
 *
 * Design ref: inline banner above the Google login button (per clarifications)
 */

/** Known OAuth error codes and their Vietnamese messages */
const ERROR_MESSAGES: Record<string, string> = {
  oauth_init_failed: "Đăng nhập thất bại. Vui lòng thử lại.",
  oauth_exchange_failed: "Đăng nhập thất bại. Vui lòng thử lại.",
  oauth_missing_code: "Đăng nhập thất bại. Vui lòng thử lại.",
  // Generic fallback for unknown codes
  default: "Đã xảy ra lỗi. Vui lòng thử lại.",
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default;
}

interface LoginErrorBannerProps {
  errorCode: string;
}

export default function LoginErrorBanner({ errorCode }: LoginErrorBannerProps) {
  const message = getErrorMessage(errorCode);

  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2.5 text-sm text-white shadow-md backdrop-blur-sm"
    >
      {/* Warning icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M8 1.5L14.928 13.5H1.072L8 1.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.5V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
