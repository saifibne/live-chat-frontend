export interface SearchUser {
  _id: string;
  name: string;
  email: string;
  pictureUrl: string;
  alreadyFriend: boolean;
}
export interface FriendListInterface {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pictureUrl: string;
  };
}
export interface UserInterface {
  _id: string;
  name: string;
  email: string;
  pictureUrl: string;
}
