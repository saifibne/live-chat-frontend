import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortText',
})
export class ShortTextPipe implements PipeTransform {
  transform(value: string, number: number): any {
    if (value.length > number) {
      return value.substr(0, number) + ' ...';
    }
    return value;
  }
}
