export default function WelcomeStep({
  onSignIn,
  onGuest,
}: {
  onSignIn: () => void;
  onGuest: () => void;
}) {
  return (
    <div>
      <div className="card p-5 sm:p-8 mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-6">Welcome!</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button onClick={onSignIn} className="btn-primary text-sm">
            Sign in or Create an account
          </button>
          <span className="text-sm text-text-secondary text-center">or</span>
          <button onClick={onGuest} className="btn-outline text-sm">
            Continue as guest
          </button>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-5 pl-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
            1
          </div>
          <span className="text-lg font-bold text-text-muted">
            Delivery options
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
            2
          </div>
          <span className="text-lg font-bold text-text-muted">
            Customer details
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
            3
          </div>
          <span className="text-lg font-bold text-text-muted">
            Payment methods
          </span>
        </div>
      </div>
    </div>
  );
}
