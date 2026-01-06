import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const isAuth = cookieStore.get('dash_access');

    if (!isAuth) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#181818]">
            {children}
        </div>
    );
}
