import { Action, createReducer, on } from '@ngrx/store';

import * as userActions from './userStore.action';
import { UserInterface } from '../../model/user.model';

export interface State {
  user:
    | {
        _id: string;
        address: string;
        phoneNo: string;
        birthDate: string;
        name: string;
        email: string;
        pictureUrl: string;
      }
    | undefined;
  loadingState: boolean;
  persistUserData:
    | {
        name: string;
        pictureUrl: string;
        notifications: [{ message: string; imageUrl: string }];
        pendingRequests: [
          { userId: { _id: string; name: string; pictureUrl: string } }
        ];
      }
    | undefined;
}

const initialState: State = {
  user: undefined,
  loadingState: false,
  persistUserData: undefined,
};

const userStoreReducer = createReducer(
  initialState,
  on(userActions.startGettingUser, (state, payload) => ({
    ...state,
    user: undefined,
    loadingState: true,
  })),
  on(userActions.userDetail, (state, payLoad: UserInterface) => {
    return {
      ...state,
      user: {
        _id: payLoad._id,
        address: payLoad.address,
        phoneNo: payLoad.phoneNo,
        birthDate: payLoad.birthDate,
        name: payLoad.name,
        email: payLoad.email,
        pictureUrl: payLoad.pictureUrl,
      },
      loadingState: false,
    };
  }),
  on(userActions.userDetailFail, (state, payload) => ({
    ...state,
    user: undefined,
    loadingState: false,
  })),
  on(userActions.startPersistUserData, (state, payload) => ({
    ...state,
    persistUserData: undefined,
    loadingState: true,
  })),
  on(userActions.persistUserData, (state, payload) => {
    return {
      ...state,
      persistUserData: {
        name: payload.name,
        pictureUrl: payload.pictureUrl,
        notifications: payload.notifications,
        pendingRequests: payload.pendingRequests,
      },
      loadingState: false,
    };
  }),
  on(userActions.persistUserDataFail, (state, payload) => ({
    ...state,
    persistUserData: undefined,
    loadingState: false,
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return userStoreReducer(state, action);
}
