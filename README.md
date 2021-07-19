# Electron Module Manager

A simple implementation of windows/modules management system for React-based Electron application.
Allows you to set up simple and secure communication between **main** and **renderer** processes, using separate context and state for each window.

Easy to set up, update and maintain 😊.

## Installation

- Add package as dependency:

```bash
npm install electron-module-manager
```

- Create an enum with list of your **module types**:

```typescript
export const enum ModuleType {
    COUNTER
}
```

- Create an interface with the **module state** (_optional_):

```typescript
export interface CounterModuleState {
    counter:number;
}
```

- Create **module class**, extending base _Module_ class:

```typescript
export class CounterModule extends Module<CounterModuleState> {
    public async increaseValue():Promise<void> {
        // updating module state and notifying module view

        this.updateState({
            counter: this._state.counter + 1
        });
    }

    public get windowOptions():WindowBaseOptions {
        // providing initial state for window view

        return {
            moduleTitle: 'Counter',
            width: 250,
            height: 250
        };
    }
}
```

- Create **module view class**, extending base _ModuleView_ class:

```typescript jsx
export class CounterModuleView extends ModuleView<CounterModule> {
    private _updatesCount:number = 0;

    private increaseCounterValue = async () => {
        this._updatesCount++;
        await this._context.increaseValue();
    };

    public componentDidMount() {
        setInterval(this.increaseCounterValue, 1000);
        super.componentDidMount();
    }

    public render():React.ReactNode {
        return (
            <div className="counter">
                <div>Current window <strong>counter</strong>: { this._updatesCount }</div>
                <div>Global <strong>counter</strong>: { this.state.counter }</div>
            </div>
        );
    }
}
```

- Create **entry points** (application, preload & window scrips):

```typescript
// application.ts - binding module type with module class

const application = new Application(
    'window.html', 'window.bridge.js', {
        [ModuleType.COUNTER]: CounterModule
    }
);

Electron.app.on('ready', async () => {
    await application.windowManager.createParent<CounterModuleState>(
        ModuleType.COUNTER, {
            // setting up initial module state
            counter: 0
        }
    );
});
```

```typescript
// window.bridge.js - preload script, exposing main process API to renderer 

BridgeProcessWorker.createBridge();
```

```typescript
// window.js - binding module type with module view class

WindowProcessWorker.createWindow(
    WindowView, '#application', {
        [ModuleType.COUNTER]: CounterModuleView
    }
);
```

- Check that "usedExports" flag is enabled in "optimization" options for your webpack config:

```javascript
// webpack.config.js

module.exports = {
    optimization: {
        usedExports: true
    },

    // ...
};
```

## Communication

Starting from v2.3.0 communication between **Module** and **ModuleView** (view state updating) is done using [JSON patch](https://www.npmjs.com/package/fast-json-patch).

It leads to a small overhead when modules have a simple state (1-2 fields). But, which is a more realistic situation, gives huge performance when modules state have a complex structure (arrays, trees with deep length, etc).

## Example

Example application could be found [here](https://github.com/dmn-chumak/electron-module-manager/tree/master/example).
