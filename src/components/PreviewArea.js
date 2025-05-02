import React, { useState, useRef } from "react";
import CatSprite from "./CatSprite";

export default function PreviewArea() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const isDragging = useRef(false); //Mutable State
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="flex-none h-full w-full overflow-y-auto p-2 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      <div
        className="absolute cursor-grab"
        onMouseDown={handleMouseDown}
        style={{
          left: position.x,
          top: position.y,
          position: "absolute",
        }}>
        <CatSprite />
      </div>
    </div>
  );
}
