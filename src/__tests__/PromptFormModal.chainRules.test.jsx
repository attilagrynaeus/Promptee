import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptFormModal from 'components/PromptFormModal';
import { t } from 'i18n';

// Rationale: Replace obsolete skipped DB-integration tests with focused UI
// validation around chain rules enforced by PromptFormModal. These tests
// verify limit, auto-assignment, and duplicate detection logic through the
// component's submit flow.

// Render portals inline for JSDOM
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

// Capture dialog invocations (prefix with mock* so jest hoisting allows it)
const mockShowDialog = jest.fn();
jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: mockShowDialog }),
}));

// Provide a top-level supabase mock reference that tests can swap
// Use var to avoid TDZ with jest hoisting
var mockSupabase;
jest.mock('supabaseClient', () => ({
  get supabase() {
    return mockSupabase;
  },
}));

function makeSupabaseMock({ chainCount = 0, dupExists = false, chains = [{ id: 'chain-1', name: 'Chain A' }] } = {}) {
  return {
    from: (table) => {
      if (table === 'chains') {
        const p = Promise.resolve({ data: chains });
        return {
          select: () => ({
            then: (onFulfilled, onRejected) => p.then(onFulfilled, onRejected),
            catch: (onRejected) => p.catch(onRejected),
            finally: (onFinally) => p.finally(onFinally),
          }),
        };
      }

      if (table === 'prompts') {
        return {
          // Count query path
          select: (_sel, opts) => {
            if (opts?.head && opts?.count === 'exact') {
              return {
                eq: () => ({
                  // Return only count, as component expects
                  then: (onFulfilled) => Promise.resolve(onFulfilled({ count: chainCount, error: null })),
                }),
              };
            }

            // Duplicate check path
            const chain = {
              data: dupExists ? [{ id: 'dup' }] : [],
              error: null,
            };
            return {
              eq: () => ({
                eq: () => ({
                  neq: () => chain,
                }),
              }),
            };
          },
        };
      }

      return {};
    },
  };
}

describe('PromptFormModal - chain rules', () => {
  const baseProps = {
    prompt: {},
    categories: [{ id: 'c1', name: 'Others' }],
    prompts: [],
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('blocks save when chain has 10 items and no order provided', async () => {
    mockSupabase = makeSupabaseMock({ chainCount: 10 });

    render(<PromptFormModal {...baseProps} />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.TitlePlaceholder')), { target: { value: 'Title' } });
    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.ContentPlaceholder')), { target: { value: 'Body' } });

    // Select a chain (no explicit order set)
    // Wait for chains to be loaded to ensure option exists
    await screen.findByRole('option', { name: 'Chain A' });
    const chainSelect = screen.getByRole('combobox', { name: /Chain Type/i });
    fireEvent.change(chainSelect, { target: { value: 'chain-1' } });

    fireEvent.click(screen.getByText(t('PromptForm.Save')));

    await waitFor(() => {
      expect(mockShowDialog).toHaveBeenCalled();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });
  });

  it('auto-assigns next order and saves when under limit', async () => {
    mockSupabase = makeSupabaseMock({ chainCount: 3 });

    render(<PromptFormModal {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.TitlePlaceholder')), { target: { value: 'Title' } });
    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.ContentPlaceholder')), { target: { value: 'Body' } });

    await screen.findByRole('option', { name: 'Chain A' });
    const chainSelect = screen.getByRole('combobox', { name: /Chain Type/i });
    fireEvent.change(chainSelect, { target: { value: 'chain-1' } });

    fireEvent.click(screen.getByText(t('PromptForm.Save')));

    await waitFor(() => {
      expect(baseProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ chain_id: 'chain-1', chain_order: 4 })
      );
    });
  });

  it('blocks save when duplicate order exists', async () => {
    mockSupabase = makeSupabaseMock({ chainCount: 1, dupExists: true });

    render(<PromptFormModal {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.TitlePlaceholder')), { target: { value: 'Title' } });
    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.ContentPlaceholder')), { target: { value: 'Body' } });

    await screen.findByRole('option', { name: 'Chain A' });
    const chainSelect = screen.getByRole('combobox', { name: /Chain Type/i });
    fireEvent.change(chainSelect, { target: { value: 'chain-1' } });

    // Provide explicit order within range to trigger duplicate check
    const orderInput = await screen.findByRole('spinbutton', { name: /Chain order/i });
    fireEvent.change(orderInput, { target: { value: '2' } });

    fireEvent.click(screen.getByText(t('PromptForm.Save')));

    await waitFor(() => {
      expect(mockShowDialog).toHaveBeenCalled();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });
  });
});
