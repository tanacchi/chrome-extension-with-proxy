import { detectTargetTable } from './table-detection';

/**
 * Creates an analyze button element
 * @param onClick - Click handler for the button
 * @returns HTMLButtonElement configured for analysis
 */
export const createAnalyzeButton = (onClick: () => void): HTMLButtonElement => {
  const button = document.createElement('button');
  button.textContent = 'AI分析';
  button.className = 'ai-analyze-button';

  // Styling
  button.style.position = 'absolute';
  button.style.zIndex = '10000';
  button.style.backgroundColor = 'rgb(59, 130, 246)';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.padding = '8px 12px';
  button.style.fontSize = '12px';
  button.style.fontWeight = 'bold';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

  // Hover effects
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'rgb(37, 99, 235)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'rgb(59, 130, 246)';
  });

  button.addEventListener('click', onClick);

  return button;
};

/**
 * Injects analyze button next to the target table
 * @param onClick - Click handler for the button
 * @returns true if button was injected, false if target table not found
 */
export const injectAnalyzeButton = (onClick: () => void): boolean => {
  const table = detectTargetTable();
  if (!table) {
    return false;
  }

  // Check if button already exists
  const existingButton = document.querySelector('.ai-analyze-button');
  if (existingButton) {
    return true;
  }

  const button = createAnalyzeButton(onClick);

  // Position button to the left of the table
  const tableRect = table.getBoundingClientRect();
  button.style.left = `${tableRect.left - 100}px`;
  button.style.top = `${tableRect.top + window.scrollY}px`;

  document.body.appendChild(button);
  return true;
};

/**
 * Shows a balloon with analysis result
 * @param content - Text content to display in the balloon
 * @param targetElement - Element to position the balloon relative to
 */
export const showBalloon = (content: string, targetElement: HTMLElement): void => {
  // Remove existing balloon
  hideBalloon();

  const balloon = document.createElement('div');
  balloon.className = 'ai-balloon';
  balloon.textContent = content;

  // Styling
  balloon.style.position = 'absolute';
  balloon.style.zIndex = '10001';
  balloon.style.backgroundColor = 'white';
  balloon.style.border = '1px solid #ccc';
  balloon.style.borderRadius = '8px';
  balloon.style.padding = '12px';
  balloon.style.maxWidth = '300px';
  balloon.style.fontSize = '14px';
  balloon.style.lineHeight = '1.4';
  balloon.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  balloon.style.wordWrap = 'break-word';

  // Position relative to target element
  const targetRect = targetElement.getBoundingClientRect();
  balloon.style.left = `${targetRect.right + 10}px`;
  balloon.style.top = `${targetRect.top + window.scrollY}px`;

  document.body.appendChild(balloon);
};

/**
 * Hides the analysis result balloon
 */
export const hideBalloon = (): void => {
  const balloon = document.querySelector('.ai-balloon');
  if (balloon) {
    balloon.remove();
  }
};

/**
 * Shows loading indicator
 * @param targetElement - Element to position the loading indicator relative to
 */
export const showLoading = (targetElement: HTMLElement): void => {
  // Remove existing loading indicator
  hideLoading();

  const loading = document.createElement('div');
  loading.className = 'ai-loading';
  loading.textContent = '分析中...';

  // Styling
  loading.style.position = 'absolute';
  loading.style.zIndex = '10002';
  loading.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  loading.style.color = 'white';
  loading.style.border = 'none';
  loading.style.borderRadius = '4px';
  loading.style.padding = '8px 12px';
  loading.style.fontSize = '12px';
  loading.style.fontWeight = 'bold';

  // Position relative to target element
  const targetRect = targetElement.getBoundingClientRect();
  loading.style.left = `${targetRect.right + 10}px`;
  loading.style.top = `${targetRect.top + window.scrollY}px`;

  document.body.appendChild(loading);
};

/**
 * Hides the loading indicator
 */
export const hideLoading = (): void => {
  const loading = document.querySelector('.ai-loading');
  if (loading) {
    loading.remove();
  }
};
