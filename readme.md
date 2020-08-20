# update-notifier-git

> Update notifications for your CLI app

![example](screenshot.png)


[![NPM](https://nodei.co/npm/update-notifier-git.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/update-notifier-git)

Inform users of your package of updates in a non-intrusive way.

- [Install](#install)
- [Usage](#usage)
	- [Simple](#simple)
	- [Comprehensive](#comprehensive)
	- [Options and custom message](#options-and-custom-message)
- [How](#how)
- [API](#api)
	- [notifier = updateNotifier(options)](#notifier--updatenotifieroptions)
		- [options.pkg](#optionspkg)
		- [options.remoteUrl](#optionsremoteurl)
		- [options.updateCheckInterval](#optionsupdatecheckinterval)
		- [options.shouldNotifyInNpmScript](#optionsshouldnotifyinnpmscript)
		- [options.distTag](#optionsdisttag)
	- [notifier.fetchInfo()](#notifierfetchinfo)
	- [notifier.notify(options?)](#notifiernotifyoptions)
		- [options.defer](#optionsdefer)
		- [options.message](#optionsmessage)
		- [options.isGlobal](#optionsisglobal)
		- [options.boxenOptions](#optionsboxenoptions)
	- [User settings](#user-settings)
- [About](#about)

## Install

```bash
npm install update-notifier-git --save
```

## Usage

### Simple

```js
const updateNotifier = require('update-notifier-git');
const pkg = require('./package.json');

// either hardcode that here or retrieve it from packageJson.repository.url
const repo = 'https://github.com/JoernBerkefeld/update-notifier-git.git';
updateNotifier({
  pkg,
  remoteUrl: repo,
}).notify();
```

### Comprehensive

```js
const updateNotifier = require('update-notifier-git');
const pkg = require('./package.json');
// either hardcode that here or retrieve it from packageJson.repository.url
const repo = 'https://github.com/JoernBerkefeld/update-notifier-git.git';

// Checks for available update and returns an instance
const notifier = updateNotifier({
  pkg,
  remoteUrl: repo,
});

// Notify using the built-in convenience method
notifier.notify();

// `notifier.update` contains some useful info about the update
console.log(notifier.update);
/*
{
 latest: '1.0.1',
 current: '1.0.0',
 type: 'patch', // Possible values: latest, major, minor, patch, prerelease, build
 name: 'pageres'
}
*/
```

### Options and custom message

```js
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
});

if (notifier.update) {
  console.log(`Update available: ${notifier.update.latest}`);
}
```

## How

Whenever you initiate the update notifier and it's not within the interval threshold, it will asynchronously check with npm in the background for available updates, then persist the result. The next time the notifier is initiated, the result will be loaded into the `.update` property. This prevents any impact on your package startup performance.
The update check is done in a unref'ed [child process](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). This means that if you call `process.exit`, the check will still be performed in its own process.

The first time the user runs your app, it will check for an update, and even if an update is available, it will wait the specified `updateCheckInterval` before notifying the user. This is done to not be annoying to the user, but might surprise you as an implementer if you're testing whether it works. Check out [`example.js`](example.js) to quickly test out `update-notifier` and see how you can test that it works in your app.

## API

### notifier = updateNotifier(options)

Checks if there is an available update. Accepts options defined below. Returns an instance with an `.update` property if there is an available update, otherwise `undefined`.

#### options.pkg

Type: `object`

##### options.pkg.name

_Required_\
Type: `string`

##### options.pkg.version

_Required_\
Type: `string`

#### options.remoteUrl

Type: `String`\
Default: `null`

If your package is not published on NPM but instead only resides on a Git repo (e.g. GitHub, Gitlab, Bitbucket).

If you specify this parameter, NPM will not be checked but instead git is used to make a callout to your repo and retrieve version tags.

The info message to the user is also updated to show `npm update <package name>` instead of `npm install <url>` as that will not require you to specify the URL (like for npm install) but use the URL specified during the initial install, making things easier for your users.

#### options.updateCheckInterval

Type: `number`\
Default: `1000 * 60 * 60 * 24` _(1 day)_

How often to check for updates.

#### options.shouldNotifyInNpmScript

Type: `boolean`\
Default: `false`

Allows notification to be shown when running as an npm script.

#### options.distTag

Type: `string`\
Default: `'latest'`

Which [dist-tag](https://docs.npmjs.com/adding-dist-tags-to-packages) to use to find the latest version.

### notifier.fetchInfo()

Check update information.

Returns an `object` with:

- `latest` _(String)_ - Latest version.
- `current` _(String)_ - Current version.
- `type` _(String)_ - Type of current update. Possible values: `latest`, `major`, `minor`, `patch`, `prerelease`, `build`.
- `name` _(String)_ - Package name.

### notifier.notify(options?)

Convenience method to display a notification message. _(See screenshot)_

Only notifies if there is an update and the process is [TTY](https://nodejs.org/api/process.html#process_a_note_on_process_i_o).

#### options.defer

Type: `boolean`\
Default: `true`

Defer showing the notification to after the process has exited.

#### options.message

Type: `string`\
Default: [See above screenshot](https://github.com/yeoman/update-notifier#update-notifier-)

Message that will be shown when an update is available.

Available placeholders:

- `{packageName}` - Package name.
- `{currentVersion}` - Current version.
- `{latestVersion}` - Latest version.
- `{updateCommand}` - Update command.

```js
notifier.notify({ message: 'Run `{updateCommand}` to update.' });

// Output:
// Run `npm install update-notifier-tester@1.0.0` to update.
```

#### options.isGlobal

Type: `boolean`\
Default: Auto-detect

Include the `-g` argument in the default message's `npm i` recommendation. You may want to change this if your CLI package can be installed as a dependency of another project, and don't want to recommend a global installation. This option is ignored if you supply your own `message` (see above).

#### options.boxenOptions

Type: `object`\
Default: `{padding: 1, margin: 1, align: 'center', borderColor: 'yellow', borderStyle: 'round'}` _(See screenshot)_

Options object that will be passed to [`boxen`](https://github.com/sindresorhus/boxen).

### User settings

Users of your module have the ability to opt-out of the update notifier by changing the `optOut` property to `true` in `~/.config/configstore/update-notifier-[your-module-name].json`. The path is available in `notifier.config.path`.

Users can also opt-out by [setting the environment variable](https://github.com/sindresorhus/guides/blob/master/set-environment-variables.md) `NO_UPDATE_NOTIFIER` with any value or by using the `--no-update-notifier` flag on a per run basis.

The check is also skipped automatically:

- on CI
- in unit tests (when the `NODE_ENV` environment variable is `test`)

## About

The idea for this module came from the desire to apply the browser update strategy to CLI tools, where everyone is always on the latest version. We first tried automatic updating, which we discovered wasn't popular.

This is the third iteration of that idea, this time adding full git support in parallel to npm packages.
