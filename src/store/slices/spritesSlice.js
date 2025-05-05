import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [
    {
      id: 1,
      name: "cat",
      x: 50,
      y: 50,
      blocks: [],
    },
    {
      id: 2,
      name: "ball",
      x: 150,
      y: 150,
      blocks: [],
    },
  ],
  collisionCooldown: false,
};

export const spritesSlice = createSlice({
  name: "sprites",
  initialState,
  reducers: {
    addSprite: (state) => {
      const newId = Math.max(...state.items.map((sprite) => sprite.id), 0) + 1;
      state.items.push({
        id: newId,
        name: `Sprite ${newId}`,
        x: 100,
        y: 100,
        blocks: [],
      });
    },
    
    deleteSprite: (state, action) => {
      const spriteId = action.payload;
      state.items = state.items.filter(sprite => sprite.id !== spriteId);
    },
    
    updateSpritePosition: (state, action) => {
      const { id, x, y } = action.payload;
      const spriteIndex = state.items.findIndex(sprite => sprite.id === id);
      
      if (spriteIndex !== -1) {
        // Use proper immutable updates
        state.items[spriteIndex] = {
          ...state.items[spriteIndex],
          x: x,
          y: y
        };
      }
    },
    
    addBlockToSprite: (state, action) => {
      const { spriteId, blockdata } = action.payload;
      const spriteIndex = state.items.findIndex(sprite => sprite.id === spriteId);
      
      if (spriteIndex !== -1) {
        // Ensure blocks array exists
        if (!state.items[spriteIndex].blocks) {
          state.items[spriteIndex].blocks = [];
        }
        
        // Add new block with unique ID
        state.items[spriteIndex].blocks.push({
          ...blockdata,
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });
      }
    },
    
    updateBlockInSprite: (state, action) => {
      const { spriteId, blockId, newData } = action.payload;
      const spriteIndex = state.items.findIndex(sprite => sprite.id === spriteId);
      
      if (spriteIndex !== -1) {
        const blockIndex = state.items[spriteIndex].blocks.findIndex(
          block => block.id === blockId
        );
        
        if (blockIndex !== -1) {
          // Update the block immutably
          state.items[spriteIndex].blocks[blockIndex] = {
            ...state.items[spriteIndex].blocks[blockIndex],
            ...newData
          };
        }
      }
    },
    
    removeBlockFromSprite: (state, action) => {
      const { spriteId, blockId } = action.payload;
      const spriteIndex = state.items.findIndex(sprite => sprite.id === spriteId);
      
      if (spriteIndex !== -1) {
        state.items[spriteIndex].blocks = state.items[spriteIndex].blocks.filter(
          block => block.id !== blockId
        );
      }
    },
    
    setCooldown: (state, action) => {
      state.collisionCooldown = action.payload;
    },
    
    checkCollisionsAndSwap: (state) => {
      // Don't process if on cooldown
      if (state.collisionCooldown) {
        return;
      }
      
      // Check for collisions
      for (let i = 0; i < state.items.length; i++) {
        for (let j = i + 1; j < state.items.length; j++) {
          const sprite1 = state.items[i];
          const sprite2 = state.items[j];
          
          const dx = sprite1.x - sprite2.x;
          const dy = sprite1.y - sprite2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            // Create deep copies of blocks with new IDs to avoid conflicts
            const sprite1Blocks = sprite1.blocks.map(block => ({
              ...block,
              id: `${block.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            }));
            
            const sprite2Blocks = sprite2.blocks.map(block => ({
              ...block,
              id: `${block.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            }));
            
            // Update the blocks immutably
            state.items[i] = {
              ...state.items[i],
              blocks: sprite2Blocks
            };
            
            state.items[j] = {
              ...state.items[j],
              blocks: sprite1Blocks
            };
            
            state.collisionCooldown = true;
            
            return;
          }
        }
      }
    },
  },
});

export const {
  addSprite,
  deleteSprite,
  updateSpritePosition,
  addBlockToSprite,
  updateBlockInSprite,
  removeBlockFromSprite,
  checkCollisionsAndSwap,
  setCooldown,
} = spritesSlice.actions;

export default spritesSlice.reducer;