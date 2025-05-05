import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RotateCcw, RotateCw, MessageCircle, X } from "lucide-react";
import {
  updateBlockInSprite,
  removeBlockFromSprite,
} from "../store/slices/spritesSlice";

const Script = ({ blocks, spriteId }) => {
  const dispatch = useDispatch();

  // Handle input change for block parameters
  const handleInputChange = (blockId, field, value) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    dispatch(
      updateBlockInSprite({
        spriteId,
        blockId,
        newData: {
          [field]: value,
          display: generateDisplayText(block, field, value),
        },
      })
    );
  };

  // Generate display text based on updated parameters
  const generateDisplayText = (block, field, value) => {
    if (!block) return "";

    switch (block.type) {
      case "motion":
        switch (block.action) {
          case "move":
            return `Move ${field === "steps" ? value : block.steps} steps`;
          case "turnLeft":
            return `Turn left ${
              field === "degrees" ? value : block.degrees
            } degrees`;
          case "turnRight":
            return `Turn right ${
              field === "degrees" ? value : block.degrees
            } degrees`;
          case "goToXY":
            return `Go to x: ${field === "x" ? value : block.x} y: ${
              field === "y" ? value : block.y
            }`;
          default:
            return block.display;
        }
      case "looks":
        switch (block.action) {
          case "say":
            return `Say ${field === "message" ? value : block.message} for ${
              field === "duration" ? value : block.duration
            } seconds`;
          case "think":
            return `Think ${field === "message" ? value : block.message} for ${
              field === "duration" ? value : block.duration
            } seconds`;
          default:
            return block.display;
        }
      case "control":
        switch (block.action) {
          case "repeat":
            return `Repeat ${field === "times" ? value : block.times} times`;
          default:
            return block.display;
        }
      default:
        return block.display;
    }
  };

  // Handle block removal
  const handleRemoveBlock = (blockId) => {
    dispatch(removeBlockFromSprite({ spriteId, blockId }));
  };

  // Render blocks based on their type
  const renderBlock = (block) => {
    let blockColor;
    let blockContent;

    switch (block.type) {
      case "event":
        blockColor = "bg-gradient-to-r from-yellow-500 to-yellow-400";
        blockContent = <div className="w-full">{block.display}</div>;
        break;

      case "motion":
        blockColor = "bg-gradient-to-r from-blue-600 to-blue-500";
        switch (block.action) {
          case "move":
            blockContent = (
              <div className="flex items-center w-full">
                <span>Move </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-blue-400 text-white text-center rounded"
                  value={block.steps}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "steps",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span> steps</span>
              </div>
            );
            break;
          case "turnLeft":
            blockContent = (
              <div className="flex items-center w-full">
                <RotateCcw size={14} className="mr-2" />
                <span>Turn left </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-blue-400 text-white text-center rounded"
                  value={block.degrees}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "degrees",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span> degrees</span>
              </div>
            );
            break;
          case "turnRight":
            blockContent = (
              <div className="flex items-center w-full">
                <RotateCw size={14} className="mr-2" />
                <span>Turn right </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-blue-400 text-white text-center rounded"
                  value={block.degrees}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "degrees",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span> degrees</span>
              </div>
            );
            break;
          case "goToXY":
            blockContent = (
              <div className="flex items-center w-full">
                <span>Go to x: </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-blue-400 text-white text-center rounded"
                  value={block.x}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "x",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span> y: </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-blue-400 text-white text-center rounded"
                  value={block.y}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "y",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            );
            break;
          default:
            blockContent = <div className="w-full">{block.display}</div>;
        }
        break;

      case "looks":
        blockColor = "bg-gradient-to-r from-purple-600 to-purple-500";
        switch (block.action) {
          case "say":
            blockContent = (
              <div className="flex items-center w-full">
                <MessageCircle size={14} className="mr-2" />
                <span>Say </span>
                <input
                  type="text"
                  className="mx-1 w-20 bg-purple-400 text-white text-center rounded"
                  value={block.message}
                  onChange={(e) =>
                    handleInputChange(block.id, "message", e.target.value)
                  }
                />
                <span> for </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-purple-400 text-white text-center rounded"
                  value={block.duration}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "duration",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
                <span> seconds</span>
              </div>
            );
            break;
          case "think":
            blockContent = (
              <div className="flex items-center w-full">
                <span>Think </span>
                <input
                  type="text"
                  className="mx-1 w-20 bg-purple-400 text-white text-center rounded"
                  value={block.message}
                  onChange={(e) =>
                    handleInputChange(block.id, "message", e.target.value)
                  }
                />
                <span> for </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-purple-400 text-white text-center rounded"
                  value={block.duration}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "duration",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
                <span> seconds</span>
              </div>
            );
            break;
          default:
            blockContent = <div className="w-full">{block.display}</div>;
        }
        break;

      case "control":
        blockColor = "bg-gradient-to-r from-orange-600 to-orange-500";
        switch (block.action) {
          case "repeat":
            blockContent = (
              <div className="flex items-center w-full">
                <span>Repeat </span>
                <input
                  type="number"
                  className="mx-1 w-12 bg-orange-400 text-white text-center rounded"
                  value={block.times}
                  onChange={(e) =>
                    handleInputChange(
                      block.id,
                      "times",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span> times</span>
              </div>
            );
            break;
          default:
            blockContent = <div className="w-full">{block.display}</div>;
        }
        break;

      default:
        blockColor = "bg-gray-400";
        blockContent = <div className="w-full">{block.display}</div>;
    }

    return (
      <div
        key={block.id}
        className={`${blockColor} text-white px-3 py-2 my-1 text-sm rounded-md flex justify-between items-center shadow-sm w-full relative group`}>
        {blockContent}
        <button
          className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleRemoveBlock(block.id)}>
          <X size={12} />
        </button>
      </div>
    );
  };

  return <div className="p-3 space-y-1">{blocks.map(renderBlock)}</div>;
};

export default function MidArea() {
  const selectedSpriteId = useSelector((state) => state.ui.selectedSpriteId);
  const sprites = useSelector((state) => state.sprites.items);
  const selectedSprite = sprites.find(
    (sprite) => sprite.id === selectedSpriteId
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Handle dropping logic if needed
  };

  return (
    <div
      className="h-full bg-white flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">
          Code Blocks for {selectedSprite?.name}
        </h3>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {selectedSprite && (
          <Script blocks={selectedSprite.blocks} spriteId={selectedSpriteId} />
        )}
      </div>
    </div>
  );
}
