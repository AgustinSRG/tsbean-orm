// Data Access Object
// (Typescript Bean ORM)

"use strict";

import { DataSource, DataSourceDriver, GenericFilter, GenericKeyValue, GenericRow, SortDirection } from "./data-source";
import { DataFilter } from "./filtering";

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforzed type ("string" | "number" | "boolean" | "int" | "bigint" | "date" | "object" | "array")
 * @returns The parsed value
 */
export function enforceType(value: any, type: "string" | "number" | "boolean" | "int" | "bigint" | "date" | "object" | "array"): any {
    if (value === undefined || value === null) {
        return null;
    }
    switch (type) {
    case "string":
        return "" + value;
    case "number":
        return Number(value);
    case "boolean":
        return !!value;
    case "int":
        return parseInt(value, 10);
    case "bigint":
        return BigInt(value);
    case "date":
        return new Date(value);
    case "object":
        if (typeof value === "object") {
            return value;
        } else if (typeof value === "string" && value.length > 0) {
            try {
                if (value.charAt(0) === "~") {
                    return JSON.parse(value.substr(1));
                } else {
                    return JSON.parse(value);
                }
            } catch (ex) {
                return Object.create(null);
            }
        } else {
            return Object.create(null);
        }
    case "array":
        if (value instanceof Array) {
            return value;
        } else if (typeof value === "string" && value.length > 0) {
            try {
                let array: any[];
                if (value.charAt(0) === "~") {
                    array = JSON.parse(value.substr(1));
                } else {
                    array = JSON.parse(value);
                }

                if (array instanceof Array) {
                    return array;
                } else {
                    return [];
                }
            } catch (ex) {
                return [];
            }
        } else {
            return [];
        }
    default:
        return null;
    }
}

/**
 * Makes a copy of a bean object
 * @param original Original bean
 * @returns Copy of the bean
 */
export function makeCopyOfObject(original: any): any {
    if (original === null || typeof original !== "object") {
        return original;
    }
    if (original instanceof Array) {
        const copyArr = [];
        for (const r of original) {
            copyArr.push(makeCopyOfObject(r));
        }
        return copyArr;
    }
    if (original instanceof Date) {
        return new Date(original.getTime());
    }
    const attrs = Object.keys(original);
    const copy: any = Object.create(null);
    for (const attr of attrs) {
        const val = original[attr];
        if (typeof val === "function" || (typeof val === "object" && (val instanceof DataAccessObject))) {
            continue; // Skip functions and DAOs
        } else if (typeof val === "object") {
            copy[attr] = makeCopyOfObject(val);
        } else {
            copy[attr] = val;
        }
    }
    return copy;
}

function getRealkeys(o) {
    const keys = Object.keys(o);
    const result = [];
    for (const key of keys) {
        const val = o[key];
        if (typeof val === "function" || (typeof val === "object" && (val instanceof DataAccessObject))) {
            continue; // Skip functions and DAOs
        } else {
            result.push(key);
        }
    }
    return result.sort();
}

function compareArrays(a1, a2): boolean {
    if (a1.length !== a2.length) {
        return false;
    }
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}

