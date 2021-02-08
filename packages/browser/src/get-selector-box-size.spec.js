/**
 * @jest-environment jsdom
 */

/* eslint-env browser */

const getSelectorBoxSize = require('./get-selector-box-size');

const addElementsToWrapper = (rects, customMarkup = (w) => w) => {
  let wrapper = document.querySelector('#root');

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.setAttribute('id', 'root');
    document.body.appendChild(wrapper);
  } else {
    wrapper.innerHTML = '';
  }

  wrapper = customMarkup(wrapper);

  rects.forEach(({ x, y, width, height, style }) => {
    const element = document.createElement('div');
    element.getBoundingClientRect = jest.fn(() => ({
      x,
      y,
      width,
      height,
    }));
    Object.assign(element.style, { padding: '0px', margin: '0px' }, style, {
      width: `${width}px`,
      height: `${height}px`,
    });
    wrapper.appendChild(element);
  });
};

describe('getSelectorBoxSize', () => {
  it('should throw an exception when no elements', () => {
    expect(() => getSelectorBoxSize(window, 'any-selector')).toThrow();
  });

  it('should return the box size for a single element', () => {
    const mockElementRect = { x: 0, y: 0, width: 10, height: 10 };
    addElementsToWrapper([mockElementRect]);
    expect(getSelectorBoxSize(window, '#root > *')).toEqual(mockElementRect);
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
    addElementsToWrapper(mockElementRects);
    expect(getSelectorBoxSize(window, '#root > *')).toEqual({
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
    addElementsToWrapper(mockElementRects);
    expect(getSelectorBoxSize(window, '#root > *')).toEqual({
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
    ];
    addElementsToWrapper(mockElementRects, (root) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'wrapper');
      wrapper.getBoundingClientRect = jest.fn(() => ({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      }));
      root.appendChild(wrapper);
      return wrapper;
    });
    expect(getSelectorBoxSize(window, '.wrapper > *, #root > *, body')).toEqual(
      {
        x: 10,
        y: 10,
        width: 90,
        height: 130,
      }
    );
    expect(getSelectorBoxSize(window, '#root > *')).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });

  it('should return the box size with only visible elements', () => {
    const mockElementRects = [
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 10, width: 10, height: 10, style: { visibility: 'hidden' } },
      { x: 20, y: 20, width: 10, height: 10, style: { display: 'none' } },
      { x: 30, y: 30, width: 10, height: 10, style: { opacity: '0' } },
      { x: 10, y: 10, width: 0, height: 100 },
      { x: 10, y: 10, width: 100, height: 0 },
    ];
    addElementsToWrapper(mockElementRects);
    expect(getSelectorBoxSize(window, '#root > *')).toEqual({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
  });
});
