#!/usr/bin/env node
const updateNotifier = require('..');

test();

/**
 * execute test
 * @returns {void}
 */
async function test() {
	const testRemoteUri = 'https://github.com/joernberkefeld/update-notifier-git.git';

	const notifier = updateNotifier({
		pkg: {
			name: 'update-notifier-git',
			version: '4.0.0',
		},
		updateCheckInterval: 1000,
		remoteUrl: testRemoteUri,
	});
	// Notify using the built-in convenience method
	notifier.notify();
	console.log('test:notifier.update', notifier.update);
}
