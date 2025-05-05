import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateSpritePosition,
  checkCollisionsAndSwap,
  addSprite,
  deleteSprite,
  setCooldown,
} from "../store/slices/spritesSlice";
import { setSelectedSpriteId } from "../store/slices/uiSlice";
import CatSprite from "./Sprite";

export default function PreviewArea() {
  const dispatch = useDispatch();
  const lastPositionRef = useRef({});

  // Get state from Redux store
  const sprites = useSelector((state) => state.sprites.items);
  const selectedSpriteId = useSelector((state) => state.ui.selectedSpriteId);
  const isPlaying = useSelector((state) => state.ui.isPlaying);
  const collisionCooldown = useSelector(
    (state) => state.sprites.collisionCooldown
  );

  const animationFrameRef = useRef({});
  const [activeDragSprites, setActiveDragSprites] = useState({});
  const dragOffsets = useRef({});
  const [bubbles, setBubbles] = useState({});
  const [rotations, setRotations] = useState({});

  const activeAnimations = useRef({});

  const handleMouseDown = (e, spriteId) => {
    if (isPlaying) return;

    e.stopPropagation(); // Prevent event bubbling

    dispatch(setSelectedSpriteId(spriteId));
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;
    dragOffsets.current[spriteId] = {
      x: e.clientX - sprite.x,
      y: e.clientY - sprite.y,
    };
    setActiveDragSprites((prev) => ({
      ...prev,
      [spriteId]: true,
    }));
  };

  const handleMouseMove = (e) => {
    if (isPlaying || Object.keys(activeDragSprites).length === 0) return;

    // Update position for each active dragged sprite
    Object.keys(activeDragSprites).forEach((spriteId) => {
      if (activeDragSprites[spriteId] && dragOffsets.current[spriteId]) {
        const offset = dragOffsets.current[spriteId];
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        if (
          lastPositionRef.current[spriteId] &&
          (Math.abs(lastPositionRef.current[spriteId].x - newX) > 1 ||
            Math.abs(lastPositionRef.current[spriteId].y - newY) > 1)
        ) {
          dispatch(
            updateSpritePosition({
              id: parseInt(spriteId),
              x: newX,
              y: newY,
            })
          );
        }

        // Update last position after dispatch
        lastPositionRef.current[spriteId] = { x: newX, y: newY };
      }
    });
  };

  const handleMouseUp = () => {
    // Clear all active drags
    setActiveDragSprites({});
  };

  // Process block animations for a specific sprite
  const processBlocks = (sprite, blocks, blockIndex = 0, repeatStack = {}) => {
    // Return immediately if no blocks exist or index is out of bounds
    if (!blocks || blockIndex >= blocks.length) return Promise.resolve();

    const block = blocks[blockIndex];

    // Skip if this block doesn't exist
    if (!block) return Promise.resolve();

    // Create an animation ID for this particular execution - ensure uniqueness with sprite ID
    const animationId = `${sprite.id}_${block.id}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 5)}`;
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
        return processControlBlock(
          sprite,
          block,
          blocks,
          blockIndex,
          repeatStack,
          animationId
        );

      default:
        delete activeAnimations.current[animationId];
        return processBlocks(sprite, blocks, blockIndex + 1, repeatStack);
    }
  };

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

          setRotations((prev) => ({
            ...prev,
            [sprite.id]: newRotationLeft,
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

          setRotations((prev) => ({
            ...prev,
            [sprite.id]: newRotationRight,
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

  const processLooksBlock = (sprite, block, animationId) => {
    return new Promise((resolve) => {
      // If this animation has been cancelled, don't proceed
      if (!activeAnimations.current[animationId]) {
        resolve();
        return;
      }

      switch (block.action) {
        case "say":
          setBubbles((prev) => ({
            ...prev,
            [sprite.id]: {
              type: "speech",
              content: block.message || "",
            },
          }));

          const sayDuration = Math.max(0.5, block.duration || 2); // Minimum 0.5 seconds
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              setBubbles((prev) => {
                // Only clear if it's still the same message
                if (
                  prev[sprite.id]?.type === "speech" &&
                  prev[sprite.id]?.content === block.message
                ) {
                  const newBubbles = { ...prev };
                  delete newBubbles[sprite.id];
                  return newBubbles;
                }
                return prev;
              });
              resolve();
            }
          }, sayDuration * 1000);
          break;

        case "think":
          setBubbles((prev) => ({
            ...prev,
            [sprite.id]: {
              type: "thought",
              content: block.message || "",
            },
          }));

          // Clear bubble after duration
          const thinkDuration = Math.max(0.5, block.duration || 2);
          setTimeout(() => {
            if (activeAnimations.current[animationId]) {
              setBubbles((prev) => {
                if (
                  prev[sprite.id]?.type === "thought" &&
                  prev[sprite.id]?.content === block.message
                ) {
                  const newBubbles = { ...prev };
                  delete newBubbles[sprite.id];
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
  const processControlBlock = (
    sprite,
    block,
    blocks,
    blockIndex,
    repeatStack,
    animationId
  ) => {
    // If this animation has been cancelled, don't proceed
    if (!activeAnimations.current[animationId]) {
      return Promise.resolve();
    }

    switch (block.action) {
      case "repeat":
        const repeatId = `${block.id}_${blockIndex}`;
        if (!repeatStack[repeatId]) {
          repeatStack[repeatId] = 0;
        }

        repeatStack[repeatId]++;

        const times = block.times || 1;

        if (repeatStack[repeatId] <= times) {
          const childrenBlocks = block.children || [];

          return processBlocks(sprite, childrenBlocks, 0, repeatStack).then(
            () => {
              if (activeAnimations.current[animationId]) {
                return processBlocks(sprite, blocks, blockIndex, repeatStack);
              }
              return Promise.resolve();
            }
          );
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

  // In the animatePosition function, we can smooth out the movement
  const animatePosition = (
    sprite,
    targetX,
    targetY,
    onComplete,
    animationId
  ) => {
    let localAnimationFrameRef = null;
    const currentSprite = sprites.find((s) => s.id === sprite.id);
    if (!currentSprite) {
      if (onComplete) onComplete();
      return;
    }

    const startX = currentSprite.x;
    const startY = currentSprite.y;
    const startTime = performance.now();
    const duration = 500; // Animation duration in ms

    const animate = (currentTime) => {
      if (!activeAnimations.current[animationId]) {
        if (onComplete) onComplete();
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate new position smoothly
      const newX = startX + (targetX - startX) * progress;
      const newY = startY + (targetY - startY) * progress;

      // Dispatch position update once per animation frame
      dispatch(
        updateSpritePosition({
          id: sprite.id,
          x: newX,
          y: newY,
        })
      );

      if (progress < 1) {
        // Continue animation using this specific animation's frame reference
        localAnimationFrameRef = requestAnimationFrame(animate);
      } else {
        // Animation complete
        dispatch(
          updateSpritePosition({
            id: sprite.id,
            x: targetX,
            y: targetY,
          })
        );

        if (onComplete) onComplete();
      }
    };

    localAnimationFrameRef = requestAnimationFrame(animate);
  };

  const checkEventTriggers = (spriteId, eventType) => {
    if (!isPlaying) return;

    // Get a fresh reference to the sprite from Redux state
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;

    const eventBlocks = sprite.blocks.filter(
      (block) => block.type === "event" && block.action === eventType
    );

    // Process each matching event block independently
    // We use Promise.all to ensure all event blocks run concurrently
    const blockPromises = eventBlocks.map((eventBlock) => {
      const blockIndex = sprite.blocks.indexOf(eventBlock);
      if (blockIndex !== -1) {
        const spriteCopy = { ...sprite };

        return processBlocks(spriteCopy, sprite.blocks, blockIndex + 1);
      }
      return Promise.resolve();
    });

    // Run all event blocks concurrently
    return Promise.all(blockPromises);
  };

  // Reset collision cooldown
  useEffect(() => {
    if (collisionCooldown) {
      const timeout = setTimeout(() => {
        dispatch(setCooldown(false));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [collisionCooldown, dispatch]);

  useEffect(() => {
    if (isPlaying) {
      activeAnimations.current = {};

      setBubbles({});

      const animationFrames = [];

      const spriteAnimationPromises = sprites.map((sprite) => {
        return new Promise((resolve) => {
          // This helps prevent race conditions
          setTimeout(() => {
            checkEventTriggers(sprite.id, "flagClick");
            resolve();
          }, Math.random() * 25); // Small random delay between 0-50ms
        });
      });

      Promise.all(spriteAnimationPromises);

      const collisionCheckInterval = setInterval(() => {
        if (isPlaying && !collisionCooldown) {
          dispatch(checkCollisionsAndSwap());
        }
      }, 1000); // Check for collisions every second

      return () => {
        clearInterval(collisionCheckInterval);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        animationFrames.forEach((frameId) => cancelAnimationFrame(frameId));
        activeAnimations.current = {};
        setBubbles({});
      };
    }
  }, [isPlaying, sprites, dispatch, collisionCooldown]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      // Cancel all animation frames
      if (animationFrameRef.current) {
        Object.values(animationFrameRef.current).forEach((frameId) => {
          if (frameId) cancelAnimationFrame(frameId);
        });
      }
      animationFrameRef.current = {};
      activeAnimations.current = {};
    };
  }, []);

  // Handle sprite click events
  const handleSpriteClick = (spriteId) => {
    dispatch(setSelectedSpriteId(spriteId));

    if (isPlaying) {
      checkEventTriggers(spriteId, "spriteClick");
    }
  };

  const renderBubble = (spriteId) => {
    const bubble = bubbles[spriteId];
    if (!bubble) return null;

    return (
      <div
        className={`absolute -top-16 left-12 p-2 bg-white rounded-lg border ${
          bubble.type === "thought" ? "rounded-full" : "speech-bubble"
        }`}>
        {bubble.content}
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
            className={`absolute ${
              activeDragSprites[sprite.id] ? "cursor-grabbing" : "cursor-grab"
            } ${selectedSpriteId === sprite.id ? "ring-2 ring-blue-500" : ""}`}
            onMouseDown={(e) => handleMouseDown(e, sprite.id)}
            onClick={() => handleSpriteClick(sprite.id)}
            style={{
              left: sprite.x,
              top: sprite.y,
              transform: `rotate(${rotations[sprite.id] || 0}deg)`,
              zIndex: activeDragSprites[sprite.id] ? 10 : 1,
            }}>
            {/* Render bubble if exists */}
            {renderBubble(sprite.id)}

            <CatSprite spriteName={sprite.name} />
          </div>
        ))}
      </div>

      {/* Sprite List - 20% */}
      <div className="h-64 bg-white p-3 border-t border-gray-300 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Sprites</h3>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            onClick={() => dispatch(addSprite())}>
            + Add Sprite
          </button>
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
