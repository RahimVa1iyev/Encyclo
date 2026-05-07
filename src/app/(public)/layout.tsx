import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Encyclo
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/encyclopedia" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Ensiklopediya
              </Link>
              <Link href="/forum" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Forum
              </Link>
              <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                About
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Encyclo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