function isEqualsRecursive(o1: any, o2: any): boolean {
    const t1 = typeof o1;
    const t2 = typeof o2;
    if (t1 === t2) {
        if (typeof t1 === "object" && o1 !== null && o2 !== null) {
            const keys1 = getRealkeys(o1);
            const keys2 = getRealkeys(o2);
            if (compareArrays(keys1, keys2)) {
                for (const key of keys1) {
                    if (!isEqualsRecursive(o1[key], o2[key])) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return (o1 === o2);
        }
    } else {
        return false;
    }
}

function firstLevelObjectDifference(original: any, changed: any): any {
    const keys = Object.keys(changed);
    const changes: any = Object.create(null);
    for (const key of keys) {
        const val = changed[key];
        if (typeof val === "function" || (typeof val === "object" && (val instanceof DataAccessObject))) {
            continue; // Skip functions and DAOs
        } else if (!isEqualsRecursive(original[key], val)) {
            changes[key] = val;
        }
    }
    return changes;
}

/**
 * Data Acess object.
 */
export class DataAccessObject {

    /**
     * Resolves and returns the current database driver.
     * @param s The name of the data source
     * @returns The driver
     */
    public static getDriver(s: string): DataSourceDriver {
        const ds = DataSource.get(s);
        if (ds) {
            return ds.driver;
        } else {
            throw new Error("Could not find data source: " + s);
        }
    }

    /**
     * Finds by primary key
     * @param source Data source name
     * @param table Table name
     * @param keyName Key name
     * @param keyValue Key value
     */
    public static async findByKey(source: string, table: string, keyName: string, keyValue: GenericKeyValue): Promise<GenericRow> {
        if (keyValue === null || keyValue === undefined) {
            return null;
        }
        return DataAccessObject.getDriver(source).findByKey(table, keyName, keyValue);
    }

    /**
     * Finds rows
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all. 
     */
    public static async find(source: string, table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>): Promise<GenericRow[]> {
        return DataAccessObject.getDriver(source).find(table, filter, sortBy, sortDir, skip, limit, projection);
    }

    /**
     * Finds rows (stream) / Async
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all. 
     * @param each Function to parse each row
     */
    public static async findStream(source: string, table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: GenericRow) => Promise<void>): Promise<void> {
        return DataAccessObject.getDriver(source).findStream(table, filter, sortBy, sortDir, skip, limit, projection, each);
    }

    /**
     * Finds rows (stream) / Sync
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all. 
     * @param each Function to parse each row
     */
    public static async findStreamSync(source: string, table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: GenericRow) => void): Promise<void> {
        return DataAccessObject.getDriver(source).findStreamSync(table, filter, sortBy, sortDir, skip, limit, projection, each);
    }

    /**
     * Counts instances
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     */
    public static async count(source: string, table: string, filter: GenericFilter): Promise<number> {
        return DataAccessObject.getDriver(source).count(table, filter);
    }

    /**
     * Aggregation
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     * @param id Primary Key name
     * @param field Field to aggregate
     */
    public static async sum(source: string, table: string, filter: GenericFilter, id: string, field: string): Promise<number> {
        return DataAccessObject.getDriver(source).sum(table, filter, id, field);
    }

    /**
     * Insert instance
     * @param source Data source name
     * @param table Table name
     * @param row Row to insert
     */
    public static async insertInstance(source: string, table: string, row: GenericRow) {
        return DataAccessObject.getDriver(source).insert(table, makeCopyOfObject(row), null);
    }

    /**
     * Insert instances
     * @param source Data source name
     * @param table Table name
     * @param rows Rows to insert
     */
    public static async insertInstances(source: string, table: string, rows: GenericRow[]) {
        return DataAccessObject.getDriver(source).batchInsert(table, makeCopyOfObject(rows));
    }

    /**
     * Deletes rows
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     */
    public static async deleteMany(source: string, table: string, filter: GenericFilter): Promise<number> {
        return DataAccessObject.getDriver(source).deleteMany(table, filter);
    }

    /**
     * Updates rows
     * @param source Data source name
     * @param table Table name
     * @param filter Filter to apply
     * @param updated Updated row
     */
    public static async updateMany(source: string, table: string, filter: GenericFilter, updated: GenericRow): Promise<number> {
        return DataAccessObject.getDriver(source).updateMany(table, filter, updated);
    }

    /**
     * Atomic increment
     * @param source Data source name
     * @param table Table name
     * @param keyName Key name
     * @param keyValue Key value
     * @param prop Field to increment
     * @param inc Amount to increment
     */
    public static async increment(source: string, table: string, keyName: string, keyValue: GenericKeyValue, prop: string, inc: number): Promise<void> {
        return DataAccessObject.getDriver(source).increment(table, keyName, keyValue, prop, inc);
    }

    public source: string;
    public table: string;
    public pk: string;

    public original: any;
    public ref: any;

    /**
     * DAO constructor.
     * @param source Data source
     * @param table Table name
     * @param pk Private key name
     * @param document Document
     */
    constructor(source: string, table: string, pk: string, row: GenericRow) {
        this.source = source;
        this.table = table;
        this.pk = pk;
        this.original = makeCopyOfObject(row);
        this.ref = row;
    }

    public changeRef(row: any) {
        this.original = makeCopyOfObject(row);
        this.ref = row;
    }

    /**
     * Inserts the document.
     */
    public async insert(): Promise<void> {
        try {
            await DataAccessObject.getDriver(this.source).insert(this.table, makeCopyOfObject(this.ref), this.pk, function (keyVal) {
                this.ref[this.pk] = keyVal;
            }.bind(this));
        } catch (ex) {
            return Promise.reject(ex);
        }
        this.original = makeCopyOfObject(this.ref); // Reset original
        return Promise.resolve();
    }

    /**
     * Saves the document changes.
     * @param condition Optional. Condition to check before updating.
     * @returns True if saved, false if not saved
     */
    public async save(condition?: DataFilter): Promise<boolean> {
        if (!this.pk) {
            throw new Error("Cannot update: A primary key is not set for this data model. Use a Finder instead.");
        }
        let res = true;
        try {
            const diff = firstLevelObjectDifference(this.original, this.ref);
            if (Object.keys(diff).length === 0) {
                return Promise.resolve(false); // Nothing to update
            }
            if (condition) {
                const affected = await DataAccessObject.getDriver(this.source).updateMany(this.table, DataFilter.and(DataFilter.equals(this.pk, this.ref[this.pk]), condition).query, diff);
                res = affected > 0;
            } else {
                await DataAccessObject.getDriver(this.source).update(this.table, this.pk, this.ref[this.pk], diff);
            }
        } catch (ex) {
            return Promise.reject(ex);
        }
        this.original = makeCopyOfObject(this.ref); // Reset original
        return Promise.resolve(res);
    }

    /**
     * Deletes the document.
     * @returns True if deleted, false if not deleted
     */
    public async delete(): Promise<boolean> {
        if (!this.pk) {
            throw new Error("Cannot delete: A primary key is not set for this data model. Use a finder instead.");
        }
        return DataAccessObject.getDriver(this.source).delete(this.table, this.pk, this.ref[this.pk]);
    }

    /**
     * Atomic increment
     * @param field Name of the field
     * @param inc Amount to increment
     */
    public async increment(field: string, inc: number): Promise<void> {
        if (!this.pk) {
            throw new Error("Cannot update: A primary key is not set for this data model. Use a finder instead.");
        }
        return DataAccessObject.getDriver(this.source).increment(this.table, this.pk, this.ref[this.pk], field, inc);
    }
}
