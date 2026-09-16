export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jadwal/:path*',
    '/tugas/:path*',
    '/nilai/:path*',
    '/absen/:path*',
    '/profil/:path*',
    '/progress/:path*',
  ],
};
