import { ActionReducerMap } from '@ngrx/store';

import * as fromUserStore from '../store/userStore/userStore.reducer';

export interface AppStateInterface {
  userDetails: fromUserStore.State;
}

export const appState: ActionReducerMap<AppStateInterface> = {
  userDetails: fromUserStore.reducer,
};
