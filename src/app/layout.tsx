export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html className="grid h-screen w-screen place-items-center">
            <body className="grid h-1/2 w-1/2 place-items-center">
                {children}
            </body>
        </html>
    );
}
