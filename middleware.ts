export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - api/webhooks (Webhook endpoints like WhatsApp)
     * - api/postop/webhook (WhatsApp webhook)
     * - api/whatsapp/webhook (WhatsApp webhook)
     * - api/cron (Cron jobs endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|api/webhooks|api/postop/webhook|api/whatsapp/webhook|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
