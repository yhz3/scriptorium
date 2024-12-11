/**
 * Handle the error when updating relations.
 * Returns an object, {code, error}
 * @param {*} error 
 * @returns {object}
 */
export default function updateErrorExamine(error) {
    switch (error.code) {
        case 'P2002':
            console.error("Unique constraint failed on the fields: ", error.meta.target);
            return { code: 409, error: "A duplicate value already exists." };
        case 'P2003':
            console.error("Foreign key constraint failed on the field: ", error.meta.field_name);
            return { code: 400, error: "Invalid foreign key value." };
        case 'P2025':
            console.error("Record to update not found: ", error.meta.cause);
            return { code: 404, error: "Record not found." };
        case 'P2011':
            console.error("Null constraint violation on the field: ", error.meta.field_name);
            return { code: 400, error: "Null constraint violation." };
        case 'P2012':
            console.error("Missing a required value at: ", error.meta.field_name);
            return { code: 400, error: "Missing required value." };
        case 'P2013':
            console.error("Missing the required argument: ", error.meta.argument_name);
            return { code: 400, error: "Missing required argument." };
        case 'P2014':
            console.error("The change you are trying to make would violate the required relation: ", error.meta.relation_name);
            return { code: 400, error: "Relation violation." };
        case 'P2015':
            console.error("A related record could not be found: ", error.meta.details);
            return { code: 404, error: "Related record not found." };
        default:
            return { code: 500, error: "Internal server error." };
    }
}
