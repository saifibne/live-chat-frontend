import { Pipe, PipeTransform } from '@angular/core';

import { ChatConnectionModel } from '../model/chat.model';

@Pipe({
  name: 'searchArray',
})
export class ArrayFilterPipe implements PipeTransform {
  transform(value: ChatConnectionModel[], input: string): any {
    if (input && input.length > 0) {
      const searchText = new RegExp(`${input}`, 'i');
      const array = [...value];
      const filteredArray = array.filter((item) => {
        return item.name.match(searchText);
      });
      if (filteredArray.length > 0) {
        filteredArray.forEach((item) => {
          const index = array.findIndex((eachItem) => {
            return eachItem._id === item._id;
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
