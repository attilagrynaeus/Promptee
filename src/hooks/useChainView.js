import { useState } from 'react';

export default function useChainView(prompts, filtered, showDialog) {
  const [chainViewActive, setChainViewActive] = useState(false);
  const [currentChain, setCurrentChain] = useState([]);

  const activateChainView = (startPrompt) => {
    const chain = [];
    let current = startPrompt;
    while (current) {
      chain.push(current);
      current = prompts.find(p => p.id === current.next_prompt_id);
    }
    setCurrentChain(chain);
    setChainViewActive(true);
  };

  const deactivateChainView = () => {
    setChainViewActive(false);
    setCurrentChain([]);
  };

  const toggleChainView = () => {
    if (chainViewActive) {
      deactivateChainView();
    } else if (filtered.length > 0) {
      activateChainView(filtered[0]);
    } else {
      showDialog({
        title: 'No prompts available',
        message: 'You need at least one prompt to activate chain view.',
        confirmText: 'OK',
      });
    }
  };

  return { chainViewActive, currentChain, activateChainView, deactivateChainView, toggleChainView };
}