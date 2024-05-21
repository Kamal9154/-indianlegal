import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(
  ) { }
/*===========Validations Expression Start here ===========*/
notRequired_validator = [];
required = [Validators.required];
email = [Validators.required, Validators.minLength(6), Validators.maxLength(150),
  Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,25}$')];
latitude = [Validators.required,Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/),Validators.maxLength(50)]
longitude = [Validators.required,Validators.pattern(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/),Validators.maxLength(50)]
password = [Validators.required, Validators.minLength(6)];
mobile = [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern('^[+]?[0-9]+$')];
name = [Validators.required, Validators.minLength(1), Validators.maxLength(50)];
address = [Validators.required, Validators.minLength(2), Validators.maxLength(155)];
answer = [Validators.required, Validators.minLength(2), Validators.maxLength(2000)];
/*===========Validations Expression End here ===========*/

}
