import { FormGroup } from '@angular/forms';
import { LatLongValidator } from './lat-long.validator';

// custom validator to check valid format of latitude and longitu
export function ChkLatLong(location_lat: string, location_long: string, latLongValidator: LatLongValidator) {
    
    return (formGroup: FormGroup) => {
        const latCtrl = formGroup.controls[location_lat];
        const longCtrl = formGroup.controls[location_long];
        latCtrl.setErrors(null)
        longCtrl.setErrors(null)

        // Run validations only if control values are defined.
        if (latCtrl.value != undefined && longCtrl.value != undefined) {
            //check latitude pattern
            if(!latLongValidator.lat_regex.test(latCtrl.value)){
                latCtrl.setErrors({ pattern: true })
            }
            //check longitude pattern
            if(!latLongValidator.long_regex.test(longCtrl.value)){
                longCtrl.setErrors({ pattern: true })
            }

            //check presence of lat and long
            //if lat is present, there must be a long (and vis-a-vis)
            //absence of both lat/long is ok 
            if (!latCtrl.value && longCtrl.value) {// long but no lat: invalid
                latCtrl.setErrors({ chkLatLong: true });
            }
            else if(latCtrl.value && !longCtrl.value){// lat but not long: invalid
                longCtrl.setErrors({ chkLatLong: true });
            }
            else if(!latCtrl.value && !longCtrl.value){// neither lat or long: valid
                latCtrl.setErrors(null)
                longCtrl.setErrors(null)
            }
        }
    }
}