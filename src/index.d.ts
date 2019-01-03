// Very Sad, Promise<ProduceFunc<S>> can not work with Partial<S> | ProduceFunc<S>
type Action<S = {}, P = any, ActionKeys = {}> = (
  state: S,
  actions: getConsumerActionsType<Actions<S, ActionKeys>>,
  params: P
) => Partial<S> | Promise<Partial<S>> | ProduceFunc<S> | Promise<ProduceFunc<S>>

type ProduceFunc<S> = (state: S) => void

type Actions<S = {}, ActionKeys = {}> = {
  [P in keyof ActionKeys]: Action<S, ActionKeys[P], ActionKeys>
}

type Dispatch<A> = (value: A) => void
type SetStateAction<S> = S | ((prevState: S) => S)
interface Context<S = {}> {
  action: Action
  consumerActions: (actions: Actions) => getConsumerActionsType<Actions>
  params: Object
  actionName: string
  modelName: string
  next: Function
  newState: Object | null
  setState: Dispatch<SetStateAction<S>>
}
type Middleware<S = {}> = (C: Context<S>, M: Middleware<S>[]) => void

interface Models {
  [name: string]: ModelType
}

type ModelType<InitStateType = {}, ActionKeys = {}> = {
  actions: {
    [P in keyof ActionKeys]: Action<InitStateType, ActionKeys[P], ActionKeys>
  }
  state: { [P in keyof InitStateType]: InitStateType[P] }
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never

type getConsumerActionsType<A extends Actions<any, any>> = {
  [P in keyof A]: ArgumentTypes<A[P]>[2] extends undefined
    ? <K extends keyof A>(params?: ArgumentTypes<A[K]>[2]) => ReturnType<A[K]>
    : <K extends keyof A>(params: ArgumentTypes<A[K]>[2]) => ReturnType<A[K]>
}

type Get<Object, K extends keyof Object> = Object[K]

type ProviderProps = { [name: string]: ModelType }
