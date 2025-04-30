import { createStore, reconcile } from 'solid-js/store';

export const createReducer = <T extends object, A extends { type: string }>(
  reducer: (state: T, action: A) => T,
  initialState: T
): [T, (action: A) => void] => {
  const [store, setStore] = createStore(initialState);

  const dispatch = (action: A): void => {
    const nextState = reducer(store, action);
    setStore(reconcile(nextState));
  };

  return [store, dispatch];
};
