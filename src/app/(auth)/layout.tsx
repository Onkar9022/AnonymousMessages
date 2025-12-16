// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html> or <body> here!
  return (
    <div className="min-h-screen flex items-center   justify-center">
      {children}
      
    </div>
  );
}
