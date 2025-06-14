import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { UIProvider } from '../context/UIContext';
import usePromptData from '../hooks/usePromptData';

jest.mock('../utils/promptService', () => ({
  fetchCategories: jest.fn(() => Promise.resolve({ data: [], error: null })),
  fetchPrompts: jest.fn(),
  savePrompt: jest.fn(),
  deletePrompt: jest.fn(),
  clonePrompt: jest.fn(),
  toggleFavorit: jest.fn(),
  updatePrompt: jest.fn(),
  archivePrompt: jest.fn(),
}));

const {
  fetchPrompts,
  updatePrompt,
  archivePrompt,
} = require('../utils/promptService');

const wrapper = ({ children }) => <UIProvider>{children}</UIProvider>;

const supabase = {};
const session = { user: { id: 'u1' } };
const showDialog = jest.fn();

const prompt = { id: 'p1', archived_at: null };
let store = [prompt];

fetchPrompts.mockImplementation(() => Promise.resolve({ data: [...store], error: null }));

test('archiving moves prompt to archived list', async () => {
  const { result, rerender } = renderHook(
    ({ archive }) => usePromptData(supabase, session, showDialog, archive),
    { wrapper, initialProps: { archive: false } }
  );

  await act(async () => {}); // wait for initial load
  expect(result.current.prompts).toHaveLength(1);

  archivePrompt.mockImplementation(() => {
    store[0] = {
      ...store[0],
      archived_at: '2021-01-01T00:00:00Z',
      favorit: false,
      color: 'default',
      chain_id: null,
      chain_order: null,
    };
    return Promise.resolve(null);
  });
  fetchPrompts.mockImplementation(() => Promise.resolve({ data: [], error: null }));

  await act(async () => {
    await result.current.handleArchive(prompt);
  });
  expect(archivePrompt).toHaveBeenCalledWith(supabase, prompt);
  expect(result.current.prompts).toHaveLength(0);

  fetchPrompts.mockImplementation(() => Promise.resolve({ data: [...store], error: null }));
  rerender({ archive: true });
  await act(async () => {});
  expect(result.current.prompts).toHaveLength(1);
});
