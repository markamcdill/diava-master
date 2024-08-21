import { FormGroup } from '@angular/forms';

export function AlertDateValidator(alertMsg: string, startDate: string) {
    return (formGroup: FormGroup) => {
        // valid: 
        //  alert message (without special characters) and a date range
        //  no alert message, no date range

        // invalid:
            // alert message has special characters
            // alert message no date-range
            // date-range no alert message

        // NOTE: only start date used as a parameter since the interface sets both start/end dates on selection


        const alertMsgControl = formGroup.controls[alertMsg];
        const startDateControl = formGroup.controls[startDate];

        if(alertMsgControl.value == '' && !startDateControl.value){// no alert, no date (valid)
            alertMsgControl.setErrors(null) // clear errors
            startDateControl.setErrors(null) // clear errors
            return
        }


        if(alertMsgControl.errors){//alert message has special characters (invalid)
            return
        }

        if(alertMsgControl.value == '' && startDateControl.value != ''){// no alert message with a date (invalid)
            alertMsgControl.setErrors({noMsg: true})// set no alert message error
        }
        else if(alertMsgControl.value != '' && !startDateControl.value){ // alert message with no date (invalid)
            startDateControl.setErrors({noDate: true})// set no date error
        }
    }
}