import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

const sampleCalculate = (a: number, b: number): number => {
  return a + b;
};

class SampleFireEvent {
  private readonly button: HTMLButtonElement;

  constructor(button: HTMLButtonElement) {
    this.button = button;
  }

  bind(): void {
    this.button.addEventListener('click', () => {
      this.button.textContent = 'test';
    });
  }
}

it('Sample Calculate Test', () => {
  expect(sampleCalculate(1, 2)).toBe(3);
});

it('SampleFireEvent: ボタンをクリックしたときラベルが「test」であること', () => {
  const button = document.createElement('button');
  new SampleFireEvent(button).bind();
  fireEvent.click(button);
  expect(button).toHaveTextContent('test');
});
