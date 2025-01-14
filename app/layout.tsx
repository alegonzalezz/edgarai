import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(d, t) {
                var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
                v.onload = function() {
                  window.voiceflow.chat.load({
                    verify: { projectID: "67744408d18869ad2b731108" },
                    url: "https://general-runtime.voiceflow.com",
                    versionID: "production"
                  });
                }
                v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; 
                v.type = "text/javascript"; 
                s.parentNode.insertBefore(v, s);
              })(document, "script");
            `
          }}
        />
      </body>
    </html>
  )
}

