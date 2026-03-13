import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          sonji<span className="text-violet-500">.</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">Sign in to your CRM</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-gray-100",
            headerTitle: "text-gray-900",
            headerSubtitle: "text-gray-500",
            socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
            footerActionLink: "text-violet-600 hover:text-violet-700",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/signup"
      />
    </div>
  );
}
