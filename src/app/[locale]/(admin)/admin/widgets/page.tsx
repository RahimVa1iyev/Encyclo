import { redirect } from '@/lib/navigation';

export default function AdminWidgetsPage() {
  redirect({ href: '/admin/partners', locale: 'az' });
}
