import { NextResponse } from 'next/server';

export function middleware(request) {
  // المسارات التي نريد حمايتها (لوحة التحكم فقط)
  const protectedPaths = ['/admin', '/admin/orders', '/admin/add-product'];

  const { pathname } = request.nextUrl;

  // إذا كان المسار محمياً
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // التحقق من وجود التوكن في الكوكيز
    const token = request.cookies.get('token');

    if (!token) {
      // إذا لم يوجد توكن، حوله لصفحة تسجيل الدخول
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // إذا كان المسار هو تسجيل الدخول والمستخدم مسجل بالفعل، حوله للأدمن
  if (pathname === '/login') {
    const token = request.cookies.get('token');
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}