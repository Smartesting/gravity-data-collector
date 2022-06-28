import { describe, it, beforeEach, expect, vi } from 'vitest';
import { mockWindowScreen, mockWindowLocation, mockClick } from '../test-utils/mocks';
import { JSDOM } from 'jsdom';
import createGravityEvent from './createGravityEvent';
import EventType from './eventType';
import getLocationData from './getLocationData';
import getViewportData from './getViewportData';

describe('createGravityEvent', () => {
  beforeEach(() => {
    mockWindowScreen();
    mockWindowLocation();
  });

  it('returns the specified "type"', async () => {
    const dom = new JSDOM(`<button>Click Me</button>`);
    const elt = dom.window.document.querySelector('button');
    const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

    expect(event.type).toEqual(EventType.Click);
  });

  it('returns location data', async () => {
    const dom = new JSDOM(`<div>Click Me</div>`);
    const elt = dom.window.document.querySelector('div');
    const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

    expect(event.location).toEqual(getLocationData());
  });

  it('returns viewport data', async () => {
    const dom = new JSDOM(`<div>Click Me</div>`);
    const elt = dom.window.document.querySelector('div');
    const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

    expect(event.viewportData).toEqual(getViewportData());
  });

  it('returns recordedAt', async () => {
    const now = Date.parse('2022-05-12');
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse('2022-05-12'));

    const dom = new JSDOM(`<div>Click Me</div>`);
    const elt = dom.window.document.querySelector('div');
    const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

    expect(event.recordedAt).toEqual(now);
  });

  describe('target data embeds...',() => {
    it('tag name', async () => {
      const dom = new JSDOM(`<div>Click Me</div>`);
      const elt = dom.window.document.querySelector('div');
      const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

      expect(event.target?.element).toEqual('div');
    });

    it('text content', async () => {
      const dom = new JSDOM(`<li>I am a list item</li>`);
      const elt = dom.window.document.querySelector('li');
      const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

      expect(event.target?.textContent).toEqual('I am a list item');
    });

    it('html attributes', async () => {
      const dom = new JSDOM(`<input type='text' data-testid='userName' class='size-lg'/>`);
      const elt = dom.window.document.querySelector('input');
      const event = await createGravityEvent(mockClick(elt as HTMLElement) as Event, EventType.Click);

      expect((event.target?.attributes as Record<string, string>)['type']).toEqual('text');
      expect((event.target?.attributes as Record<string, string>)['data-testid']).toEqual('userName');
      expect((event.target?.attributes as Record<string, string>)['class']).toEqual('size-lg');
    });

    it('pointer coordinates data when the event is a click', async () => {
      const dom = new JSDOM(`<input type='text' data-testid='userName' class='size-lg'/>`);
      const elt = dom.window.document.querySelector('input');
      const clickEvent = mockClick(elt as HTMLElement) as PointerEvent;
      const event = await createGravityEvent(clickEvent, EventType.Click);

      expect(event.eventData?.clickOffsetX).toEqual(clickEvent.clientX);
      expect(event.eventData?.clickOffsetY).toEqual(clickEvent.clientY);

      const eltBounds = elt?.getBoundingClientRect();
      expect(event.eventData?.elementOffsetX).toEqual(eltBounds?.left);
      expect(event.eventData?.elementOffsetY).toEqual(eltBounds?.top);
      expect(event.eventData?.elementRelOffsetX).toEqual(Math.trunc(clickEvent.clientX - (eltBounds?.left || 0)));
      expect(event.eventData?.elementRelOffsetY).toEqual(Math.trunc(clickEvent.clientY - (eltBounds?.top || 0)));
    });
  });
});
