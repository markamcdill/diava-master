import { FormGroup } from '@angular/forms';

// custom validator to validate location names (required, no blanks, no dupes)
export function ChkLocationName(location_id: string, location_name: string, locations: Array<any>) {
    
    return (formGroup: FormGroup) => {
        const location_name_ctnrl = formGroup.controls[location_name];
        const location_id_ctnrl = formGroup.controls[location_id]
        location_name_ctnrl.setErrors(null)


        if(location_name_ctnrl.value){//location_name not null; check it

            // check for location_name with only spaces
            if((!/\S/.test(location_name_ctnrl.value))){
                location_name_ctnrl.setErrors({name: true})//location_name is all spaces; invalid
            }

            // check for duplicate name (non-case-sensitive)
            if(locations){//make sure the locations array is defined (it's a timing thing)
                if(location_id_ctnrl.value){//EDIT MODE: the presence of a location_id == edit mode
                    locations.forEach(loc => {//check location_name provided against ALL locations other than this one (exclude record with 'this' location_id)
                        if(loc.location_name.toLowerCase() == location_name_ctnrl.value.toLowerCase() && location_id_ctnrl.value != loc.location_id){
                            location_name_ctnrl.setErrors({duplicate: true})//a location other than this one already has this name; invalid
                        }
                    })
                }
                else{//ADD MODE: no location_id
                    if(locations){//check location_name against ALL current locations
                        locations.forEach(loc => {
                            if(loc.location_name.toLowerCase() == location_name_ctnrl.value.toLowerCase()){
                                location_name_ctnrl.setErrors({duplicate: true})//a location with this name already exists; invalid
                            }
                        })
                    }
                }
            }
        }
        else{//no location_name is null; invalid
            location_name_ctnrl.setErrors({name: true})
        }
    }
}