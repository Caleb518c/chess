const App = require('./App.tsx');

test('Capture test', () => {
    expect(App.isACapture("dxe4")).toBe(false);
  });

  test('Test 2', () => {
    expect(App.isACapture("dxe4")).toBe(true);
  });

export {}