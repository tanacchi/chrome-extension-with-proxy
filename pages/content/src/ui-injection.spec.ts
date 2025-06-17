import {
  injectAnalyzeButton,
  createAnalyzeButton,
  showBalloon,
  hideBalloon,
  showLoading,
  hideLoading,
} from './ui-injection';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UI Injection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createAnalyzeButton', () => {
    it('should create analyze button with correct attributes', () => {
      const onClick = vi.fn();
      const button = createAnalyzeButton(onClick);

      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('AI分析');
      expect(button.className).toBe('ai-analyze-button');
      expect(button.style.position).toBe('absolute');
      expect(button.style.zIndex).toBe('10000');
    });

    it('should call onClick handler when clicked', () => {
      const onClick = vi.fn();
      const button = createAnalyzeButton(onClick);

      button.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have proper styling for visibility', () => {
      const onClick = vi.fn();
      const button = createAnalyzeButton(onClick);

      expect(button.style.backgroundColor).toBe('rgb(59, 130, 246)');
      expect(button.style.color).toBe('white');
      expect(button.style.border).toBe('');
      expect(button.style.borderRadius).toBe('4px');
      expect(button.style.padding).toBe('8px 12px');
    });
  });

  describe('injectAnalyzeButton', () => {
    it('should inject button next to target table', () => {
      document.body.innerHTML = `
        <div>
          <table class="ai-target-table-table">
            <tbody>
              <tr><td>Data 1</td><td>Value 1</td></tr>
              <tr><td>Data 2</td><td>Value 2</td></tr>
            </tbody>
          </table>
        </div>
      `;

      const onClick = vi.fn();
      const result = injectAnalyzeButton(onClick);

      expect(result).toBe(true);
      const injectedButton = document.querySelector('.ai-analyze-button');
      expect(injectedButton).not.toBeNull();
      expect(injectedButton?.textContent).toBe('AI分析');
    });

    it('should return false when no target table exists', () => {
      document.body.innerHTML = `
        <div>
          <table class="other-table">
            <tbody>
              <tr><td>Data 1</td><td>Value 1</td></tr>
            </tbody>
          </table>
        </div>
      `;

      const onClick = vi.fn();
      const result = injectAnalyzeButton(onClick);

      expect(result).toBe(false);
      const injectedButton = document.querySelector('.ai-analyze-button');
      expect(injectedButton).toBeNull();
    });

    it('should not inject duplicate buttons', () => {
      document.body.innerHTML = `
        <div>
          <table class="ai-target-table-table">
            <tbody>
              <tr><td>Data 1</td><td>Value 1</td></tr>
            </tbody>
          </table>
        </div>
      `;

      const onClick = vi.fn();
      injectAnalyzeButton(onClick);
      injectAnalyzeButton(onClick);

      const buttons = document.querySelectorAll('.ai-analyze-button');
      expect(buttons.length).toBe(1);
    });
  });

  describe('showBalloon', () => {
    it('should create and show balloon with content', () => {
      const content = 'Test analysis result';
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showBalloon(content, targetElement);

      const balloon = document.querySelector('.ai-balloon');
      expect(balloon).not.toBeNull();
      expect(balloon?.textContent).toBe(content);
      expect(balloon?.getAttribute('style')).toContain('position: absolute');
    });

    it('should position balloon relative to target element', () => {
      const content = 'Test content';
      const targetElement = document.createElement('td');
      targetElement.style.position = 'absolute';
      targetElement.style.left = '100px';
      targetElement.style.top = '200px';
      document.body.appendChild(targetElement);

      showBalloon(content, targetElement);

      const balloon = document.querySelector('.ai-balloon') as HTMLElement;
      expect(balloon).not.toBeNull();
      expect(balloon.style.position).toBe('absolute');
      expect(balloon.style.zIndex).toBe('10001');
    });

    it('should replace existing balloon content', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showBalloon('First content', targetElement);
      showBalloon('Second content', targetElement);

      const balloons = document.querySelectorAll('.ai-balloon');
      expect(balloons.length).toBe(1);
      expect(balloons[0].textContent).toBe('Second content');
    });
  });

  describe('hideBalloon', () => {
    it('should remove balloon from DOM', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showBalloon('Test content', targetElement);
      expect(document.querySelector('.ai-balloon')).not.toBeNull();

      hideBalloon();
      expect(document.querySelector('.ai-balloon')).toBeNull();
    });

    it('should do nothing if no balloon exists', () => {
      expect(() => hideBalloon()).not.toThrow();
      expect(document.querySelector('.ai-balloon')).toBeNull();
    });
  });

  describe('showLoading', () => {
    it('should create and show loading indicator', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showLoading(targetElement);

      const loading = document.querySelector('.ai-loading');
      expect(loading).not.toBeNull();
      expect(loading?.textContent).toBe('分析中...');
      expect(loading?.getAttribute('style')).toContain('position: absolute');
    });

    it('should position loading indicator relative to target', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showLoading(targetElement);

      const loading = document.querySelector('.ai-loading') as HTMLElement;
      expect(loading.style.position).toBe('absolute');
      expect(loading.style.zIndex).toBe('10002');
    });

    it('should replace existing loading indicator', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showLoading(targetElement);
      showLoading(targetElement);

      const loadings = document.querySelectorAll('.ai-loading');
      expect(loadings.length).toBe(1);
    });
  });

  describe('hideLoading', () => {
    it('should remove loading indicator from DOM', () => {
      const targetElement = document.createElement('td');
      document.body.appendChild(targetElement);

      showLoading(targetElement);
      expect(document.querySelector('.ai-loading')).not.toBeNull();

      hideLoading();
      expect(document.querySelector('.ai-loading')).toBeNull();
    });

    it('should do nothing if no loading indicator exists', () => {
      expect(() => hideLoading()).not.toThrow();
      expect(document.querySelector('.ai-loading')).toBeNull();
    });
  });
});
