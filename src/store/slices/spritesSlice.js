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
      const { spriteId, blockData } = action.payload;
      const sprite = state.items.find((sprite) => sprite.id === spriteId);
      if (sprite) {
        sprite.blocks.push({ ...blockData, id: Date.now() });
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
    checkCollisionsAndSwap: (state) => {
      for (let i = 0; i < state.items.length; i++) {
        for (let j = i + 1; j < state.items.length; j++) {
          const sprite1 = state.items[i];
          const sprite2 = state.items[j];

          const dx = sprite1.x - sprite2.x;
          const dy = sprite1.y - sprite2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Swap the animation blocks between the two sprites
            const temp = [...sprite1.blocks];
            sprite1.blocks = [...sprite2.blocks];
            sprite2.blocks = [...temp];
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
} = spritesSlice.actions;

export default spritesSlice.reducer;
