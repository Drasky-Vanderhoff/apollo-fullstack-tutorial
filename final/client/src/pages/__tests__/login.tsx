/*
import React from 'react';

import {
  renderApollo,
  cleanup,
  fireEvent,
  waitForElement,
} from '../../test-utils';
import Login, {LOGIN_USER} from '../login';
import { cache, isLoggedInVar } from '../../cache';

describe('Login Page', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  it('renders login page', async () => {
    renderApollo(<Login />);
  });

  it('fires login mutation and updates cache after done', async () => {
    expect(isLoggedInVar()).toBeFalsy();

    const mocks = [
      {
        request: {query: LOGIN_USER, variables: {email: 'a@a.a'}},
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

    const {getByText, getByTestId} = await renderApollo(<Login />, {
      mocks,
      cache,
    });

    fireEvent.change(getByTestId('login-input'), {
      target: {value: 'a@a.a'},
    });

    fireEvent.click(getByText(/log in/i));

    // login is done if loader is gone
    await waitForElement(() => getByText(/log in/i));

    expect(isLoggedInVar()).toBeTruthy();
  });
});
*/

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
import { RenderResult } from '@testing-library/react';

const emailValueMock = 'a@a.a';

const loginMachine = Machine({
  id: 'login',
  initial: 'loggedOut',
  states: {
    loggedOut: {
      on: {
        LOG_IN: [
          { target: 'loginSuccesful', cond: (_: any, e: { value: string; }) => (/\S+@\S+\.\S+/).test(e.value) },
        ]
      },
      meta: {
        test: ({ getByTestId }: RenderResult) => {
          expect(getByTestId('login-input')).toBeInTheDocument()
          expect(getByTestId('login-button')).toBeInTheDocument()
        }
      }
    },
    loginSuccesful: {
      type: 'final',
      meta: {
        test: async ({ getByText }: RenderResult) => {
          await waitForElement(() => getByText(/log in/i));
          expect(isLoggedInVar()).toBeTruthy();
        }
      }
    }
  },
});

const loginModel = createModel(loginMachine, {
  events: {
    LOG_IN: {
      exec: async ({ getByTestId }, event: { value: string; }) => {
        fireEvent.change(getByTestId('login-input'), {
          target: { value: event.value },
        });
        fireEvent.click(getByTestId('login-button'));
      },
      cases: [{},{ value: '' }, { value: 'fruta' }, { value: emailValueMock }]
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