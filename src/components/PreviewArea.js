import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateSpritePosition,
  checkCollisionsAndSwap,
  addSprite,
  deleteSprite,
  setCooldown
} from "../store/slices/spritesSlice";
import { setSelectedSpriteId } from "../store/slices/uiSlice";
import CatSprite from "./Sprite";

export default function PreviewArea() {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const sprites = useSelector(state => state.sprites.items);
  const selectedSpriteId = useSelector(state => state.ui.selectedSpriteId);
  const isPlaying = useSelector(state => state.ui.isPlaying);
  const collisionCooldown = useSelector(state => state.sprites.collisionCooldown);

  // Animation frame reference
  const animationFrameRef = useRef(null);
  
  // Refs for drag functionality
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // State for speech and thought bubbles
  const [bubbles, setBubbles] = useState({});
  
  // Track sprite rotations
  const [rotations, setRotations] = useState({});
  
  // Track ongoing animations to prevent conflicts
  const activeAnimations = useRef({});

  // Handle mouse down on sprite
  const handleMouseDown = (e, spriteId) => {
    if (isPlaying) return; // Prevent dragging during animation
    
    isDragging.current = true;
    dispatch(setSelectedSpriteId(spriteId));

    // Find the current sprite position
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;
    
    offset.current = {
      x: e.clientX - sprite.x,
      y: e.clientY - sprite.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || isPlaying) return;

    // Update position of only the selected sprite
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    
    dispatch(updateSpritePosition({
      id: selectedSpriteId,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Process block animations for a specific sprite
  const processBlocks = (sprite, blocks, blockIndex = 0, repeatStack = {}) => {
    // Return immediately if no blocks exist or index is out of bounds
    if (!blocks || blockIndex >= blocks.length) return Promise.resolve();
    
    const block = blocks[blockIndex];
    
    // Skip if this block doesn't exist
    if (!block) return Promise.resolve();

    // Create an animation ID for this particular execution
    const animationId = `${sprite.id}_${block.id}_${Date.now()}`;
    activeAnimations.current[animationId] = true;

    // Process block based on type
    switch (block.type) {
      case "motion":
        return processMotionBlock(sprite, block, animationId).then(() => {
          // Only continue if this animation hasn't been cancelled
          if (activeAnimations.current[animationId]) {
            delete activeAnimations.current[animationId];
            return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
          }
          return Promise.resolve();
        });
      
      case "looks":
        return processLooksBlock(sprite, block, animationId).then(() => {
          // Only continue if this animation hasn't been cancelled
          if (activeAnimations.current[animationId]) {
            delete activeAnimations.current[animationId];
            return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
          }
          return Promise.resolve();
        });
      
      case "control":
        return processControlBlock(sprite, block, blocks, blockIndex, repeatStack, animationId);
      
      default:
        // For blocks like events, just move to the next one
        delete activeAnimations.current[animationId];
        return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
    }
  };

  // Process motion blocks
  const processMotionBlock = (sprite, block, animationId) => {
    return new Promise((resolve) => {
      // If this animation has been cancelled, don't proceed
      if (!activeAnimations.current[animationId]) {
        resolve();
        return;
      }

      switch (block.action) {
        case "move":
          // Calculate new position based on rotation
          const spriteRotation = rotations[sprite.id] || 0;
          const radians = spriteRotation * (Math.PI / 180);
          const steps = block.steps || 0;
          
          // Calculate exact target position
          const targetX = sprite.x + steps * Math.cos(radians);
          const targetY = sprite.y + steps * Math.sin(radians);
          
          // Animate the movement with exact target position
          animatePosition(sprite, targetX, targetY, resolve, animationId);
          break;
        
        case "turnLeft":
          const currentRotationLeft = rotations[sprite.id] || 0;
          const newRotationLeft = currentRotationLeft - (block.degrees || 0);
          
          setRotations(prev => ({
            ...prev,
            [sprite.id]: newRotationLeft
          }));
          
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              resolve();
            }
          }, 300);
          break;
        
        case "turnRight":
          const currentRotationRight = rotations[sprite.id] || 0;
          const newRotationRight = currentRotationRight + (block.degrees || 0);
          
          setRotations(prev => ({
            ...prev,
            [sprite.id]: newRotationRight
          }));
          
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              resolve();
            }
          }, 300);
          break;
        
        case "goToXY":
          const x = block.x || 0;
          const y = block.y || 0;
          animatePosition(sprite, x, y, resolve, animationId);
          break;
        
        default:
          resolve();
      }
    });
  };

  // Process looks blocks
  const processLooksBlock = (sprite, block, animationId) => {
    return new Promise((resolve) => {
      // If this animation has been cancelled, don't proceed
      if (!activeAnimations.current[animationId]) {
        resolve();
        return;
      }

      switch (block.action) {
        case "say":
          // Show speech bubble
          setBubbles(prev => ({
            ...prev,
            [sprite.id]: {
              type: 'speech',
              content: block.message || ""
            }
          }));
          
          // Clear bubble after duration
          const sayDuration = Math.max(0.5, block.duration || 2); // Minimum 0.5 seconds
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              setBubbles(prev => {
                // Only clear if it's still the same message
                if (prev[sprite.id]?.type === 'speech' && 
                    prev[sprite.id]?.content === block.message) {
                  const newBubbles = {...prev};
                  newBubbles[sprite.id] = null;
                  return newBubbles;
                }
                return prev;
              });
              resolve();
            }
          }, sayDuration * 1000);
          break;
        
        case "think":
          // Show thought bubble
          setBubbles(prev => ({
            ...prev,
            [sprite.id]: {
              type: 'thought',
              content: block.message || ""
            }
          }));
          
          // Clear bubble after duration
          const thinkDuration = Math.max(0.5, block.duration || 2); // Minimum 0.5 seconds
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              setBubbles(prev => {
                // Only clear if it's still the same message
                if (prev[sprite.id]?.type === 'thought' && 
                    prev[sprite.id]?.content === block.message) {
                  const newBubbles = {...prev};
                  newBubbles[sprite.id] = null;
                  return newBubbles;
                }
                return prev;
              });
              resolve();
            }
          }, thinkDuration * 1000);
          break;
        
        default:
          resolve();
      }
    });
  };

  // Process control blocks
  const processControlBlock = (sprite, block, blocks, blockIndex, repeatStack, animationId) => {
    // If this animation has been cancelled, don't proceed
    if (!activeAnimations.current[animationId]) {
      return Promise.resolve();
    }

    switch (block.action) {
      case "repeat":
        // Initialize repeat counter for this block if not exists
        const repeatId = `${block.id}_${blockIndex}`;
        if (!repeatStack[repeatId]) {
          repeatStack[repeatId] = 0;
        }
        
        // Increment counter
        repeatStack[repeatId]++;
        
        const times = block.times || 1; // Default to 1 if undefined
        
        if (repeatStack[repeatId] <= times) {
          // If we haven't repeated enough times, process nested blocks then this block again
          const childrenBlocks = block.children || [];
          
          return processBlocks(sprite, childrenBlocks, 0, repeatStack).then(() => {
            if (activeAnimations.current[animationId]) {
              return processBlocks(sprite, blocks, blockIndex, repeatStack);
            }
            return Promise.resolve();
          });
        } else {
          // Reset counter and move to next block
          delete repeatStack[repeatId];
          delete activeAnimations.current[animationId];
          return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
        }
      
      default:
        delete activeAnimations.current[animationId];
        return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
    }
  };

  // Animate sprite position changes
  const animatePosition = (sprite, targetX, targetY, onComplete, animationId) => {
    const startX = sprite.x;
    const startY = sprite.y;
    const startTime = performance.now();
    const duration = 500; // Animation duration in ms
    
    const animate = (currentTime) => {
      // Check if animation has been cancelled
      if (!activeAnimations.current[animationId]) {
        if (onComplete) onComplete();
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate new position with easing
      const newX = startX + (targetX - startX) * progress;
      const newY = startY + (targetY - startY) * progress;
      
      // Update sprite position using Redux
      dispatch(updateSpritePosition({
        id: sprite.id,
        x: newX,
        y: newY
      }));
      
      if (progress < 1) {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - make sure we set the exact final coordinates
        dispatch(updateSpritePosition({
          id: sprite.id,
          x: targetX,
          y: targetY
        }));
        
        if (onComplete) onComplete();
      }
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Check for sprite event triggers
  const checkEventTriggers = (spriteId, eventType) => {
    if (!isPlaying) return;
    
    const sprite = sprites.find(s => s.id === spriteId);
    if (!sprite) return;
    
    // Find all blocks that start with this event
    const eventBlocks = sprite.blocks.filter(block => 
      block.type === "event" && block.action === eventType
    );
    
    // Process each matching event block
    eventBlocks.forEach(eventBlock => {
      const blockIndex = sprite.blocks.indexOf(eventBlock);
      if (blockIndex !== -1) {
        // Start processing blocks from the event trigger
        processBlocks(sprite, sprite.blocks, blockIndex + 1);
      }
    });
  };

  // Reset collision cooldown
  useEffect(() => {
    if (collisionCooldown) {
      // Reset cooldown after a delay
      const timeout = setTimeout(() => {
        dispatch(setCooldown(false));
      }, 3000); // 3 second cooldown
      
      return () => clearTimeout(timeout);
    }
  }, [collisionCooldown, dispatch]);

  // Start animations when play button is pressed
  useEffect(() => {
    if (isPlaying) {
      // Clear any active animations
      activeAnimations.current = {};
      
      // Reset bubbles when play is pressed
      setBubbles({});
      
      // Start animations for all sprites with "flagClick" events
      sprites.forEach(sprite => {
        checkEventTriggers(sprite.id, "flagClick");
      });
      
      // Set up collision detection interval
      const collisionCheckInterval = setInterval(() => {
        if (isPlaying && !collisionCooldown) {
          dispatch(checkCollisionsAndSwap());
        }
      }, 1000); // Check for collisions every second
      
      return () => {
        // Clean up on stop playing
        clearInterval(collisionCheckInterval);
        
        // Cancel any ongoing animations
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Clear all active animations
        activeAnimations.current = {};
        
        // Clear all bubbles
        setBubbles({});
      };
    }
  }, [isPlaying, sprites, dispatch, collisionCooldown]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      activeAnimations.current = {};
    };
  }, []);

  // Handle sprite click events
  const handleSpriteClick = (spriteId) => {
    dispatch(setSelectedSpriteId(spriteId));
    
    // If playing, trigger sprite click event
    if (isPlaying) {
      checkEventTriggers(spriteId, "spriteClick");
    }
  };

  // Render speech or thought bubble for a sprite
  const renderBubble = (spriteId, x, y) => {
    const bubble = bubbles[spriteId];
    if (!bubble) return null;
    
    const bubbleStyle = {
      position: 'absolute',
      left: x + 60,
      top: y - 60,
      backgroundColor: 'white',
      borderRadius: bubble.type === 'speech' ? '12px' : '12px',
      padding: '8px 12px',
      maxWidth: '150px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 10
    };
    
    return (
      <div style={bubbleStyle} className="speech-bubble">
        <p className="text-sm text-gray-800">{bubble.content}</p>
        {bubble.type === 'speech' && (
          <div className="absolute left-0 -bottom-2 w-4 h-4 bg-white transform rotate-45 -ml-1"></div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Preview Area - 80% */}
      <div
        className="flex-grow bg-white relative overflow-hidden border-b border-gray-300"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        {sprites.map((sprite) => (
          <div
            key={sprite.id}
            className={`absolute cursor-grab ${
              selectedSpriteId === sprite.id ? "ring-2 ring-blue-500" : ""
            }`}
            onMouseDown={(e) => handleMouseDown(e, sprite.id)}
            onClick={() => handleSpriteClick(sprite.id)}
            style={{
              left: sprite.x,
              top: sprite.y,
              transform: `rotate(${rotations[sprite.id] || 0}deg)`,
              transition: !isDragging.current ? 'transform 0.3s' : 'none'
            }}>
            <CatSprite spriteName={sprite.name} />
            {renderBubble(sprite.id, 0, 0)}
          </div>
        ))}
      </div>

      {/* Sprite List - 20% */}
      <div className="h-64 bg-white p-3 border-t border-gray-300 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Sprites</h3>
          {/* <button
            disabled={true}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            onClick={() => dispatch(addSprite())}>
            + Add Sprite
          </button> */}
        </div>

        <div className="flex gap-2 items-start overflow-x-auto pb-2">
          {sprites.map((sprite) => (
            <div
              key={sprite.id}
              className={`w-44 rounded m-2 shadow-md relative bg-white flex-shrink-0 ${
                selectedSpriteId === sprite.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => dispatch(setSelectedSpriteId(sprite.id))}>
              {/* Delete Button (only show if there's more than one sprite) */}
              {sprites.length > 1 && (
                <button
                  className="absolute top-1 right-1 bg-gray-100 p-1 rounded-full text-red-500 hover:text-red-700 text-sm font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteSprite(sprite.id));
                  }}>
                  ✕
                </button>
              )}

              <div className="p-2">
              <CatSprite spriteName={sprite.name} />
              </div>

              <div className="px-4 pb-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {sprite.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}