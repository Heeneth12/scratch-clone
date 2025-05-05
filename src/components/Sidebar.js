import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, ChevronRight, Flag, RotateCcw, RotateCw, Copy, PlusCircle, MessageCircle} from "lucide-react";
import { addBlockToSprite } from "../store/slices/spritesSlice";

const CategoryHeader = ({ title, color, isOpen, onClick }) => (
  <div
    className="flex items-center justify-between w-full px-3 py-2 font-medium text-gray-800 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
    onClick={onClick}>
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
      <span>{title}</span>
    </div>
    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
  </div>
);

const Block = ({ color, children, onClick, draggable = true }) => {
  const handleDragStart = (e) => {
    if (!draggable) return;
    e.dataTransfer.setData("text/plain", JSON.stringify(children.props.blockdata));
  };

  return (
    <div
      className={`${color} text-white px-3 py-2 my-1 text-sm cursor-pointer rounded-md flex items-center shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 w-full ${draggable ? "cursor-grab" : ""}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}>
      {children}
    </div>
  );
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const selectedSpriteId = useSelector(state => state.ui.selectedSpriteId);
  
  const [openCategories, setOpenCategories] = useState({
    events: true,
    motion: true,
    looks: true,
    control: true,
    sound: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  const handleAddBlock = (blockdata) => {
    dispatch(addBlockToSprite({
      spriteId: selectedSpriteId,
      blockdata: blockdata
    }));
  };

  return (
    <div className="w-full flex-none h-full overflow-y-auto flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Blocks</h2>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search blocks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2">
        <div className="mb-1">
          <CategoryHeader
            title="Events"
            color="bg-yellow-400"
            isOpen={openCategories.events}
            onClick={() => toggleCategory("events")}
          />

          {openCategories.events && (
            <div className="ml-2 mt-1 space-y-1">
              <Block 
                color="bg-gradient-to-r from-yellow-500 to-yellow-400"
                onClick={() => handleAddBlock({
                  type: "event",
                  action: "flagClick",
                  display: "When flag clicked"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "event",
                  action: "flagClick",
                  display: "When flag clicked"
                }}>
                  <Flag size={14} className="mr-2" />
                  <span>When flag clicked</span>
                </div>
              </Block>

              <Block 
                color="bg-gradient-to-r from-yellow-500 to-yellow-400"
                onClick={() => handleAddBlock({
                  type: "event",
                  action: "spriteClick",
                  display: "When this sprite clicked"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "event",
                  action: "spriteClick",
                  display: "When this sprite clicked"
                }}>
                  <span>When this sprite clicked</span>
                </div>
              </Block>
            </div>
          )}
        </div>

        <div className="mb-1">
          <CategoryHeader
            title="Motion"
            color="bg-blue-500"
            isOpen={openCategories.motion}
            onClick={() => toggleCategory("motion")}
          />

          {openCategories.motion && (
            <div className="ml-2 mt-1 space-y-1">
              <Block 
                color="bg-gradient-to-r from-blue-600 to-blue-500"
                onClick={() => handleAddBlock({
                  type: "motion",
                  action: "move",
                  steps: 25,
                  display: "Move 25 steps"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "motion",
                  action: "move",
                  steps: 25,
                  display: "Move 25 steps"
                }}>
                  <span>Move 25 steps</span>
                </div>
              </Block>

              <Block 
                color="bg-gradient-to-r from-blue-600 to-blue-500"
                onClick={() => handleAddBlock({
                  type: "motion",
                  action: "turnLeft",
                  degrees: 15,
                  display: "Turn left 15 degrees"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "motion",
                  action: "turnLeft",
                  degrees: 15,
                  display: "Turn left 15 degrees"
                }}>
                  <RotateCcw size={14} className="mr-2" />
                  <span>Turn left 15 degrees</span>
                </div>
              </Block>

              <Block 
                color="bg-gradient-to-r from-blue-600 to-blue-500"
                onClick={() => handleAddBlock({
                  type: "motion",
                  action: "turnRight",
                  degrees: 15,
                  display: "Turn right 15 degrees"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "motion",
                  action: "turnRight",
                  degrees: 15,
                  display: "Turn right 15 degrees"
                }}>
                  <RotateCw size={14} className="mr-2" />
                  <span>Turn right 15 degrees</span>
                </div>
              </Block>

              <Block 
                color="bg-gradient-to-r from-blue-600 to-blue-500"
                onClick={() => handleAddBlock({
                  type: "motion",
                  action: "goToXY",
                  x: 0,
                  y: 0,
                  display: "Go to x: 0 y: 0"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "motion",
                  action: "goToXY",
                  x: 0,
                  y: 0,
                  display: "Go to x: 0 y: 0"
                }}>
                  <span>Go to x: 0 y: 0</span>
                </div>
              </Block>
            </div>
          )}
        </div>

        <div className="mb-1">
          <CategoryHeader
            title="Looks"
            color="bg-purple-500"
            isOpen={openCategories.looks}
            onClick={() => toggleCategory("looks")}
          />

          {openCategories.looks && (
            <div className="ml-2 mt-1 space-y-1">
              <Block 
                color="bg-gradient-to-r from-purple-600 to-purple-500"
                onClick={() => handleAddBlock({
                  type: "looks",
                  action: "say",
                  message: "Hello!",
                  duration: 2,
                  display: "Say Hello! for 2 seconds"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "looks",
                  action: "say",
                  message: "Hello!",
                  duration: 2,
                  display: "Say Hello! for 2 seconds"
                }}>
                  <MessageCircle size={14} className="mr-2" />
                  <span>Say Hello! for 2 seconds</span>
                </div>
              </Block>

              <Block 
                color="bg-gradient-to-r from-purple-600 to-purple-500"
                onClick={() => handleAddBlock({
                  type: "looks",
                  action: "think",
                  message: "Hmm...",
                  duration: 2,
                  display: "Think Hmm... for 2 seconds"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "looks",
                  action: "think",
                  message: "Hmm...",
                  duration: 2,
                  display: "Think Hmm... for 2 seconds"
                }}>
                  <span>Think Hmm... for 2 seconds</span>
                </div>
              </Block>
            </div>
          )}
        </div>

        <div className="mb-1">
          <CategoryHeader
            title="Control"
            color="bg-orange-500"
            isOpen={openCategories.control}
            onClick={() => toggleCategory("control")}
          />

          {openCategories.control && (
            <div className="ml-2 mt-1 space-y-1">
              <Block 
                color="bg-gradient-to-r from-orange-600 to-orange-500"
                onClick={() => handleAddBlock({
                  type: "control",
                  action: "repeat",
                  times: 10,
                  children: [],
                  display: "Repeat 10 times"
                })}
              >
                <div className="flex items-center" blockdata={{
                  type: "control",
                  action: "repeat",
                  times: 10,
                  children: [],
                  display: "Repeat 10 times"
                }}>
                  <span>Repeat 10 times</span>
                </div>
              </Block>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 bg-white flex justify-between">
        <button className="text-blue-500 hover:text-blue-700 text-sm flex items-center">
          <PlusCircle size={16} className="mr-1" />
          <span>Add Extension</span>
        </button>
        <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center">
          <Copy size={16} className="mr-1" />
          <span>Copy All</span>
        </button>
      </div>
    </div>
  );
}