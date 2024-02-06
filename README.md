# express-web-app-template

This project is designed to be a starting point for a typescript web application with unit, integration, blackbox, e2e,
and performance testing. There is also GitHub action files for continuous integration and deployment, and dependency
updates.

```npm install```

## Development environment commands

### Run front end

``` npm run frontend ```

### Create static web pages for backend

```npm run build```

### Run backend

1. Auth0 secret must be set to run the application
2. Value should be set in zshrc since it's a live service
3. Ask teammate for value

```npm run backend```

### Run backend and frontend

```npm run fullstack```

### Run database

1. ```brew services start postgresql@14```

### To create a new migration

```npm run migrations:create --name=<name>```

#### To roll back a bad migration

```npm run migrations:revert```

##### Install postgresql@14
n 
1. ```brew install postgresql@14```
2. ```createdb post```

note*:
brew does not create a database folder for postgresql@14
which may lead to errors starting the service with brew
or interacting in general. Consider checking error logs.
These are the steps I had to complete on macOS to make brew play nicely

1. navigate to /opt/homebrew/var (hint: run ```brew info postgresql@14``` to see where config location is)
2. ``mkdir postgresql@14``

### Run unit and blackbox tests

```npm run test```

#### Run tests as they are in GitHub actions

```npm run test:github```

note*: make sure port 8080 is available

### Run performance tests

1. ```brew install k6```
2. ```k6 run tests/backend/postPerformance.ts```

### Manually test backend responses

1. ```brew install insomnia```
2. import from file ```insomnia-config.json```

### Remove node modules and cache

```npm run clean```

### Deploy to staging environment (Prefer GitHub action when possible)

#### First time

1. ```brew install flyctl```
2. ```flyctl login```

#### Every time

1. ```npm run build```
2. ```flylctl deploy```

## Configure WebStorm

### To match formatter

1. Preferences | Editor | Code Style | TypeScript | Punctuation
2. From the drop-downs, select "Don't use", "always", "single", "always", and "keep"

### To format on save

Record the macro

1. Edit | Macros | Start Macro recording
2. Press Cmd+Option+L, and then Cmd+Option+S (on Windows: Ctrl+Alt+L, and then Ctrl+Alt+S)
3. Stop recording the macro clicking on the Stop button on the bottom right of the page
4. Give this macro a name like "Format and Save"

Assign Ctrl+S to "Format and Save"

1. File | Settings
2. search for "keymap" and open it
3. search "Format and Save" and double-click the action "Format and Save"
4. select "Add Keyboard Shortcut"
5. select "Ctrl+S" as first stroke.
6. it will report conflicts. Ignore it and click OK button
7. WebStorm will show a warning "The shortcut is already assigned to other actions. Do you want to remove other
   assignments?" Click "Remove" button

### To run backend in debug mode

1. Run | Edit Configurations...
2. Create a new Node.js configuration
3. Rename to 'Debug Server'
4. Change the interpreter to ts-node (~/workspaces/express-web-app-template/node_modules/.bin/ts-node)
5. Set working directory to ~/workspaces/express-web-app-template
6. Set Javascript file to src/backend/server.ts

## GitHub actions

### Continuous deployment

Every push to main will run the continuous deployment (continuous-deployment.yml) GitHub action. This will run all unit,
blackbox, and
end-to-end tests against a fresh linux virtual machine, deploy the application to staging if there are production code
changes,
and run blackbox and e2e tests against staging

### Update dependencies

Every morning a chron job will execute the update dependencies (update-dependencies.yml) GitHub action. This will first
run the command ```npm update``` and then run all unit, blackbox, and end-to-end tests. Upon passing with changes in
package-lock.json from main, a pull request will automatically be created.

### Staging behavioral test

Every morning a chron job will execute the staging behavioral test (staging-behavioral-test.yml) GitHub action. This
will
run blackbox and e2e tests against the staging environment.

### Staging performance test

Every morning a chron job will execute the staging performance test (staging-performance-test.yml) GitHub action. This
will
run k6 tests against the staging environment.

### Deploy to staging

Only manual triggers will run this job. This will deploy main code to staging.

## Setting up new repository

### 1. Replace express-web-app-template with new repository name

### 2. Set DataSource properties

### 3. Setup new secrets

```fly secrets set DB_PASSWORD="<password>" DB_USERNAME="<username>"```

### 4. Add application as source for log service

### 5. Set GitHub Action's FLY_SECRET and AUTH0_SECRET