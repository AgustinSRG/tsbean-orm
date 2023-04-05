// Example for testing: Person

"use strict";

import { DataModel, GenericRow, DataSource, DataFinder, enforceType } from "../../src/index";

const SOURCE = DataSource.DEFAULT;
const TABLE = "person";
const PRIMARY_KEY = "id";

export class Person extends DataModel {

    public static finder = new DataFinder<Person>(
        SOURCE, // The data source
        TABLE, // The table or collection name
        PRIMARY_KEY, // The primary key. Leave blank if no primary key
        (data: GenericRow) => {
            return new Person(data);
        },
    );

    public id: number;
    public name: string;
    public surname: string;
    public age: number;
    public hasDriverLicense: boolean;
    public preferences: string[];
    public birthDate: Date;

    constructor(data: GenericRow) {
        // First, we call DataModel constructor 
        super(
            SOURCE, // The data source
            TABLE, // The table or collection name
            PRIMARY_KEY // The primary key. Leave blank if no primary key
        );

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "int");
        this.name = enforceType(data.name, "string");
        this.surname = enforceType(data.surname, "string");
        this.age = enforceType(data.age, "int");
        this.hasDriverLicense = enforceType(data.hasDriverLicense, "boolean");
        this.preferences = enforceType(data.preferences, "array");
        this.birthDate = enforceType(data.birthDate, "date");

        // Finally, we must call init()
        this.init();
    }
}
