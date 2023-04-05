// Data source manager
// (Typescript Bean ORM)

"use strict";

import { DataSourceDriver } from "./data-source-driver";

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

