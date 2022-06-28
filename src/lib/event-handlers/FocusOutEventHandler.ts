import { v4 as uuidv4 } from 'uuid';
import TLogHandler from '../log-handlers/TLogHandler';
import createGravityEvent from '../../utils/createGravityEvent';
import EventType from '../../utils/eventType';
import { DataAnonymizer } from '../../utils/dataAnonymizer';

const anonymizer = new DataAnonymizer(uuidv4());

type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement;

class FocusOutEventHandler {
  private logHandler: TLogHandler;

  constructor(logHandler: TLogHandler) {
    this.logHandler = logHandler;
  }

  init() {
    window.addEventListener(
      'focusout',
      async (event) => {
        const elementTarget = event.target as HTMLInputWithValue;

        if (elementTarget instanceof HTMLInputElement || elementTarget instanceof HTMLTextAreaElement) {
          const gravityEvent = await createGravityEvent(event, EventType.FocusOut);
          if (gravityEvent.target) {
            gravityEvent.target.value = inputValueType(elementTarget);
          }
          this.logHandler.run(gravityEvent);
        }
      },
      true,
    );
  }
}

function inputValueType(element: HTMLInputWithValue) {
  switch (element.type) {
    case 'checkbox':
      return (!!element.getAttribute('checked')).toString();
    case 'email':
      return anonymizer.anonymize(element.value);
    case 'file':
      return anonymizer.anonymize(element.value);
    case 'password':
      return '[[PASSWORD]]';
    case 'search':
      return element.value;
    case 'text':
      return anonymizer.anonymize(element.value);
    case 'tel':
      return anonymizer.anonymize(element.value);
    case 'url':
      return anonymizer.anonymize(element.value);
    default:
      return anonymizer.anonymize(element.value);
  }
}

export default FocusOutEventHandler;
