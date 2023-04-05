// Example for testing: Dummy

"use strict";

import { DataModel, GenericRow, DataSource, DataFinder, enforceType } from "../../src/index";

const SOURCE = DataSource.DEFAULT;
const TABLE = "dummy";
const PRIMARY_KEY = "id";

export class Dummy extends DataModel {

    public static finder = new DataFinder<Dummy>(
        SOURCE, // The data source
        TABLE, // The table or collection name
        PRIMARY_KEY, // The primary key. Leave blank if no primary key
        (data: GenericRow) => {
            return new Dummy(data);
        },
    );

    public id: string;
    public value1: number;
    public value2: number;
    public value3: string;
    public data: { [key: string]: any };

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

        this.id = enforceType(data.id, "string");

        this.value1 = enforceType(data.value1, "int");
        this.value2 = enforceType(data.value2, "number");
        this.value3 = enforceType(data.value3, "string");

        this.data = enforceType(data.data, "object");

        // Finally, we must call init()
        this.init();
    }
}
