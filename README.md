# Messagr
**Messagr** is a MOD (*message oriented design*) library for improved code organization and scalability. The name comes from a play with the words *messenger* and *message manager*.

Instalation: 
`npm i @victormga/messagr`

## MOD
In *Message Oriented Design*, all the communication between the software components occurs using the concept of *messages*, which is similar to an *event*, but not exactly. Think of it more like an conversation, happening on a meting room or office, where the actors (*your services/modules/pieces of code*) talk to others actors in an asynchronous and agnostic way.
This architecture is strongly inspired by [Event-Driven Architeture](https://en.wikipedia.org/wiki/Event-driven_architecture) and [Observer-Pattern Design](https://en.wikipedia.org/wiki/Observer_pattern).

## Why MOD?
When a software is becoming complex, organization and extensibility starts to become top priority. Using this architecture allows the developer to create atomic pieces of functionality that can talk with others, without the fear of breaking stuff that's already working, since the only thing trafficking between them are *Messages*.
*Actors* can communicate with others at any time, without even knowing who, or the internal logic inside other actors, all they have to agree upon are the *Messages*.
On top of that, working with *events* is a more natural way to model things that happens in real life, making it easier to abstract complex concepts and turn it into code.
Got a new web request? What about dispatch a message instead of instantiating a `new IFactoryModelerHttpWebRequestHandlerCreator`?

## Wait, isn't that EventEmitter with extra-steps?
Event-Emitters works really well in node.js, but it becomes short when you need more complex things like two-way communication, ordering or validations. That's where this library enters the game. It's not meant to replace Events, but to improve upon them.

## Is this a poor-man's version of RxJS?
[RxJS](https://rxjs.dev/) library has it's focus on data-streams and transformations, with a lot of roots in functional programming. **Messagr** is a more simplified, generic and straightforward way to deal with events and communication between modules in a ~~maybe~~ large codebase. 
That being said, if you think you can leverage the extra functionality RxJS offers, i say go for it. RxJS is a **great** library. 
If your objective is to go for something more [KISS](https://en.wikipedia.org/wiki/KISS_principle), **Messagr** is a good alternative that will meet your needs.

## Entities and terms
- An **Actor** is any piece of code belonging to your application, which is responsible for a certain set of of functionality, may it be *services*, *classes*, *modules*, etc. This library does not enforce any specific type of organization.

- A **Topic**, like the name suggests, is like a channel on which Actors can speak/listen-to. Just like a topic in a conversation, a specific actor can be interested or not in participating. If no topic is selected, then the default/main topic will be used.

- A **Message**  is a event occuring at any point in time, that can be *listened to* or *sent*. It may or may not contain extra information, and may or may not contain a *reply*.

- A **Dispatcher** is an *Actor* who dispatches a message to a *topic*. This actor may or may not wait for a *reply*.

- A **Listener** is a *callback* which will be triggered when a specific message is sent. This *callback* can be synchronous or asynchronous. A message can have an unlimited number of listeners. 
There are four types of Listeners, described bellow:

	-  **Listen**: A default listener is a function who will be called when a message is dispatched. No return value is expected from this function, and thrown errors will be ignored so as not to disrupt the flow of the program.  This works similar to a default *javascript event-listener*.
*Listeners* will be executed in the order they are registered. 

	- **Reply**: A *reply* or *replier* is a type of *Listener* who will reply the message back to the original *Dispatcher*. This kind of listener is expected to always return a `Generic Object`, which will be merged with other replies to form the final data returned to the dispatcher *Actor*.
*Replies* will be executed in the order they are registered. 

	-	**Intercept**: *Intercept* listeners are similar to a *Reply* listener, except when a *Intercept* returns anything other than `undefined`, others *Intercept*/*Reply* listeners will be ignored and the return value will be returned to the *Dispatcher*. Default listeners will still be able to listen to the message.
After registering the *Intercept*, you can choose to not intercept the message in the internal logic by returning nothing or `undefined`. Unlike *Replies*, any type of data can be returned in an *Intercept*. 
*Intercepts* will be executed in the order they are registered. 
	
	- **Interrupt**: The *Interrupt* listeners will be handled before any other kind of *Listener*, having the ability to stop the propagation of the message. To interrupt a message, all the listener have to do is **thrown an error**. *Interrupts* are expected to have no return.
*Interrupts* will be executed in the order they are registered. 
	

## Examples

--
### Sending messages
```typescript
import Messagr from "@victormga/messagr";

Messagr.send("hello world");
Messagr.send("message with data", "hello world");
Messagr.send("message with data", { name: "jhon doe" });
```

--
### Listening to messages
```typescript
import Messagr from "@victormga/messagr";

Messagr.listen("hello world", () => {
    console.log("hello world was dispatched!");
});

Messagr.listen("message with data", (data) => {
    console.log(`data was received: ${data.name}`);
});

[...]

Messagr.send("hello world");
Messagr.send("message with data", { name: "jhon" });
```
Use cases: anything that doesn't require returning a value to the dispatcher. Ex: creating logs, updating caches, sending external requests, etc.

--
### Using RegExp
```typescript
import Messagr from "@victormga/messagr";

Messagr.listen(/^hello/, () => {
    console.log("a message starting with hello was dispatched!");
});

[...]

Messagr.send("hello world");
Messagr.send("hello with data", { name: "jhon" });
// OBS: sending event does not accept RegExp, only string.
```

--
### Subscribing to a specific Topic
```typescript
import Messagr from "@victormga/messagr";

Messagr.listen("hello world", () => {
    console.log("hello world was dispatched!");
});

Messagr.topic("mytopic").listen("hello world", () => {
    console.log("hello world on mytopic was dispatched!");
});

[...]

Messagr.send("hello world");
// Sends to default topic

Messagr.topic("mytopic").send("hello world");
// sends to "mytopic"
```

--
### Replying to messages
```typescript
import Messagr from "@victormga/messagr";

Messagr.reply("get user", (data) => {
    const info = getSession(data.uid);
    return { name: info.name };
});

[...]

// the same message can have multiple replies.
Messagr.reply("get user", async (data) => {
    const phone = await getUserPhone(data.uid);
    return { phone_number: phone };
});

[...]

// send always returns a Promise
const user = await Messagr.send("get user", { uid: 1 });
console.log(user);
```
Use cases: anything that requires to return a value to the dispacther. Ex: processing requests, aggregating data, retrieving information, etc.

--
### Intercepting messages
```typescript
import Messagr from "@victormga/messagr";

Messagr.reply("get user", (data) => {
    const info = getSession(data.uid);
    return { name: info.name };
});

[...]

Messagr.intercept("get user", (data) => {
    if (data.uid !== 1) return; 
    // returning void/undefined will not intercept the message.

    return {
        name: "el número uno!",
        phone: "123456789"
    }
});

// this will be intercepted
const user = await Messagr.send("get user", { uid: 1 });
console.log(user);

// this will NOT be intercepted and will get the default reply.
const user = await Messagr.send("get user", { uid: 42 });
console.log(user);
```
Use cases: anything that want to intercept the message before it reaches the repliers, Ex: getting information from cache instead of database, handling special cases, etc.

--
### Interrupting messages
```typescript
import Messagr from "@victormga/messagr";

Messagr.reply("get user", (data) => {
    const info = getSession(data.uid);
    return { name: info.name };
});

[...]

Messagr.interrupt("get user", async (data) => {
    if (typeof data.uid !== "number") throw new Error("Invalid UserID");
});

[...]

// this message will be interrupted, and an exception will be thrown.
try {
    const user = await Messagr.send("get user", { uid: "" });
    console.log(user);
} catch(e) {
    console.error(e);
}

// this message will be replied.
try {
    const user = await Messagr.send("get user", { uid: 42 });
    console.log(user);
} catch(e) {
    console.error(e);
}
```
Use cases: anything that may want to forbid the message to reach other repliers, Ex: validating messages, checking authentication, permissions, etc.

--
### Chaning send
```typescript
import Messagr from "@victormga/messagr";

Messagr.topic("auth").reply("get user", (data) => {
    const info = getSession(data.uid);
    return { name: info.name };
});

Messagr.topic("auth").interrupt("get user", async (data) => {
    if (typeof data.uid !== "number") throw new Error("Invalid UserID");
});

[...]

// as the send method returns an Promise, you can chain it like a normal Promise.
Messagr
.topic("authenticated")
.send("get user", { uid: 42 })
.then((reply) => {
    console.log("the message was replied");
    console.log(reply);
})
.catch(err) => {
    console.log("the message was interrupted");
};
```


# License
ISC License (ISC)

Copyright 2021 - Victor Hugo Sabiar

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.