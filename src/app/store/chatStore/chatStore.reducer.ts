import { Action, createReducer, on } from '@ngrx/store';

import * as chatActions from './chatStore.action';
import { ChatConnectionModel } from '../../model/chat.model';
import { FriendListInterface } from '../../model/user.model';

export interface State {
  existingChatConnection:
    | {
        message: string;
        _id: string;
        name: string;
        pictureUrl: string;
        time: Date;
      }
    | undefined;
  chatConnections: ChatConnectionModel[] | undefined;
  loadingData: boolean;
  friends: FriendListInterface[] | undefined;
  currentSection: string | undefined;
}

const initialState: State = {
  existingChatConnection: undefined,
  chatConnections: undefined,
  loadingData: false,
  friends: undefined,
  currentSection: undefined,
};

const chatStoreReducer = createReducer(
  initialState,
  on(chatActions.existingChatConnection, (state, payload) => ({
    ...state,
    existingChatConnection: {
      message: payload.message,
      _id: payload._id,
      name: payload.name,
      pictureUrl: payload.pictureUrl,
      time: payload.time,
    },
  })),
  on(chatActions.resetLatestChatConnection, (state, payload) => ({
    ...state,
    existingChatConnection: undefined,
  })),
  on(chatActions.startGettingChats, (state, payload) => ({
    ...state,
    loadingData: true,
    currentSection: 'chats',
  })),
  on(chatActions.chats, (state, payload) => {
    if (state.existingChatConnection) {
      const existingChatConnectionIndex = payload.chatConnections.findIndex(
        (eachChatConnection) =>
          eachChatConnection._id === state.existingChatConnection?._id
      );
      if (existingChatConnectionIndex !== -1) {
        const newChatConnections = [...payload.chatConnections];
        newChatConnections.splice(existingChatConnectionIndex, 1);
        return {
          ...state,
          chatConnections: [
            state.existingChatConnection,
            ...newChatConnections,
          ],
          existingChatConnection: undefined,
          loadingData: false,
        };
      } else {
        return {
          ...state,
          chatConnections: [
            state.existingChatConnection,
            ...payload.chatConnections,
          ],
          existingChatConnection: undefined,
          loadingData: false,
        };
      }
    } else {
      return {
        ...state,
        chatConnections: payload.chatConnections,
        loadingData: false,
      };
    }
  }),
  on(chatActions.resetChats, (state, payload) => ({
    ...state,
    chatConnections: undefined,
  })),
  on(chatActions.startGettingFriendList, (state, payload) => ({
    ...state,
    loadingData: true,
    currentSection: 'friends',
  })),
  on(chatActions.friendList, (state, payload) => ({
    ...state,
    friends: payload.friends,
    loadingData: false,
  })),
  on(chatActions.resetFriendList, (state, payload) => ({
    ...state,
    friends: undefined,
    loadingData: false,
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return chatStoreReducer(state, action);
}
