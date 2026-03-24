import AuthProvider from "@/components/providers/tenant/auth-provider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
