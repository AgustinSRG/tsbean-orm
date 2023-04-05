// Common types and functions
// (Typescript Bean ORM)

"use strict";

/**
 * String that must be the name of a property of the Model
 */
export type ModelKeyName<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T & string];

/**
 * A generic value for a primary key
 */
export type GenericKeyValue = any;

/**
 * A generic value
 */
export type GenericValue = any;

/**
 * A row before being parsed
 */
export type GenericRow = any;

/**
 * A row constrained within a data model
 */
export type TypedRow<T> = { [K in keyof T]?: T[K] extends Function ? never : T[K] };

/**
 * Sort direction enumeration
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * Comparing filtering operation
 * - eq = Equals
 * - ne = Not Equals
 * - gt = Greater than
 * - gte = Greater than or equals
 * - lt = Lower than
 * - lte = Lower than or equals
 */
export interface FilterCompareOperation<T = string> {
    operation: "eq" | "ne" | "gt" | "gte" | "lt" | "lte",
    key: T,
    value: GenericKeyValue,
}

/**
 * Exists (NOT NULL) filtering operation
 * Checks if the value is not null
 */
export interface FilterExistsOperation<T = string> {
    operation: "exists",
    key: T,
    exists: boolean,
}

/**
 * Into filtering operation
 * Checks if the value it is inside a list
 */
export interface FilterIntoOperation<T = string> {
    operation: "in",
    key: T,
    values: GenericKeyValue[],
}

/**
 * Regex filtering operation
 * Checks if the value matches a regular expression
 */
export interface FilterRegexOperation<T = string> {
    operation: "regex",
    key: T,
    regexp: RegExp,
}

/**
 * Groups multiple filters with the AND operator
 * All conditions must be satisfied
 */
export interface FilterAndOperation {
    operation: "and",
    children: FilterOperation[],
}

/**
 * Groups multiple filters with the OR operator
 * At least one condition must be satisfied
 */
export interface FilterOrOperation {
    operation: "or",
    children: FilterOperation[],
}

/**
 * Negates a condition (NOT)
 */
export interface FilterNotOperation {
    operation: "not",
    child: FilterOperation,
}

/**
 * Generic filtering operation (groups all filtering operations)
 */
export type FilterOperation<T = string> = FilterAndOperation | FilterOrOperation | FilterNotOperation | FilterCompareOperation<T> | FilterRegexOperation<T> | FilterExistsOperation<T> | FilterIntoOperation<T>;

/**
 * Represents a generic filter, given a key space
 */
export type GenericFilter<KeySpace = string> = FilterOperation<KeySpace>;

/**
 * Indicates the value must be changed
 */
export interface RowUpdateSet {
    update: "set",

    /**
     * Value to store
     */
    value: GenericValue,
}
/**
 * Indicates the value must be incremented.
 */
export interface RowUpdateIncrement {
    update: "inc",

    /**
     * Amount to increment (negative for decrements)
     */
    value: number,
}

/**
 * Generic row update (column keys as string, values can be primitives, RowUpdateSet or RowUpdateIncrement).
 */
export type GenericRowUpdate = { [key: string]: RowUpdateSet | RowUpdateIncrement | any };

/**
 * Strict row update. Given a data model, specify the new values for each one of the fields that must be updated.
 */
export type StrictRowUpdate<T> = { [key in keyof T]?: RowUpdateSet | RowUpdateIncrement | any };


/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "string"): string;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "number" | "int"): number;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "boolean"): boolean;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "bigint"): bigint;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "date"): Date;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "object"): any;

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "array"): any[];

/**
 * Enforces a type when receiving data from data source
 * @param value The value received from the data source
 * @param type The enforced type
 * @returns The parsed value
 */
export function enforceType(value: unknown, type: "string" | "number" | "boolean" | "int" | "bigint" | "date" | "object" | "array"): any {
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
        return Math.floor(Number(value));
    case "bigint":
        return BigInt(value + "");
    case "date":
        if (value instanceof Date) {
            return value;
        } else if (typeof value === "string" || typeof value === "number") {
            return new Date(value);
        } else {
            return null;
        }
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
