import { Position, Toaster } from '@blueprintjs/core';

export const AppToaster = Toaster.create({
  position: Position.TOP,
});

export const BottomToaster = Toaster.create({
  position: Position.BOTTOM,
});
