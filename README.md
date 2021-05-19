# Typescript bean-like ORM

[![npm version](https://badge.fury.io/js/tsbean-orm.svg)](https://badge.fury.io/js/tsbean-orm)
[![Dependency Status](https://david-dm.org/AgustinSRG/tsbean-orm.svg)](https://david-dm.org/AgustinSRG/tsbean-orm)
[![devDependency Status](https://david-dm.org/AgustinSRG/tsbean-orm/dev-status.svg)](https://david-dm.org/AgustinSRG/tsbean-orm?type=dev)

This is a generic object relational mapping framework for Typescript and NodeJS.

 - Easy to use
 - No dependencies
 - Pluggable drivers
 - Promise-based

## Installation

To install into your project using npm, type:

```
npm install --save tsbean-orm
```

## Data sources and drivers

To connect with a data source, you need a driver. Here is a list of available ones:
 
  - [**MySQL**](https://www.npmjs.com/package/tsbean-driver-mysql)
  - [**PostgreSQL**](https://www.npmjs.com/package/tsbean-driver-postgres)
  - **MongoDB** (Coming soon)

If you want to write your own driver, check this template: [**Data Source Driver Template**](https://github.com/AgustinSRG/tsbean-driver-template)

With the driver you can create a data source for your application.
 - You can create one or multiple based on your needs
 - Each data source must have an unique name
 - If you are only using a single data source, you can use `DataSource.DEFAULT` as the name for it.

To set a data source use `DataSource.set`

Example:

```ts
import { DataSourceDriver, DataSource } from "tsbean-orm";
import { MyDriver } from "tsbean-orm-driver-mydriver"

const mySource = MyDriver.createDataSource({} /* Options */);

DataSource.set(DataSource.DEFAULT, mySource);
```

## Data Models

The recommended architecture when using this project is to create a `models` folder with a class file for each entity of your relational data model.

The data models must extend `DataModel`

```ts
import { DataModel } from "tsbean-orm";

export class MyModel extends DataModel {

}
```

Data models must have a constructor receiving the data from the data source. The constructor must:

 - Call DataModel class `super` construtor, wih the name of the data source, the table and the primary key.
 - Set the properties of the model from the data.
 - Call `this.init()` for the orm to start checking for changes.

Example:

```ts
import { DataModel, GenericRow, DataSource, enforceType } from "tsbean-orm";

export class Person extends DataModel {

    public name: string;
    public age: number;

    constructor(data: GenericRow) {
        // First, we call DataModel constructor 
        super(
            DataSource.DEFAULT, // The data source
            "persons", // The table or collection name
            "name" // The primary key. Leave blank if no primary key
        );

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.name = enforceType(data.name, "string");
        this.age = enforceType(data.age, "int");

        // Finally, we must call init()
        this.init();
    }
}
```

## Finders

Finders are used to execute queries over multiple documents, based on a data model.

To create one, you have to specify the  name of the data source, the table, the primary key (if any) and a callback to instanciate your custom data model.

```ts
import { DataModel, GenericRow, DataSource, DataFinder, enforceType } from "tsbean-orm";

export class Person extends DataModel {

    public static finder = new DataFinder<Person>(
            DataSource.DEFAULT, // The data source
            "persons", // The table or collection name
            "name" // The primary key. Leave blank if no primary key
            (data: GenericRow) => {
                return new Person(data);
            },
    );

    public name: string;
    public age: number;

    constructor(data: GenericRow) {
        // First, we call DataModel constructor 
        super(
            DataSource.DEFAULT, // The data source
            "persons", // The table or collection name
            "name" // The primary key. Leave blank if no primary key
        );

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.name = enforceType(data.name, "string");
        this.age = enforceType(data.age, "int");

        // Finally, we must call init()
        this.init();
    }
}
```

Main finder classes:

 - DataFinder: The finder for a data model
 - DataFilter: Allows setting filters for the data
 - OrderBy: Sets the order of the received data
 - SelectOptions: Sets options like the max number of rows or the projection.

You can use the finder to find instances of your data model, or apply updates or deletions to many of them. 

Here are some examples using the `Person` model:

```ts
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions } from "tsbean-orm";

async function main() {
    // Find person with name "person1"
    const person1 = await Person.finder.findByKey("person1");

    // Find persons with age = 20
    const personsAge20 = await Person.finder.find(DataFilter.equals("age", 20));

    // Find persons with age >= 20 && age <= 50, ordered by age, limit of 10
    const personsAge20To50 = await Person.finder.find(
        DataFilter.and(
            DataFilter.greaterOrEquals("age", 20),
            DataFilter.lessOrEquals("age", 50)
        ),
        OrderBy.asc("age"),
        SelectOptions.configure().setMaxRows(10),
    );

    // Update persons with age = 20, set age = 21
    const rowsAffected = await Person.finder.update({ age: 21 }, DataFilter.equals("age", 20));

    // Delete persons with age = 30
    const rowsAffected2 = await Person.finder.delete(DataFilter.equals("age", 30));
}
```

## Insert

In order to insert a new instance of you data model into the data source, you have to create it using the `new` keyword and then call the `insert` method:

```ts
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions } from "tsbean-orm";

async function main() {
    const person = new Person({
        name: "example",
        age: 40,
    });

    try {
        await person.insert();
    } catch (ex) {
        // The most common error may be duplicated primary key
    }
}
```

## Update

Once you find a model using a finder object, you can update its properties and then save it, to apply the changes to the data source. In order to do that, use the `save`  method.

```ts
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions } from "tsbean-orm";

async function main() {
    const person = await Person.finder.findByKey("example");

    if (person) {
        person.age = 60;
        await person.save();
    }
}
```

## Delete

Once you find a model using a finder object, you can also delete it, using the `delete` method.

```ts
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions } from "tsbean-orm";

async function main() {
    const person = await Person.finder.findByKey("example");

    if (person) {
        await person.delete();
    }
}
```

## Serialize

Since the DataModel objects are circular structures, you cannot simply serialize them with `JSON.stringify`. Instead, DataModel class offers 2 method to serialize it:

 - toObject: Turns the DataModel instance into a plain key-values object.
 - ToJSON: Turns the DataModel instance intoa JSON string

```ts
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions } from "tsbean-orm";

async function main() {
    const person = await Person.finder.findByKey("example");

    if (person) {
        console.log("Person Found: " + person.toJSON());
    }

    const people = await Person.finder.find(DataFilter.any());

    console.log("People Found: " + JSON.stringify(people.map(p => p.toObject())));
}
```
