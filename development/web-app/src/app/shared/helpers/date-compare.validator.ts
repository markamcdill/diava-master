import { FormGroup } from '@angular/forms';

// custom validator to check that two date fields match and the the start date is before the end date
export function DateCompare(firstDate: string, secondDate: string) {
    return (formGroup: FormGroup) => {
        const dateNow = new Date()
        const control = formGroup.controls[firstDate];
        const secondControl = formGroup.controls[secondDate];

        if (secondControl.errors && !secondControl.errors.dateCompare) {
            // return if another validator has already found an error on the matchingControl
            return;
        }
        
        var date1 = Number(new Date(control.value).getTime());
        var date2 = Number(new Date(secondControl.value).getTime());
        // set error on matchingControl if validation fails
        

        // if((date1 < dateNow.getTime()) || (date2 < dateNow.getTime())){//catch dates previous to 'now'
        //     control.setErrors({datePrevious: true})
        // }

        if (date2 < date1) {
            secondControl.setErrors({ dateCompare: true });
        }
         else {
            secondControl.setErrors(null);
        }
    }
}