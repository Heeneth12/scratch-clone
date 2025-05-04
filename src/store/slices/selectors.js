export const selectSprites = (state) => state.sprites.items;
export const selectSelectedSpriteId = (state) => state.ui.selectedSpriteId;
export const selectSelectedSprite = (state) =>
  state.sprites.items.find((sprite) => sprite.id === state.ui.selectedSpriteId);
export const selectIsPlaying = (state) => state.ui.isPlaying;
