import React from 'react';
import { Machine } from 'xstate';
import { createModel } from '@xstate/test';
import {
  renderApollo,
  cleanup,
  fireEvent,
  waitForElement
} from '../../test-utils';
import Login, { LOGIN_USER } from '../login';
import { cache, isLoggedInVar } from '../../cache';

const emailValueMock = 'a@a.a';

const loginMachine = Machine({
  id: 'login',
  initial: 'loggedOut',
  states: {
    loggedOut: {
      on: {
        LOG_IN: [{
          target: 'loggedIn',
          cond: (_, e) => (/\S+@\S+\.\S+/).test(e.value)
        }]
      },
      meta: {
        test: ({ getByTestId }) => {
          expect(getByTestId('login-input')).toBeInTheDocument()
          expect(getByTestId('login-button')).toBeInTheDocument()
        }
      }
    },
    loggedIn: {
      type: 'final',
      meta: {
        test: async ({ getByText }) => {
          await waitForElement(() => getByText(/log in/i));
          expect(isLoggedInVar()).toBeTruthy();
        }
      }
    }
  }
});

const loginModel = createModel(loginMachine, {
  events: {
    LOG_IN: {
      exec: async ({ getByTestId }, event) => {
        fireEvent.change(getByTestId('login-input'), {
          target: { value: event.value },
        });
        fireEvent.click(getByTestId('login-button'));
      },
      cases: [{ value: '' }, { value: 'fruta' }, { value: emailValueMock }]
    }
  }
})

describe('Login Page', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  const testPlan = loginModel.getShortestPathPlans();

  const mocks = [
    {
      request: { query: LOGIN_USER, variables: { email: emailValueMock } },
      result: {
        data: {
          login: {
            id: 'abc123',
            token: 'def456',
          },
        },
      },
    },
  ];


  testPlan.forEach(plan => {
    describe(plan.description, () => {
      afterEach(cleanup);
      
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const rendered = renderApollo(<Login />, {
            mocks,
            cache,
          });
          return path.test(rendered)
        })
      })
    })
  })

  it('should have full coverage', () => {
    return loginModel.testCoverage();
  })
});