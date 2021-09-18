import { ActionReducerMap } from '@ngrx/store';

import * as fromUserStore from '../store/userStore/userStore.reducer';
import * as fromChatStore from '../store/chatStore/chatStore.reducer';

export interface AppStateInterface {
  userDetails: fromUserStore.State;
  chatStore: fromChatStore.State;
}

export const appState: ActionReducerMap<AppStateInterface> = {
  userDetails: fromUserStore.reducer,
  chatStore: fromChatStore.reducer,
};
