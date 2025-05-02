import React from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 grid grid-cols-12  overflow-hidden">
        {/* Left Sidebar */}
        <div className="col-span-3 border border-gray-300 overflow-auto">
          <Sidebar />
        </div>

        {/* Middle Area */}
        <div className="col-span-3 border border-gray-300 overflow-auto">
          <MidArea />
        </div>

        {/* Preview Area */}
        <div className="col-span-6  border border-gray-300 overflow-auto">
          <PreviewArea />
        </div>
      </div>
    </div>
  );
}
