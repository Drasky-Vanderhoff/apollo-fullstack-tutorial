/* import React from 'react';
import { InMemoryCache } from '@apollo/client';

import {
  renderApollo,
  cleanup,
  waitForElement,
} from '../../test-utils';
import Launches, { GET_LAUNCHES } from '../launches';

const mockLaunch = {
  __typename: 'Launch',
  id: 1,
  isBooked: true,
  rocket: {
    __typename: 'Rocket',
    id: 1,
    name: 'tester',
    type: 'test',
  },
  mission: {
    __typename: 'Mission',
    id: 1,
    name: 'test mission',
    missionPatch: '/',
  },
  site: 'earth',
  isInCart: false,
};

describe('Launches Page', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  it('renders launches', async () => {
    const cache = new InMemoryCache({ addTypename: false });
    const mocks = [
      {
        request: { query: GET_LAUNCHES },
        result: {
          data: {
            launches: {
              cursor: '123',
              hasMore: true,
              launches: [mockLaunch],
            },
          },
        },
      },
    ];
    const { getByText } = await renderApollo(<Launches />, {
      mocks,
      cache,
    });
    await waitForElement(() => getByText(/test mission/i));
  });
});
 */

import React from 'react';
import { Machine } from 'xstate';
import { createModel } from '@xstate/test';
import { InMemoryCache } from '@apollo/client';
import {
  renderApollo,
  cleanup,
  waitForElementToBeRemoved,
  waitForElement,
} from '../../test-utils';
import Launches, { GET_LAUNCHES } from '../launches';
import mockLaunches from './__mocks__/launches.json';
import { fireEvent, RenderResult } from '@testing-library/react';

const mockLaunchesIds = mockLaunches.map(({ id }) => ({ value: id }));

const launchesMachine = Machine({
  id: 'launches',
  initial: 'loading',
  states: {
    loading: {
      on: {
        LOADING_DONE: 'launchesLoaded'
      },
      meta: {
        test: ({ getByTestId } : RenderResult) => {
          expect(getByTestId('launches-loading')).toBeInTheDocument()
        }
      }
    },
    launchesLoaded: {
/*       on: {
        SELECT_LAUNCH: [{
          target: 'launchSelected',
          cond: (_, e) => mockLaunchesIds.some(({ value }) => value === e.value)
        }]
      }, */
      meta: {
        test: ({ queryByTestId, getByTestId } : RenderResult) => {
          expect(queryByTestId('launches-loading')).toBeNull()
          mockLaunches.map(
            ({ id }) => expect(getByTestId(`launch-tile-${id}`)).toBeInTheDocument()
          )
        }
      }
    },
/*     launchSelected: {
      type: 'final',
      meta: {
        test: async ({ getByText } : RenderResult) => {
          await waitForElement(() => getByText(/launch/i))
          expect(getByText(/launch/i)).toBeTruthy()
        }
      }
    } */
  }
});

const launchesModel = createModel(launchesMachine, {
  events: {
    LOADING_DONE: {
      exec: async ({ queryByTestId }) => await waitForElementToBeRemoved(() => queryByTestId('launches-loading'))
    },
/*     SELECT_LAUNCH: {
      exec: async ({ getByTestId } : RenderResult, event) => await fireEvent.click(getByTestId(`launch-tile-${event.value}`)),
      cases: mockLaunchesIds
    } */
  }
})

describe('Launches Page', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  const testPlan = launchesModel.getShortestPathPlans();

  const cache = new InMemoryCache({ addTypename: false });
  const mocks = [
    {
      request: { query: GET_LAUNCHES },
      result: {
        data: {
          launches: {
            cursor: '123',
            hasMore: true,
            launches: mockLaunches,
          },
        }
      }
    }
  ];

  testPlan.forEach(plan => {
    describe(plan.description, () => {
      beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(jest.fn());
        jest.spyOn(console, 'debug').mockImplementation(jest.fn());
      });
      afterEach(cleanup);
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const rendered = renderApollo(<Launches />, {
            mocks,
            cache,
            resolvers: {}
          });
          return path.test(rendered)
        })
      })
    })
  })

  it('should have full coverage', () => {
    return launchesModel.testCoverage();
  })
});