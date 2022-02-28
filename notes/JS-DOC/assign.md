# Object.assign()

The `Object.assign()` method copies all [enumerable](propertyisenumerable) [own properties](hasownproperty) from one or more _source objects_ to a _target object_. It returns the target object.

## Syntax

    Object.assign(target, ...sources)

### Parameters

`target`  
The target object — what to apply the sources' properties to, which is returned after it is modified.

`sources`  
The source object(s) — objects containing the properties you want to apply.

### Return value

The target object.

## Description

Properties in the target object are overwritten by properties in the sources if they have the same [key](keys). Later sources' properties overwrite earlier ones.

The `Object.assign()` method only copies _enumerable_ and _own_ properties from a source object to a target object. It uses `[[Get]]` on the source and `[[Set]]` on the target, so it will invoke [getters](../../functions/get) and [setters](../../functions/set). Therefore it _assigns_ properties, versus copying or defining new properties. This may make it unsuitable for merging new properties into a prototype if the merge sources contain getters.

For copying property definitions (including their enumerability) into prototypes, use [`Object.getOwnPropertyDescriptor()`](getownpropertydescriptor) and [`Object.defineProperty()`](defineproperty) instead.

Both [`String`](../string) and [`Symbol`](../symbol) properties are copied.

In case of an error, for example if a property is non-writable, a [`TypeError`](../typeerror) is raised, and the `target` object is changed if any properties are added before the error is raised.

**Note:** `Object.assign()` does not throw on [`null`](../null) or [`undefined`](../undefined) sources.

## Polyfill

This [polyfill](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill) doesn't support symbol properties, since ES5 doesn't have symbols anyway:

    if (typeof Object.assign !== 'function') {
      // Must be writable: true, enumerable: false, configurable: true
      Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
          'use strict';
          if (target === null || target === undefined) {
            throw new TypeError('Cannot convert undefined or null to object');
          }

          var to = Object(target);

          for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource !== null && nextSource !== undefined) {
              for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
          return to;
        },
        writable: true,
        configurable: true
      });
    }

## Examples

### Cloning an object

    const obj = { a: 1 };
    const copy = Object.assign({}, obj);
    console.log(copy); // { a: 1 }

### Warning for Deep Clone

For deep cloning, we need to use alternatives, because `Object.assign()` copies property values.

If the source value is a reference to an object, it only copies the reference value.

    function test() {
      'use strict';

      let obj1 = { a: 0 , b: { c: 0}};
      let obj2 = Object.assign({}, obj1);
      console.log(JSON.stringify(obj2)); // { "a": 0, "b": { "c": 0}}

      obj1.a = 1;
      console.log(JSON.stringify(obj1)); // { "a": 1, "b": { "c": 0}}
      console.log(JSON.stringify(obj2)); // { "a": 0, "b": { "c": 0}}

      obj2.a = 2;
      console.log(JSON.stringify(obj1)); // { "a": 1, "b": { "c": 0}}
      console.log(JSON.stringify(obj2)); // { "a": 2, "b": { "c": 0}}

      obj2.b.c = 3;
      console.log(JSON.stringify(obj1)); // { "a": 1, "b": { "c": 3}}
      console.log(JSON.stringify(obj2)); // { "a": 2, "b": { "c": 3}}

      // Deep Clone
      obj1 = { a: 0 , b: { c: 0}};
      let obj3 = JSON.parse(JSON.stringify(obj1));
      obj1.a = 4;
      obj1.b.c = 4;
      console.log(JSON.stringify(obj3)); // { "a": 0, "b": { "c": 0}}
    }

    test();

### Merging objects

    const o1 = { a: 1 };
    const o2 = { b: 2 };
    const o3 = { c: 3 };

    const obj = Object.assign(o1, o2, o3);
    console.log(obj); // { a: 1, b: 2, c: 3 }
    console.log(o1);  // { a: 1, b: 2, c: 3 }, target object itself is changed.

