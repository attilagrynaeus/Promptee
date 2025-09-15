import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from 'components/LoginForm';

jest.mock('i18n', () => ({
  t: (key) => key,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('logs in and stores JWT', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-token' }),
    });

    render(<LoginForm />);

    fireEvent.change(
      screen.getByPlaceholderText('LoginForm.EmailPlaceholder'),
      { target: { value: 'user@example.com' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText('LoginForm.PasswordPlaceholder'),
      { target: { value: 'secret' } }
    );

    fireEvent.click(screen.getByRole('button', { name: 'LoginForm.Login' }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      '/api/login',
      expect.objectContaining({ method: 'POST' })
    );
    expect(localStorage.getItem('jwt')).toBe('jwt-token');
  });

  it('registers new user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'reg-token' }),
    });

    render(<LoginForm />);

    fireEvent.click(screen.getByText('LoginForm.ToggleToRegister'));

    fireEvent.change(
      screen.getByPlaceholderText('LoginForm.EmailPlaceholder'),
      { target: { value: 'user@example.com' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText('LoginForm.PasswordPlaceholder'),
      { target: { value: 'secret' } }
    );

    fireEvent.click(screen.getByRole('button', { name: 'LoginForm.CreateAccount' }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      '/api/register',
      expect.objectContaining({ method: 'POST' })
    );
    expect(localStorage.getItem('jwt')).toBe('reg-token');
    await waitFor(() =>
      expect(screen.getByText('LoginForm.RegisterSuccess')).toBeInTheDocument()
    );
  });
});
