import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { createRoot } from 'react-dom/client';
import "./panel.css";

const container = document.getElementById("panel")
if (container) {
  const root = createRoot(container);
  root.render(<Panel />);
}

function Panel() {
  const [authenticationKey, setAuthenticationKey] = useState<string>('')

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.get(
      ["authenticationKey"],
      function (settings) {
        if (settings.authenticationKey) {
          setAuthenticationKey(settings.authenticationKey);
        }
      }
    );
  }, [])

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.set({ authenticationKey });
    // @ts-ignore
    chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, { action: 'newAuthenticationKey', value: authenticationKey })
  }, [authenticationKey])

  return (
    <div className="gravity-data-collector-panel">
      <button onClick={(e) => {
        // @ts-ignore
        chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, { action: 'newSession' })
      }}>New session</button>
      <TextField
        id="authentication-key"
        className='gravity-data-collector-authentication-key'
        label="Authentication Key"
        value={authenticationKey}
        type="password"
        autoComplete="current-auth-key"
        onBlur={(e) => setAuthenticationKey(e.target.value)}
      />
    </div>
  );
}
