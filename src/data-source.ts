// Data source manager
// (Typescript Bean ORM)

"use strict";

export type ModelKeyName<T> = keyof T & string;
export type GenericKeyValue = any;
export type GenericValue = any;
export type GenericRow = any;
export type TypedRow<T> = { [key in keyof T]?: T[key] };
export type SortDirection = "asc" | "desc" | null;

interface FilterCompareOperation<T = string> {
    operation: "eq" | "ne" | "gt" | "gte" | "lt" | "lte",
    key: T,
    value: GenericKeyValue,
}

interface FilterExistsOperation<T = string> {
    operation: "exists",
    key: T,
    exists: boolean,
}

interface FilterIntoOperation<T = string> {
    operation: "in",
    key: T,
    values: GenericKeyValue[],
}

interface FilterRegexOperation<T = string> {
    operation: "regex",
    key: T,
    regexp: RegExp,
}

interface FilterAndOperation {
    operation: "and",
    children: FilterOperation[],
}

interface FilterOrOperation {
    operation: "or",
    children: FilterOperation[],
}

interface FilterNotOperation {
    operation: "not",
    child: FilterOperation,
}

type FilterOperation<T = string> = FilterAndOperation | FilterOrOperation | FilterNotOperation | FilterCompareOperation<T> | FilterRegexOperation<T> | FilterExistsOperation<T> | FilterIntoOperation<T>;

export type GenericFilter<KeySpace = string> = FilterOperation<KeySpace>;

interface RowUpdateSet {
    update: "set",
    value: GenericValue,
}

interface RowUpdateIncrement {
    update: "inc",
    value: number,
}

export type GenericRowUpdate = { [key: string]: RowUpdateSet | RowUpdateIncrement | any };
export type StrictRowUpdate<T> = { [key in keyof T]?: RowUpdateSet | RowUpdateIncrement | any };

/**
 * Represents a driver to connect to a data source,
 * for example a database (MYSQL, Mongo, etc)
 */
export interface DataSourceDriver {
    /* Find */

    /**
     * Finds a row by primary key
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     */
    findByKey(table: string, keyName: string, keyValue: GenericValue): Promise<GenericRow>;

    /**
     * Finds rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all.
     */
    find(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>): Promise<GenericRow[]>;

    /**
     * Counts the number of rows matching a condition
     * @param table Table or collection name
     * @param filter Filter to apply
     */
    count(table: string, filter: GenericFilter): Promise<number>;

    /**
     * Finds rows (stream mode). You can parse each row with an ASYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all. 
     * @param each Function to parse each row
     */
    findStream(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: GenericRow) => Promise<void>): Promise<void>;

    /**
     * Finds rows (stream mode). You can parse each row with a SYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all. 
     * @param each Function to parse each row
     */
    findStreamSync(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: any) => void): Promise<void>;

    /* Insert */

    /**
     * Inserts a row
     * @param table Table or collection name
     * @param row Row to insert
     * @param key The name of the primary key (if any)
     * @param callback Callback to set the value of the primary key after inserting (Optional, only if auto-generated key)
     */
    insert(table: string, row: GenericRow, key: string, callback?: (value: GenericKeyValue) => void): Promise<void>;

    /**
     * Inserts many rows
     * @param table Table or collection name
     * @param rows List of rows to insert
     */
    batchInsert(table: string, rows: GenericRow[]): Promise<void>;

    /* Update */

    /**
     * Updates a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @param updated Updated row
     */
    update(table: string, keyName: string, keyValue: GenericKeyValue, updated: GenericRow): Promise<void>;

    /**
     * Updates many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param updated Updates to apply to each row
     * @returns The number of affected rows
     */
    updateMany(table: string, filter: GenericFilter, updated: GenericRowUpdate): Promise<number>;

    /* Delete */

    /**
     * Deletes a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @returns true if the row was deleted, false if the row didn't exists
     */
    delete(table: string, keyName: string, keyValue: GenericKeyValue): Promise<boolean>;

    /**
     * Deletes many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @returns The number of affected rows
     */
    deleteMany(table: string, filter: GenericFilter): Promise<number>;

    /* Aggregations */

    /**
     * Summatory of many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param id Name of the primary key
     * @param field Name of the field to aggregate
     */
    sum(table: string, filter: GenericFilter, id: string, field: string): Promise<number>;

    /**
     * Atomic increment
     * @param table Table or collection name
     * @param keyName The name of the key
     * @param keyValue The value ofthe key
     * @param prop The field to increment
     * @param inc The amount to increment
     */
    increment(table: string, keyName: string, keyValue: GenericKeyValue, prop: string, inc: number): Promise<void>;
}

/**
 * Represents a generic data source for the ORM to use
 */
export class DataSource {

    /**
     * Default data source name
     */
    public static DEFAULT = "default";

    /**
     * Global data sources
     */
    private static dataSources: Map<string, DataSource> = new Map();

    /**
     * Sets a data source
     * @param name Name of the data source. Use "default" for default data source
     * @param datSource Data source
     */
    public static set(name: string, datSource: DataSource) {
        DataSource.dataSources.set(name, datSource);
    }

    /**
     * @param name Name of the data source
     * @returns The data source
     */
    public static get(name: string): DataSource {
        return DataSource.dataSources.get(name);
    }

    public name: string;
    public driver: DataSourceDriver;

    constructor(name: string, driver: DataSourceDriver) {
        this.name = name;
        this.driver = driver;
    }
}

