import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Providers } from "@/components/providers"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Personal Dictionary",
  description: "Your personal word collection and definitions",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="antialiased">

        <Providers>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="flex h-[45px] items-center  border-b bg-background px-1.5 ">
                  <SidebarTrigger />
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
         </SidebarProvider>
        </Providers>

        <Toaster />
      </body>
    </html>
  )
}
