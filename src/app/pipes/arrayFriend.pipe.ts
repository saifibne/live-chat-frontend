import { Pipe, PipeTransform } from '@angular/core';
import { FriendListInterface } from '../model/user.model';

@Pipe({
  name: 'searchFriend',
})
export class ArrayFriendPipe implements PipeTransform {
  transform(value: FriendListInterface[], input: string): any {
    if (input && input.length > 0) {
      const searchText = new RegExp(`${input}`, 'i');
      const array = [...value];
      const filteredArray = array.filter((item) => {
        return item.userId.name.match(searchText);
      });
      if (filteredArray.length > 0) {
        filteredArray.forEach((item) => {
          const index = array.findIndex((eachItem) => {
            return eachItem.userId._id === item.userId._id;
          });
          if (index !== -1) {
            array.splice(index, 1);
          }
        });
        return [...filteredArray, ...array];
      } else {
        return value;
      }
    } else {
      return value;
    }
  }
}
