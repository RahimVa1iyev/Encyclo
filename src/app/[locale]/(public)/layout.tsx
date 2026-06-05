import { siteConfig } from '@/lib/config';
// app/(public)/layout.tsx
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Link } from '@/lib/navigation';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialIsLoggedIn={!!user} />

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Məhsul</h3>
              <div className="flex flex-col space-y-3">
                <Link href="/encyclopedia" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Ensiklopediya</Link>
                <Link href="/features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Xüsusiyyətlər</Link>
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Tariflər</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Şirkət</h3>
              <div className="flex flex-col space-y-3">
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Haqqında</Link>
                <Link href="/encyclopedia" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Ensiklopediya</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Əlaqə</h3>
              <p className="text-sm text-gray-500">hello@{siteConfig.url.replace(/^https?:\/\//, '').split(':')[0]}</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Encyclo. Bütün hüquqlar qorunur.
          </div>
        </div>
      </footer>
    </div>
  );
}
