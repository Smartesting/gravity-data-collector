import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import { createRoot } from 'react-dom/client'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './panel.css'

const container = document.getElementById('panel')
if (container) {
  const root = createRoot(container)
  root.render(<Panel />)
}

function Panel() {
  const [authenticationKey, setAuthenticationKey] = useState<string>('')
  const [authorizedSites, setAuthorizedSites] = useState<string[]>([])
  const [newSite, setNewSite] = useState<string>('')

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.get(['authenticationKey', 'authorizedSites'], function (settings: any) {
      if (settings.authenticationKey) {
        setAuthenticationKey(settings.authenticationKey)
      }
      if (settings.authorizedSites) {
        setAuthorizedSites(settings.authorizedSites)
      }
    })
  }, [])

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.set({ authenticationKey: authenticationKey })
    // @ts-ignore
    chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
      action: 'newAuthenticationKey',
      value: authenticationKey,
    })
  }, [authenticationKey])

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.set({ authorizedSites: authorizedSites })
    // @ts-ignore
    chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
      action: 'newAuthorizedSites',
      value: authorizedSites,
    })
  }, [authorizedSites])

  return (
    <div className="gravity-data-collector-panel">
      <div className="gravity-data-collector-panel__left">
        <button
          className="primary"
          onClick={() => {
            // @ts-ignore
            chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, { action: 'newSession' })
            toast.info('New session')
          }}
        >
          New session
        </button>
        <h4>Gravity project Settings</h4>
        <TextField
          id="authentication-key"
          className="gravity-data-collector__authentication-key"
          label="Authentication Key"
          value={authenticationKey}
          type="password"
          autoComplete="current-auth-key"
          onChange={(e) => setAuthenticationKey(e.target.value)}
        />
        <h4>Authorized Sites</h4>
        <div className="gravity-data-collector__authorized-sites">
          {authorizedSites.map((site, index) => {
            return (
              <div className="gravity-data-collector__authorized-site__line">
                <TextField
                  id="authorized-site"
                  key={site}
                  className="gravity-data-collector__authorized-site"
                  label="Authorized site"
                  value={site}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <button
                  className="secondary"
                  onClick={() => {
                    const newSites = authorizedSites.slice()
                    newSites.splice(index, 1)
                    setAuthorizedSites(newSites)
                  }}
                >
                  Remove
                </button>
              </div>
            )
          })}
          <TextField
            id="new-authorized-site"
            className="gravity-data-collector__authorized-site"
            label="Add authorized site"
            value={newSite}
            onChange={(e:React.ChangeEvent<HTMLInputElement>) => setNewSite(e.target.value)}
            onBlur={(e) => {
              if (e.target.value.length > 0) {
                const newSites = authorizedSites.slice()
                newSites.push(e.target.value)
                setAuthorizedSites(newSites)
                setNewSite('')
              }
            }}
          />
        </div>
      </div>
      <div className="gravity-data-collector-panel__right">
        <h4>Collector Settings</h4>
      </div>
      <ToastContainer />
    </div>
  )
}
