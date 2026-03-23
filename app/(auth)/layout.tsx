import AuthProvider from "@/components/providers/auth-provider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>{children}</AuthProvider>
    // <div className="flex min-h-screen flex-col-reverse md:flex-row overflow-hidden">
    //   <div className="hidden md:block md:w-3/8">
    //     <div className="relative h-full w-full bg-[#1B6B3A] p-8">
    //       <h1 className="text-white text-4xl font-bold">
    //         Eduvia
    //         <span className="text-[#D4A017] font-black ">.</span>
    //       </h1>
    //     </div>
    //   </div>

    //   <div className="flex w-full h-screen overflow-y-auto flex-col justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-12 relative">
    //     {children}
    //     <div className="absolute top-0 right-0 pointer-events-none">
    //       <div className="relative size-56 2xl:size-64"></div>
    //     </div>
    //   </div>
    // </div>
  );
}
