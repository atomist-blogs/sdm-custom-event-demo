<p align="center">
  <img src="https://images.atomist.com/sdm/SDM-Logo-Dark.png">
</p>

## Development

You will need to install [Node.js][node] to build and test this
project.

[node]: https://nodejs.org/ (Node.js)

You should also make sure you have the latest atomist cli

```
npm install @atomist/cli -g
```

### Build and test

Install dependencies.

```
$ npm install
```

Use the `build` package script to compile, test, lint, and build the
documentation.

```
$ npm run build
```

You'll need to have an atomist workspace to try out custom ingestion.  Assuming you already have an atomist workspace configured, you can just run:

```
$ atomist start
```

## Custom ingestion

### Adding new types

We use [graphql schema](https://graphql.org/learn/schema/) to define new types.  [This example][deployment.graphql] explores a new `CustomDeployment` type.  After starting the SDM, your startup message will include details about the new type:

![console-output](docs/console.png?raw=true "sdm startup")

```
$ curl https://webhook.atomist.com/atomist/teams/AP1N4221F/ingestion/CustomDeployment/859724c6-c7f5-4b51-8a69-5f25de0b7e37 -d '{"target": "us-east-1", "start": 100, "end": 101, "branch": "master", "status": "success", "sha": "a09af831abae8a3699ae036b545455a06b58595a"}' -H "Content-Type:application/json"
```

Breaking down this curl command:

1.  the url that defines your custom endpoint.  This will be different when you run this command but it will remain constant as long as your graphql schema does not change.  New versions of the schema will create new endpoints.
2.  the `application/json` content posted above must conform to your [custom type][deployment.graphql].  In our example, we've included details on how to link your custom data to an existing `Push` in the model.  When trying this, choose a sha in one of your org's Repos!

After running this command, you should see some output in your sdm's terminal:

```
2019-04-24T20:42:17.939Z [m:87138:890f90af-0a67-4d00-b137-c5512f9b6208:AP1N4221F:deployed:002] [info ] event currently untyped {"data":{"CustomDeployment":[{"branch":"master","end":101,"push":{"after":{"sha":"a09af831abae8a3699ae036b545455a06b58595a"}},"sha":"a09af831abae8a3699ae036b545455a06b58595a","start":100,"status":"success","target":"us-east-1"}]},"extensions":{"operationName":"deployed"}}
```

This is the log line [here][handler] in our event handler.

### Machine

There are really [two lines](two-lines) that are important for this demo:

```ts
    sdm.addIngester(GraphQL.ingester("deployment"));

    sdm.addEvent({
        name: "deployed",
        subscription: GraphQL.subscription("deployed"),
        listener: detectDeployment()
    });
```

Of course, the real meat of custom ingestion are in the graphql files!  

### Types

We just demonstrated your delivery can respond to whole new kinds of events.  Correspondingly, we have an open-ended type system to help your plan goals across new systems.  Now that we are handling new kinds of typed events, let's pull those new types into our machine.

While the sdm is still running, type:

```
$ atomist gql-fetch
```

As with previous commands, this will require that you have a connection to a valid atomist workspace.  Now make a change to your package.json file:

```
-    "gql:gen": "echo \"do nothing at first\"",
+    "gql:gen": "atm-gql-gen",
```

and now rebuild the project:

```
$ npm run build
```

You'll now have an updated set of typescript types in your project and it will include your new custom types.  That's going to make it easier for you to use the previous event, which has been typed as `any`.


[deployment.graphql]: https://github.com/atomist-blogs/sdm-custom-event-demo/blob/master/lib/graphql/ingester/deployment.graphql
[handler]: https://github.com/atomist-blogs/sdm-custom-event-demo/blob/master/lib/machine/handler.ts#L5
[two-lines]: https://github.com/atomist-blogs/sdm-custom-event-demo/blob/master/lib/machine/machine.ts#L41-L47