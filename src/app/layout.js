import "./globals.css";

export const metadata = {
  title: "What Now? — one dish, no decisions",
  description:
    "A meal picker that fights food decision fatigue by giving you exactly one confident recommendation, not a list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
