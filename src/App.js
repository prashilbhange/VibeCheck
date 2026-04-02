import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import ResultsPage from "@/pages/ResultsPage";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="app-shell dark">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </div>
    </ThemeProvider>
  );
}

export default App;
