import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import { createRoot } from 'react-dom/client'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './panel.css'
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { Message } from '../../types'

const container = document.getElementById('panel')
if (container) {
  const root = createRoot(container)
  root.render(<Panel />)
}

function Panel() {
  const [gravityServerUrl, setGravityServerUrl] = useState('http://localhost:3000/')
  const [authenticationKey, setAuthenticationKey] = useState('')
  const [authorizedSites, setAuthorizedSites] = useState<string[]>([])
  const [requestInterval, setRequestInterval] = useState(0)
  const [useHashInUrlAsPathname, setUseHashInUrlAsPathname] = useState(false)
  const [inlineResources, setInlineResources] = useState(true)
  const [newSite, setNewSite] = useState<string>('')

  useEffect(() => {
    void chrome.storage.local.get(
      [
        'authenticationKey',
        'authorizedSites',
        'gravityServerUrl',
        'requestInterval',
        'useHashInUrlAsPathname',
        'inlineResources',
      ],
      function (settings: any) {
        if (settings.authenticationKey) {
          setAuthenticationKey(settings.authenticationKey)
        }
        if (settings.authorizedSites) {
          setAuthorizedSites(settings.authorizedSites)
        }
        setGravityServerUrl(settings.gravityServerUrl ?? 'http://localhost:3000/')
        setRequestInterval(Number(settings.requestInterval) ?? 0)
        setUseHashInUrlAsPathname(Boolean(settings.useHashInUrlAsPathname) ?? false)
        setInlineResources(Boolean(settings.inlineResources) ?? true)
      },
    )
  }, [])

  useEffect(() => {
    void chrome.storage.local.set({ authenticationKey })
    sendMessageAction({
      action: 'updateAuthKey',
      authKey: authenticationKey,
    })
  }, [authenticationKey])

  useEffect(() => {
    void chrome.storage.local.set({ gravityServerUrl })
    sendMessageAction({
      action: 'updateGravityServerUrl',
      url: gravityServerUrl,
    })
  }, [gravityServerUrl])

  useEffect(() => {
    void chrome.storage.local.set({ requestInterval })
    sendMessageAction({
      action: 'updateRequestInterval',
      interval: requestInterval,
    })
  }, [requestInterval])

  useEffect(() => {
    void chrome.storage.local.set({ useHashInUrlAsPathname })
    sendMessageAction({
      action: 'updateUseHashInUrlAsPathname',
      value: useHashInUrlAsPathname,
    })
  }, [useHashInUrlAsPathname])

  useEffect(() => {
    void chrome.storage.local.set({ inlineResources })
    sendMessageAction({
      action: 'updateInlineResources',
      value: inlineResources,
    })
  }, [inlineResources])

  useEffect(() => {
    void chrome.storage.local.set({ authorizedSites })
    sendMessageAction({
      action: 'updateAuthorisedSites',
      sites: authorizedSites,
    })
  }, [authorizedSites])

  return (
    <div className="gravity-data-collector-panel">
      <div className="gravity-data-collector-panel__left">
        <button
          className="primary"
          onClick={() => {
            sendMessageAction({ action: 'startNewSession' })
            toast.info('New session')
          }}
        >
          New session
        </button>
        <h4>Gravity collector Settings</h4>
        <TextField
          size="small"
          id="gravity-server-url"
          className="gravity-data-collector__gravity-server-url"
          label="Gravity Server Url"
          value={gravityServerUrl}
          onChange={(e) => setGravityServerUrl(e.target.value)}
        />
        <TextField
          size="small"
          style={{ marginTop: '10px' }}
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
            size="small"
            id="new-authorized-site"
            className="gravity-data-collector__authorized-site"
            label="Add authorized site"
            value={newSite}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSite(e.target.value)}
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
        <TextField
          size="small"
          id="request-interval"
          label="Request interval"
          value={requestInterval}
          type="number"
          style={{ marginTop: '10px', width: '200px' }}
          onChange={(e) => {
            let stringValue = e.target.value
            try {
              setRequestInterval(parseInt(stringValue))
            } catch (e) {
              setRequestInterval(0)
            }
          }}
        />
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={useHashInUrlAsPathname}
                onChange={(_event, checked) => {
                  setUseHashInUrlAsPathname(checked)
                }}
              />
            }
            label="use # in URL as pathname"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={inlineResources}
                onChange={(_event, checked) => {
                  setInlineResources(checked)
                }}
              />
            }
            label="inline resources (CSS/images)"
          />
        </FormGroup>
      </div>
      <ToastContainer />
    </div>
  )
}

function sendMessageAction(message: Message) {
  void chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, message)
}
