import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, getByTestId, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

describe('ChangeEventListener', () => {
  let sessionIdHandler: ISessionIdHandler
  let userActionHandler: UserActionHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  const dataTestId = 'my-data-testId'

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 600)
    userActionHandler = new UserActionHandler(sessionIdHandler, 0, nop)
    handleSpy = vitest.spyOn(userActionHandler, 'handle')
    createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
  })

  it('it calls createTargetedUserAction with the excludeRegex option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
      <div>
        <input id='text-5' type='checkbox' />
      </div>`,
      'div',
    )

    new ChangeEventListener(userActionHandler, domWindow, { excludeRegex: /.*/ }).init()

    const checkbox = await waitFor(() => getByRole(element, 'checkbox'))
    fireEvent.change(checkbox)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new Event('change'), 'change', { excludeRegex: /.*/ })
    })
  })

  it('it calls createTargetedUserAction with the customSelector option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
      <div>
        <input id='text-5' type='checkbox' />
      </div>`,
      'div',
    )

    new ChangeEventListener(userActionHandler, domWindow, { customSelector: 'data-testid' }).init()

    const checkbox = await waitFor(() => getByRole(element, 'checkbox'))
    fireEvent.change(checkbox)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new Event('change'), 'change', {
        customSelector: 'data-testid',
      })
    })
  })

  it('calls handler when change event been fired', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
        <div>
          <input type='checkbox' id='checkbox1' name='checkbox1'>
        </div>`,
      'div',
    )

    new ChangeEventListener(userActionHandler, domWindow).init()

    const checkBox = await waitFor(() => getByRole(element, 'checkbox'))
    await userEvent.click(checkBox)

    await waitFor(() => {
      expect(handleSpy).toHaveBeenCalledOnce()
    })
  })

  const textInputs = [
    {
      inputType: 'text',
      html: `<input id='text-1' type='text' data-testid='${dataTestId}' />`,
    },
    {
      inputType: 'textarea',
      html: `<textarea id='text-2' data-testid='${dataTestId}'></textarea>`,
    },
    {
      inputType: 'search',
      html: `<input id='text-5' type='search' data-testid='${dataTestId}' />`,
    },
  ]
  for (const { inputType, html } of textInputs) {
    it(`does not call handler on ${inputType} inputs`, async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
          <div>
            ${html}
          </div>`,
        'div',
      )

      new ChangeEventListener(userActionHandler, domWindow).init()
      const input = await waitFor(() => getByTestId(element, dataTestId))
      await userEvent.type(input, 'Something{Tab}')

      await waitFor(() => {
        expect(handleSpy).not.toHaveBeenCalled()
      })
    })
  }

  const nonTextInputs = [
    {
      inputType: 'radio',
      html: `<input id='radio' type='radio' data-testid='${dataTestId}' />`,
    },
    {
      inputType: 'checkbox',
      html: `<input id='checkbox' type='checkbox' data-testid='${dataTestId}' />`,
    },
    {
      inputType: 'select',
      html: `<select id='select' data-testid='${dataTestId}'><option>Opt1</option></select>`,
    },
  ]

  for (const { inputType, html } of nonTextInputs) {
    it(`calls handler on ${inputType} inputs`, async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
          <div>
            ${html}
          </div>`,
        'div',
      )

      new ChangeEventListener(userActionHandler, domWindow).init()
      const input = await waitFor(() => getByTestId(element, dataTestId))
      if (inputType === 'select') {
        await userEvent.selectOptions(input, 'Opt1')
      } else {
        await userEvent.click(input)
      }

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
      })
    })
  }
})
