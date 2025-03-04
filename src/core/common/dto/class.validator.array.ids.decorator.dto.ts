/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import {isValidMongoId} from "../../utils/utils";
import {jsonDecoder} from "../../utils/app.validator";


export function IsMongoIdsObject(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "IsMongoIdsObject",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions ?? { message: "The list must be valid mongo id object !" },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if(!value){
            return  false
          }
          let data = [];
          try {
            data = jsonDecoder(JSON.parse(value));
          } catch (err) {
          }

          if (!Array.isArray(data)) {
            return false;
          }
          if (value.length == 0) {
            return false;
          }
          for (let i of data) {
            if (!isValidMongoId(i)) {
              return false;
            }
          }
          return true;
        }
      }
    });
  };
}