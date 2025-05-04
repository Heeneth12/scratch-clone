import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [
    {
      id: 1,
      name: "Sprite 1",
      x: 50,
      y: 50,
      blocks: [],
    },
    {
      id: 2,
      name: "Sprite 2",
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
      state.items = state.items.filter(
        (sprite) => sprite.id !== action.payload
      );
    },
    updateSpritePosition: (state, action) => {
      const { id, x, y } = action.payload;
      const sprite = state.items.find((sprite) => sprite.id === id);
      if (sprite) {
        sprite.x = x;
        sprite.y = y;
      }
    },
    addBlockToSprite: (state, action) => {
      const { spriteId, blockdata } = action.payload;
      const sprite = state.items.find((sprite) => sprite.id === spriteId);
      if (sprite) {
        sprite.blocks.push({ ...blockdata, id: Date.now() });
      }
    },
    updateBlockInSprite: (state, action) => {
      const { spriteId, blockId, newData } = action.payload;
      const sprite = state.items.find((sprite) => sprite.id === spriteId);
      if (sprite) {
        const blockIndex = sprite.blocks.findIndex(
          (block) => block.id === blockId
        );
        if (blockIndex !== -1) {
          sprite.blocks[blockIndex] = {
            ...sprite.blocks[blockIndex],
            ...newData,
          };
        }
      }
    },
    removeBlockFromSprite: (state, action) => {
      const { spriteId, blockId } = action.payload;
      const sprite = state.items.find((sprite) => sprite.id === spriteId);
      if (sprite) {
        sprite.blocks = sprite.blocks.filter((block) => block.id !== blockId);
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

            sprite1.blocks = sprite2Blocks;
            sprite2.blocks = sprite1Blocks;
            
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