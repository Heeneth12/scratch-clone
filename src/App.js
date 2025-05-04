import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPlaying } from "./store/slices/uiSlice";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
  const isPlaying = useSelector((state) => state.ui.isPlaying);
  const dispatch = useDispatch();

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Scratch Clone</h1>
        <div>
          <button
            className={`px-4 py-2 rounded ${
              isPlaying ? "bg-red-500" : "bg-green-500"
            } text-white`}
            onClick={() => dispatch(setPlaying(!isPlaying))}>
            {isPlaying ? "Stop" : "Play"}
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-3 border border-gray-300 overflow-auto">
          <Sidebar />
        </div>
        <div className="col-span-3 border border-gray-300 overflow-auto">
          <MidArea />
        </div>
        <div className="col-span-6 border border-gray-300 overflow-auto">
          <PreviewArea />
        </div>
      </div>
    </div>
  );
}
