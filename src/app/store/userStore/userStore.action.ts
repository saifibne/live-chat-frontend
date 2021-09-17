import { createAction, props } from '@ngrx/store';
import { UserInterface } from '../../model/user.model';

export const userDetail = createAction(
  '[Account] UserDetails',
  props<UserInterface>()
);

export const startGettingUser = createAction('[User Store] Get UserDetail');

export const userDetailFail = createAction('[User Store] Userdata Fail');

export const startPersistUserData = createAction(
  '[User Store] Get Persist UserData'
);

export const persistUserData = createAction(
  '[User Store] Persist UserData',
  props<{
    name: string;
    pictureUrl: string;
    notifications: [{ message: string; imageUrl: string }];
    pendingRequests: [
      { userId: { _id: string; name: string; pictureUrl: string } }
    ];
  }>()
);

export const persistUserDataFail = createAction(
  '[User Store] Persist UserData Fail'
);
