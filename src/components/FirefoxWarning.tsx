import React from 'react';

export function FirefoxWarning() {
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  
  if (!isFirefox) return null;
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-900/90 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-100">
      <h4 className="font-semibold mb-2">Firefox Users</h4>
      <p className="mb-2">If Phantom wallet doesn't open:</p>
      <ol className="list-decimal list-inside space-y-1 text-xs">
        <li>Check popup blocker in address bar</li>
        <li>Allow popups from this site</li>
        <li>Disable Enhanced Tracking Protection for this site</li>
        <li>Try refreshing after allowing popups</li>
      </ol>
    </div>
  );
}