### Merging objects with same properties

    const o1 = { a: 1, b: 1, c: 1 };
    const o2 = { b: 2, c: 2 };
    const o3 = { c: 3 };

    const obj = Object.assign({}, o1, o2, o3);
    console.log(obj); // { a: 1, b: 2, c: 3 }

The properties are overwritten by other objects that have the same properties later in the parameters order.

### Copying symbol-typed properties

    const o1 = { a: 1 };
    const o2 = { [Symbol('foo')]: 2 };

    const obj = Object.assign({}, o1, o2);
    console.log(obj); // { a : 1, [Symbol("foo")]: 2 } (cf. bug 1207182 on Firefox)
    Object.getOwnPropertySymbols(obj); // [Symbol(foo)]

### Properties on the prototype chain and non-enumerable properties cannot be copied

    const obj = Object.create({ foo: 1 }, { // foo is on obj's prototype chain.
      bar: {
        value: 2  // bar is a non-enumerable property.
      },
      baz: {
        value: 3,
        enumerable: true  // baz is an own enumerable property.
      }
    });

    const copy = Object.assign({}, obj);
    console.log(copy); // { baz: 3 }

### Primitives will be wrapped to objects

    const v1 = 'abc';
    const v2 = true;
    const v3 = 10;
    const v4 = Symbol('foo');

    const obj = Object.assign({}, v1, null, v2, undefined, v3, v4);
    // Primitives will be wrapped, null and undefined will be ignored.
    // Note, only string wrappers can have own enumerable properties.
    console.log(obj); // { "0": "a", "1": "b", "2": "c" }

### Exceptions will interrupt the ongoing copying task

    const target = Object.defineProperty({}, 'foo', {
      value: 1,
      writable: false
    }); // target.foo is a read-only property

    Object.assign(target, { bar: 2 }, { foo2: 3, foo: 3, foo3: 3 }, { baz: 4 });
    // TypeError: "foo" is read-only
    // The Exception is thrown when assigning target.foo

    console.log(target.bar);  // 2, the first source was copied successfully.
    console.log(target.foo2); // 3, the first property of the second source was copied successfully.
    console.log(target.foo);  // 1, exception is thrown here.
    console.log(target.foo3); // undefined, assign method has finished, foo3 will not be copied.
    console.log(target.baz);  // undefined, the third source will not be copied either.

### Copying accessors

    const obj = {
      foo: 1,
      get bar() {
        return 2;
      }
    };

    let copy = Object.assign({}, obj);
    console.log(copy);
    // { foo: 1, bar: 2 }
    // The value of copy.bar is obj.bar's getter's return value.

    // This is an assign function that copies full descriptors
    function completeAssign(target, ...sources) {
      sources.forEach(source => {
        let descriptors = Object.keys(source).reduce((descriptors, key) => {
          descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
          return descriptors;
        }, {});

        // By default, Object.assign copies enumerable Symbols, too
        Object.getOwnPropertySymbols(source).forEach(sym => {
          let descriptor = Object.getOwnPropertyDescriptor(source, sym);
          if (descriptor.enumerable) {
            descriptors[sym] = descriptor;
          }
        });
        Object.defineProperties(target, descriptors);
      });
      return target;
    }

    copy = completeAssign({}, obj);
    console.log(copy);
    // { foo:1, get bar() { return 2 } }

## Specifications

<table><thead><tr class="header"><th>Specification</th></tr></thead><tbody><tr class="odd"><td><a href="https://tc39.es/ecma262/#sec-object.assign">ECMAScript Language Specification (ECMAScript) 
<br/>

<span class="small">#sec-object.assign</span></a></td></tr></tbody></table>

`assign`

45

12

34

No

32

9

45

45

34

32

9

5.0

## See also

-   [`Object.defineProperties()`](defineproperties)
-   [Enumerability and ownership of properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)
-   [Spread in object literals](../../operators/spread_syntax#spread_in_object_literals)

© 2005–2021 MDN contributors.  
Licensed under the Creative Commons Attribution-ShareAlike License v2.5 or later.  
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign" class="_attribution-link">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign</a>