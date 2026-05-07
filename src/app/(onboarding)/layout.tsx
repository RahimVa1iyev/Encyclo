export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        <div className="flex justify-center mb-8">
          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Encyclo
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
