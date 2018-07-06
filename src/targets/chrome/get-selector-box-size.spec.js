const getSelectorBoxSize = require('./get-selector-box-size');

const createMockWindow = elements => ({
  document: {
    querySelectorAll: () =>
      elements.map(element => ({
        getBoundingClientRect: () => element,
        contains: () => element.class === 'wrapper',
      })),
  },
});

describe('getSelectorBoxSize', () => {
  it('should throw an exception when no elements', () => {
    const mockWindow = createMockWindow([]);
    expect(() => getSelectorBoxSize(mockWindow, 'any-selector')).toThrowError();
  });

  it('should return the box size for a single element', () => {
    const mockElementRect = { x: 0, y: 0, width: 10, height: 10 };
    const mockWindow = createMockWindow([mockElementRect]);
    expect(getSelectorBoxSize(mockWindow, 'any-selector')).toEqual(
      mockElementRect
    );
  });

  /**
   *
   *    <-------a------>
   *  ^ +------------------------->x
   *  | |              |
   *  | |              |
   *  | |              |
   *  b |              |
   *  | |              |
   *  | |              |
   *  | |              |
   *  v +--------------+   a = 30
   *    |              |   b = 40
   *    |              |
   *    |              |
   *    |              |
   *    |              |
   *    |              |
   *    |              |
   *    +--------------+
   *    |
   *    |
   *    v
   *    y
   *
   */

  it('should return the box size for stacked elements', () => {
    const mockElementRects = [
      { x: 0, y: 0, width: 30, height: 40 },
      { x: 0, y: 40, width: 30, height: 40 },
    ];
    const mockWindow = createMockWindow(mockElementRects);
    expect(getSelectorBoxSize(mockWindow, 'any-selector')).toEqual({
      x: 0,
      y: 0,
      width: 30,
      height: 80,
    });
  });

  /**
   *
   *  +---------------------------------------------------------->x
   *  |
   *  |                a
   *  |            +---------+                a = 20
   *  |            |         |                b = 60
   *  |            |         |
   *  |            |         |
   *  |            |    b    |
   *  |   +---------------------------+
   *  |   |        |         |        |
   *  |  a|      b |    +------------------------------------+
   *  |   |        |    |    |        |                      |
   *  |   +---------------------------+                      |
   *  |            |    |    |                               |
   *  |            |    |    |                               |
   *  |            |    |    |                               |
   *  |            |    |    |                               | b
   *  |            +---------+                               |
   *  |                 |                                    |
   *  |                 |                                    |
   *  |                 |                                    |
   *  |                 |                                    |
   *  |                 |                                    |
   *  |                 |                                    |
   *  |                 +------------------------------------+
   *  |                                    b
   *  |            +---------+
   *  |            |         |
   *  |          a |         |
   *  |            |         |
   *  |            +---------+
   *  |                 a
   *  v
   *  y
   *
   */

  it('should return the box size for complex layouts', () => {
    const mockElementRects = [
      { x: 30, y: 10, width: 20, height: 60 },
      { x: 10, y: 30, width: 60, height: 20 },
      { x: 40, y: 40, width: 60, height: 60 },
      { x: 30, y: 120, width: 20, height: 20 },
    ];
    const mockWindow = createMockWindow(mockElementRects);
    expect(getSelectorBoxSize(mockWindow, 'any-selector')).toEqual({
      x: 10,
      y: 10,
      width: 90,
      height: 130,
    });
  });

  it('should return the box size without wrapper elements', () => {
    const mockElementRects = [
      { x: 30, y: 10, width: 20, height: 60 },
      { x: 10, y: 30, width: 60, height: 20 },
      { x: 40, y: 40, width: 60, height: 60 },
      { x: 30, y: 120, width: 20, height: 20 },
      { x: 0, y: 0, width: 1000, height: 1000, class: 'wrapper' },
    ];
    const mockWindow = createMockWindow(mockElementRects);
    expect(getSelectorBoxSize(mockWindow, 'any-selector')).toEqual({
      x: 10,
      y: 10,
      width: 90,
      height: 130,
    });
  });
});
