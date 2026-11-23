// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '@/App';

afterEach(cleanup);

describe('room filtering in the app', () => {
  it('shows the empty-state message and disables Check when no room matches (F4)', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '200' } });

    expect(screen.getByRole('status')).toHaveTextContent(
      'No rooms match your requirements.',
    );
    expect(screen.getByRole('button', { name: 'Check availability' })).toBeDisabled();
  });
});

describe('attendees input in the app', () => {
  it('keeps the attendees field empty after it is cleared so a new number can be typed', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '' } });

    expect((screen.getByLabelText('Attendees') as HTMLInputElement).value).toBe('');
  });
});

describe('explain availability in the app', () => {
  it('shows the fallback label on adapter failure and leaves the status unchanged', async () => {
    window.history.replaceState(null, '', '/?mock=error');
    render(<App />);

    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '570' } });
    fireEvent.change(screen.getByLabelText('End'), { target: { value: '600' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(screen.getByText('Available')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText('Standard explanation (no AI)')).toBeInTheDocument();

    expect(screen.getByText('Available')).toBeInTheDocument();
    window.history.replaceState(null, '', '/');
  });
});

describe('room switching in the app', () => {
  it('clears the old availability result when the selected room changes (F5)', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '630' } });
    fireEvent.change(screen.getByLabelText('End'), { target: { value: '700' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'B-202' } });

    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });
});
