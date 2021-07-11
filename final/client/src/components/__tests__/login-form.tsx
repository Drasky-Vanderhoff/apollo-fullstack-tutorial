import React from 'react';
/* import { Machine } from 'xstate';
import { createModel } from '@xstate/test'; */

import { render, cleanup } from '../../test-utils';
import LoginForm from '../login-form';

/* export const loginFormStates = {
  initial: 'clearForm',
  states: {
    clearForm: {
      on: {
        CHANGE_MAIL_INPUT: 'dirtyForm'
      }
    },
    dirtyForm: {
      on: {
        SUBMIT: 'loggedIn',
        CLEAN_FORM: 'clearForm'
      }
    },
    loggedIn: {}
  }
} */

describe('Login Form', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  it('renders without error', () => {
    render(<LoginForm login={() => {}}/>);
  });
});
