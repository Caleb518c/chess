import React from 'react';
import App from './App';

import { isACapture } from './App';

test('Test', () => {
  expect(isACapture("dxe4")).toBe(true);
});
