import React from 'react';
import ReactDOM from 'react-dom';

export default function SubscribeModal({ open, onClose, userId }) {
  if (!open) return null;

  const startCheckout = async () => {
    try {
      const res = await fetch('/.netlify/functions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          // TODO: set actual success and cancel URLs via env
          successUrl: window.location.origin,
          cancelUrl: window.location.href,
        }),
      });
      const { id } = await res.json();
      if (id) {
        window.location.href = `https://checkout.stripe.com/pay/${id}`;
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-gray-200">
        <h2 className="text-xl font-semibold mb-2">Subscription required</h2>
        <p className="text-sm mb-4">Your trial has ended. Subscribe to unlock all features.</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={startCheckout}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-md font-semibold shadow"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
