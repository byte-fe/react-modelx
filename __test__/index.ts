/// <reference path="./index.d.ts" />
/// <reference path="../src/index.d.ts" />
import { Model } from '../src'
import { timeout } from '../src/helper'
import { actionMiddlewares } from '../src/middlewares'
import { freeze } from 'immer'
import { name } from 'faker'

export const ActionsTester: ModelType<ActionTesterState, ActionTesterParams> = {
  actions: {
    get: async () => {
      const response = await timeout(9, { code: 0, data: { counter: 1000 } })
      return { response }
    },
    getData: async (_, { actions }) => {
      await actions.get()
      actions.parse()
    },
    parse: () => {
      return (state) => {
        state.data = state.response.data
      }
    }
  },
  state: {
    data: {},
    response: {
      data: {}
    }
  }
}

export const Counter: ModelType<
  CounterState,
  CounterActionParams & ExtraActionParams
> = {
  actions: {
    add: (params, { state }) => {
      return {
        count: state.count + params
      }
    },
    addCaller: (_, { actions }) => {
      actions.add(5)
    },
    increment: (params) => {
      return (state) => {
        state.count += params
      }
    }
  },
  state: { count: 0 }
}

// v3.0
export const NextCounter: ModelType<
  CounterState,
  CounterActionParams & ExtraActionParams
> = {
  actions: {
    add: (params, { state }) => {
      return {
        count: state.count + params
      }
    },
    addCaller: (_, { actions }) => {
      actions.add(5)
    },
    increment: (params) => {
      return (state) => {
        state.count += params
      }
    }
  },
  state: { count: 0 }
}

// common used case
interface CommonState {
  xxx: string
  yyy: number
}

interface CommonActionParams {
  setState: Partial<CommonState> | ProduceFunc<Partial<CommonState>>
}

export const State: ModelType<CommonState, CommonActionParams> = {
  state: {
    xxx: '',
    yyy: -1
  },
  actions: {
    setState: async (payload) => payload
  }
}

export const ExtCounter: ModelType<
  ExtState,
  ExtActionParams,
  { name: string }
> = {
  actions: {
    ext: (_, { name }) => {
      return {
        name
      }
    }
  },
  state: { name: '' }
}

export const Theme: ModelType<ThemeState, ThemeActionParams> = {
  actions: {
    changeTheme: (_, { state }) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark'
    })
  },
  state: {
    theme: 'dark'
  }
}

export const AsyncCounter: ModelType<CounterState, CounterActionParams> = {
  actions: {
    increment: (params) => {
      return (state) => {
        state.count += params
      }
    }
  },
  asyncState: async (context: { count?: number }) => ({
    count: context ? context.count || 1 : 1
  }),
  state: { count: 0 }
}

export const SSRCounter: ModelType<SSRCounterState, CounterActionParams> = {
  actions: {
    increment: (params) => {
      return (state) => {
        state.count += params
      }
    }
  },
  asyncState: async (context: { count?: number }) => ({
    count: context ? context.count || 1 : 1
  }),
  state: { count: 0, clientKey: 'unused' }
}

export const AsyncNull: ModelType<CounterState, CounterActionParams> = {
  actions: {
    increment: (params) => {
      return (state) => {
        state.count += params
      }
    }
  },
  state: { count: 0 }
}

const timeoutCounter: ModelType<CounterState, CounterActionParams> = {
  actions: {
    increment: async (params, { state: _ }) => {
      await timeout(4000, {})
      return (state: typeof _) => {
        state.count += params
      }
    }
  },
  asyncState: async () => ({
    count: 1
  }),
  state: { count: 0 }
}

export const RetTester: ModelType<RetState, RetActionParams> = {
  state: {
    count: 0,
    extra: 'extra'
  },
  actions: {
    add: (num, { state }) => {
      return { count: state.count + num }
    },
    asyncAdd: async (num, { state }) => {
      await timeout(300, {})
      return { count: state.count + num }
    },
    produceAdd: (num) => {
      return (state) => {
        state.count += num
      }
    },
    asyncProduceAdd: async (num) => {
      await timeout(300, {})
      return (state) => {
        state.count += num
      }
    },
    hocAdd: (num, { actions }) => {
      return actions.add(num)
    },
    asyncHocAdd: async (num, { actions }) => {
      await timeout(100, {})
      return actions.add(num)
    }
  }
}

export const TimeoutCounter = Model(timeoutCounter)

export const ErrorCounter: ModelType<CounterState, CounterActionParams> = {
  actions: {
    increment: async () => {
      throw 'error'
    }
  },
  state: { count: 0 }
}

const delayMiddleware: Middleware = async (context, restMiddlewares) => {
  await timeout(1000, {})
  context.next(restMiddlewares)
}

export const NextCounterModel: ModelType<
  CounterState,
  NextCounterActionParams
> = {
  actions: {
    add: (num) => {
      return (state) => {
        state.count += num
      }
    },
    increment: async (num, { actions }) => {
      actions.add(num)
      await timeout(300, {})
    }
  },
  middlewares: [delayMiddleware, ...actionMiddlewares],
  state: {
    count: 0
  }
}

interface ExpensiveState {
  moduleList: any[]
}

interface ExpensiveActionParams {
  setState: undefined
  setPreFreezedDataset: undefined
}

const hugeDataset = <any[]>[]

// Create circular data
console.time('create data')
Array.from(Array(20000).keys()).forEach((_, idx) => {
  // const obj = makeDeepFakeData(100)
  hugeDataset.push({
    idx,
    name: name.findName(),
    parent: hugeDataset
  })
})
console.timeEnd('create data')

export const ExpensiveModel: ModelType<
  ExpensiveState,
  ExpensiveActionParams
> = {
  state: {
    moduleList: []
  },
  actions: {
    setState: () => {
      return { moduleList: hugeDataset }
    },
    setPreFreezedDataset: () => {
      const optimizedDataset = freeze(hugeDataset)
      return { moduleList: optimizedDataset }
    }
  }
}
