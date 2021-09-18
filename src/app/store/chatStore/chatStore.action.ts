import { createAction, props } from '@ngrx/store';
import { ChatConnectionModel } from '../../model/chat.model';
import { FriendListInterface } from '../../model/user.model';

export const existingChatConnection = createAction(
  '[Chat Store] Latest Chat Connection',
  props<{
    message: string;
    _id: string;
    name: string;
    pictureUrl: string;
    time: Date;
  }>()
);

export const resetLatestChatConnection = createAction(
  '[Chat Store] Reset Latest Chat Connection'
);

export const startGettingChats = createAction(
  '[Chat Store] Start Getting Chats'
);

export const chats = createAction(
  '[Chat Store] Chats',
  props<{ chatConnections: ChatConnectionModel[] }>()
);

export const resetChats = createAction('[Chat Store] Reset Chats');

export const startGettingFriendList = createAction(
  '[Chat Store] Start Getting Friend List'
);

export const friendList = createAction(
  '[Chat Store] Friend Lists',
  props<{ friends: FriendListInterface[] }>()
);

export const resetFriendList = createAction('[Chat Store] Reset Friend Lists');
